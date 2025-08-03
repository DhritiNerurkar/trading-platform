import asyncio
import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from services.portfolio_manager import portfolio_manager
from services.data_loader import data_loader
from api.router import router
from core.config import SIMULATION_SPEED_SECONDS

app = FastAPI(title="Nomura Trading Platform POC")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)
app.include_router(router, prefix="/api")

class ConnectionManager:
    def __init__(self): self.active_connections: list[WebSocket] = []
    async def connect(self, websocket: WebSocket): await websocket.accept(); self.active_connections.append(websocket)
    def disconnect(self, websocket: WebSocket): self.active_connections.remove(websocket)
    async def broadcast(self, message: dict):
        for connection in self.active_connections: await connection.send_json(message)

manager = ConnectionManager()

async def broadcast_live_data():
    while True:
        live_ticks = await data_loader.get_next_tick()
        portfolio_manager.update_prices(live_ticks)
        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
        portfolio_state = portfolio_manager.get_state(timestamp=timestamp)
        payload = {"type": "market_data", "ticks": live_ticks, "portfolio": portfolio_state}
        await manager.broadcast(payload)
        await asyncio.sleep(SIMULATION_SPEED_SECONDS)

@app.on_event("startup")
async def startup_event():
    """This runs when the FastAPI server starts up."""
    # This print statement is CRUCIAL for debugging.
    print("\n--- FastAPI Server Starting Up... ---")
    print("--- Forcing a reset of the Portfolio Manager state. ---")
    portfolio_manager.reset()
    # Start the background task for broadcasting data.
    asyncio.create_task(broadcast_live_data())

@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True: await websocket.receive_text()
    except WebSocketDisconnect: manager.disconnect(websocket)

@app.get("/")
def read_root(): return {"Status": "Nomura Trading Backend is Running"}