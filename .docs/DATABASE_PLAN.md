# 資料庫規劃

以下整理近期新增或調整的資料表，說明其用途、欄位與外鍵對應關係。

## users
- **作用**：系統使用者的主檔。
- **補充**：`status` 採用數字代碼儲存，於服務層或控制器對應實際權限名稱，方便擴充權限等級。

| 欄位 | 類型 | 說明 | 外鍵／備註 |
| --- | --- | --- | --- |
| id | BIGINT | 主鍵 | |
| name | VARCHAR | 使用者名稱 | |
| email | VARCHAR | 使用者信箱 | 唯一值 |
| locale | VARCHAR | 偏好的介面語系 | 可為空值 |
| status | TINYINT UNSIGNED | 使用者狀態代碼 | 預設 1（1=啟用、2=停用），於服務層轉換文字 |
| email_verified_at | TIMESTAMP | 信箱驗證時間 | 可為空值 |
| password | VARCHAR | 登入密碼雜湊值 | |
| remember_token | VARCHAR | 記住登入 Token | 可為空值 |
| deleted_at | TIMESTAMP | 軟刪除時間 | 可為空值 |
| created_at | TIMESTAMP | 建立時間 | 可為空值 |
| updated_at | TIMESTAMP | 最後更新時間 | 可為空值 |

## user_profiles
- **作用**：儲存使用者的個人檔案資訊與經歷。
- **關聯**：`user_id` 對應 `users.id`，一對一；`user_profile_links.user_profile_id` 指向此表。

| 欄位 | 類型 | 說明 | 外鍵／備註 |
| --- | --- | --- | --- |
| id | BIGINT | 主鍵 | |
| user_id | BIGINT | 對應的使用者 ID | `users.id`，唯一並隨使用者刪除而一併刪除 |
| avatar_url | LONGTEXT | 大頭照網址 | 可為空值 |
| bio | LONGTEXT | 個人簡介 | 可為空值 |
| experience | JSON | 經歷資訊 JSON | 可為空值 |
| education | JSON | 學歷資訊 JSON | 可為空值 |
| created_at | TIMESTAMP | 建立時間 | 可為空值，由系統維護 |
| updated_at | TIMESTAMP | 最後更新時間 | 可為空值，由系統維護 |

## user_profile_links
- **作用**：儲存使用者在外部平台的連結（社群、個人網站等）。
- **關聯**：`user_profile_id` 對應 `user_profiles.id`，使用者刪除時一併刪除。

| 欄位 | 類型 | 說明 | 外鍵／備註 |
| --- | --- | --- | --- |
| id | BIGINT | 主鍵 | |
| user_profile_id | BIGINT | 所屬使用者個人檔案 ID | `user_profiles.id`，使用者刪除時連動刪除 |
| type | VARCHAR(50) | 連結類型 | 預設值 `other` |
| label | VARCHAR | 連結顯示文字 | 可為空值 |
| url | VARCHAR | 連結網址 | |
| sort_order | INT | 排序數值 | 預設為 0 |
| created_at | TIMESTAMP | 建立時間 | 可為空值 |
| updated_at | TIMESTAMP | 最後更新時間 | 可為空值 |

## post_categories
- **作用**：定義文章的分類階層。
- **關聯**：`parent_id` 對應自身 `id` 形成階層；`posts.category_id` 指向此表。

| 欄位 | 類型 | 說明 | 外鍵／備註 |
| --- | --- | --- | --- |
| id | BIGINT | 主鍵 | |
| parent_id | BIGINT | 父層分類 ID | 可為空值，指向 `post_categories.id`，父層刪除時設為 NULL |
| slug | VARCHAR | 分類代碼 | 唯一值 |
| name | VARCHAR | 分類名稱 | |
| name_en | VARCHAR | 分類英文名稱 | |
| sort_order | INT | 排序數值 | 預設為 0 |
| visible | BOOLEAN | 是否顯示 | 預設為 true，並加索引 |
| deleted_at | TIMESTAMP | 軟刪除時間 | 可為空值 |
| created_at | TIMESTAMP | 建立時間 | 可為空值 |
| updated_at | TIMESTAMP | 最後更新時間 | 可為空值 |

## posts
- **作用**：儲存網站文章內容與其屬性。
- **關聯**：`category_id` 對應 `post_categories.id`；`created_by`、`updated_by` 對應 `users.id`。

| 欄位 | 類型 | 說明 | 外鍵／備註 |
| --- | --- | --- | --- |
| id | BIGINT | 主鍵 | |
| category_id | BIGINT | 所屬分類 ID | `post_categories.id`，分類刪除時連動刪除 |
| slug | VARCHAR | 文章代碼 | 唯一值 |
| status | TINYINT UNSIGNED | 文章狀態代碼 | 預設 0（0=草稿、1=公開、2=隱藏），於服務層轉換文字並加索引 |
| source_type | TINYINT UNSIGNED | 內容來源類型代碼 | 預設 1（1=手動、2=匯入、3=外部連結），於服務層轉換文字並加索引 |
| source_url | VARCHAR | 外部來源網址 | 可為空值 |
| publish_at | TIMESTAMP | 發佈時間 | 可為空值並加索引 |
| expire_at | TIMESTAMP | 下架時間 | 可為空值 |
| pinned | BOOLEAN | 是否置頂 | 預設為 false，並加索引 |
| cover_image_url | VARCHAR | 封面圖片網址 | 可為空值 |
| title | VARCHAR | 文章標題 | |
| title_en | VARCHAR | 文章英文標題 | |
| summary | TEXT | 文章摘要 | 可為空值 |
| summary_en | TEXT | 文章英文摘要 | 可為空值 |
| content | LONGTEXT | 文章內容 | |
| content_en | LONGTEXT | 文章英文內容 | |
| views | BIGINT | 瀏覽次數 | 預設 0 |
| created_by | BIGINT | 建立者使用者 ID | `users.id` |
| updated_by | BIGINT | 最後更新者使用者 ID | `users.id` |
| deleted_at | TIMESTAMP | 軟刪除時間 | 可為空值 |
| created_at | TIMESTAMP | 建立時間 | 可為空值 |
| updated_at | TIMESTAMP | 最後更新時間 | 可為空值 |

## post_tag
- **作用**：連結文章與標籤，取代文章表內的 JSON 標籤欄位以符合正規化需求。
- **關聯**：`post_id` 對應 `posts.id`；`tag_id` 對應 `tags.id`。

| 欄位 | 類型 | 說明 | 外鍵／備註 |
| --- | --- | --- | --- |
| post_id | BIGINT | 文章 ID | `posts.id`，刪除文章時一併刪除 |
| tag_id | BIGINT | 標籤 ID | `tags.id`，刪除標籤時一併刪除 |

## programs
- **作用**：建立各類學制（如學士班、碩士班），供前台展示學制概況、課程地圖等內容。
- **關聯**：透過 `program_post` 與文章建立一對多／多對多關聯。

| 欄位 | 類型 | 說明 | 外鍵／備註 |
| --- | --- | --- | --- |
| id | BIGINT | 主鍵 | |
| slug | VARCHAR | 學制代碼，供網址或查詢使用 | 唯一值 |
| name | VARCHAR | 學制名稱 | |
| name_en | VARCHAR | 學制英文名稱 | 可為空值 |
| degree_level | VARCHAR | 學位層級說明，如學士班、碩士班 | 可為空值 |
| summary | TEXT | 學制簡介或特色說明 | 可為空值 |
| metadata | JSON | 學制額外設定 JSON，保留額外顯示需求 | 可為空值 |
| sort_order | INT | 排序數值，數字越小排序越前 | 預設 0 |
| visible | BOOLEAN | 是否顯示於前台 | 預設 true |
| created_at | TIMESTAMP | 建立時間 | 可為空值 |
| updated_at | TIMESTAMP | 最後更新時間 | 可為空值 |

## program_post
- **作用**：學制與文章的樞紐表，可將課程地圖、畢業條件等文章彈性對應至各學制。
- **關聯**：`program_id` 對應 `programs.id`；`post_id` 對應 `posts.id`。

| 欄位 | 類型 | 說明 | 外鍵／備註 |
| --- | --- | --- | --- |
| program_id | BIGINT | 學制 ID | `programs.id`，學制刪除時連動刪除 |
| post_id | BIGINT | 文章 ID | `posts.id`，文章刪除時連動刪除 |
| relation_type | VARCHAR | 關聯備註，如課程地圖、畢業條件 | 可為空值 |
| sort_order | INT | 文章在該學制內的排序數值 | 預設 0 |
| primary(program_id, post_id) | - | 限制同一篇文章在同一學制僅維持一筆關聯 | |

## spaces
- **作用**：統一管理系所內的空間資源，包含研究室、實驗室與教室。
- **關聯**：透過 `space_user` 與使用者建立管理者／聯絡人關係，透過 `space_tag` 串接領域或設備標籤。

| 欄位 | 類型 | 說明 | 外鍵／備註 |
| --- | --- | --- | --- |
| id | BIGINT | 主鍵 | |
| code | VARCHAR | 空間代碼 | 唯一，用於顯示與查詢 |
| space_type | TINYINT UNSIGNED | 空間類型代碼 | 1=研究室、2=實驗室、3=教室，於服務層轉換名稱並加索引 |
| name | VARCHAR | 空間名稱 | |
| name_en | VARCHAR | 空間英文名稱 | 可為空值 |
| location | VARCHAR | 空間位置或樓層資訊 | 可為空值 |
| capacity | INT | 容納人數 | 可為空值 |
| website_url | VARCHAR | 官方網站網址 | 可為空值 |
| contact_email | VARCHAR | 聯絡信箱 | 可為空值 |
| contact_phone | VARCHAR | 聯絡電話 | 可為空值 |
| cover_image_url | VARCHAR | 封面圖片網址 | 可為空值 |
| equipment_summary | VARCHAR | 設備摘要 | 可為空值 |
| description | LONGTEXT | 空間介紹 | 可為空值 |
| description_en | LONGTEXT | 空間英文介紹 | 可為空值 |
| sort_order | INT | 排序數值 | 預設 0 並加索引 |
| visible | BOOLEAN | 是否顯示 | 預設 true 並加索引 |
| deleted_at | TIMESTAMP | 軟刪除時間 | 可為空值 |
| created_at | TIMESTAMP | 建立時間 | 可為空值 |
| updated_at | TIMESTAMP | 最後更新時間 | 可為空值 |

## space_user
- **作用**：空間與使用者的多對多關聯樞紐表，可標示負責人或聯絡窗口。
- **關聯**：`space_id` 對應 `spaces.id`；`user_id` 對應 `users.id`。

| 欄位 | 類型 | 說明 | 外鍵／備註 |
| --- | --- | --- | --- |
| space_id | BIGINT | 空間 ID | `spaces.id`，空間刪除時一併刪除 |
| user_id | BIGINT | 使用者 ID | `users.id`，使用者刪除時一併刪除 |
| unique(space_id,user_id) | - | 限制同一使用者僅被指派一次 | |

## space_tag
- **作用**：空間與標籤的多對多關聯樞紐表，紀錄空間領域或設備分類。
- **關聯**：`space_id` 對應 `spaces.id`；`tag_id` 對應 `tags.id`。

| 欄位 | 類型 | 說明 | 外鍵／備註 |
| --- | --- | --- | --- |
| space_id | BIGINT | 空間 ID | `spaces.id`，空間刪除時一併刪除 |
| tag_id | BIGINT | 標籤 ID | `tags.id`，標籤刪除時一併刪除 |
| unique(space_id,tag_id) | - | 限制同一空間與標籤僅有一筆關聯 | |

## attachments
- **作用**：儲存可附加於多種模型的檔案或外部連結資訊。
- **關聯**：`attached_to_type`、`attached_to_id` 透過多型關聯指向各模型；`uploaded_by` 對應 `users.id`。

| 欄位 | 類型 | 說明 | 外鍵／備註 |
| --- | --- | --- | --- |
| id | BIGINT | 主鍵 | |
| attached_to_type | VARCHAR | 多型關聯模型類型 | 與 `attached_to_id` 組成索引 |
| attached_to_id | BIGINT | 多型關聯模型主鍵 | 與 `attached_to_type` 組成索引 |
| type | TINYINT UNSIGNED | 附件類型代碼 | 1=圖片、2=文件、3=連結，於服務層轉換文字並加索引 |
| title | VARCHAR | 附件標題 | 可為空值 |
| filename | VARCHAR | 原始檔名 | 可為空值 |
| disk | VARCHAR | 儲存磁碟名稱 | 預設 `public` |
| disk_path | VARCHAR | 儲存路徑 | 可為空值 |
| file_url | VARCHAR | 檔案存取網址 | 可為空值 |
| external_url | VARCHAR | 外部連結網址 | 可為空值 |
| mime_type | VARCHAR | 檔案 MIME 類型 | 可為空值 |
| size | BIGINT | 檔案大小位元組 | 可為空值 |
| uploaded_by | BIGINT | 上傳者使用者 ID | 可為空值，對應 `users.id`，使用者刪除時設為 NULL |
| visibility | TINYINT UNSIGNED | 可見性代碼 | 預設 1（1=公開、2=私人），於服務層轉換文字並加索引 |
| alt_text | VARCHAR | 替代文字 | 可為空值 |
| alt_text_en | VARCHAR | 替代文字英文版 | 可為空值 |
| sort_order | INT | 排序數值 | 預設 0 |
| deleted_at | TIMESTAMP | 軟刪除時間 | 可為空值 |
| created_at | TIMESTAMP | 建立時間 | 可為空值 |
| updated_at | TIMESTAMP | 最後更新時間 | 可為空值 |

## contact_messages
- **作用**：保存網站聯絡我們表單的提交紀錄。
- **關聯**：`processed_by` 對應 `users.id`。

| 欄位 | 類型 | 說明 | 外鍵／備註 |
| --- | --- | --- | --- |
| id | BIGINT | 主鍵 | |
| locale | VARCHAR | 表單語系 | 可為空值 |
| name | VARCHAR | 聯絡人姓名 | |
| email | VARCHAR | 聯絡人信箱 | |
| subject | VARCHAR | 主旨 | 可為空值 |
| message | LONGTEXT | 訊息內容 | |
| file_url | VARCHAR | 附件連結 | 可為空值 |
| status | TINYINT UNSIGNED | 處理狀態代碼 | 預設 1（1=新進、2=處理中、3=已結案、4=垃圾訊息），於服務層轉換文字並加索引 |
| processed_by | BIGINT | 處理人員使用者 ID | 可為空值，對應 `users.id`，刪除時設為 NULL |
| processed_at | TIMESTAMP | 處理時間 | 可為空值 |
| created_at | TIMESTAMP | 建立時間 | 可為空值 |
| updated_at | TIMESTAMP | 最後更新時間 | 可為空值 |

## tags
- **作用**：提供各種模組可共用的標籤資料。
- **關聯**：透過 `context` 欄位區分標籤使用範圍；多型或樞紐表對應 `tags.id`。

| 欄位 | 類型 | 說明 | 外鍵／備註 |
| --- | --- | --- | --- |
| id | BIGINT | 主鍵 | |
| context | VARCHAR(100) | 標籤使用範疇 | 例如 `post`、`space`、`research`，與 `slug` 組成唯一索引 |
| name | VARCHAR | 標籤名稱 | |
| slug | VARCHAR | 標籤代碼 | |
| description | VARCHAR | 標籤描述 | 可為空值 |
| sort_order | INT | 排序數值 | 預設 0 |
| created_at | TIMESTAMP | 建立時間 | 可為空值 |
| updated_at | TIMESTAMP | 最後更新時間 | 可為空值 |

## research_projects
- **作用**：紀錄研究計畫的核心資訊，對應研究概況中的「研究計畫」。
- **關聯**：透過 `research_project_tag` 與 `tags.id` 建立標籤對應，預期使用 `context = research` 的標籤（例如系統整合領域、網路通訊領域、軟體發展領域）。

| 欄位 | 類型 | 說明 | 外鍵／備註 |
| --- | --- | --- | --- |
| id | BIGINT | 主鍵 | |
| start_date | DATE | 研究計畫開始日期 | |
| end_date | DATE | 研究計畫結束日期 | 可為空值，尚未結束時保留 NULL |
| title | VARCHAR | 研究計畫名稱 | |
| sponsor | VARCHAR | 研究計畫執行單位或出資單位 | |
| total_budget | BIGINT | 研究計畫總經費 | 可為空值 |
| principal_investigator | VARCHAR | 研究計畫主持人 | |
| summary | TEXT | 研究計畫摘要說明 | 可為空值 |
| created_at | TIMESTAMP | 建立時間 | 可為空值 |
| updated_at | TIMESTAMP | 最後更新時間 | 可為空值 |

## papers
- **作用**：整合期刊與研討會論文資訊，對應研究概況中的「期刊論文」與「研討會論文」。
- **關聯**：透過 `paper_tag` 與 `tags.id` 建立標籤對應，使用研究領域標籤描述論文主題。

| 欄位 | 類型 | 說明 | 外鍵／備註 |
| --- | --- | --- | --- |
| id | BIGINT | 主鍵 | |
| type | TINYINT UNSIGNED | 論文類型代碼 | 1=期刊、2=研討會，於服務層轉換文字 |
| published_date | DATE | 論文發表日期 | |
| title | VARCHAR | 論文名稱 | |
| venue_name | VARCHAR | 期刊或研討會名稱 | |
| authors | VARCHAR | 論文發表人 | |
| summary | TEXT | 論文摘要或說明 | 可為空值 |
| doi | VARCHAR | 論文 DOI 或識別碼 | 可為空值，期刊類型常用 |
| location | VARCHAR | 研討會舉辦地點 | 可為空值，僅研討會類型使用 |
| created_at | TIMESTAMP | 建立時間 | 可為空值 |
| updated_at | TIMESTAMP | 最後更新時間 | 可為空值 |

## research_project_tag
- **作用**：連結研究計畫與研究領域標籤。
- **關聯**：`research_project_id` 指向 `research_projects.id`；`tag_id` 指向 `tags.id`。

| 欄位 | 類型 | 說明 | 外鍵／備註 |
| --- | --- | --- | --- |
| research_project_id | BIGINT | 研究計畫 ID | `research_projects.id`，刪除計畫時一併刪除 |
| tag_id | BIGINT | 標籤 ID | `tags.id`，刪除標籤時一併刪除 |

## paper_tag
- **作用**：連結論文與研究領域標籤。
- **關聯**：`paper_id` 指向 `papers.id`；`tag_id` 指向 `tags.id`。

| 欄位 | 類型 | 說明 | 外鍵／備註 |
| --- | --- | --- | --- |
| paper_id | BIGINT | 論文 ID | `papers.id`，刪除論文時一併刪除 |
| tag_id | BIGINT | 標籤 ID | `tags.id`，刪除標籤時一併刪除 |

## tests
- **作用**：保留測試用途的範例資料表。

| 欄位 | 類型 | 說明 | 外鍵／備註 |
| --- | --- | --- | --- |
| id | BIGINT | 主鍵 | |
| created_at | TIMESTAMP | 建立時間 | 可為空值 |
| updated_at | TIMESTAMP | 最後更新時間 | 可為空值 |

