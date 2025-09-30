<?php

namespace App\Http\Controllers\Manage;

use App\Http\Controllers\Controller;
use App\Http\Requests\Manage\User\StoreUserRequest;
use App\Http\Requests\Manage\User\UpdateUserRequest;
use App\Http\Resources\Manage\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Services\UserRoleProfileSynchronizer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserController extends Controller
{
    /** @var list<int> */
    private array $perPageOptions = [15, 30, 50, 100, 200];

    protected UserRoleProfileSynchronizer $synchronizer;

    public function __construct(UserRoleProfileSynchronizer $synchronizer)
    {
        $this->authorizeResource(User::class, 'user');
        $this->synchronizer = $synchronizer;
    }

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $query = User::query();

        $filters = $this->applyFilters($request, $query);
        [$sortColumn, $sortDirection, $sortParam] = $this->resolveSort($request);
        $query->orderBy($sortColumn, $sortDirection);

        $perPage = $this->resolvePerPage($request);

        /** @var LengthAwarePaginator $users */
        $users = $query
            ->paginate($perPage)
            ->withQueryString();

        $resource = UserResource::collection($users);
        $userPayload = $resource->response()->getData(true);

        return Inertia::render('manage/users/index', [
            'users' => $userPayload,
            'filters' => array_merge($filters, [
                'sort' => $sortParam,
                'per_page' => (string) $perPage,
            ]),
            'roleOptions' => $this->roleOptions(),
            'statusOptions' => $this->statusOptions(),
            'sortOptions' => $this->sortOptions(),
            'perPageOptions' => $this->perPageOptions,
            'can' => [
                'create' => $request->user()->can('create', User::class),
                'manage' => $request->user()->isAdmin(),
            ],
            'authUserId' => $request->user()->id,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('manage/users/edit', [
            'mode' => 'create',
            'user' => null,
            'roleOptions' => $this->roleOptions(),
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $roles = $data['roles'];

        $user = new User();
        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->status = $data['status'];
        $user->password = Hash::make($data['password']);
        $user->email_verified_at = $request->boolean('email_verified') ? now() : null;
        $user->save();

        $this->synchronizer->synchronizeUserProfile($user, $roles);

        return redirect()
            ->route('manage.users.index')
            ->with('success', '使用者建立成功');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('manage/users/edit', [
            'mode' => 'edit',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getActiveRoles(),
                'status' => $user->status,
                'email_verified_at' => optional($user->email_verified_at)?->toIso8601String(),
            ],
            'roleOptions' => $this->roleOptions(),
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();

        $roles = $data['roles'];

        $payload = [
            'name' => $data['name'],
            'email' => $data['email'],
            'status' => $data['status'],
        ];

        if (! empty($data['password'])) {
            $payload['password'] = Hash::make($data['password']);
        }

        $payload['email_verified_at'] = $request->boolean('email_verified')
            ? ($user->email_verified_at ?? now())
            : null;

        $user->update($payload);

        $this->synchronizer->synchronizeUserProfile($user, $roles);

        return redirect()
            ->route('manage.users.index')
            ->with('success', '使用者更新成功');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($request->user()->id === $user->id) {
            return back()->with('error', '無法刪除自己的帳號');
        }

        if ($this->isLastActiveAdmin($user)) {
            return back()->with('error', '系統至少需要保留一位管理成員，無法刪除此帳號');
        }

        DB::transaction(function () use ($user) {
            $user->forceFill(['status' => 'suspended'])->save();
            $user->delete();
        });

        return redirect()
            ->route('manage.users.index')
            ->with('success', '使用者已移至回收桶');
    }

    public function restore(Request $request, int $userId): RedirectResponse
    {
        $user = User::withTrashed()->findOrFail($userId);

        $this->authorize('restore', $user);

        if (! $user->trashed()) {
            return back()->with('info', '此帳號未被刪除');
        }

        DB::transaction(function () use ($user) {
            $user->restore();
            $user->forceFill(['status' => 'active'])->save();
        });

        return redirect()
            ->route('manage.users.index')
            ->with('success', '使用者已成功還原');
    }

    public function bulk(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['delete'])],
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'distinct'],
        ]);

        $ids = collect($data['ids'])->unique()->values();
        $users = User::withTrashed()->whereIn('id', $ids)->get();

        if ($users->isEmpty()) {
            return back()->with('info', '未找到選取的使用者');
        }

        if ($data['action'] === 'delete') {
            $authUser = $request->user();

            $activeAdminsCount = $this->countActiveAdmins();

            $targetActiveAdmins = $users->filter(
                fn (User $target) => $target->hasRole('admin') && ! $target->trashed()
            );

            if ($targetActiveAdmins->isNotEmpty() && $targetActiveAdmins->count() >= $activeAdminsCount) {
                return back()->with('error', '系統至少需要保留一位管理成員，無法刪除所有管理成員帳號');
            }

            foreach ($users as $target) {
                if ($authUser->cannot('delete', $target)) {
                    return back()->with('error', '您沒有刪除所選帳號的權限');
                }

                if ($this->isLastActiveAdmin($target)) {
                    return back()->with('error', '系統至少需要保留一位管理成員，無法刪除此帳號');
                }
            }

            DB::transaction(function () use ($users) {
                foreach ($users as $target) {
                    if (! $target->trashed()) {
                        $target->forceFill(['status' => 'suspended'])->save();
                        $target->delete();
                    }
                }
            });

            return redirect()
                ->route('manage.users.index')
                ->with('success', '選取的使用者已移至回收桶');
        }

        return back()->with('error', '不支援的批次操作');
    }

    public function export(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', User::class);

        $query = User::query();
        $this->applyFilters($request, $query);
        [$sortColumn, $sortDirection] = $this->resolveSort($request);
        $query->orderBy($sortColumn, $sortDirection);

        $ids = collect($request->input('ids', []))
            ->filter(fn ($id) => is_numeric($id))
            ->map(fn ($id) => (int) $id)
            ->values();

        if ($ids->isNotEmpty()) {
            $query->whereIn('id', $ids);
        }

        $users = $query->with(['userRoles.role'])->get();

        $fileName = 'users-' . now()->format('Ymd-His') . '.csv';

        return response()->streamDownload(function () use ($users) {
            $handle = fopen('php://output', 'w');
            if ($handle === false) {
                return;
            }

            fwrite($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($handle, ['ID', '姓名', 'Email', '角色', '狀態', '建立時間']);

            foreach ($users as $user) {
                fputcsv($handle, [
                    $user->id,
                    $user->name,
                    $user->email,
                    implode('、', $user->getActiveRoles()),
                    $user->status,
                    optional($user->created_at)?->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @return array{q: string, role: string, status: string, created_from: string|null, created_to: string|null}
     */
    private function applyFilters(Request $request, Builder $query): array
    {
        $search = trim((string) $request->input('q', ''));
        if ($search !== '') {
            $query->where(function (Builder $inner) use ($search) {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $role = $request->input('role');
        if (is_string($role) && $role !== '') {
            $query->whereHas('userRoles', function (Builder $builder) use ($role) {
                $builder->where('status', 'active')
                    ->whereHas('role', function (Builder $roleQuery) use ($role) {
                        $roleQuery->where('name', $role);
                    });
            });
        } else {
            $role = '';
        }

        $status = $request->input('status');
        if (in_array($status, ['active', 'suspended'], true)) {
            $query->where('status', $status);
        } else {
            $status = '';
        }

        $createdFrom = null;
        if ($request->filled('created_from')) {
            try {
                $createdFrom = Carbon::parse($request->input('created_from'))->startOfDay();
                $query->where('created_at', '>=', $createdFrom);
            } catch (\Throwable) {
                $createdFrom = null;
            }
        }

        $createdTo = null;
        if ($request->filled('created_to')) {
            try {
                $createdTo = Carbon::parse($request->input('created_to'))->endOfDay();
                $query->where('created_at', '<=', $createdTo);
            } catch (\Throwable) {
                $createdTo = null;
            }
        }

        return [
            'q' => $search,
            'role' => is_string($role) ? $role : '',
            'status' => is_string($status) ? $status : '',
            'created_from' => $createdFrom?->toDateString(),
            'created_to' => $createdTo?->toDateString(),
        ];
    }

    /**
     * @return array{0: string, 1: 'asc'|'desc', 2?: string}
     */
    private function resolveSort(Request $request): array
    {
        $sortParam = (string) $request->input('sort', '-created_at');
        $direction = str_starts_with($sortParam, '-') ? 'desc' : 'asc';
        $columnKey = ltrim($sortParam, '-');

        $allowed = [
            'created_at' => 'created_at',
            'name' => 'name',
            'email' => 'email',
            'status' => 'status',
        ];

        if (! array_key_exists($columnKey, $allowed)) {
            $columnKey = 'created_at';
            $direction = 'desc';
            $sortParam = '-created_at';
        }

        return [$allowed[$columnKey], $direction, $sortParam];
    }

    private function resolvePerPage(Request $request): int
    {
        $perPage = (int) $request->input('per_page', 15);

        if ($perPage < 1) {
            $perPage = 15;
        }

        if ($perPage > 200) {
            $perPage = 200;
        }

        return $perPage;
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function roleOptions(): array
    {
        return Role::orderByPriority()
            ->get()
            ->map(static fn (Role $role) => [
                'value' => $role->name,
                'label' => $role->display_name,
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function statusOptions(): array
    {
        return [
            ['value' => 'active', 'label' => '啟用'],
            ['value' => 'suspended', 'label' => '停用'],
        ];
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function sortOptions(): array
    {
        return [
            ['value' => '-created_at', 'label' => '建立時間（新到舊）'],
            ['value' => 'created_at', 'label' => '建立時間（舊到新）'],
            ['value' => 'name', 'label' => '姓名（A → Z）'],
            ['value' => '-name', 'label' => '姓名（Z → A）'],
            ['value' => 'email', 'label' => 'Email（A → Z）'],
            ['value' => '-email', 'label' => 'Email（Z → A）'],
        ];
    }

    private function isLastActiveAdmin(User $user): bool
    {
        if (! $user->hasRole('admin')) {
            return false;
        }

        $activeAdmins = $this->countActiveAdmins();

        if ($user->trashed()) {
            return $activeAdmins === 0;
        }

        return $activeAdmins <= 1;
    }

    private function countActiveAdmins(): int
    {
        return User::query()
            ->whereNull('deleted_at')
            ->whereHas('userRoles', function (Builder $query) {
                $query->where('status', 'active')
                    ->whereHas('role', function (Builder $roleQuery) {
                        $roleQuery->where('name', 'admin');
                    });
            })
            ->count();
    }
}
