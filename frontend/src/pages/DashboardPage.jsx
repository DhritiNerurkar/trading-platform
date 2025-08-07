import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js-dist-min';
import { useData } from '../context/DataContext';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, List, ListItem, ListItemText, Tabs, Tab, Button, Collapse, IconButton,
    ToggleButton, ToggleButtonGroup, Card, CardContent, Grid, Chip, Avatar
} from '@mui/material';
import { keyframes } from '@emotion/react';
import { TypeAnimation } from 'react-type-animation';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PushPinIcon from '@mui/icons-material/PushPin';

import AdvancedTradeTicket from '../components/AdvancedTradeTicket';
import PortfolioAnalytics from '../components/PortfolioAnalytics';
import PriceAlertModal from '../components/PriceAlertModal';
import usePinnedTickers from '../components/usePinnedTickers';

const flashGreen = keyframes`from { background-color: #10b981; } to { background-color: transparent; }`;
const flashRed = keyframes`from { background-color: #ef4444; } to { background-color: transparent; }`;

const DashboardPage = () => {
    const { liveData, portfolio, isConnected } = useData();
    const [selectedTicker, setSelectedTicker] = useState('AAPL');

    if (!isConnected || !portfolio) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '80vh',
                flexDirection: 'column',
                gap: 2
            }}>
                <CircularProgress size={60} sx={{ color: 'primary.main' }} />
                <Typography variant="h6" color="text.secondary">
                    Connecting to Tradely...
                </Typography>
            </Box>
        );
    }

    const selectedStockData = liveData[selectedTicker];

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 120px)',
            gap: 3
        }}>
            {/* Header Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Trading Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Real-time market data and portfolio analytics
                    </Typography>
                </Box>
                <Chip
                    label="Live Trading"
                    color="success"
                    icon={<TrendingUpIcon />}
                    sx={{ fontWeight: 600 }}
                />
            </Box>

            {/* Trade Ticket Card */}
            <Card sx={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #111111 100%)',
                border: '1px solid #2a2a2a',
                borderRadius: 3,
            }}>
                <CardContent sx={{ p: 3 }}>
                    <AdvancedTradeTicket
                        ticker={selectedTicker}
                        price={selectedStockData?.price}
                        high={selectedStockData?.high}
                        low={selectedStockData?.low}
                        bid={selectedStockData?.bid}
                        ask={selectedStockData?.ask}
                        portfolio={portfolio}
                        layout="horizontal"
                        onTradeSuccess={() => {
                            // This will trigger a refresh of transaction history when user navigates to portfolio
                            console.log('Trade completed, transaction history should be refreshed');
                        }}
                    />
                </CardContent>
            </Card>

            {/* Main Content Grid */}
            <Box sx={{
                flexGrow: 1,
                display: 'flex',
                gap: 3,
                minHeight: 0
            }}>
                {/* Watchlist Card */}
                <Card sx={{
                    width: '35%',
                    minWidth: '450px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #111111 100%)',
                    border: '1px solid #2a2a2a',
                    borderRadius: 3,
                    height: '100%',
                }}>
                    <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{
                            p: 3,
                            borderBottom: '1px solid #2a2a2a',
                            background: 'rgba(255, 255, 255, 0.02)',
                            flexShrink: 0,
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Market Watchlist
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Real-time stock prices and changes
                            </Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1, overflow: 'hidden', minHeight: 0 }}>
                            <Watchlist liveData={liveData} onSelectTicker={setSelectedTicker} />
                        </Box>
                    </CardContent>
                </Card>

                {/* Chart and Analytics Card */}
                <Card sx={{
                    flexGrow: 1,
                    height: '100%',
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #111111 100%)',
                    border: '1px solid #2a2a2a',
                    borderRadius: 3,
                }}>
                    <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <MainContent ticker={selectedTicker} />
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

// --- Child Components ---

const Watchlist = React.memo(({ liveData, onSelectTicker }) => {
    const [alertModalOpen, setAlertModalOpen] = useState(false);
    const [modalTicker, setModalTicker] = useState(null);
    const { toggle, isPinned } = usePinnedTickers();

    const handleOpenAlert = (ticker) => {
        setModalTicker(ticker);
        setAlertModalOpen(true);
    };
    const handleCloseAlert = () => setAlertModalOpen(false);

    return (
        <>
            <TableContainer sx={{
                flexGrow: 1,
                overflowY: 'auto',
                overflowX: 'auto',
                height: '100%',
                minHeight: 0,
            }}>
                <Table stickyHeader size="small" sx={{ minWidth: 600 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{
                                fontWeight: 600,
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                minWidth: '120px',
                                width: '120px',
                            }}>
                                Symbol
                            </TableCell>
                            <TableCell align="right" sx={{
                                fontWeight: 600,
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                minWidth: '100px',
                                width: '100px',
                            }}>
                                Price
                            </TableCell>
                            <TableCell align="right" sx={{
                                fontWeight: 600,
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                minWidth: '100px',
                                width: '100px',
                            }}>
                                Change
                            </TableCell>
                            <TableCell align="right" sx={{
                                fontWeight: 600,
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                minWidth: '140px',
                                width: '140px',
                            }}>
                                Spread
                            </TableCell>
                            <TableCell align="center" sx={{
                                fontWeight: 600,
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                minWidth: '80px',
                                width: '80px',
                            }}>
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.values(liveData).sort((a, b) => a.ticker.localeCompare(b.ticker)).map((stock) => {
                            const priceChange = stock.price - stock.prevPrice;
                            const isPositive = priceChange > 0;
                            const isNegative = priceChange < 0;

                            return (
                                <TableRow key={stock.ticker} hover sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' } }}>
                                    <TableCell sx={{ cursor: 'pointer' }} onClick={() => onSelectTicker(stock.ticker)}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main', flexShrink: 0 }}>
                                                {stock.ticker.charAt(0)}
                                            </Avatar>
                                            <Typography variant="body2" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {stock.ticker}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{
                                        cursor: 'pointer',
                                        backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : isNegative ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                        transition: 'background-color 0.3s ease',
                                    }} align="right" onClick={() => onSelectTicker(stock.ticker)}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            ${stock.price?.toFixed(2)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{
                                        cursor: 'pointer',
                                        backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : isNegative ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                        transition: 'background-color 0.3s ease',
                                    }} align="right" onClick={() => onSelectTicker(stock.ticker)}>
                                        <Chip
                                            label={`${stock.change_percent?.toFixed(2)}%`}
                                            size="small"
                                            color={stock.change > 0 ? 'success' : stock.change < 0 ? 'error' : 'default'}
                                            icon={stock.change > 0 ? <TrendingUpIcon /> : stock.change < 0 ? <TrendingDownIcon /> : null}
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ cursor: 'pointer' }} align="right" onClick={() => onSelectTicker(stock.ticker)}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                            ${stock.bid?.toFixed(2) || '...'} - ${stock.ask?.toFixed(2) || '...'}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                            ${((stock.ask || 0) - (stock.bid || 0)).toFixed(2)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={{ width: '80px', minWidth: '80px' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                            <IconButton
                                                size="small"
                                                title="Set Price Alert"
                                                onClick={() => handleOpenAlert(stock.ticker)}
                                                sx={{ color: 'text.secondary' }}
                                            >
                                                <NotificationsIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color={isPinned(stock.ticker) ? "warning" : "default"}
                                                title={isPinned(stock.ticker) ? "Unpin" : "Pin to Watchlist"}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggle(stock.ticker);
                                                }}
                                            >
                                                <PushPinIcon />
                                            </IconButton>
                                        </Box>
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

const MainContent = ({ ticker }) => {
    const [activeTab, setActiveTab] = useState(0);
    const handleTabChange = (event, newValue) => { setActiveTab(newValue); };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{
                borderBottom: '1px solid #2a2a2a',
                background: 'rgba(255, 255, 255, 0.02)',
                px: 3,
                py: 2
            }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    aria-label="main content tabs"
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                        },
                        '& .Mui-selected': {
                            color: 'primary.main',
                        },
                    }}
                >
                    <Tab label="Chart Analysis" />
                    <Tab label="Portfolio Analytics" />
                    <Tab label="News & Sentiment" />
                </Tabs>
            </Box>
            <Box sx={{ flexGrow: 1, p: 3, minHeight: 0, overflow: 'hidden' }}>
                {activeTab === 0 && <MainChart ticker={ticker} />}
                {activeTab === 1 && <PortfolioAnalytics />}
                {activeTab === 2 && <NewsSentiment ticker={ticker} />}
            </Box>
        </Box>
    );
};


const MainChart = React.memo(({ ticker }) => {
    const { liveData } = useData();
    const [chartData, setChartData] = useState({ prices: [], plotData: [] });
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState("");
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [chartType, setChartType] = useState('candlestick');
    const plotRef = React.useRef(null);

    // Effect 1: Load the initial historical data
    useEffect(() => {
        setAnalysis("");
        const fetchChartData = async () => {
            if (!ticker) return;
            setLoading(true);
            try {
                const response = await apiClient.get(`/historical/${ticker}`);
                const data = response.data;

                // Create chart data based on selected chart type
                let priceTrace;
                if (chartType === 'candlestick') {
                    priceTrace = {
                        x: data.map(d => d.timestamp),
                        open: data.map(d => d.open),
                        high: data.map(d => d.high),
                        low: data.map(d => d.low),
                        close: data.map(d => d.close),
                        type: 'candlestick', name: ticker, yaxis: 'y1',
                        increasing: { line: { color: 'limegreen' } },
                        decreasing: { line: { color: 'red' } }
                    };
                } else {
                    // Line chart using closing prices
                    priceTrace = {
                        x: data.map(d => d.timestamp),
                        y: data.map(d => d.close),
                        type: 'scatter',
                        mode: 'lines',
                        name: ticker,
                        yaxis: 'y1',
                        line: { color: '#90caf9', width: 2 }
                    };
                }

                const volumeTrace = {
                    x: data.map(d => d.timestamp),
                    y: data.map(d => d.volume),
                    type: 'bar', name: 'Volume', yaxis: 'y2',
                    marker: { color: '#f48fb1' }
                };

                setChartData({ prices: data, plotData: [priceTrace, volumeTrace] });
            } catch (error) { console.error("Failed to fetch chart data", error); }
            setLoading(false);
        };
        fetchChartData();
    }, [ticker, chartType]);

    // Effect 2: Handle LIVE data updates
    useEffect(() => {
        const liveTickData = liveData[ticker];

        if (plotRef.current && plotRef.current.el && liveTickData && chartData.prices.length > 0 && liveTickData.volume) {
            const plotlyInstance = plotRef.current.el;
            const lastTimestamp = plotlyInstance.data[0].x.slice(-1)[0];

            if (new Date(liveTickData.timestamp) > new Date(lastTimestamp)) {
                // Handle new data based on chart type
                let newPoint;
                if (chartType === 'candlestick') {
                    newPoint = {
                        x: [[liveTickData.timestamp]],
                        open: [[liveTickData.open]],
                        high: [[liveTickData.high]],
                        low: [[liveTickData.low]],
                        close: [[liveTickData.price]]
                    };
                } else {
                    // Line chart - only need x and y (close price)
                    newPoint = {
                        x: [[liveTickData.timestamp]],
                        y: [[liveTickData.price]]
                    };
                }

                const newVolume = {
                    x: [[liveTickData.timestamp]],
                    y: [[liveTickData.volume]]
                };

                // The indices [0] and [1] correspond to the price and volume traces
                Plotly.extendTraces(plotlyInstance, newPoint, [0]);
                Plotly.extendTraces(plotlyInstance, newVolume, [1]);
            }
        }
    }, [liveData, ticker, chartData.prices]);


    const handleAnalyzeChart = async () => {
        if (!chartData.prices.length) return;
        setAnalysisLoading(true);
        try {
            const response = await apiClient.post('/genai/chart-analysis', { ticker, prices: chartData.prices });
            setAnalysis(response.data.analysis);
        } catch (error) { setAnalysis("Error fetching analysis."); }
        setAnalysisLoading(false);
    };

    if (loading) return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 2
        }}>
            <CircularProgress size={40} sx={{ color: 'primary.main' }} />
            <Typography variant="body2" color="text.secondary">
                Loading chart data...
            </Typography>
        </Box>
    );

    const handleChartTypeChange = (event, newChartType) => {
        if (newChartType !== null) {
            setChartType(newChartType);
        }
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                p: 2,
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 2,
                border: '1px solid #2a2a2a'
            }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {ticker} Price Chart
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Real-time price data and volume analysis
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <ToggleButtonGroup
                        value={chartType}
                        exclusive
                        onChange={handleChartTypeChange}
                        size="small"
                        aria-label="chart type"
                        sx={{
                            '& .MuiToggleButton-root': {
                                borderColor: '#2a2a2a',
                                color: 'text.secondary',
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'primary.contrastText',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                },
                            },
                        }}
                    >
                        <ToggleButton value="candlestick" aria-label="candlestick chart">
                            <CandlestickChartIcon fontSize="small" />
                        </ToggleButton>
                        <ToggleButton value="line" aria-label="line chart">
                            <ShowChartIcon fontSize="small" />
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AutoAwesomeIcon />}
                        onClick={handleAnalyzeChart}
                        disabled={analysisLoading}
                        sx={{
                            background: 'linear-gradient(135deg, #00d4aa 0%, #4dffdb 100%)',
                            color: '#000',
                            fontWeight: 600,
                            '&:hover': {
                                background: 'linear-gradient(135deg, #00a37a 0%, #00d4aa 100%)',
                            },
                        }}
                    >
                        {analysisLoading ? "Analyzing..." : "AI Analysis"}
                    </Button>
                </Box>
            </Box>

            <Box sx={{ flexGrow: 1, position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid #2a2a2a' }}>
                <Plot
                    ref={plotRef}
                    data={chartData.plotData}
                    layout={{
                        dragmode: 'pan',
                        template: 'plotly_dark',
                        showlegend: false,
                        xaxis: {
                            rangeslider: { visible: false },
                            gridcolor: '#2a2a2a',
                            zerolinecolor: '#2a2a2a',
                        },
                        yaxis: {
                            title: 'Price (USD)',
                            domain: [0.25, 1],
                            autorange: true,
                            gridcolor: '#2a2a2a',
                            zerolinecolor: '#2a2a2a',
                        },
                        yaxis2: {
                            title: 'Volume',
                            domain: [0, 0.2],
                            autorange: true,
                            showgrid: false,
                            gridcolor: '#2a2a2a',
                            zerolinecolor: '#2a2a2a',
                        },
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        margin: { t: 20, b: 40, l: 50, r: 20 },
                        font: {
                            color: '#ffffff'
                        }
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                    config={{ responsive: true, scrollZoom: true }}
                />
            </Box>

            <Collapse in={!!analysis || analysisLoading}>
                <Box sx={{
                    p: 3,
                    mt: 2,
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #111111 100%)',
                    borderRadius: 2,
                    border: '1px solid #2a2a2a',
                    borderLeft: '4px solid #00d4aa'
                }}>
                    <Typography variant="subtitle1" sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        fontWeight: 600,
                        color: 'primary.main'
                    }}>
                        <AutoAwesomeIcon fontSize="small" />
                        AI Market Analysis
                    </Typography>
                    {analysisLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CircularProgress size={20} sx={{ color: 'primary.main' }} />
                            <Typography variant="body2" color="text.secondary">
                                Analyzing market patterns...
                            </Typography>
                        </Box>
                    ) : (
                        <TypeAnimation
                            sequence={[analysis]}
                            wrapper="span"
                            speed={70}
                            cursor={false}
                            style={{
                                fontSize: '0.9rem',
                                fontStyle: 'italic',
                                lineHeight: 1.6,
                                color: '#e5e5e5'
                            }}
                        />
                    )}
                </Box>
            </Collapse>
        </Box>
    );
});


const NewsSentiment = ({ ticker }) => {
    // ... (This component remains the same)
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