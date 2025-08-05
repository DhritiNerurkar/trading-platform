import asyncio
from services.portfolio_manager import portfolio_manager
from services.data_loader import data_loader

class AlertManager:
    def __init__(self):
        self.price_alerts = []
        self.alert_channel = None # This will be our WebSocket ConnectionManager

    def set_alert_channel(self, channel):
        """Sets the WebSocket manager for broadcasting alerts."""
        self.alert_channel = channel

    def set_price_alert(self, alert_data: dict):
        required_keys = ['ticker', 'target_price', 'condition']
        if not all(key in alert_data for key in required_keys):
            return {"success": False, "message": "Invalid alert data."}
        
        # Prevent identical duplicates
        for alert in self.price_alerts:
            if all(alert.get(k) == alert_data.get(k) for k in required_keys):
                return {"success": False, "message": "Identical alert already set."}

        self.price_alerts.append(alert_data)
        print(f"--- New Price Alert/Order Set: {alert_data} ---")
        return {"success": True, "message": f"Alert for {alert_data['ticker']} set successfully."}

    async def check_alerts_periodically(self):
        """A background task that runs periodically to check for alerts."""
        while True:
            triggered_indices = []
            for i, alert in enumerate(self.price_alerts):
                current_price = portfolio_manager.last_known_prices.get(alert['ticker'])
                if not current_price:
                    continue

                triggered = False
                if alert['condition'] == 'above' and current_price >= alert['target_price']:
                    triggered = True
                elif alert['condition'] == 'below' and current_price <= alert['target_price']:
                    triggered = True
                
                if triggered:
                    print(f"--- PRICE ALERT TRIGGERED: {alert} ---")
                    
                    if alert.get('auto_trade_action') and alert.get('auto_trade_quantity'):
                        action = alert['auto_trade_action']
                        quantity = alert['auto_trade_quantity']
                        ticker = alert['ticker']
                        print(f"--- Executing Auto-Trade: {action.upper()} {quantity} of {ticker} ---")
                        if action == 'buy': portfolio_manager.buy(ticker, quantity)
                        elif action == 'sell': portfolio_manager.sell(ticker, quantity)
                        
                        message = f"**Auto-Trade Executed**: {action.upper()} {quantity} of {ticker} at approx. ${current_price:.2f}."
                        if self.alert_channel:
                            await self.alert_channel.broadcast({"type": "alert", "message": message})
                    
                    else:
                        message = f"**Price Alert**: {alert['ticker']} has crossed ${alert['target_price']:.2f}. Current price: ${current_price:.2f}."
                        if self.alert_channel:
                            await self.alert_channel.broadcast({"type": "alert", "message": message})
                    
                    triggered_indices.append(i)

            for i in sorted(triggered_indices, reverse=True):
                del self.price_alerts[i]
            
            await asyncio.sleep(5) # Check every 5 seconds

alert_manager = AlertManager()