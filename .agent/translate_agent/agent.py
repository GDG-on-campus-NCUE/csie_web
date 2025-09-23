from google.adk.agents import Agent
# from google.adk.tools.google_search_tool import GoogleSearchTool
from pydantic import BaseModel, Field
from typing import Literal

class TranslateInput(BaseModel):
    text_en: str = Field(..., description="Text to be translated")
    text_zh_tw: str = Field(..., description="要翻譯的文本")

translate_agent = Agent(
    model="gemini-2.0-flash-lite",
    name="翻譯Agent",
    instruction="""
    你是一個翻譯專家，能夠將任何語言的文本翻譯成英文與繁體中文。
    """,
    output_schema=TranslateInput,
)

root_agent = translate_agent


