import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import Plot from 'react-plotly.js';
import { useData } from '../context/DataContext';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, List, ListItem, ListItemText, Tabs, Tab, Button, Collapse
} from '@mui/material';
import { keyframes } from '@emotion/react';
import { TypeAnimation } from 'react-type-animation';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import AdvancedTradeTicket from '../components/AdvancedTradeTicket';
import PortfolioAnalytics from '../components/PortfolioAnalytics';

const flashGreen = keyframes`from { background-color: #004d40; } to { background-color: transparent; }`;
const flashRed = keyframes`from { background-color: #b71c1c; } to { background-color: transparent; }`;

const DashboardPage = () => {
    const { liveData, portfolio, isConnected } = useData();
    const [selectedTicker, setSelectedTicker] = useState('AAPL');
    const [activeTab, setActiveTab] = useState(0);

    if (!isConnected || !portfolio) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 100px)' }}>
            <Box sx={{ width: '30%', minWidth: '350px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper>
                    <Watchlist liveData={liveData} onSelectTicker={setSelectedTicker} />
                </Paper>
                <Paper sx={{ flexGrow: 1 }}>
                    <AdvancedTradeTicket
                        ticker={selectedTicker}
                        price={liveData[selectedTicker]?.price}
                        portfolio={portfolio}
                    />
                </Paper>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
                <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} aria-label="tabs">
                            <Tab label="Chart" />
                            <Tab label="Portfolio Analytics" />
                            <Tab label="News & Sentiment" />
                        </Tabs>
                    </Box>
                    <Box sx={{ flexGrow: 1, p: 1, minHeight: 0 }}>
                        {activeTab === 0 && <MainChart ticker={selectedTicker} />}
                        {activeTab === 1 && <PortfolioAnalytics />}
                        {activeTab === 2 && <NewsSentiment ticker={selectedTicker} />}
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

// Watchlist Component
const Watchlist = React.memo(({ liveData, onSelectTicker }) => {
    return (
        <>
            <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid grey' }}>Watchlist</Typography>
            <TableContainer sx={{ maxHeight: 350 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Ticker</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="right">Change</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.values(liveData).sort((a, b) => a.ticker.localeCompare(b.ticker)).map((stock) => {
                            const priceChange = stock.price - stock.prevPrice;
                            let flashAnimation = '';
                            if (priceChange > 0) flashAnimation = `${flashGreen} 0.5s ease-out`;
                            if (priceChange < 0) flashAnimation = `${flashRed} 0.5s ease-out`;

                            return (
                                <TableRow key={stock.ticker} hover sx={{ cursor: 'pointer', animation: flashAnimation }} onClick={() => onSelectTicker(stock.ticker)}>
                                    <TableCell>{stock.ticker}</TableCell>
                                    <TableCell align="right">${stock.price?.toFixed(2)}</TableCell>
                                    <TableCell align="right" sx={{ color: stock.change >= 0 ? 'success.main' : 'error.main' }}>
                                        {stock.change_percent?.toFixed(2)}%
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
});

// MainChart Component
const MainChart = ({ ticker }) => {
    const [chartData, setChartData] = useState({ prices: [], plotData: [] });
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState('');
    const [analysisLoading, setAnalysisLoading] = useState(false);

    useEffect(() => {
        setAnalysis('');
        const fetchChartData = async () => {
            if (!ticker) return;
            setLoading(true);
            try {
                const res = await apiClient.get(`/historical/${ticker}`);
                const data = res.data;
                const priceData = {
                    x: data.map(d => d.timestamp),
                    open: data.map(d => d.open),
                    high: data.map(d => d.high),
                    low: data.map(d => d.low),
                    close: data.map(d => d.close),
                    type: 'candlestick',
                    name: ticker,
                    yaxis: 'y1',
                    increasing: { line: { color: 'limegreen' } },
                    decreasing: { line: { color: 'red' } }
                };
                const volumeData = {
                    x: data.map(d => d.timestamp),
                    y: data.map(d => d.volume),
                    type: 'bar',
                    name: 'Volume',
                    yaxis: 'y2',
                    marker: { color: '#f48fb1' }
                };
                setChartData({ prices: data, plotData: [priceData, volumeData] });
            } catch (err) {
                console.error('Failed to fetch chart data', err);
            }
            setLoading(false);
        };
        fetchChartData();
    }, [ticker]);

    const handleAnalyzeChart = async () => {
        if (!chartData.prices.length) return;
        setAnalysisLoading(true);
        try {
            const res = await apiClient.post('/genai/chart-analysis', { ticker, prices: chartData.prices });
            setAnalysis(res.data.analysis);
        } catch (err) {
            setAnalysis("Error fetching analysis.");
        }
        setAnalysisLoading(false);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            {/* Chart Section */}
            <Box sx={{ position: 'relative', width: '100%', height: 400 }}>
                <Plot
                    data={chartData.plotData}
                    layout={{
                        title: `${ticker} Price and Volume`,
                        template: 'plotly_dark',
                        showlegend: false,
                        xaxis: { rangeslider: { visible: false } },
                        yaxis: { domain: [0.3, 1] },
                        yaxis2: { domain: [0, 0.2], showgrid: false },
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                        margin: { t: 40, b: 40, l: 40, r: 20 },
                    }}
                    config={{ responsive: true }}
                    style={{ width: '100%', height: '100%' }}
                    useResizeHandler
                />

                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AutoAwesomeIcon />}
                    onClick={handleAnalyzeChart}
                    disabled={analysisLoading}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                    {analysisLoading ? 'Analyzing...' : 'Analyze Chart'}
                </Button>
            </Box>

            {/* GenAI Analysis Section */}
            <Collapse in={!!analysis || analysisLoading}>
                <Paper
                    elevation={6}
                    sx={{
                        p: 2,
                        mt: 2,
                        backgroundColor: '#1e1e1e',
                        borderRadius: 2,
                        border: '1px solid #444',
                        color: 'white'
                    }}
                >
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: '#90caf9' }}>
                        <AutoAwesomeIcon fontSize="small" /> GenAI Analysis
                    </Typography>
                    {analysisLoading ? (
                        <CircularProgress size={20} />
                    ) : (
                        <TypeAnimation
                            sequence={[analysis]}
                            wrapper="span"
                            speed={70}
                            cursor={false}
                            style={{ fontSize: '0.9em', fontStyle: 'italic', color: '#e0e0e0' }}
                        />
                    )}
                </Paper>
            </Collapse>
        </Box>
    );
};

// NewsSentiment Component
const NewsSentiment = ({ ticker }) => {
    const [sentimentData, setSentimentData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSentiment = async () => {
            if (!ticker) return;
            setLoading(true);
            try {
                const res = await apiClient.get(`/news/${ticker}`);
                setSentimentData(res.data);
            } catch (err) {
                console.error("Failed to fetch sentiment", err);
                setSentimentData([]);
            }
            setLoading(false);
        };
        fetchSentiment();
    }, [ticker]);

    const getSentimentColor = (sentiment) => {
        if (sentiment === 'Bullish') return 'success.main';
        if (sentiment === 'Bearish') return 'error.main';
        return 'text.secondary';
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ p: 1 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
                News & GenAI Sentiment for {ticker}
            </Typography>
            <List dense>
                {sentimentData.map((item, i) => (
                    <ListItem key={i} disableGutters>
                        <ListItemText
                            primary={item.headline}
                            secondary={
                                <Typography component="span" variant="body2" sx={{ fontWeight: 'bold', color: getSentimentColor(item.sentiment) }}>
                                    {item.sentiment}
                                </Typography>
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default DashboardPage;
