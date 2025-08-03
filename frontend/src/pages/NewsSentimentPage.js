import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import apiClient from '../api/apiClient';
import {
    Box,
    Typography,
    Paper,
    Grid,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import PortfolioBriefing from '../components/PortfolioBriefing';

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
        // --- THE FIX: Create a master flexbox column for the entire page content ---
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
            <Typography variant="h4" gutterBottom>News & GenAI Analysis</Typography>
            
            {/* This Grid container will now grow to fill the available space */}
            <Grid container spacing={3} sx={{ flexGrow: 1 }}>

                {/* Left Panel: Ticker-Specific News */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                             <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>
                        ) : (
                            // This List will grow and become scrollable
                            <List sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
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
                </Grid>

                {/* Right Panel: GenAI Portfolio Briefing */}
                <Grid item xs={12} md={6}>
                    <PortfolioBriefing />
                </Grid>
                
            </Grid>
        </Box>
    );
};

export default NewsSentimentPage;