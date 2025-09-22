<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(User::class, 'user');
    }

    public function index(Request $request): Response
    {
        $query = User::withTrashed();

        $search = trim((string) $request->input('q', $request->input('search', '')));
        if ($search !== '') {
            $query->where(function ($inner) use ($search) {
                $inner
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $role = $request->input('role');
        $roleOptions = ['admin', 'teacher', 'user'];
        if (in_array($role, $roleOptions, true)) {
            $query->where('role', $role);
        }

        $status = $request->input('status');
        $statusOptions = ['active', 'suspended'];
        if (in_array($status, $statusOptions, true)) {
            $query->where('status', $status);
        }

        $createdFrom = trim((string) $request->input('created_from'));
        if ($createdFrom !== '') {
            try {
                $from = Carbon::parse($createdFrom)->startOfDay();
                $query->where('created_at', '>=', $from);
            } catch (\Throwable) {
                // ignore invalid date
            }
        }

        $createdTo = trim((string) $request->input('created_to'));
        if ($createdTo !== '') {
            try {
                $to = Carbon::parse($createdTo)->endOfDay();
                $query->where('created_at', '<=', $to);
            } catch (\Throwable) {
                // ignore invalid date
            }
        }

        $trashed = $request->input('trashed');
        if ($trashed === 'with') {
            $query->withTrashed();
        } elseif ($trashed === 'only') {
            $query->onlyTrashed();
        }

        $sortOptions = ['name', '-name', 'email', '-email', 'created_at', '-created_at'];
        $sort = (string) $request->input('sort', '-created_at');
        if (! in_array($sort, $sortOptions, true)) {
            $sort = '-created_at';
        }

        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = ltrim($sort, '-');
        $query->orderBy($column, $direction)->orderBy('id', 'asc');

        $perPageOptions = [10, 20, 50];
        $perPage = (int) $request->input('per_page', 20);
        if (! in_array($perPage, $perPageOptions, true)) {
            $perPage = 20;
        }

        $users = $query
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'locale' => $user->locale,
                'email_verified_at' => optional($user->email_verified_at)?->toIso8601String(),
                'created_at' => optional($user->created_at)?->toIso8601String(),
                'updated_at' => optional($user->updated_at)?->toIso8601String(),
                'deleted_at' => optional($user->deleted_at)?->toIso8601String(),
            ]);

        return Inertia::render('manage/admin/users/index', [
            'users' => $users,
            'filters' => [
                'q' => $search,
                'role' => $role,
                'status' => $status,
                'created_from' => $createdFrom,
                'created_to' => $createdTo,
                'trashed' => $trashed,
                'sort' => $sort,
                'per_page' => $perPage,
            ],
            'roleOptions' => array_map(fn ($value) => ['value' => $value, 'label' => ucfirst($value)], $roleOptions),
            'statusOptions' => [
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'suspended', 'label' => 'Suspended'],
            ],
            'sortOptions' => [
                ['value' => '-created_at', 'label' => '最新建立'],
                ['value' => 'created_at', 'label' => '最早建立'],
                ['value' => 'name', 'label' => '姓名 A → Z'],
                ['value' => '-name', 'label' => '姓名 Z → A'],
                ['value' => 'email', 'label' => 'Email A → Z'],
                ['value' => '-email', 'label' => 'Email Z → A'],
            ],
            'perPageOptions' => $perPageOptions,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('manage/admin/users/create', [
            'roleOptions' => [
                ['value' => 'admin', 'label' => 'Admin'],
                ['value' => 'teacher', 'label' => 'Teacher'],
                ['value' => 'user', 'label' => 'User'],
            ],
            'statusOptions' => [
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'suspended', 'label' => 'Suspended'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->whereNull('deleted_at')],
            'role' => ['required', Rule::in(['admin', 'teacher', 'user'])],
            'status' => ['required', Rule::in(['active', 'suspended'])],
            'locale' => ['nullable', 'string', 'max:10'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'email_verified' => ['boolean'],
        ]);

        $payload = [
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'],
            'status' => $data['status'],
            'locale' => ($data['locale'] ?? null) !== '' ? $data['locale'] : null,
            'password' => Hash::make($data['password']),
            'email_verified_at' => $request->boolean('email_verified') ? now() : null,
        ];

        User::create($payload);

        return redirect()->route('manage.admin.users.index')
            ->with('success', '使用者建立成功');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('manage/admin/users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'locale' => $user->locale,
                'email_verified_at' => optional($user->email_verified_at)?->toIso8601String(),
                'deleted_at' => optional($user->deleted_at)?->toIso8601String(),
            ],
            'roleOptions' => [
                ['value' => 'admin', 'label' => 'Admin'],
                ['value' => 'teacher', 'label' => 'Teacher'],
                ['value' => 'user', 'label' => 'User'],
            ],
            'statusOptions' => [
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'suspended', 'label' => 'Suspended'],
            ],
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)->whereNull('deleted_at')],
            'role' => ['required', Rule::in(['admin', 'teacher', 'user'])],
            'status' => ['required', Rule::in(['active', 'suspended'])],
            'locale' => ['nullable', 'string', 'max:10'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'email_verified' => ['boolean'],
        ]);

        $payload = [
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'],
            'status' => $data['status'],
            'locale' => ($data['locale'] ?? null) !== '' ? $data['locale'] : null,
        ];

        if (! empty($data['password'])) {
            $payload['password'] = Hash::make($data['password']);
        }

        $emailVerified = $request->boolean('email_verified');
        $payload['email_verified_at'] = $emailVerified
            ? ($user->email_verified_at ?? now())
            : null;

        $user->update($payload);

        return redirect()->route('manage.admin.users.index')
            ->with('success', '使用者更新成功');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ((int) $request->user()->id === (int) $user->id) {
            return back()->with('error', '不能刪除自己的帳號');
        }

        if ($user->role === 'admin') {
            $remainingAdmins = User::query()
                ->where('role', 'admin')
                ->whereNull('deleted_at')
                ->where('id', '!=', $user->id)
                ->count();

            if ($remainingAdmins === 0) {
                return back()->with('error', '無法刪除最後一位管理員');
            }
        }

        DB::transaction(function () use ($user, $request) {
            $actorId = $request->user()->id;

            $user->createdPosts()->update(['created_by' => $actorId]);
            $user->updatedPosts()->update(['updated_by' => $actorId]);
            Attachment::query()->where('uploaded_by', $user->id)->update(['uploaded_by' => $actorId]);

            $user->delete();
        });

        return redirect()->route('manage.admin.users.index')
            ->with('success', '使用者已刪除');
    }

    public function restore(Request $request, User $user): RedirectResponse
    {
        $this->authorize('restore', $user);

        if (! $user->trashed()) {
            return back()->with('error', '此使用者未被刪除');
        }

        $user->restore();

        AuditLog::logAction(
            action: 'restore_user',
            target: $user,
            actor: $request->user(),
            metadata: [
                'restored_user_email' => $user->email,
                'restored_user_role' => $user->role,
            ]
        );

        return redirect()->route('manage.admin.users.index')
            ->with('success', '使用者已還原');
    }
}

