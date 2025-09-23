要可以大量使用csv匯入、會出
在英文介面下 publish at、featured image、upload files 等欄位是用中文顯示
post主要有兩種格式，一種是原版手動創建，另一種是接用外部已有的連結
tag可以控管，，增加一個tag控管，對不同管理頁面，若有tag可以設定好tag
目前.agent主要是使用google adk來搭建的ai，中英文輸入時，例如目前是中文輸入，送到php後端後，會送到adk(call fast api)，或是原生API function，翻譯，再建入資料庫
可以輸入少量文字，讓ai幫忙生成文字(需訂製上限)(.agent/enhence_agent)
google api fast api也就是資料表的audit log會有id，id(流水)直接拿來當作session id，audit log應該會去記錄各種動作，不單單只有為了call adk api，新增post、修改post、刪除post、上傳檔案、刪除檔案都要記錄，利用tag設置各種tag
輸入連結，前端change後自動調用api，取得標題、摘要
