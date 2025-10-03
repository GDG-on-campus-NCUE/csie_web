<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_projects', function (Blueprint $table) {
            $table->id()->comment('主鍵');
            $table->date('start_date')->comment('研究計畫開始日期');
            $table->date('end_date')->nullable()->comment('研究計畫結束日期，未結束時可為空值');
            $table->string('title')->comment('研究計畫名稱');
            $table->string('title_en')->nullable()->comment('研究計畫英文名稱');
            $table->string('sponsor')->comment('研究計畫執行單位或出資單位');
            $table->unsignedBigInteger('total_budget')->nullable()->comment('研究計畫總經費，若未知可為空值');
            $table->string('principal_investigator')->comment('研究計畫主持人');
            $table->text('summary')->nullable()->comment('研究計畫摘要說明');
            $table->foreignId('space_id')->nullable()->constrained('spaces')->nullOnDelete()->comment('關聯的 Space 資源');
            $table->timestamp('created_at')->nullable()->comment('建立時間');
            $table->timestamp('updated_at')->nullable()->comment('最後更新時間');
            $table->softDeletes()->comment('軟刪除時間');
        });

        Schema::create('papers', function (Blueprint $table) {
            $table->id()->comment('主鍵');
            $table->unsignedTinyInteger('type')
                ->comment('論文類型：1=期刊、2=研討會，於服務層轉換名稱');
            $table->date('published_date')->comment('論文發表日期');
            $table->string('title')->comment('論文名稱');
            $table->string('venue_name')->comment('期刊或研討會名稱');
            $table->string('authors')->comment('論文發表人');
            $table->text('summary')->nullable()->comment('論文摘要或說明');
            $table->string('doi')->nullable()->comment('論文 DOI 或識別碼，期刊類型常用');
            $table->string('location')->nullable()->comment('研討會舉辦地點，僅研討會類型使用');
            $table->timestamp('created_at')->nullable()->comment('建立時間');
            $table->timestamp('updated_at')->nullable()->comment('最後更新時間');
        });

        Schema::create('research_project_tag', function (Blueprint $table) {
            $table->unsignedBigInteger('research_project_id')->comment('研究計畫 ID');
            $table->unsignedBigInteger('tag_id')->comment('標籤 ID');

            $table->primary(['research_project_id', 'tag_id'], 'research_project_tag_primary');
            $table->foreign('research_project_id')->references('id')->on('research_projects')->cascadeOnDelete();
            $table->foreign('tag_id')->references('id')->on('tags')->cascadeOnDelete();
        });

        Schema::create('paper_tag', function (Blueprint $table) {
            $table->unsignedBigInteger('paper_id')->comment('論文 ID');
            $table->unsignedBigInteger('tag_id')->comment('標籤 ID');

            $table->primary(['paper_id', 'tag_id'], 'paper_tag_primary');
            $table->foreign('paper_id')->references('id')->on('papers')->cascadeOnDelete();
            $table->foreign('tag_id')->references('id')->on('tags')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paper_tag');
        Schema::dropIfExists('research_project_tag');
        Schema::dropIfExists('papers');
        Schema::dropIfExists('research_projects');
    }
};
