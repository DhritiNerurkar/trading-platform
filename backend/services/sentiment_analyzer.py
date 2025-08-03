import requests
from core.config import OLLAMA_API_URL, GENAI_MODEL_NAME
from services.data_loader import data_loader

class SentimentAnalyzer:
    def __init__(self):
        # In-memory cache to avoid re-analyzing the same headline
        self.cache = {}

    def get_sentiment_for_ticker(self, ticker: str):
        news_items = data_loader.news_data.get(ticker, [])
        # Get the 5 most recent news items
        recent_news = sorted(news_items, key=lambda x: x['time_published'], reverse=True)[:5]
        
        analyzed_news = []
        for item in recent_news:
            headline = item['title']
            if headline in self.cache:
                sentiment = self.cache[headline]
            else:
                sentiment = self._analyze_headline(headline)
                self.cache[headline] = sentiment
            
            analyzed_news.append({
                "headline": headline,
                "sentiment": sentiment
            })
        return analyzed_news

    def _analyze_headline(self, headline: str) -> str:
        prompt = f"""
        Analyze the sentiment of the following financial news headline.
        Classify it as 'Bullish', 'Bearish', or 'Neutral'.
        Return only the single-word classification.

        Headline: "{headline}"
        Sentiment:
        """
        try:
            response = requests.post(
                OLLAMA_API_URL,
                json={"model": GENAI_MODEL_NAME, "prompt": prompt, "stream": False},
                timeout=20 # Add a timeout
            )
            response.raise_for_status()
            
            generated_text = response.json().get('response', '').strip().lower()
            
            if 'bullish' in generated_text:
                return 'Bullish'
            elif 'bearish' in generated_text:
                return 'Bearish'
            else:
                return 'Neutral'
        except requests.exceptions.RequestException as e:
            print(f"Error communicating with Ollama API: {e}")
            return "Error"

sentiment_analyzer = SentimentAnalyzer()