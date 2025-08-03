import datetime

class PortfolioManager:
    def __init__(self):
        self.reset()

    def reset(self):
        self.cash = 1000000.00
        self.holdings = {}
        self.last_known_prices = {}
        self.value_history = [{
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "value": self.cash
        }]
        print("--- Portfolio Manager has been successfully reset. ---")

    def get_state(self, timestamp=None):
        portfolio_value = 0
        enriched_holdings = {}

        for ticker, data in self.holdings.items():
            current_price = self.last_known_prices.get(ticker, data.get('avg_price', 0.0))
            shares = data.get('shares', 0)
            avg_price = data.get('avg_price', 0.0)

            market_value = shares * current_price
            portfolio_value += market_value

            enriched_holdings[ticker] = {
                "shares": shares,
                "avg_price": avg_price,
                "market_price": current_price
            }

        total_value = self.cash + portfolio_value

        if timestamp:
            if len(self.value_history) > 1000:
                self.value_history.pop(1)
            self.value_history.append({"timestamp": timestamp, "value": total_value})

        return {
            "cash": self.cash,
            "holdings": enriched_holdings,
            "portfolio_value": portfolio_value,
            "total_value": total_value
        }

    def update_prices(self, live_ticks):
        for tick in live_ticks:
            self.last_known_prices[tick['ticker']] = tick['price']

    def buy(self, ticker: str, quantity: int):
        price = self.last_known_prices.get(ticker)
        if price is None:
            return {"success": False, "message": "Market price not available for this ticker."}

        cost = price * quantity
        if self.cash < cost:
            return {"success": False, "message": "Not enough cash to complete this transaction."}

        self.cash -= cost

        if ticker in self.holdings:
            existing = self.holdings[ticker]
            old_total_cost = existing['avg_price'] * existing['shares']
            new_total_shares = existing['shares'] + quantity
            new_total_cost = old_total_cost + cost
            new_avg_price = new_total_cost / new_total_shares
            self.holdings[ticker] = {
                "shares": new_total_shares,
                "avg_price": new_avg_price
            }
        else:
            self.holdings[ticker] = {
                "shares": quantity,
                "avg_price": price
            }

        return {"success": True, "message": f"Bought {quantity} of {ticker}"}

    def sell(self, ticker: str, quantity: int):
        price = self.last_known_prices.get(ticker)
        if price is None:
            return {"success": False, "message": "Market price not available."}

        if ticker not in self.holdings or self.holdings[ticker]['shares'] < quantity:
            return {"success": False, "message": "Not enough shares to sell."}

        self.cash += price * quantity
        self.holdings[ticker]['shares'] -= quantity

        if self.holdings[ticker]['shares'] == 0:
            del self.holdings[ticker]

        return {"success": True, "message": f"Sold {quantity} of {ticker}"}


portfolio_manager = PortfolioManager()
