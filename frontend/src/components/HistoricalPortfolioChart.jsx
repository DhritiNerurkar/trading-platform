import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import Plot from 'react-plotly.js';
import { Paper, CircularProgress, Box } from '@mui/material';

const HistoricalPortfolioChart = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await apiClient.get('/portfolio/history');
                setHistory(response.data);
            } catch (error) {
                console.error("Failed to fetch portfolio history", error);
            }
            setLoading(false);
        };
        fetchHistory();
    }, []);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
    }

    return (
        <Plot
            data={[{
                x: history.map(d => d.timestamp),
                y: history.map(d => d.value),
                type: 'scatter',
                mode: 'lines',
                line: { color: '#90caf9' }
            }]}
            layout={{
                title: 'Portfolio Value Over Time',
                template: 'plotly_dark',
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                xaxis: { showgrid: false },
                yaxis: { title: 'Portfolio Value (USD)', showgrid: true, gridcolor: '#444' }
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
            config={{ responsive: true }}
        />
    );
};

export default HistoricalPortfolioChart;