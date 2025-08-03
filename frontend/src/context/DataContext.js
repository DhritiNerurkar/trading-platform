import React, { createContext, useState, useEffect, useContext } from 'react';

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
        // This effect runs only once and manages the single WebSocket connection
        const ws = new WebSocket('ws://localhost:8000/ws/live');

        ws.onopen = () => {
            console.log("Global WebSocket Connected");
            setIsConnected(true);
        };
        
        ws.onclose = () => {
            console.log("Global WebSocket Disconnected");
            setIsConnected(false);
        };

        ws.onmessage = (event) => {
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
                    return updatedData;
                });

                setPortfolio(data.portfolio);
            }
        };

        // Cleanup on app unmount
        return () => {
            ws.close();
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