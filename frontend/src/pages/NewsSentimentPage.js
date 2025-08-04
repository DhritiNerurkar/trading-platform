import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import apiClient from '../api/apiClient';
import { Box, Typography, Paper, Grid, List, ListItem, ListItemText, CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const NewsSentimentPage = () => {
    const { liveData } = useData();
    const [selectedTicker, setSelectedTicker] = useState('AAPL');
    const [sentimentData, setSentimentData] = useState([]);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const fetchSentiment = async () => {
            if (!selectedTicker) return;
            setLoading(true);
            try {
                const response = await apiClient.get(`/news/${selectedTicker}`);
                setSentimentData(response.data);
            } catch (error) {
                console.error("Failed to fetch sentiment", error);
            }
            setLoading(false);
        };
        fetchSentiment();
    }, [selectedTicker]);

    const getSentimentColor = (sentiment) => {
        if (sentiment === 'Bullish') return 'success.main';
        if (sentiment === 'Bearish') return 'error.main';
        return 'text.secondary';
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>News & GenAI Sentiment</Typography>
            
            {/* --- THE FIX: The page is no longer a grid, just a single panel --- */}
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Ticker News & Sentiment</Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="ticker-select-label">Select a Ticker</InputLabel>
                    <Select
                        labelId="ticker-select-label"
                        value={selectedTicker}
                        label="Select a Ticker"
                        onChange={(e) => setSelectedTicker(e.target.value)}
                    >
                        {Object.keys(liveData).sort().map(ticker => (
                            <MenuItem key={ticker} value={ticker}>{ticker}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                ) : (
                    <List sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        {sentimentData.map((item, index) => (
                            <ListItem key={index} disableGutters divider>
                                <ListItemText
                                    primary={item.headline}
                                    secondary={<Typography component="span" variant="body2" sx={{ fontWeight: 'bold', color: getSentimentColor(item.sentiment) }}>{item.sentiment}</Typography>}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>
        </Box>
    );
};

export default NewsSentimentPage;