import os

# --- Core Paths ---
# Builds an absolute path from the location of this file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), "data")

# --- Simulation Settings ---
# List of stock tickers you have data for
TICKERS = ["AAPL", "GOOG", "MSFT", "TSLA", "IBM", "UL", "WMT"]
SIMULATION_SPEED_SECONDS = 1  # Seconds between each live tick

# --- GenAI Settings ---
OLLAMA_API_URL = "http://localhost:11434/api/generate"
GENAI_MODEL_NAME = "gemma3:1b"