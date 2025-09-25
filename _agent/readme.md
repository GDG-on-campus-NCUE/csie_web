lsof -i :10001
nohup adk api_server --host=0.0.0.0 --port=10001 > output.log 2>&1 &

## 使用 ADK API 跑 agent

此目錄包含兩個 agent：`spider_agent`（爬蟲 + 摘要）與 `translate_agent`（翻譯）。

為了方便自動化呼叫 ADK 的 REST API，我新增了一個簡單的腳本 `run_adk_agent.py`，它會依序：

- 建立 session（Create Session With Id）：POST /apps/{app_name}/users/{user_id}/sessions/{session_id}
- 呼叫 /run 執行 agent：POST /run，會送出 `appName`, `userId`, `sessionId`, `newMessage` 等欄位。

預設 ADK server 地址：http://localhost:10001

範例用法：

```bash
# 對 spider_agent 建立 session 並送一個 url 作為 newMessage
python3 .agent/run_adk_agent.py --app spider_agent --user user123 --session s1 --url https://example.com

# 對 translate_agent 建立 session 並送要翻譯的文字
python3 .agent/run_adk_agent.py --app translate_agent --user user123 --session s2 --text "Hello world"
```

如需更細節，請直接閱讀 `run_adk_agent.py` 的說明或執行 `python3 .agent/run_adk_agent.py --help`。
