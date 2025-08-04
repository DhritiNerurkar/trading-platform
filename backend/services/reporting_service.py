from services.portfolio_manager import portfolio_manager
from services.data_loader import data_loader

class ReportingService:
    def generate_performance_summary(self):
        """
        Calculates and returns a detailed summary of portfolio performance.
        """
        state = portfolio_manager.get_state()
        holdings = state['holdings']
        
        total_invested_capital = 0
        pnl_today = 0
        
        # Calculate total invested capital and today's P&L
        for ticker, data in holdings.items():
            total_invested_capital += data['shares'] * data['avg_price']
            
            prev_close = data_loader.previous_day_closes.get(ticker)
            if prev_close:
                pnl_today += (data['market_price'] - prev_close) * data['shares']

        return {
            "total_invested_capital": total_invested_capital,
            "current_market_value": state['portfolio_value'],
            "total_pnl": state['total_value'] - 1000000.00, # Assuming 1M initial capital
            "pnl_today": pnl_today,
            "holdings": holdings,
            "portfolio_history": portfolio_manager.value_history
        }

reporting_service = ReportingService()