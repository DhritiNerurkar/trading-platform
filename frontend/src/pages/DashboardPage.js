import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import Plot from 'react-plotly.js';
import { useData } from '../context/DataContext';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, List, ListItem, ListItemText, Tabs, Tab, Button, Collapse, IconButton
} from '@mui/material';
import { keyframes } from '@emotion/react';
import { TypeAnimation } from 'react-type-animation';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

// --- Import all necessary child components and icons ---
import AdvancedTradeTicket from '../components/AdvancedTradeTicket';
import PortfolioAnalytics from '../components/PortfolioAnalytics';
import PriceAlertModal from '../components/PriceAlertModal';
import NotificationsIcon from '@mui/icons-material/Notifications';

const flashGreen = keyframes`from { background-color: #004d40; } to { background-color: transparent; }`;
const flashRed = keyframes`from { background-color: #b71c1c; } to { background-color: transparent; }`;

const DashboardPage = () => {
    const { liveData, portfolio, isConnected } = useData();
    const [selectedTicker, setSelectedTicker] = useState('AAPL');
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (!isConnected || !portfolio) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }
    
    const selectedStockData = liveData[selectedTicker];

    return (
        <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 100px)' }}>
            <Box sx={{ width: '30%', minWidth: '350px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper>
                    <Watchlist liveData={liveData} onSelectTicker={setSelectedTicker} />
                </Paper>
                <Paper sx={{ flexGrow: 1 }}>
                    <AdvancedTradeTicket
                        ticker={selectedTicker}
                        price={selectedStockData?.price}
                        high={selectedStockData?.high}
                        low={selectedStockData?.low}
                        portfolio={portfolio}
                    />
                </Paper>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
                <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={activeTab} onChange={handleTabChange} aria-label="tabs">
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

// --- Child Components ---

const Watchlist = React.memo(({ liveData, onSelectTicker }) => {
    const [alertModalOpen, setAlertModalOpen] = useState(false);
    const [modalTicker, setModalTicker] = useState(null);

    const handleOpenAlert = (ticker) => {
        setModalTicker(ticker);
        setAlertModalOpen(true);
    };
    const handleCloseAlert = () => setAlertModalOpen(false);

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
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.values(liveData).sort((a, b) => a.ticker.localeCompare(b.ticker)).map((stock) => {
                            const priceChange = stock.price - stock.prevPrice;
                            let flashAnimation = '';
                            if (priceChange > 0) flashAnimation = `${flashGreen} 0.5s ease-out`;
                            if (priceChange < 0) flashAnimation = `${flashRed} 0.5s ease-out`;

                            return (
                                <TableRow key={stock.ticker} hover>
                                    <TableCell sx={{cursor: 'pointer'}} onClick={() => onSelectTicker(stock.ticker)}>{stock.ticker}</TableCell>
                                    <TableCell sx={{cursor: 'pointer'}} align="right" onClick={() => onSelectTicker(stock.ticker)}>${stock.price?.toFixed(2)}</TableCell>
                                    <TableCell sx={{cursor: 'pointer', color: stock.change >= 0 ? 'success.main' : 'error.main'}} align="right" onClick={() => onSelectTicker(stock.ticker)}>
                                        {stock.change_percent?.toFixed(2)}%
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" title="Set Price Alert" onClick={() => handleOpenAlert(stock.ticker)}>
                                            <NotificationsIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <PriceAlertModal open={alertModalOpen} onClose={handleCloseAlert} ticker={modalTicker} />
        </>
    );
});

// --- THE FIX: The full, correct MainChart component is now included ---
const MainChart = React.memo(({ ticker }) => {
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

            <Collapse in={!!analysis || analysisLoading}>
                <Paper elevation={4} sx={{ p: 2, mt: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                        <AutoAwesomeIcon fontSize="small"/>
                        GenAI Analysis
                    </Typography>
                    {analysisLoading ? <CircularProgress size={20} /> : (
                         <TypeAnimation sequence={[analysis]} wrapper="span" speed={70} cursor={false} style={{ fontSize: '0.9em', fontStyle: 'italic' }}/>
                    )}
                </Paper>
            </Collapse>
        </Paper>
    );
});

// --- THE FIX: The full, correct NewsSentiment component is now included ---
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
        <Box sx={{ p: 1, height: '100%', overflowY: 'auto' }}>
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