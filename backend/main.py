import asyncio
import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from api.router import router
from services.data_loader import data_loader
from services.portfolio_manager import portfolio_manager
from services.alert_service import alert_service # NEW IMPORT
from core.config import SIMULATION_SPEED_SECONDS

app = FastAPI(title="Nomura Trading Platform POC")

app.add_middleware( CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],)
app.include_router(router, prefix="/api")

class ConnectionManager:
    def __init__(self): self.active_connections: list[WebSocket] = []
    async def connect(self, websocket: WebSocket): await websocket.accept(); self.active_connections.append(websocket)
    def disconnect(self, websocket: WebSocket): self.active_connections.remove(websocket)
    async def broadcast(self, message: dict):
        for connection in self.active_connections: await connection.send_json(message)

# Create two separate managers for two WebSocket channels
market_data_manager = ConnectionManager()
alert_manager = ConnectionManager()

async def broadcast_market_data():
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
    print("\n--- FastAPI Server Starting Up... ---")
    portfolio_manager.reset()
    # --- NEW: Set up the alert service and start its background task ---
    alert_service.set_alert_channel(alert_manager)
    asyncio.create_task(broadcast_market_data())
    asyncio.create_task(alert_service.check_alerts())

@app.websocket("/ws/market-data")
async def market_data_ws(websocket: WebSocket):
    await market_data_manager.connect(websocket)
    try:
        while True: await websocket.receive_text()
    except WebSocketDisconnect: market_data_manager.disconnect(websocket)

@app.websocket("/ws/alerts") # NEW WEBSOCKET ENDPOINT
async def alerts_ws(websocket: WebSocket):
    await alert_manager.connect(websocket)
    try:
        while True: await websocket.receive_text()
    except WebSocketDisconnect: alert_manager.disconnect(websocket)


@app.get("/")
def read_root(): return {"Status": "Nomura Trading Backend is Running"}