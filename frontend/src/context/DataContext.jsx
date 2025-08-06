import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify'; // Import the toast library

// Create the context
const DataContext = createContext(null);

// Create a custom hook for easy access to the context
export const useData = () => {
    return useContext(DataContext);
};

// Create the Provider component
export const DataProvider = ({ children }) => {
    const [liveData, setLiveData] = useState({});
    const [portfolio, setPortfolio] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // --- WebSocket #1: For Market Data (Your existing, working code) ---
        const marketWs = new WebSocket('ws://localhost:8000/ws/market-data');

        marketWs.onopen = () => {
            console.log("Market Data WebSocket Connected");
            setIsConnected(true);
        };
        
        marketWs.onclose = () => {
            console.log("Market Data WebSocket Disconnected");
            setIsConnected(false);
        };

        marketWs.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'market_data') {
                const newLiveData = {};
                data.ticks.forEach(tick => {
                    newLiveData[tick.ticker] = tick;
                });
                
                // Keep previous price for flash effect
                setLiveData(prevData => {
                    const updatedData = {};
                    Object.keys(newLiveData).forEach(key => {
                        updatedData[key] = {
                            ...newLiveData[key],
                            prevPrice: prevData[key]?.price
                        };
                    });
                    // Merge new data with previous to avoid losing data for tickers that didn't update this tick
                    return { ...prevData, ...updatedData };
                });

                setPortfolio(data.portfolio);
            }
        };

        // --- THE FIX: Add WebSocket #2 for the new Alert System ---
        const alertWs = new WebSocket('ws://localhost:8000/ws/alerts');

        alertWs.onopen = () => console.log("Alerts WebSocket Connected");
        alertWs.onclose = () => console.log("Alerts WebSocket Disconnected");

        alertWs.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'alert') {
                // When an alert message is received, show a toast notification.
                // The `toast.info` function comes from the react-toastify library.
                toast.info(data.message, {
                    position: "bottom-right",
                    autoClose: 10000, // Keep alert on screen for 10 seconds
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        };

        // Cleanup function to close both WebSocket connections when the app unmounts
        return () => {
            marketWs.close();
            alertWs.close();
        };
    }, []); // Empty dependency array ensures this runs only ONCE

    const value = {
        liveData,
        portfolio,
        isConnected,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};