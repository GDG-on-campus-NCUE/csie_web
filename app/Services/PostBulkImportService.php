<?php

namespace App\Services;

use App\Models\Post;
use App\Models\PostCategory;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

/**
 * 公告批次匯入服務
 * 負責處理 CSV 檔案的匯入邏輯
 * 提供完整的錯誤處理和資料驗證
 */
class PostBulkImportService
{
    /**
     * 支援的檔案類型
     */
    private const SUPPORTED_MIME_TYPES = [
        'text/csv',
        'text/plain',
        'application/csv',
    ];

    /**
     * 最大檔案大小 (5MB)
     */
    private const MAX_FILE_SIZE = 5 * 1024 * 1024;

    /**
     * 必要的 CSV 欄位
     */
    private const REQUIRED_FIELDS = ['title', 'content'];

    /**
     * 分類識別欄位（至少需要其中一個）
     */
    private const CATEGORY_FIELDS = ['category_slug', 'category_id'];

    /**
     * 處理多個檔案的批次匯入
     *
     * @param Request $request
     * @param array<UploadedFile> $files
     * @return array{created: int, skipped: int, errors: array<string>}
     */
    public function importFromFiles(Request $request, array $files): array
    {
        $totalCreated = 0;
        $totalSkipped = 0;
        $allErrors = [];

        // 處理每個檔案
        foreach ($files as $file) {
            if (!$file instanceof UploadedFile) {
                $allErrors[] = '無效的檔案格式';
                continue;
            }

            // 驗證檔案
            $validation = $this->validateFile($file);
            if (!$validation['valid']) {
                $allErrors = array_merge($allErrors, $validation['errors']);
                continue;
            }

            try {
                $result = $this->processFile($request, $file);
                $totalCreated += $result['created'];
                $totalSkipped += $result['skipped'];

                if (!empty($result['errors'])) {
                    $allErrors = array_merge($allErrors, $result['errors']);
                }
            } catch (Throwable $e) {
                Log::error('批次匯入檔案處理失敗', [
                    'file' => $file->getClientOriginalName(),
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);

                $allErrors[] = "檔案 \"{$file->getClientOriginalName()}\" 處理失敗：{$e->getMessage()}";
            }
        }

        return [
            'created' => $totalCreated,
            'skipped' => $totalSkipped,
            'errors' => $allErrors,
        ];
    }

    /**
     * 驗證上傳的檔案
     *
     * @param UploadedFile $file
     * @return array{valid: bool, errors: array<string>}
     */
    private function validateFile(UploadedFile $file): array
    {
        $errors = [];
        $fileName = $file->getClientOriginalName();

        // 檢查檔案大小
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            $errors[] = "檔案 \"{$fileName}\" 大小超過 5MB 限制";
        }

        // 檢查檔案類型
        $mimeType = $file->getMimeType();
        $extension = strtolower($file->getClientOriginalExtension());

        if (!in_array($mimeType, self::SUPPORTED_MIME_TYPES) && $extension !== 'csv') {
            $errors[] = "檔案 \"{$fileName}\" 格式不支援，請使用 CSV 檔案";
        }

        // 檢查檔案是否可讀取
        $realPath = $file->getRealPath();
        if (!$realPath || !is_readable($realPath)) {
            $errors[] = "檔案 \"{$fileName}\" 無法讀取";
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * 處理單個 CSV 檔案
     *
     * @param Request $request
     * @param UploadedFile $file
     * @return array{created: int, skipped: int, errors: array<string>}
     */
    private function processFile(Request $request, UploadedFile $file): array
    {
        $fileName = $file->getClientOriginalName();
        $realPath = $file->getRealPath();

        $handle = fopen($realPath, 'rb');
        if ($handle === false) {
            return [
                'created' => 0,
                'skipped' => 0,
                'errors' => ["檔案 \"{$fileName}\" 無法開啟"],
            ];
        }

        $created = 0;
        $skipped = 0;
        $errors = [];
        $lineNumber = 1;

        try {
            // 讀取標頭
            $header = fgetcsv($handle);
            if ($header === false) {
                return [
                    'created' => 0,
                    'skipped' => 0,
                    'errors' => ["檔案 \"{$fileName}\" 沒有資料"],
                ];
            }

            // 正規化標頭欄位
            $normalizedHeader = $this->normalizeHeader($header);

            // 驗證必要欄位
            $validation = $this->validateHeader($normalizedHeader, $fileName);
            if (!$validation['valid']) {
                return [
                    'created' => 0,
                    'skipped' => 0,
                    'errors' => $validation['errors'],
                ];
            }

            // 處理每一行資料
            while (($row = fgetcsv($handle)) !== false) {
                $lineNumber++;

                // 跳過空行
                if ($this->isEmptyRow($row)) {
                    continue;
                }

                try {
                    $postData = $this->parseRowData($row, $normalizedHeader, $fileName, $lineNumber);

                    DB::transaction(function () use ($request, $postData) {
                        $this->createPost($request, $postData);
                    });

                    $created++;

                    Log::info('成功匯入公告', [
                        'file' => $fileName,
                        'line' => $lineNumber,
                        'title' => $postData['title'],
                    ]);

                } catch (Throwable $e) {
                    $skipped++;
                    $errorMsg = "第 {$lineNumber} 行：{$e->getMessage()}";
                    $errors[] = $errorMsg;

                    Log::warning('公告匯入失敗', [
                        'file' => $fileName,
                        'line' => $lineNumber,
                        'error' => $e->getMessage(),
                        'data' => $row ?? null,
                    ]);
                }
            }

        } finally {
            fclose($handle);
        }

        return [
            'created' => $created,
            'skipped' => $skipped,
            'errors' => $errors,
        ];
    }

    /**
     * 正規化 CSV 標頭
     *
     * @param array $header
     * @return array<string, int>
     */
    private function normalizeHeader(array $header): array
    {
        $normalized = [];

        foreach ($header as $index => $column) {
            $normalizedColumn = Str::snake(
                str_replace(['-', ' '], '_', strtolower(trim((string) $column)))
            );

            if ($normalizedColumn !== '') {
                $normalized[$normalizedColumn] = $index;
            }
        }

        return $normalized;
    }

    /**
     * 驗證 CSV 標頭是否包含必要欄位
     *
     * @param array $header
     * @param string $fileName
     * @return array{valid: bool, errors: array<string>}
     */
    private function validateHeader(array $header, string $fileName): array
    {
        $errors = [];

        // 檢查必要欄位
        foreach (self::REQUIRED_FIELDS as $field) {
            if (!array_key_exists($field, $header)) {
                $errors[] = "檔案 \"{$fileName}\" 缺少必要欄位：{$field}";
            }
        }

        // 檢查分類欄位（至少需要一個）
        $hasCategoryField = false;
        foreach (self::CATEGORY_FIELDS as $field) {
            if (array_key_exists($field, $header)) {
                $hasCategoryField = true;
                break;
            }
        }

        if (!$hasCategoryField) {
            $categoryFieldsStr = implode(' 或 ', self::CATEGORY_FIELDS);
            $errors[] = "檔案 \"{$fileName}\" 缺少分類欄位：{$categoryFieldsStr}";
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * 檢查是否為空行
     *
     * @param array $row
     * @return bool
     */
    private function isEmptyRow(array $row): bool
    {
        return count(array_filter($row, fn($value) => trim((string) $value) !== '')) === 0;
    }

    /**
     * 解析行資料
     *
     * @param array $row
     * @param array $header
     * @param string $fileName
     * @param int $lineNumber
     * @return array
     * @throws \RuntimeException
     */
    private function parseRowData(array $row, array $header, string $fileName, int $lineNumber): array
    {
        // 解析標題
        $title = trim((string) ($row[$header['title']] ?? ''));
        if ($title === '') {
            throw new \RuntimeException('標題不得為空');
        }

        // 解析分類
        $category = $this->resolveCategory($row, $header);
        if (!$category) {
            throw new \RuntimeException('找不到對應的分類');
        }

        // 解析內容
        $rawContent = trim((string) ($row[$header['content']] ?? ''));
        if ($rawContent === '') {
            throw new \RuntimeException('內容不得為空');
        }

        $content = $this->processContent($rawContent);

        // 解析其他欄位
        $slug = $this->parseSlug($row, $header, $title);
        $summary = $this->parseSummary($row, $header);
        $status = $this->parseStatus($row, $header);
        $publishAt = $this->parsePublishAt($row, $header, $status);
        $tags = $this->parseTags($row, $header);

        // 英文欄位
        $titleEn = isset($header['title_en'])
            ? trim((string) ($row[$header['title_en']] ?? ''))
            : '';

        $contentEn = isset($header['content_en'])
            ? $this->processContent(trim((string) ($row[$header['content_en']] ?? '')))
            : null;

        $summaryEn = isset($header['summary_en'])
            ? $this->sanitizePlainText($row[$header['summary_en']] ?? null)
            : null;

        $sourceUrl = isset($header['source_url'])
            ? trim((string) ($row[$header['source_url']] ?? ''))
            : null;

        return [
            'category_id' => $category->id,
            'title' => $title,
            'title_en' => $titleEn ?: $title,
            'slug' => $slug,
            'summary' => $summary,
            'summary_en' => $summaryEn ?? $summary,
            'content' => $content,
            'content_en' => $contentEn ?? $content,
            'status' => $status,
            'publish_at' => $publishAt,
            'tags' => $tags,
            'source_url' => $sourceUrl ?: null,
        ];
    }

    /**
     * 解析分類
     *
     * @param array $row
     * @param array $header
     * @return PostCategory|null
     */
    private function resolveCategory(array $row, array $header): ?PostCategory
    {
        // 優先使用 category_slug
        if (isset($header['category_slug'])) {
            $categorySlug = trim((string) ($row[$header['category_slug']] ?? ''));
            if ($categorySlug !== '') {
                $category = PostCategory::where('slug', $categorySlug)->first();
                if ($category) {
                    return $category;
                }
            }
        }

        // 使用 category_id
        if (isset($header['category_id'])) {
            $categoryId = trim((string) ($row[$header['category_id']] ?? ''));
            if (is_numeric($categoryId)) {
                return PostCategory::find((int) $categoryId);
            }
        }

        // 嘗試用名稱匹配（最後手段）
        if (isset($header['category_slug'])) {
            $identifier = trim((string) ($row[$header['category_slug']] ?? ''));
            if ($identifier !== '') {
                return PostCategory::where('name', $identifier)
                    ->orWhere('name_en', $identifier)
                    ->first();
            }
        }

        return null;
    }

    /**
     * 處理內容文字
     *
     * @param string $content
     * @return string
     */
    private function processContent(string $content): string
    {
        // 正規化換行符號
        $normalizedContent = str_replace(["\r\n", "\r"], "\n", $content);

        // 轉換為 HTML 格式
        return nl2br($this->sanitizeRichText($normalizedContent));
    }

    /**
     * 清理富文本內容
     *
     * @param string $content
     * @return string
     */
    private function sanitizeRichText(string $content): string
    {
        // 基本的 HTML 清理
        $allowed = '<p><br><strong><em><u><ol><ul><li><a><h1><h2><h3><h4><h5><h6>';
        return strip_tags($content, $allowed);
    }

    /**
     * 清理純文字內容
     *
     * @param mixed $text
     * @return string|null
     */
    private function sanitizePlainText($text): ?string
    {
        if ($text === null || $text === '') {
            return null;
        }

        return trim(strip_tags((string) $text));
    }

    /**
     * 解析 slug
     *
     * @param array $row
     * @param array $header
     * @param string $title
     * @return string
     */
    private function parseSlug(array $row, array $header, string $title): string
    {
        $slug = isset($header['slug'])
            ? trim((string) ($row[$header['slug']] ?? ''))
            : '';

        if ($slug === '') {
            $slug = Str::slug($title);
        }

        // 確保 slug 唯一
        return $this->ensureUniqueSlug($slug);
    }

    /**
     * 確保 slug 的唯一性
     *
     * @param string $slug
     * @return string
     */
    private function ensureUniqueSlug(string $slug): string
    {
        $originalSlug = $slug;
        $counter = 1;

        while (Post::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * 解析摘要
     *
     * @param array $row
     * @param array $header
     * @return string|null
     */
    private function parseSummary(array $row, array $header): ?string
    {
        // 優先使用 summary 欄位
        if (isset($header['summary'])) {
            $summary = $this->sanitizePlainText($row[$header['summary']] ?? null);
            if ($summary !== null) {
                return $summary;
            }
        }

        // 使用 excerpt 作為替代
        if (isset($header['excerpt'])) {
            return $this->sanitizePlainText($row[$header['excerpt']] ?? null);
        }

        return null;
    }

    /**
     * 解析狀態
     *
     * @param array $row
     * @param array $header
     * @return string
     */
    private function parseStatus(array $row, array $header): string
    {
        if (!isset($header['status'])) {
            return 'published';
        }

        $status = strtolower(trim((string) ($row[$header['status']] ?? '')));

        if (in_array($status, ['draft', 'published', 'scheduled'], true)) {
            return $status;
        }

        return 'published';
    }

    /**
     * 解析發布時間
     *
     * @param array $row
     * @param array $header
     * @param string $status
     * @return \Carbon\Carbon|null
     */
    private function parsePublishAt(array $row, array $header, string $status): ?\Carbon\Carbon
    {
        if (!isset($header['publish_at'])) {
            return $status === 'published' ? now() : null;
        }

        $publishAtStr = trim((string) ($row[$header['publish_at']] ?? ''));
        if ($publishAtStr === '') {
            return $status === 'published' ? now() : null;
        }

        try {
            $publishAt = \Carbon\Carbon::parse($publishAtStr);

            if ($status === 'scheduled' && $publishAt->isPast()) {
                // 如果是排程狀態但時間已過，改為立即發布
                return now();
            }

            return $publishAt;
        } catch (\Exception $e) {
            // 無法解析時間，根據狀態決定
            return $status === 'published' ? now() : null;
        }
    }

    /**
     * 解析標籤
     *
     * @param array $row
     * @param array $header
     * @return array
     */
    private function parseTags(array $row, array $header): array
    {
        if (!isset($header['tags'])) {
            return [];
        }

        $tagsStr = trim((string) ($row[$header['tags']] ?? ''));
        if ($tagsStr === '') {
            return [];
        }

        // 分割標籤（支援逗號、分號、豎線分隔）
        $tags = preg_split('/[,;|]/', $tagsStr);

        return array_map('trim', array_filter($tags, fn($tag) => trim($tag) !== ''));
    }

    /**
     * 建立公告
     *
     * @param Request $request
     * @param array $postData
     * @return Post
     */
    private function createPost(Request $request, array $postData): Post
    {
        $post = new Post([
            'category_id' => $postData['category_id'],
            'title' => $postData['title'],
            'title_en' => $postData['title_en'],
            'slug' => $postData['slug'],
            'summary' => $postData['summary'],
            'summary_en' => $postData['summary_en'],
            'content' => $postData['content'],
            'content_en' => $postData['content_en'],
            'status' => $postData['status'],
            'publish_at' => $postData['publish_at'],
            'expire_at' => null,
            'pinned' => false,
            'tags' => $postData['tags'],
            'source_type' => 'import',
            'source_url' => $postData['source_url'],
            'views' => 0,
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        $post->save();

        return $post;
    }
}
