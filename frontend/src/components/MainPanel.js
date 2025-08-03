import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import Plot from 'react-plotly.js';
import { Box, Paper, Typography, Button, Collapse, CircularProgress } from '@mui/material';
import { TypeAnimation } from 'react-type-animation';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PortfolioAnalytics from './PortfolioAnalytics';

// This component is the main container for the right-hand side of the dashboard.
const MainPanel = ({ ticker }) => {
    return (
        // --- FIX: Use a simple flex column layout ---
        // This ensures components stack vertically and respect each other's space.
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
            <Box sx={{ flex: 1, minHeight: 0 }}> {/* This makes the chart container grow to fill available space */}
                <MainChart ticker={ticker} />
            </Box>
            <Box> {/* This container takes up its natural height at the bottom */}
                <PortfolioAnalytics />
            </Box>
        </Box>
    );
};

const MainChart = ({ ticker }) => {
    const [chartData, setChartData] = useState({ prices: [], plotData: [] });
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState("");
    const [analysisLoading, setAnalysisLoading] = useState(false);

    useEffect(() => {
        setAnalysis("");
        const fetchChartData = async () => {
            if (!ticker) return;
            setLoading(true);
            try {
                const response = await apiClient.get(`/historical/${ticker}`);
                const data = response.data;
                const priceTrace = { x: data.map(d => d.timestamp), open: data.map(d => d.open), high: data.map(d => d.high), low: data.map(d => d.low), close: data.map(d => d.close), type: 'candlestick', name: ticker, yaxis: 'y1', increasing: { line: { color: 'limegreen' } }, decreasing: { line: { color: 'red' } } };
                const volumeTrace = { x: data.map(d => d.timestamp), y: data.map(d => d.volume), type: 'bar', name: 'Volume', yaxis: 'y2', marker: { color: '#f48fb1' } };
                setChartData({prices: data, plotData: [priceTrace, volumeTrace]});
            } catch (error) { console.error("Failed to fetch chart data", error); }
            setLoading(false);
        };
        fetchChartData();
    }, [ticker]);

    const handleAnalyzeChart = async () => {
        if (!chartData.prices.length) return;
        setAnalysisLoading(true);
        try {
            const response = await apiClient.post('/genai/chart-analysis', { ticker, prices: chartData.prices });
            setAnalysis(response.data.analysis);
        } catch (error) { setAnalysis("Error fetching analysis."); }
        setAnalysisLoading(false);
    };

    if (loading) return <Paper sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Paper>;

    return (
        <Paper sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{ticker} Price and Volume</Typography>
                <Button variant="outlined" size="small" startIcon={<AutoAwesomeIcon />} onClick={handleAnalyzeChart} disabled={analysisLoading}>
                    {analysisLoading ? "Analyzing..." : "Analyze Chart"}
                </Button>
            </Box>

            {/* Main chart container that fills the available vertical space */}
            <Box sx={{ flexGrow: 1, position: 'relative' }}>
                 <Plot
                    data={chartData.plotData}
                    layout={{
                        dragmode: 'pan', template: 'plotly_dark', showlegend: false,
                        xaxis: { rangeslider: { visible: false } },
                        yaxis: { title: 'Price (USD)', domain: [0.25, 1], autorange: true },
                        yaxis2: { title: 'Volume', domain: [0, 0.2], autorange: true, showgrid: false },
                        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
                        margin: { t: 20, b: 40, l: 50, r: 20 },
                    }}
                    useResizeHandler={true} 
                    style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                    config={{ responsive: true, scrollZoom: true }}
                />
            </Box>

            {/* --- FIX: CLEAN UI FOR AI ANALYSIS --- */}
            {/* The AI analysis now appears in a clean, designated area *below* the chart */}
            <Collapse in={!!analysis || analysisLoading}>
                <Box sx={{ p: 2, mt: 1, borderTop: '1px solid #444' }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                        <AutoAwesomeIcon fontSize="small"/>
                        GenAI Analysis
                    </Typography>
                    {analysisLoading ? <CircularProgress size={20} /> : (
                         <TypeAnimation sequence={[analysis]} wrapper="span" speed={70} cursor={false} style={{ fontSize: '0.9em', fontStyle: 'italic' }}/>
                    )}
                </Box>
            </Collapse>
        </Paper>
    );
};

export default React.memo(MainPanel);