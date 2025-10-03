<?php

namespace Tests\Browser\Manage\Teacher;

use App\Models\Lab;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class LabManagementTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected User $teacher;

    protected function setUp(): void
    {
        parent::setUp();

        $this->teacher = User::factory()->create([
            'name' => '測試教師',
            'email' => 'teacher@test.com',
            'password' => bcrypt('password'),
            'role' => 'teacher',
            'status' => 1,
        ]);
    }

    /**
     * 測試：教師可以檢視實驗室列表。
     */
    public function test_teacher_can_view_labs_list(): void
    {
        $lab = Lab::factory()->create([
            'name' => '人工智慧實驗室',
            'field' => 'Artificial Intelligence',
            'principal_investigator_id' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) use ($lab) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/labs')
                ->waitForText('實驗室')
                ->assertSee($lab->name)
                ->assertSee($lab->field);
        });
    }

    /**
     * 測試：教師可以搜尋實驗室。
     */
    public function test_teacher_can_search_labs(): void
    {
        Lab::factory()->create([
            'name' => '人工智慧實驗室',
            'principal_investigator_id' => $this->teacher->id,
        ]);

        Lab::factory()->create([
            'name' => '網路安全實驗室',
            'principal_investigator_id' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/labs')
                ->waitForText('實驗室')
                ->type('input[placeholder*="搜尋"]', '人工智慧')
                ->pause(500)
                ->assertSee('人工智慧實驗室')
                ->assertDontSee('網路安全實驗室');
        });
    }

    /**
     * 測試：教師可以篩選實驗室（依領域）。
     */
    public function test_teacher_can_filter_labs_by_field(): void
    {
        Lab::factory()->create([
            'name' => 'AI 實驗室',
            'field' => 'Artificial Intelligence',
            'principal_investigator_id' => $this->teacher->id,
        ]);

        Lab::factory()->create([
            'name' => '網路實驗室',
            'field' => 'Network Security',
            'principal_investigator_id' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/labs')
                ->waitForText('實驗室')
                ->click('button:contains("篩選")') // 假設有篩選按鈕
                ->pause(300)
                ->select('select[name="field"]', 'Artificial Intelligence')
                ->pause(500)
                ->assertSee('AI 實驗室')
                ->assertDontSee('網路實驗室');
        });
    }

    /**
     * 測試：教師可以建立新實驗室。
     */
    public function test_teacher_can_create_lab(): void
    {
        $members = User::factory()->count(2)->create([
            'role' => 'user',
            'status' => 1,
        ]);

        $this->browse(function (Browser $browser) use ($members) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/labs')
                ->waitForText('實驗室')
                ->clickLink('新增實驗室')
                ->waitForLocation('/manage/teacher/labs/create')
                ->type('input[name="name"]', '測試實驗室')
                ->type('input[name="name_en"]', 'Test Lab')
                ->type('input[name="field"]', 'Computer Science')
                ->type('input[name="location"]', 'Building A, Room 101')
                ->type('input[name="capacity"]', '20')
                ->type('textarea[name="description"]', '這是一個測試實驗室描述')
                ->type('input[name="contact_email"]', 'lab@test.com')
                ->type('input[name="contact_phone"]', '02-1234-5678')
                ->type('input[name="website_url"]', 'https://lab.test.com')
                ->check('input[name="visible"]')
                ->pause(300);

            // 選擇成員
            foreach ($members as $member) {
                $browser->check("input[type='checkbox'][value='{$member->id}']");
            }

            $browser->press('儲存')
                ->waitForLocation('/manage/teacher/labs')
                ->assertSee('測試實驗室')
                ->assertSee('實驗室建立成功');
        });

        $this->assertDatabaseHas('spaces', [
            'name' => '測試實驗室',
            'field' => 'Computer Science',
            'principal_investigator_id' => $this->teacher->id,
        ]);
    }

    /**
     * 測試：教師可以編輯實驗室。
     */
    public function test_teacher_can_edit_lab(): void
    {
        $lab = Lab::factory()->create([
            'name' => '舊名稱',
            'field' => '舊領域',
            'principal_investigator_id' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) use ($lab) {
            $browser->loginAs($this->teacher)
                ->visit("/manage/teacher/labs/{$lab->id}/edit")
                ->waitForText('編輯實驗室')
                ->clear('input[name="name"]')
                ->type('input[name="name"]', '更新後的實驗室')
                ->clear('input[name="field"]')
                ->type('input[name="field"]', '更新後的領域')
                ->press('儲存')
                ->waitForLocation('/manage/teacher/labs')
                ->assertSee('更新後的實驗室')
                ->assertSee('實驗室更新成功');
        });

        $this->assertDatabaseHas('spaces', [
            'id' => $lab->id,
            'name' => '更新後的實驗室',
            'field' => '更新後的領域',
        ]);
    }

    /**
     * 測試：教師可以查看實驗室詳情。
     */
    public function test_teacher_can_view_lab_details(): void
    {
        $lab = Lab::factory()->create([
            'name' => '詳情測試實驗室',
            'field' => 'AI',
            'location' => 'Building A',
            'description' => '這是詳細描述',
            'principal_investigator_id' => $this->teacher->id,
            'visible' => true,
        ]);

        $member = User::factory()->create([
            'name' => '測試成員',
            'role' => 'user',
        ]);
        $lab->members()->attach($member->id);

        $this->browse(function (Browser $browser) use ($lab, $member) {
            $browser->loginAs($this->teacher)
                ->visit("/manage/teacher/labs/{$lab->id}")
                ->waitForText($lab->name)
                ->assertSee($lab->field)
                ->assertSee($lab->location)
                ->assertSee($lab->description)
                ->assertSee($member->name)
                ->assertSee('公開顯示');
        });
    }

    /**
     * 測試：教師可以刪除實驗室。
     */
    public function test_teacher_can_delete_lab(): void
    {
        $lab = Lab::factory()->create([
            'name' => '待刪除實驗室',
            'principal_investigator_id' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) use ($lab) {
            $browser->loginAs($this->teacher)
                ->visit("/manage/teacher/labs/{$lab->id}")
                ->waitForText($lab->name)
                ->press('刪除實驗室')
                ->whenAvailable('.swal2-popup', function ($modal) {
                    $modal->press('確定');
                })
                ->waitForLocation('/manage/teacher/labs')
                ->assertSee('實驗室刪除成功')
                ->assertDontSee($lab->name);
        });

        $this->assertSoftDeleted('spaces', [
            'id' => $lab->id,
        ]);
    }

    /**
     * 測試：建立實驗室時的表單驗證。
     */
    public function test_lab_creation_form_validation(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->teacher)
                ->visit('/manage/teacher/labs/create')
                ->waitForText('新增實驗室')
                ->press('儲存')
                ->pause(500)
                ->assertSee('必填') // 驗證必填欄位錯誤訊息
                ->assertPathIs('/manage/teacher/labs/create');
        });
    }

    /**
     * 測試：教師可以管理實驗室成員。
     */
    public function test_teacher_can_manage_lab_members(): void
    {
        $lab = Lab::factory()->create([
            'name' => '成員管理測試',
            'principal_investigator_id' => $this->teacher->id,
        ]);

        $member1 = User::factory()->create(['name' => '成員A', 'role' => 'user']);
        $member2 = User::factory()->create(['name' => '成員B', 'role' => 'user']);

        $lab->members()->attach($member1->id);

        $this->browse(function (Browser $browser) use ($lab, $member1, $member2) {
            $browser->loginAs($this->teacher)
                ->visit("/manage/teacher/labs/{$lab->id}/edit")
                ->waitForText('編輯實驗室')
                ->assertChecked("input[type='checkbox'][value='{$member1->id}']")
                ->assertNotChecked("input[type='checkbox'][value='{$member2->id}']")
                // 移除成員A，新增成員B
                ->uncheck("input[type='checkbox'][value='{$member1->id}']")
                ->check("input[type='checkbox'][value='{$member2->id}']")
                ->press('儲存')
                ->waitForLocation('/manage/teacher/labs')
                ->assertSee('實驗室更新成功');
        });

        $this->assertDatabaseMissing('space_user', [
            'space_id' => $lab->id,
            'user_id' => $member1->id,
        ]);

        $this->assertDatabaseHas('space_user', [
            'space_id' => $lab->id,
            'user_id' => $member2->id,
        ]);
    }

    /**
     * 測試：教師可以設定實驗室可見性。
     */
    public function test_teacher_can_toggle_lab_visibility(): void
    {
        $lab = Lab::factory()->create([
            'name' => '可見性測試',
            'visible' => true,
            'principal_investigator_id' => $this->teacher->id,
        ]);

        $this->browse(function (Browser $browser) use ($lab) {
            $browser->loginAs($this->teacher)
                ->visit("/manage/teacher/labs/{$lab->id}/edit")
                ->waitForText('編輯實驗室')
                ->assertChecked('input[name="visible"]')
                ->uncheck('input[name="visible"]')
                ->press('儲存')
                ->waitForLocation('/manage/teacher/labs');
        });

        $this->assertDatabaseHas('spaces', [
            'id' => $lab->id,
            'visible' => false,
        ]);
    }
}
