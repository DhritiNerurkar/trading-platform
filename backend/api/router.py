from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List

# --- Models for request bodies ---
class LoginRequest(BaseModel):
    username: str
    password: str

class TradeRequest(BaseModel):
    ticker: str
    quantity: int

class ChartDataRequest(BaseModel):
    ticker: str
    prices: List[dict] = Field(..., example=[{"timestamp": "2025-07-01", "close": 210.5}])

class GenAIQueryRequest(BaseModel):
    query: str

# --- THE FIX IS HERE: Define the missing PriceAlertRequest model ---
class PriceAlertRequest(BaseModel):
    ticker: str
    target_price: float
    condition: str # Should be "above" or "below"
# --- END FIX ---


# --- API Router ---
router = APIRouter()

# --- NEW: Alert Endpoint ---
@router.post("/alerts/set-price-alert")
async def set_price_alert(request: PriceAlertRequest):
    from services.alert_service import alert_service
    return alert_service.add_price_alert(request.ticker, request.target_price, request.condition)

# --- GenAI Endpoints ---
@router.post("/genai/query")
async def handle_genai_query(request: GenAIQueryRequest):
    from services.genai_analyzer import genai_analyzer
    return await genai_analyzer.handle_user_query(request.query)

@router.post("/genai/portfolio-briefing")
async def get_portfolio_briefing():
    from services.genai_analyzer import genai_analyzer
    return await genai_analyzer.generate_portfolio_briefing()

@router.post("/genai/chart-analysis")
async def get_chart_analysis(request: ChartDataRequest):
    from services.genai_analyzer import genai_analyzer
    return await genai_analyzer.analyze_chart_data(request.ticker, request.prices)

@router.get("/news/{ticker}")
async def get_news_and_sentiment(ticker: str):
    from services.genai_analyzer import genai_analyzer
    return await genai_analyzer.get_sentiment_for_ticker(ticker)

# --- Portfolio & Reporting Endpoints ---
@router.get("/portfolio")
async def get_portfolio():
    from services.portfolio_manager import portfolio_manager
    return portfolio_manager.get_state()

@router.get("/portfolio/history")
async def get_portfolio_history():
    from services.portfolio_manager import portfolio_manager
    return portfolio_manager.value_history

@router.get("/portfolio/transactions")
async def get_transaction_history():
    from services.portfolio_manager import portfolio_manager
    return sorted(portfolio_manager.transaction_history, key=lambda x: x['timestamp'], reverse=True)

@router.get("/reports/performance-summary")
async def get_performance_summary():
    from services.reporting_service import reporting_service
    return reporting_service.generate_performance_summary()

# --- Trading Endpoints ---
@router.post("/login")
async def login(request: LoginRequest):
    if request.username == "trader" and request.password == "password": return {"success": True}
    return {"success": False, "message": "Invalid credentials"}

@router.post("/buy")
async def buy(request: TradeRequest):
    from services.portfolio_manager import portfolio_manager
    return portfolio_manager.buy(request.ticker, request.quantity)

@router.post("/sell")
async def sell(request: TradeRequest):
    from services.portfolio_manager import portfolio_manager
    return portfolio_manager.sell(request.ticker, request.quantity)

@router.get("/historical/{ticker}")
async def get_historical_data(ticker: str):
    from services.data_loader import data_loader
    df = data_loader.historical_data.get(ticker)
    if df is not None: return df.to_dict(orient="records")
    return {"error": "Ticker not found"}