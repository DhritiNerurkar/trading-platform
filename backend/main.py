import asyncio
import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from api.router import router
from services.data_loader import data_loader
from services.portfolio_manager import portfolio_manager
from services.alert_manager import alert_manager
from core.config import SIMULATION_SPEED_SECONDS

app = FastAPI(title="Tradely POC")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router, prefix="/api")

class ConnectionManager:
    def __init__(self): self.active_connections: list[WebSocket] = []
    async def connect(self, websocket: WebSocket): await websocket.accept(); self.active_connections.append(websocket)
    def disconnect(self, websocket: WebSocket): self.active_connections.remove(websocket)
    async def broadcast(self, message: dict):
        for connection in self.active_connections: await connection.send_json(message)

# --- THE FIX: Create two separate managers for the two WebSocket channels ---
market_data_manager = ConnectionManager()
alerts_connection_manager = ConnectionManager() # Renamed for clarity

async def broadcast_market_data():
    """The main loop for broadcasting live market data."""
    while True:
        live_ticks = await data_loader.get_next_tick()
        portfolio_manager.update_prices(live_ticks)
        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
        portfolio_state = portfolio_manager.get_state(timestamp=timestamp)
        payload = {"type": "market_data", "ticks": live_ticks, "portfolio": portfolio_state}
        await market_data_manager.broadcast(payload)
        await asyncio.sleep(SIMULATION_SPEED_SECONDS)

@app.on_event("startup")
async def startup_event():
    """This runs when the FastAPI server starts up."""
    print("\n--- FastAPI Server Starting Up... ---")
    portfolio_manager.reset()
    # --- THE FIX: Set up the alert manager and start both background tasks ---
    alert_manager.set_alert_channel(alerts_connection_manager)
    asyncio.create_task(broadcast_market_data())
    asyncio.create_task(alert_manager.check_alerts_periodically())

# --- THE FIX: Re-implement two distinct WebSocket endpoints ---
@app.websocket("/ws/market-data")
async def market_data_ws(websocket: WebSocket):
    await market_data_manager.connect(websocket)
    try:
        while True: await websocket.receive_text()
    except WebSocketDisconnect: market_data_manager.disconnect(websocket)

@app.websocket("/ws/alerts")
async def alerts_ws(websocket: WebSocket):
    await alerts_connection_manager.connect(websocket)
    try:
        while True: await websocket.receive_text()
    except WebSocketDisconnect: alerts_connection_manager.disconnect(websocket)


@app.get("/")
def read_root():
    return {"Status": "Trading Backend is Running"}