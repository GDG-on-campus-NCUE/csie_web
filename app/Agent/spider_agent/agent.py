# .agent/spider_agent.py
from google.adk.agents import Agent, SequentialAgent
from pydantic import BaseModel, Field, HttpUrl
import asyncio
from crawl4ai import AsyncWebCrawler


# --- 最終輸出 schema ---
class PageSummary(BaseModel):
    url: HttpUrl = Field(..., description="來源網址")
    title: str = Field(..., description="標題")
    excerpt: str = Field(..., description="2–4句摘要（繁體中文）")


# --- Step 1: 爬蟲工具 ---
async def fetch_page_html(url: str) -> str:
    """
    使用 crawl4ai 的 AsyncWebCrawler 抓取網頁，
    回傳精簡 HTML 與純文字，交給 AI 分析。
    """
    try:
        async with AsyncWebCrawler() as crawler:
            result = await crawler.arun(
                url,
                # 這些參數依需求調整
                include_links=True,
                include_images=False,
                render_js=False
            )

        # result 裡常見屬性：
        # - result.title
        # - result.html  (原始 HTML)
        # - result.cleaned_html
        # - result.text  (乾淨純文字)
        return f"{result.markdown}"
    except Exception as e:
        return f"[ERROR] 抓取失敗: {e}"


crawler_agent = Agent(
    model="gemini-2.5-flash",
    name="爬蟲Agent",
    instruction=(
        "你會收到一個 URL，請使用工具 fetch_page_text(url) 來抓取頁面內容，"
        "並將結果（原始文字）傳遞給下一個 Agent。"
    ),
    tools=[fetch_page_html],
    # 不要 output_schema，因為只是中繼
)


# --- Step 2 Agent: 摘要輸出 ---
summarize_agent = Agent(
    model="gemini-2.5-flash",
    name="摘要Agent",
    instruction=(
        "你會收到來自爬蟲的原始文字。"
        "請產生一份 JSON，包含：\n"
        "1) url：來源網址\n"
        "2) title：標題（可基於 <title> 或重寫更精確的版本）\n"
        "3) excerpt：繁體中文摘要，2–4 句\n"
        "輸出必須符合 PageSummary schema。"
    ),
    output_schema=PageSummary,
)


# --- Sequential Agent: 先爬 → 後摘要 ---
spider_agent = SequentialAgent(
    name="URL摘要Agent",
    sub_agents=[crawler_agent, summarize_agent],
)

root_agent = spider_agent
