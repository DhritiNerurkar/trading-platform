import pandas as pd
import json
import os
import asyncio
from core.config import DATA_DIR, TICKERS

class DataLoader:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DataLoader, cls).__new__(cls)
            cls._instance.load_all_data()
        return cls._instance

    def load_all_data(self):
        print("Loading all simulation data...")
        self.historical_data, self.previous_day_closes = self._load_historical_data()
        self.news_data = self._load_news_data()
        self.live_data_generators = self._create_live_data_generators()
        print("Data loading complete.")

    def _load_historical_data(self):
        data = {}
        closes = {}
        path = os.path.join(DATA_DIR, "simulation_historical_data")
        for ticker in TICKERS:
            file_path1 = os.path.join(path, f"{ticker}_2025_historical.csv")
            file_path2 = os.path.join(path, f"simulated_{ticker}_2025_historical.csv")
            
            file_to_use = None
            if os.path.exists(file_path1): file_to_use = file_path1
            elif os.path.exists(file_path2): file_to_use = file_path2

            if file_to_use:
                try:
                    df = pd.read_csv(file_to_use)
                    df['timestamp'] = pd.to_datetime(df['timestamp'])
                    data[ticker] = df
                    # Get the second to last day's close as "previous day close" for simulation
                    if len(df) > 1:
                        closes[ticker] = df['close'].iloc[-2]
                except Exception as e:
                    print(f"Error loading historical data for {ticker}: {e}")
        return data, closes

    def _load_news_data(self):
        data = {}
        path = os.path.join(DATA_DIR, "simulation_news_data_July_1-Aug_30")
        for filename in os.listdir(path):
            if filename.endswith(".json"):
                with open(os.path.join(path, filename), 'r') as f:
                    news_json = json.load(f)
                    for date, articles in news_json.items():
                        for article in articles:
                            for sentiment_info in article.get('ticker_sentiment', []):
                                ticker = sentiment_info['ticker']
                                if ticker not in data: data[ticker] = []
                                data[ticker].append({
                                    "title": article['title'],
                                    "time_published": article['time_published']
                                })
        return data

    def _create_live_data_generators(self):
        generators = {}
        path = os.path.join(DATA_DIR, "simulation_price_data_July_1-Aug_30")
        for ticker in TICKERS:
            file_path = os.path.join(path, f"simulated_{ticker}_live.csv")
            if os.path.exists(file_path):
                generators[ticker] = self._tick_generator(file_path, ticker)
        return generators

    def _tick_generator(self, file_path, ticker):
        with open(file_path, 'r') as f:
            next(f)
            for line in f:
                parts = line.strip().split(',')
                price = float(parts[4])
                prev_close = self.previous_day_closes.get(ticker, price)
                change = price - prev_close
                change_percent = (change / prev_close) * 100 if prev_close != 0 else 0
                yield {
                    "ticker": ticker, "timestamp": parts[0], "price": price,
                    "change": change, "change_percent": change_percent
                }

    async def get_next_tick(self):
        ticks = []
        for ticker, generator in self.live_data_generators.items():
            try:
                tick = next(generator)
                ticks.append(tick)
            except StopIteration:
                pass
        return ticks

data_loader = DataLoader()