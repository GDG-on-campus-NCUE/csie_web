<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Person;
use App\Services\UserRoleProfileSynchronizer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    protected $synchronizer;

    public function __construct(UserRoleProfileSynchronizer $synchronizer)
    {
        $this->synchronizer = $synchronizer;
    }

    /**
     * 顯示使用者的所有人員檔案
     */
    public function index()
    {
        $user = auth()->user();
        $profiles = $this->synchronizer->getUserProfiles($user);

        return Inertia::render('Profile/Index', [
            'profiles' => $profiles,
            'userRoles' => $user->getActiveRoles(),
        ]);
    }

    /**
     * 顯示特定人員檔案編輯頁面
     */
    public function edit(Person $person)
    {
        $user = auth()->user();

        if (!$this->synchronizer->canUserEditPerson($user, $person)) {
            abort(403, '您沒有權限編輯此檔案');
        }

        $person->load(['teacherProfile', 'staffProfile']);

        // 取得可編輯的欄位
        $editablePersonFields = app(\App\Policies\PersonPolicy::class)
            ->getEditableFields($user, $person);

        $editableTeacherFields = [];
        $editableStaffFields = [];

        if ($person->teacherProfile) {
            $editableTeacherFields = app(\App\Policies\TeacherProfilePolicy::class)
                ->getEditableFields($user, $person->teacherProfile);
        }

        if ($person->staffProfile) {
            $editableStaffFields = app(\App\Policies\StaffProfilePolicy::class)
                ->getEditableFields($user, $person->staffProfile);
        }

        return Inertia::render('Profile/Edit', [
            'person' => $person,
            'editableFields' => [
                'person' => $editablePersonFields,
                'teacher' => $editableTeacherFields,
                'staff' => $editableStaffFields,
            ],
            'isOwnProfile' => true,
        ]);
    }

    /**
     * 更新人員檔案
     */
    public function update(Request $request, Person $person)
    {
        $user = auth()->user();

        if (!$this->synchronizer->canUserEditPerson($user, $person)) {
            abort(403, '您沒有權限編輯此檔案');
        }

        // 取得可編輯的欄位
        $editablePersonFields = app(\App\Policies\PersonPolicy::class)
            ->getEditableFields($user, $person);

        // 建立驗證規則
        $rules = [];

        foreach ($editablePersonFields as $field) {
            switch ($field) {
                case 'bio':
                    $rules['bio'] = 'nullable|array';
                    $rules['bio.zh-TW'] = 'nullable|string';
                    $rules['bio.en'] = 'nullable|string';
                    break;
                case 'phone':
                    $rules['phone'] = 'nullable|string|max:255';
                    break;
                case 'photo_url':
                    $rules['photo_url'] = 'nullable|url';
                    break;
            }
        }

        // 處理教師檔案欄位
        if ($person->teacherProfile) {
            $editableTeacherFields = app(\App\Policies\TeacherProfilePolicy::class)
                ->getEditableFields($user, $person->teacherProfile);

            foreach ($editableTeacherFields as $field) {
                switch ($field) {
                    case 'title':
                    case 'title_en':
                        $rules['teacher_data.title'] = 'nullable|array';
                        $rules['teacher_data.title.zh-TW'] = 'nullable|string|max:255';
                        $rules['teacher_data.title.en'] = 'nullable|string|max:255';
                        break;
                    case 'expertise':
                    case 'expertise_en':
                        $rules['teacher_data.expertise'] = 'nullable|array';
                        break;
                    case 'education':
                    case 'education_en':
                        $rules['teacher_data.education'] = 'nullable|array';
                        break;
                    case 'office':
                        $rules['teacher_data.office'] = 'nullable|string|max:255';
                        break;
                }
            }
        }

        // 處理職員檔案欄位
        if ($person->staffProfile) {
            $editableStaffFields = app(\App\Policies\StaffProfilePolicy::class)
                ->getEditableFields($user, $person->staffProfile);

            foreach ($editableStaffFields as $field) {
                switch ($field) {
                    case 'position':
                    case 'position_en':
                        $rules['staff_data.position'] = 'nullable|array';
                        $rules['staff_data.position.zh-TW'] = 'nullable|string|max:255';
                        $rules['staff_data.position.en'] = 'nullable|string|max:255';
                        break;
                }
            }
        }

        $validated = $request->validate($rules);

        // 更新人員基本資料
        $personData = collect($validated)->except(['teacher_data', 'staff_data'])->toArray();
        if (!empty($personData)) {
            $person->update($personData);
        }

        // 更新教師檔案
        if (isset($validated['teacher_data']) && $person->teacherProfile) {
            $person->teacherProfile->update($validated['teacher_data']);
        }

        // 更新職員檔案
        if (isset($validated['staff_data']) && $person->staffProfile) {
            $person->staffProfile->update($validated['staff_data']);
        }

        return redirect()->route('profile.index')
            ->with('success', '個人檔案已更新');
    }

    /**
     * 顯示教師檔案 (為了向後相容)
     */
    public function teacherProfile()
    {
        $user = auth()->user();
        $teacherProfile = $user->teacherProfile;

        if (!$teacherProfile) {
            return redirect()->route('profile.index')
                ->with('error', '您沒有教師檔案');
        }

        return redirect()->route('profile.edit', $teacherProfile->person);
    }

    /**
     * 顯示職員檔案 (為了向後相容)
     */
    public function staffProfile()
    {
        $user = auth()->user();
        $staffProfile = $user->staffProfile;

        if (!$staffProfile) {
            return redirect()->route('profile.index')
                ->with('error', '您沒有職員檔案');
        }

        return redirect()->route('profile.edit', $staffProfile->person);
    }
}
