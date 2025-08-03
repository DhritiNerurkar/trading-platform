import httpx
from core.config import OLLAMA_API_URL, GENAI_MODEL_NAME
from services.data_loader import data_loader
from services.portfolio_manager import portfolio_manager
import asyncio

class GenAIAnalyzer:
    def __init__(self):
        self.cache = {}

    async def _run_genai_prompt(self, prompt: str):
        """Asynchronous function to run a prompt against the GenAI model."""
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    OLLAMA_API_URL,
                    json={"model": GENAI_MODEL_NAME, "prompt": prompt, "stream": False},
                )
                response.raise_for_status()
                return response.json().get('response', 'No response from model.').strip()
        except httpx.RequestError as e:
            print(f"Error communicating with Ollama API: {e}")
            return "Error: Could not connect to the Generative AI model."

    async def get_sentiment_for_ticker(self, ticker: str):
        news_items = data_loader.news_data.get(ticker, [])
        recent_news = sorted(news_items, key=lambda x: x['time_published'], reverse=True)[:5]
        
        async def analyze_headline(headline: str):
            if headline in self.cache:
                return {"headline": headline, "sentiment": self.cache[headline]}
            
            prompt = f"Analyze the sentiment of this financial news headline: '{headline}'. Classify it as only one word: 'Bullish', 'Bearish', or 'Neutral'."
            sentiment = await self._run_genai_prompt(prompt)
            # Basic validation
            if "bullish" in sentiment.lower(): sentiment = "Bullish"
            elif "bearish" in sentiment.lower(): sentiment = "Bearish"
            else: sentiment = "Neutral"
            self.cache[headline] = sentiment
            return {"headline": headline, "sentiment": sentiment}

        analyzed_news = await asyncio.gather(*[analyze_headline(item['title']) for item in recent_news])
        return analyzed_news

    async def generate_portfolio_briefing(self):
        """Generates a daily briefing for the user's current portfolio."""
        holdings = portfolio_manager.get_state()['holdings']
        if not holdings:
            return {"briefing": "You have no holdings in your portfolio to analyze."}

        holdings_str = ", ".join([f"{data['shares']} shares of {ticker}" for ticker, data in holdings.items()])
        
        async def get_news_for_ticker(ticker):
            news_items = data_loader.news_data.get(ticker, [])
            headlines = [item['title'] for item in sorted(news_items, key=lambda x: x['time_published'], reverse=True)[:3]]
            return f"News for {ticker}: {'; '.join(headlines)}"
            
        news_list = await asyncio.gather(*[get_news_for_ticker(ticker) for ticker in holdings.keys()])
        news_str = "\n".join(news_list)

        prompt = f"""
        **Role**: You are a professional financial analyst providing a daily briefing to a client.
        **Client's Portfolio**: {holdings_str}.
        **Latest News**:
        {news_str}

        **Task**: Based *only* on the provided news, generate a 2-3 sentence professional summary.
        - **First Sentence**: Start with the overall sentiment (e.g., "The portfolio faces a mixed outlook...", "A positive sentiment surrounds the portfolio today...").
        - **Following Sentences**: Identify the single most impactful news item and briefly state its potential effect.
        - **Constraint**: Do not use conversational filler like "Okay, here's...". Be direct and professional.
        """
        briefing = await self._run_genai_prompt(prompt)
        return {"briefing": briefing}

    async def analyze_chart_data(self, ticker: str, prices: list):
        """Generates a natural language analysis of chart data."""
        if not prices or len(prices) < 2:
            return {"analysis": "Not enough data to perform analysis."}
            
        price_points = [item['close'] for item in prices[-20:]] # Analyze last 20 data points
        start_price = price_points[0]
        end_price = price_points[-1]
        
        prompt = f"""
        As a technical analyst, you are looking at recent price action for the stock {ticker}.
        The recent closing prices are: {price_points}.
        The price moved from {start_price:.2f} to {end_price:.2f}.
        
        In one or two short sentences, describe the primary trend (e.g., "strong uptrend", "clear downtrend", "range-bound consolidation", "volatile period with no clear direction"). Do not use financial jargon.
        """
        analysis = await self._run_genai_prompt(prompt)
        return {"analysis": analysis}

genai_analyzer = GenAIAnalyzer()