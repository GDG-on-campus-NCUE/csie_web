<?php

namespace App\Http\Controllers\Manage;

use App\Http\Controllers\Controller;
use App\Models\Person;
use App\Models\User;
use App\Models\Role;
use App\Services\UserRoleProfileSynchronizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class PersonController extends Controller
{
    protected $synchronizer;

    public function __construct(UserRoleProfileSynchronizer $synchronizer)
    {
        $this->synchronizer = $synchronizer;
    }

    /**
     * 顯示人員列表
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Person::class);

        $query = Person::with(['teacherProfile', 'staffProfile', 'userRoles.role'])
            ->orderBy('sort_order')
            ->orderBy('name');

        // 搜尋功能
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // 角色篩選
        if ($request->has('role') && $request->role) {
            $query->whereHas('userRoles', function ($q) use ($request) {
                $q->whereHas('role', function ($roleQuery) use ($request) {
                    $roleQuery->where('name', $request->role);
                })->where('status', 'active');
            });
        }

        // 狀態篩選
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $people = $query->paginate(20)->withQueryString();

        return Inertia::render('Manage/People/Index', [
            'people' => $people,
            'filters' => $request->all('search', 'role', 'status'),
            'roles' => Role::orderByPriority()->get(),
        ]);
    }

    /**
     * 顯示建立人員表單
     */
    public function create()
    {
        Gate::authorize('create', Person::class);

        return Inertia::render('Manage/People/Create', [
            'roles' => Role::orderByPriority()->get(),
            'users' => User::whereDoesntHave('userRoles', function ($q) {
                $q->where('status', 'active');
            })->get(['id', 'name', 'email']),
        ]);
    }

    /**
     * 儲存新人員
     */
    public function store(Request $request)
    {
        Gate::authorize('create', Person::class);

        $validated = $request->validate([
            'name' => 'required|array',
            'name.zh-TW' => 'required|string|max:255',
            'name.en' => 'required|string|max:255',
            'email' => 'required|email|unique:people,email',
            'phone' => 'nullable|string|max:255',
            'photo_url' => 'nullable|url',
            'bio' => 'nullable|array',
            'bio.zh-TW' => 'nullable|string',
            'bio.en' => 'nullable|string',
            'status' => 'required|in:active,inactive,retired',
            'visible' => 'boolean',
            'sort_order' => 'integer|min:0',
            'roles' => 'required|array|min:1',
            'roles.*' => 'exists:roles,name',
            'user_id' => 'nullable|exists:users,id',

            // 教師專屬欄位
            'teacher_data' => 'nullable|array',
            'teacher_data.office' => 'nullable|string|max:255',
            'teacher_data.job_title' => 'nullable|string|max:255',
            'teacher_data.title' => 'nullable|array',
            'teacher_data.expertise' => 'nullable|array',
            'teacher_data.education' => 'nullable|array',

            // 職員專屬欄位
            'staff_data' => 'nullable|array',
            'staff_data.position' => 'nullable|array',
            'staff_data.department' => 'nullable|array',
        ]);

        $personData = collect($validated)->only([
            'name', 'email', 'phone', 'photo_url', 'bio',
            'status', 'visible', 'sort_order'
        ])->toArray();

        $personData['visible'] = $request->boolean('visible', true);
        $personData['sort_order'] = $request->integer('sort_order', 0);

        $user = $validated['user_id'] ? User::find($validated['user_id']) : null;

        $person = $this->synchronizer->createPersonWithRoles(
            $personData,
            $validated['roles'],
            $user
        );

        // 處理教師專屬資料
        if (in_array('teacher', $validated['roles']) && !empty($validated['teacher_data'])) {
            $person->teacherProfile->update($validated['teacher_data']);
        }

        // 處理職員專屬資料
        if (in_array('staff', $validated['roles']) && !empty($validated['staff_data'])) {
            $person->staffProfile->update($validated['staff_data']);
        }

        return redirect()->route('manage.people.index')
            ->with('success', '人員資料已成功建立');
    }

    /**
     * 顯示人員詳細資料
     */
    public function show(Person $person)
    {
        Gate::authorize('view', $person);

        $person->load([
            'userRoles.role',
            'teacherProfile.links',
            'teacherProfile.publications',
            'teacherProfile.projects',
            'teacherProfile.labs',
            'staffProfile.classrooms'
        ]);

        return Inertia::render('Manage/People/Show', [
            'person' => $person,
            'profiles' => $this->synchronizer->getUserProfiles($person->users->first()),
        ]);
    }

    /**
     * 顯示編輯人員表單
     */
    public function edit(Person $person)
    {
        Gate::authorize('update', $person);

        $person->load(['userRoles.role', 'teacherProfile', 'staffProfile']);

        $editableFields = Gate::forUser(auth()->user())
            ->inspect('getEditableFields', $person)
            ->allowed() ?
            auth()->user()->can('getEditableFields', $person) : [];

        return Inertia::render('Manage/People/Edit', [
            'person' => $person,
            'roles' => Role::orderByPriority()->get(),
            'editableFields' => $editableFields,
            'canManage' => auth()->user()->can('manage', $person),
        ]);
    }

    /**
     * 更新人員資料
     */
    public function update(Request $request, Person $person)
    {
        Gate::authorize('update', $person);

        $editableFields = app(PersonPolicy::class)->getEditableFields(auth()->user(), $person);

        $rules = [];
        foreach ($editableFields as $field) {
            switch ($field) {
                case 'name':
                case 'name_en':
                    $rules['name'] = 'sometimes|array';
                    $rules['name.zh-TW'] = 'sometimes|string|max:255';
                    $rules['name.en'] = 'sometimes|string|max:255';
                    break;
                case 'email':
                    $rules['email'] = 'sometimes|email|unique:people,email,' . $person->id;
                    break;
                case 'bio':
                case 'bio_en':
                    $rules['bio'] = 'sometimes|array';
                    $rules['bio.zh-TW'] = 'nullable|string';
                    $rules['bio.en'] = 'nullable|string';
                    break;
                default:
                    $rules[$field] = 'sometimes|string|max:255';
                    break;
            }
        }

        if (auth()->user()->can('manage', $person)) {
            $rules = array_merge($rules, [
                'status' => 'sometimes|in:active,inactive,retired',
                'visible' => 'sometimes|boolean',
                'sort_order' => 'sometimes|integer|min:0',
            ]);
        }

        $validated = $request->validate($rules);

        $person->update($validated);

        return redirect()->route('manage.people.show', $person)
            ->with('success', '人員資料已更新');
    }

    /**
     * 刪除人員
     */
    public function destroy(Person $person)
    {
        Gate::authorize('delete', $person);

        $person->delete();

        return redirect()->route('manage.people.index')
            ->with('success', '人員資料已刪除');
    }

    /**
     * 更新人員狀態
     */
    public function updateStatus(Request $request, Person $person)
    {
        Gate::authorize('manage', $person);

        $request->validate([
            'status' => 'required|in:active,inactive,retired'
        ]);

        $this->synchronizer->updatePersonStatus($person, $request->status);

        return back()->with('success', '人員狀態已更新');
    }

    /**
     * 批次更新排序
     */
    public function updateOrder(Request $request)
    {
        Gate::authorize('create', Person::class);

        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:people,id',
            'items.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($request->items as $item) {
            Person::where('id', $item['id'])
                ->update(['sort_order' => $item['sort_order']]);
        }

        return back()->with('success', '排序已更新');
    }
}
