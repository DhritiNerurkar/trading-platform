import httpx
from core.config import OLLAMA_API_URL, GENAI_MODEL_NAME, TICKERS
from services.data_loader import data_loader
from services.portfolio_manager import portfolio_manager
import asyncio

class GenAIAnalyzer:
    def __init__(self):
        self.cache = {}

    async def _run_genai_prompt(self, prompt: str):
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

    # --- NEW: Master function for the "Ask Nomura AI" feature ---
    async def handle_user_query(self, query: str):
        """
        Analyzes a user's natural language query, determines intent,
        gathers relevant data, and generates an AI-powered response.
        """
        query_lower = query.lower()
        
        # Intent 1: Asking about portfolio performance
        if "portfolio" in query_lower or "best performer" in query_lower or "worst performer" in query_lower or "my holdings" in query_lower:
            return await self.answer_portfolio_query(query)

        # Intent 2: Asking for news or sentiment about a specific stock
        found_ticker = None
        for ticker in TICKERS:
            if ticker.lower() in query_lower:
                found_ticker = ticker
                break
        if found_ticker:
            return await self.answer_news_query(query, found_ticker)

        # Default Intent: General question
        return await self.answer_general_query(query)

    async def answer_portfolio_query(self, query: str):
        state = portfolio_manager.get_state()
        holdings = state['holdings']
        if not holdings:
            return {"answer": "You currently have no holdings in your portfolio."}

        # Calculate P&L to provide context
        pnl_data = []
        for ticker, data in holdings.items():
            prev_close = data_loader.previous_day_closes.get(ticker)
            if prev_close:
                pnl = (data['market_price'] - prev_close) * data['shares']
                pnl_data.append(f"{ticker}: P&L ${pnl:.2f}")
        
        context = f"Current Holdings: {holdings}. Today's P&L: {pnl_data}."
        prompt = f"You are an AI assistant for a trading platform. A user asked: '{query}'. Based on this data: {context}. Formulate a direct, concise answer."
        answer = await self._run_genai_prompt(prompt)
        return {"answer": answer}

    async def answer_news_query(self, query: str, ticker: str):
        news_items = await self.get_sentiment_for_ticker(ticker)
        context = f"Recent news for {ticker}: {news_items}"
        prompt = f"You are an AI assistant for a trading platform. A user asked: '{query}'. Based on this data: {context}. Formulate a direct, concise answer."
        answer = await self._run_genai_prompt(prompt)
        return {"answer": answer}

    async def answer_general_query(self, query: str):
        # Safety net: Prevent giving financial advice
        prompt = f"""
        You are an AI assistant for the 'Nomura Next-Gen Trading' platform. A user asked a general question: '{query}'.
        Analyze the user's question. 
        - If it asks for financial advice (e.g., "should I buy...", "is this a good stock..."), you MUST politely decline and state that you cannot provide financial advice.
        - For any other general question, provide a helpful but brief response.
        """
        answer = await self._run_genai_prompt(prompt)
        return {"answer": answer}

    # --- Existing GenAI Functions ---
    async def get_sentiment_for_ticker(self, ticker: str):
        # ... (this function remains the same)
        news_items = data_loader.news_data.get(ticker, [])
        recent_news = sorted(news_items, key=lambda x: x['time_published'], reverse=True)[:5]
        async def analyze_headline(headline: str):
            if headline in self.cache: return {"headline": headline, "sentiment": self.cache[headline]}
            prompt = f"Analyze the sentiment of this financial news headline: '{headline}'. Classify it as only one word: 'Bullish', 'Bearish', or 'Neutral'."
            sentiment = await self._run_genai_prompt(prompt)
            if "bullish" in sentiment.lower(): sentiment = "Bullish"
            elif "bearish" in sentiment.lower(): sentiment = "Bearish"
            else: sentiment = "Neutral"
            self.cache[headline] = sentiment
            return {"headline": headline, "sentiment": sentiment}
        analyzed_news = await asyncio.gather(*[analyze_headline(item['title']) for item in recent_news])
        return analyzed_news


    async def generate_portfolio_briefing(self):
        # ... (this function remains the same)
        holdings = portfolio_manager.get_state()['holdings']
        if not holdings: return {"briefing": "You have no holdings in your portfolio to analyze."}
        holdings_str = ", ".join([f"{data['shares']} shares of {ticker}" for ticker, data in holdings.items()])
        async def get_news_for_ticker(ticker):
            news_items = data_loader.news_data.get(ticker, [])
            headlines = [item['title'] for item in sorted(news_items, key=lambda x: x['time_published'], reverse=True)[:3]]
            return f"News for {ticker}: {'; '.join(headlines)}"
        news_list = await asyncio.gather(*[get_news_for_ticker(ticker) for ticker in holdings.keys()])
        news_str = "\n".join(news_list)
        prompt = f"""**Role**: You are a professional financial analyst providing a daily briefing to a client. **Client's Portfolio**: {holdings_str}. **Latest News**: {news_str}\n**Task**: Based *only* on the provided news, generate a 2-3 sentence professional summary. - **First Sentence**: Start with the overall sentiment (e.g., "The portfolio faces a mixed outlook...", "A positive sentiment surrounds the portfolio today..."). - **Following Sentences**: Identify the single most impactful news item and briefly state its potential effect. - **Constraint**: Do not use conversational filler. Be direct and professional."""
        briefing = await self._run_genai_prompt(prompt)
        briefing = briefing.replace("**Overall Sentiment:**", "").strip()
        return {"briefing": briefing}

    async def analyze_chart_data(self, ticker: str, prices: list):
        # ... (this function remains the same)
        if not prices or len(prices) < 2: return {"analysis": "Not enough data to perform analysis."}
        price_points = [item['close'] for item in prices[-20:]]
        volume_points = [item['volume'] for item in prices[-20:]]
        prompt = f"""**Role**: You are a technical analyst providing a snapshot of a stock chart for {ticker}. **Recent Data**: - Closing Prices: {price_points} - Trading Volumes: {volume_points}\n**Task**: Provide a 2-point technical snapshot. Format the output with headings. 1. **Trend & Momentum**: In one sentence, describe the primary trend and its recent momentum. 2. **Volume Confirmation**: In one sentence, comment on whether the trading volume confirms the price trend."""
        analysis = await self._run_genai_prompt(prompt)
        return {"analysis": analysis}

genai_analyzer = GenAIAnalyzer()