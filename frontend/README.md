# Nomura Next-Gen Trading Platform POC

## Project Overview

This project is a Proof of Concept (POC) for a **Next-Generation Trading Platform**, developed as a response to the **Nomura Tech Graduate Program 2025 Project Brief**. The application simulates a modern, real-time trading dashboard, integrating key functionalities like live price tracking, portfolio management, and advanced analytics powered by Generative AI.

The platform is built on a modern technology stack featuring a **Python (FastAPI)** backend and a **React** frontend, designed to be scalable, performant, and easily extensible. The core objective is to demonstrate the practical application of cutting-edge technologies, including cloud principles, DevOps practices, and especially **Generative AI**, to enhance the trading experience and operational efficiency.

---

## Key Features

-   **Live Trading Dashboard:** A real-time dashboard displaying a watchlist of stocks with live-updating prices and daily change percentages.
-   **Interactive Charting:** Professional candlestick charts with volume data, powered by Plotly.js.
-   **Full Portfolio Management:**
    -   Simulated Buy/Sell order execution.
    -   Real-time tracking of holdings, average cost, and market value.
    -   Live Profit & Loss (P&L) calculation.
-   **Multi-faceted GenAI Integration:**
    -   **AI-Powered News Sentiment:** A dedicated page to view the latest news for any stock, with sentiment (`Bullish`, `Bearish`, `Neutral`) analyzed by a local GenAI model.
    -   **Natural Language Chart Analysis:** Users can click "Analyze Chart" to receive a concise, AI-generated summary of the recent price action and trends.
    -   **Personalized Portfolio Briefing:** Users can generate a daily briefing on their specific portfolio, where the AI analyzes their holdings against the latest news to provide a personalized summary.

---

## Screenshots

---

## Technology Stack

### Backend
-   **Framework:** FastAPI
-   **Language:** Python
-   **Real-time Communication:** WebSockets
-   **Data Handling:** Pandas
-   **Server:** Uvicorn (ASGI)

### Frontend
-   **Framework:** React
-   **Build Tool:** Vite
-   **UI Library:** Material-UI (MUI)
-   **Charting:** Plotly.js
-   **API Communication:** Axios
-   **State Management:** React Context API

### Generative AI
-   **Platform:** Ollama (self-hosted)
-   **Model:** `gemma3:1b` (or any other suitable local LLM)

---

## Project Structure

/nomura-trading-poc/
├── /backend/
│ ├── /api/
│ ├── /core/
│ ├── /services/
│ │ ├── data_loader.py
│ │ ├── genai_analyzer.py
│ │ └── portfolio_manager.py
│ ├── main.py
│ └── requirements.txt
│
├── /frontend/
│ ├── /src/
│ │ ├── /api/
│ │ ├── /components/
│ │ ├── /context/
│ │ └── /pages/
│ ├── package.json
│ ├── vite.config.js
│ └── index.html
│
├── /data/
│ ├── simulation_historical_data/
│ ├── simulation_news_data_July_1-Aug_30/
│ └── simulation_price_data_July_1-Aug_30/
│
└── README.md


---

## Setup and Installation

### Prerequisites
-   [Node.js](https://nodejs.org/) (v16 or later)
-   [Python](https://www.python.org/downloads/) (v3.9 or later)
-   [Ollama](https://ollama.com/) installed and running.
-   The required GenAI model pulled via Ollama:
    ```bash
    ollama pull gemma3:1b
    ```

### 1. Clone the Repository
Clone this repository to your local machine.

### 2. Set Up the Data
Place all the provided simulation data folders (`simulation_historical_data`, etc.) inside the `/data/` directory in the project root.

### 3. Backend Setup
Follow these steps from within the `/backend` directory:
```bash
# Navigate to the backend folder
cd backend

# (Recommended) Create and activate a virtual environment
# On Mac/Linux:
python3 -m venv venv
source venv/bin/activate
# On Windows:
python -m venv venv
.\venv\Scripts\activate

# Install the required Python packages
pip install -r requirements.txt
```

### 4. Frontend Setup
Follow these steps from within the `/frontend` directory:
```bash
# Navigate to the frontend folder
cd frontend

# Install the required Node.js packages
npm install

```

### 5. Running the Application

To run the full application, you must have three separate terminals running simultaneously.
- Terminal 1: Ollama
    Ensure the Ollama application is running on your machine.
- Terminal 2: Backend Server
    Navigate to the /backend directory.
    Make sure your Python virtual environment is activated.
    Run the server:
    uvicorn main:app --reload
- Terminal 3: Frontend Server
    Navigate to the /frontend directory.
    Run the Vite development server:
    npm run dev
    This will automatically open the application in your browser at http://localhost:5173.

### 6. How to Use
Navigate to http://localhost:5173.
Log in using the mock credentials:
    Username: trader
    Password: password
Explore the Dashboard, Portfolio, and News & Sentiment pages.
Use the Trade Ticket on the Dashboard to simulate buying and selling stocks.
Use the "Analyze Chart" and "Generate Daily Briefing" buttons to interact with the GenAI features.

