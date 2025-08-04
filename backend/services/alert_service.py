import asyncio
import datetime
from services.portfolio_manager import portfolio_manager
from services.data_loader import data_loader
from services.genai_analyzer import genai_analyzer

class AlertService:
    def __init__(self):
        self.price_alerts = []
        self.triggered_alerts = set()
        self.processed_news = set()
        self.alert_channel = None
        # --- THE FIX: Add a timestamp to track the last news alert ---
        self.last_news_alert_time = None
        # --- THE FIX: Define a cooldown period in seconds (e.g., 5 minutes) ---
        self.news_alert_cooldown = 300 # 5 minutes * 60 seconds

    def set_alert_channel(self, channel):
        self.alert_channel = channel

    def add_price_alert(self, ticker: str, target_price: float, condition: str):
        alert_id = f"{ticker}-{condition}-{target_price}"
        if alert_id not in self.triggered_alerts:
            self.price_alerts.append({'ticker': ticker, 'target_price': target_price, 'condition': condition})
            return {"success": True, "message": f"Alert set for {ticker} {condition} ${target_price}"}
        return {"success": False, "message": "Alert already exists or was recently triggered."}

    async def check_alerts(self):
        while True:
            # Check for Price Alerts (these can remain frequent)
            prices = portfolio_manager.last_known_prices
            active_alerts = []
            for alert in self.price_alerts:
                alert_id = f"{alert['ticker']}-{alert['condition']}-{alert['target_price']}"
                current_price = prices.get(alert['ticker'])
                if current_price:
                    triggered = False
                    if alert['condition'] == 'above' and current_price > alert['target_price']:
                        triggered = True
                    elif alert['condition'] == 'below' and current_price < alert['target_price']:
                        triggered = True
                    
                    if triggered:
                        message = f"**Price Alert**: {alert['ticker']} has crossed ${alert['target_price']:.2f}. Current price: ${current_price:.2f}."
                        if self.alert_channel:
                            await self.alert_channel.broadcast({"type": "alert", "message": message})
                        self.triggered_alerts.add(alert_id)
                    else:
                        active_alerts.append(alert)
            self.price_alerts = active_alerts

            # --- THE FIX: Check if the cooldown period has passed for News Alerts ---
            now = datetime.datetime.now(datetime.timezone.utc)
            can_send_news_alert = True
            if self.last_news_alert_time:
                time_since_last_alert = (now - self.last_news_alert_time).total_seconds()
                if time_since_last_alert < self.news_alert_cooldown:
                    can_send_news_alert = False

            if can_send_news_alert:
                portfolio_holdings = set(portfolio_manager.get_state()['holdings'].keys())
                if portfolio_holdings:
                    all_news = []
                    for ticker in portfolio_holdings:
                        all_news.extend(data_loader.news_data.get(ticker, []))
                    
                    new_headlines = [item['title'] for item in all_news if item['title'] not in self.processed_news]
                    
                    if new_headlines:
                        # We only process and send ONE alert per cycle to prevent spam
                        headline_to_process = new_headlines[0]
                        self.processed_news.add(headline_to_process)
                        
                        relevant_ticker = None
                        for ticker in portfolio_holdings:
                            if ticker.lower() in headline_to_process.lower():
                                relevant_ticker = ticker
                                break
                        
                        if relevant_ticker:
                            prompt = f"""
                            You are an AI news alert system for a trading platform. A user holds stock in {relevant_ticker}.
                            A new, potentially high-impact headline has just been released: "{headline_to_process}"
                            
                            Task: In one short, actionable sentence, summarize the news and its likely impact for the user.
                            Start with the ticker symbol.
                            """
                            ai_message = await genai_analyzer._run_genai_prompt(prompt)
                            if self.alert_channel:
                                await self.alert_channel.broadcast({"type": "alert", "message": f"**Intelligent News Alert**: {ai_message}"})
                                # --- THE FIX: Update the timestamp after sending an alert ---
                                self.last_news_alert_time = now
            
            # Continue checking every 15 seconds
            await asyncio.sleep(15)


alert_service = AlertService()