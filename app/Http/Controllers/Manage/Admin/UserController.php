<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Manage\Admin\BulkUpdateUserStatusRequest;
use App\Http\Requests\Manage\Admin\UpdateUserRequest;
use App\Http\Resources\Manage\UserResource;
use App\Models\ManageActivity;
use App\Models\Space;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Pagination\LengthAwarePaginator as PaginationLengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * 顯示使用者管理列表。
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $filters = [
            'keyword' => $request->string('keyword')->trim()->toString() ?: null,
            'roles' => $this->parseMultiSelect($request->input('roles')),
            'statuses' => $this->parseMultiSelect($request->input('statuses')),
            'space' => $request->integer('space'),
            'sort' => $request->string('sort')->trim()->toString() ?: 'name',
            'direction' => strtolower($request->string('direction')->trim()->toString() ?: 'asc'),
            'per_page' => $request->integer('per_page') ?: 15,
        ];

        $perPage = max(5, min(100, $filters['per_page'] ?? 15));

        $query = User::query()
            ->select('users.*')
            ->with([
                'profile',
                'spaces' => fn ($relation) => $relation->select('spaces.id', 'spaces.name'),
            ])
            ->withCount(['spaces'])
            ->when($filters['keyword'], function (Builder $builder, string $keyword) {
                $keywordLike = '%' . mb_strtolower($keyword) . '%';

                $builder->where(function (Builder $nested) use ($keywordLike) {
                    $nested->whereRaw('LOWER(name) LIKE ?', [$keywordLike])
                        ->orWhereRaw('LOWER(email) LIKE ?', [$keywordLike])
                        ->orWhereRaw('LOWER(locale) LIKE ?', [$keywordLike]);
                });
            })
            ->when(! empty($filters['roles']), function (Builder $builder) use ($filters) {
                $builder->whereIn('role', $filters['roles']);
            })
            ->when(! empty($filters['statuses']), function (Builder $builder) use ($filters) {
                $builder->whereIn('status', $this->normalizeStatusFilters($filters['statuses']));
            })
            ->when($filters['space'], function (Builder $builder, int $spaceId) {
                $builder->whereHas('spaces', fn (Builder $spaceQuery) => $spaceQuery->where('spaces.id', $spaceId));
            })
            ->when($filters['sort'], function (Builder $builder, string $sortField) use ($filters) {
                $direction = $filters['direction'] === 'desc' ? 'desc' : 'asc';

                return match ($sortField) {
                    'created_at', 'updated_at' => $builder->orderBy($sortField, $direction),
                    'last_login_at' => $builder->orderBy('last_login_at', $direction),
                    'role' => $builder->orderBy('role', $direction),
                    'email' => $builder->orderBy('email', $direction),
                    default => $builder->orderBy('name', $direction),
                };
            }, fn (Builder $builder) => $builder->orderBy('name'));

        $paginator = $this->paginateUsers($query, $perPage);

        $abilities = $this->resolveAbilities($request->user());

        $filtersPayload = [
            'keyword' => $filters['keyword'],
            'roles' => $filters['roles'],
            'statuses' => $filters['statuses'],
            'space' => $filters['space'],
            'per_page' => $paginator->perPage(),
            'sort' => $filters['sort'],
            'direction' => $filters['direction'],
        ];

        $usersCollection = UserResource::collection($paginator->getCollection())->resolve();
        $links = $paginator->toArray()['links'] ?? [];

        return Inertia::render('manage/admin/users/index', [
            'users' => [
                'data' => $usersCollection,
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'from' => $paginator->firstItem(),
                    'last_page' => $paginator->lastPage(),
                    'path' => $paginator->path(),
                    'per_page' => $paginator->perPage(),
                    'to' => $paginator->lastItem(),
                    'total' => $paginator->total(),
                    'links' => $links,
                ],
            ],
            'filters' => $filtersPayload,
            'filterOptions' => [
                'roles' => $this->roleOptions(),
                'statuses' => $this->statusOptions(),
                'spaces' => $this->spaceOptions(),
                'sorts' => $this->sortOptions(),
            ],
            'abilities' => $abilities,
        ]);
    }

    /**
     * 顯示新增使用者頁面。
     */
    public function create(): Response
    {
        return Inertia::render('manage/admin/users/index');
    }

    /**
     * 儲存新使用者。
     */
    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('manage.users.index');
    }

    /**
     * 顯示單一使用者資訊。
     */
    public function show(Request $request, User $user): HttpResponse
    {
        $this->authorize('view', $user);

        $user->load([
            'profile',
            'spaces' => fn ($relation) => $relation->select('spaces.id', 'spaces.name'),
        ]);

        $activities = ManageActivity::query()
            ->where('subject_type', User::class)
            ->where('subject_id', $user->id)
            ->latest()
            ->limit(10)
            ->get();

        $user->setAttribute('recent_activities', $activities);

        return response()->json([
            'data' => UserResource::make($user)->resolve(),
        ]);
    }

    /**
     * 顯示編輯使用者頁面。
     */
    public function edit(User $user): Response
    {
        return Inertia::render('manage/admin/users/index');
    }

    /**
     * 更新指定使用者。
     */
    public function update(UpdateUserRequest $request, User $user): HttpResponse|RedirectResponse
    {
        $data = $request->validated();

        $originalStatus = $user->status;
        $originalRole = $user->role;

        $user->forceFill([
            'name' => $data['name'],
            'email' => $data['email'],
            'locale' => $data['locale'] ?? $user->locale,
        ]);

        if (isset($data['role'])) {
            $user->role = $data['role'];
        }

        if (isset($data['status'])) {
            $user->status = $data['status'];
        }

        $user->save();

        if (array_key_exists('spaces', $data)) {
            $user->spaces()->sync($data['spaces']);
        }

        ManageActivity::log(
            $request->user(),
            'user.updated',
            $user,
            [
                'role_changed' => $originalRole !== $user->role,
                'status_changed' => $originalStatus !== $user->status,
            ]
        );

        if ($request->wantsJson()) {
            return response()->json([
                'message' => __('使用者已更新。'),
                'data' => UserResource::make($user->fresh([
                    'profile',
                    'spaces' => fn ($relation) => $relation->select('spaces.id', 'spaces.name'),
                ]))->resolve(),
            ]);
        }

        return redirect()
            ->route('manage.users.index')
            ->with('flash', [
                'type' => 'success',
                'message' => __('使用者已更新。'),
            ]);
    }

    /**
     * 批次更新使用者狀態。
     */
    public function bulkStatus(BulkUpdateUserStatusRequest $request): HttpResponse
    {
        $status = strtolower($request->validated('status'));
        $normalizedStatus = User::STATUS_ALIASES[$status] ?? $status;
        $numericStatus = User::STATUS_MAP[$normalizedStatus] ?? User::STATUS_MAP['active'];

        $ids = $request->validated('user_ids');

        $affected = User::query()
            ->whereIn('id', $ids)
            ->update(['status' => $numericStatus]);

        ManageActivity::log(
            $request->user(),
            'user.bulk_status_updated',
            null,
            [
                'user_ids' => $ids,
                'status' => $normalizedStatus,
                'affected' => $affected,
            ]
        );

        return response()->json([
            'message' => __('已更新 :count 筆使用者狀態。', ['count' => $affected]),
            'affected' => $affected,
        ]);
    }

    /**
     * 發送密碼重設連結。
     */
    public function sendPasswordReset(Request $request, User $user): HttpResponse
    {
        $this->authorize('sendPasswordReset', $user);

        $status = Password::broker()->sendResetLink(['email' => $user->email]);

        ManageActivity::log(
            $request->user(),
            'user.password_reset_link',
            $user,
            [
                'status' => $status,
            ]
        );

        return response()->json([
            'message' => __($status === Password::RESET_LINK_SENT ? '重設密碼連結已寄出。' : '無法寄送重設密碼連結。'),
            'status' => $status,
        ], $status === Password::RESET_LINK_SENT ? 200 : 422);
    }

    /**
     * 模擬登入指定使用者。
     */
    public function impersonate(Request $request, User $user): RedirectResponse|HttpResponse
    {
        $this->authorize('impersonate', $user);

        $actor = $request->user();

        session([
            'impersonator_id' => $actor->id,
        ]);

        Auth::login($user);

        ManageActivity::log(
            $actor,
            'user.impersonated',
            $user,
            []
        );

        if ($request->wantsJson()) {
            return response()->json([
                'message' => __('已切換為 :name。', ['name' => $user->name]),
            ]);
        }

        return redirect()->route('manage.admin.dashboard');
    }

    /**
     * 停止模擬登入。
     */
    public function stopImpersonate(Request $request): RedirectResponse|HttpResponse
    {
        $actorId = $request->session()->pull('impersonator_id');

        if ($actorId) {
            $actor = User::query()->find($actorId);

            if ($actor) {
                Auth::login($actor);

                ManageActivity::log(
                    $actor,
                    'user.impersonation_stopped',
                    $actor,
                    []
                );
            }
        }

        if ($request->wantsJson()) {
            return response()->json([
                'message' => __('已返回原始身分。'),
            ]);
        }

        return redirect()->route('manage.admin.dashboard');
    }

    /**
     * 刪除指定使用者（停用）。
     */
    public function destroy(Request $request, User $user): HttpResponse|RedirectResponse
    {
        $this->authorize('delete', $user);

        $user->status = 'inactive';
        $user->delete();

        ManageActivity::log(
            $request->user(),
            'user.deactivated',
            $user,
            []
        );

        if ($request->wantsJson()) {
            return response()->json([
                'message' => __('使用者已停用。'),
            ]);
        }

        return redirect()
            ->route('manage.users.index')
            ->with('flash', [
                'type' => 'success',
                'message' => __('使用者已停用。'),
            ]);
    }

    /**
     * 解析多選篩選值。
     * 處理 array 或 comma-separated string 格式的輸入，
     * 統一轉換為陣列格式並過濾空值。
     */
    protected function parseMultiSelect(null|array|string $value): array
    {
        if (is_array($value)) {
            return array_values(array_filter(array_map(fn ($item) => is_string($item) ? trim($item) : null, $value)));
        }

        if (is_string($value) && $value !== '') {
            return array_values(array_filter(array_map(fn ($item) => trim($item), explode(',', $value))));
        }

        return [];
    }

    /**
     * 將狀態篩選值轉為數值代碼。
     * 支援別名轉換（如 'active' -> 1, 'inactive' -> 0），
     * 確保資料庫查詢使用正確的數值型態。
     */
    protected function normalizeStatusFilters(array $statuses): array
    {
        return collect($statuses)
            ->map(fn ($status) => strtolower($status))
            ->map(fn ($status) => User::STATUS_ALIASES[$status] ?? $status)
            ->map(fn ($status) => User::STATUS_MAP[$status] ?? null)
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    /**
     * 製作分頁結果。
     * 將 Builder 查詢結果轉換為 LengthAwarePaginator，
     * 並保留查詢字串參數以支援分頁導航。
     */
    protected function paginateUsers(Builder $query, int $perPage): LengthAwarePaginator
    {
        /** @var PaginationLengthAwarePaginator $paginator */
        $paginator = $query->paginate($perPage)->withQueryString();

        return $paginator;
    }

    /**
     * 取得當前使用者能力清單。
     * 根據使用者角色與權限，判斷可執行的操作項目。
     */
    protected function resolveAbilities(?User $actor): array
    {
        return [
            'canCreate' => $actor?->can('create', User::class) ?? false,
            'canUpdate' => $actor?->can('update', User::class) ?? false,
            'canDelete' => $actor?->can('delete', User::class) ?? false,
            'canAssignRoles' => $actor?->can('assignRole', User::class) ?? false,
            'canImpersonate' => $actor?->isAdmin() ?? false,
            'canSendPasswordReset' => $actor?->isAdmin() ?? false,
        ];
    }

    protected function roleOptions(): array
    {
        return collect(User::availableRoles())
            ->map(fn ($role) => [
                'value' => $role,
                'label' => __($this->roleLabelKey($role)),
            ])
            ->all();
    }

    protected function roleLabelKey(string $role): string
    {
        return match ($role) {
            'admin' => '管理員',
            'teacher' => '教師',
            default => '一般會員',
        };
    }

    protected function statusOptions(): array
    {
        return [
            [
                'value' => 'active',
                'label' => __('啟用'),
            ],
            [
                'value' => 'inactive',
                'label' => __('停用'),
            ],
        ];
    }

    protected function spaceOptions(): array
    {
        return Space::query()
            ->orderBy('name')
            ->limit(100)
            ->get()
            ->map(fn (Space $space) => [
                'value' => $space->id,
                'label' => $space->name,
            ])
            ->all();
    }

    protected function sortOptions(): array
    {
        return [
            [
                'value' => 'name',
                'label' => __('姓名'),
            ],
            [
                'value' => 'role',
                'label' => __('角色'),
            ],
            [
                'value' => 'created_at',
                'label' => __('建立時間'),
            ],
            [
                'value' => 'last_login_at',
                'label' => __('最近登入'),
            ],
        ];
    }
}
