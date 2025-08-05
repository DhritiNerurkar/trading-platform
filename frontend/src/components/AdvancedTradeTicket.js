import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Grid } from '@mui/material';
import { toast } from 'react-toastify';
import apiClient from '../api/apiClient';

const AdvancedTradeTicket = ({ ticker, price, high, low, portfolio, layout = 'horizontal' }) => {
    const [quantity, setQuantity] = useState(1);
    const [estimatedCost, setEstimatedCost] = useState(0);

    useEffect(() => {
        if (price && quantity > 0) {
            setEstimatedCost(price * quantity);
        } else {
            setEstimatedCost(0);
        }
    }, [price, quantity]);

    const handleTrade = async (action) => {
        if (!ticker || quantity < 1) {
            toast.error("Please select a ticker and enter a valid quantity.");
            return;
        }
        try {
            const response = await apiClient.post(`/${action}`, { ticker, quantity: parseInt(quantity, 10) });
            if (response.data.success) {
                toast.success(`Successfully ${action === 'buy' ? 'bought' : 'sold'} ${quantity} of ${ticker}`);
            } else {
                toast.error(`Trade failed: ${response.data.message}`);
            }
        } catch (error) {
            toast.error(`Trade failed: ${error.response?.data?.message || 'Server error'}`);
        }
    };

    if (layout === 'horizontal') {
        return (
            <Box sx={{ px: 2, py: 1 }}>
                <Grid container spacing={1} alignItems="center">

                    {/* Row 1: Ticker, Inputs, Buttons */}
                    <Grid item xs={12} container alignItems="center" spacing={1}>

                        {/* Left: Ticker */}
                        <Grid item xs="auto" sx={{ pr: 4 }}>
                            <Typography variant="subtitle1">
                                Trade Ticket: <strong>{ticker}</strong>
                            </Typography>
                        </Grid>

                        {/* Center Inputs */}
                        <Grid item xs={2} sm={2} md={2}>
                            <TextField
                                fullWidth
                                size="small"
                                disabled
                                label="Market Price"
                                value={price ? `$${price.toFixed(2)}` : 'N/A'}
                            />
                        </Grid>
                        <Grid item xs={2} sm={2} md={2}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Quantity"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                InputProps={{ inputProps: { min: 1 } }}
                            />
                        </Grid>

                        {/* Spacer */}
                        <Grid item xs />

                        {/* Right: Buttons */}
                        <Grid item xs="auto">
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    sx={{ minWidth: 120, height: 48 }}
                                    onClick={() => handleTrade('buy')}
                                >
                                    BUY
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    sx={{ minWidth: 120, height: 48 }}
                                    onClick={() => handleTrade('sell')}
                                >
                                    SELL
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Row 2: Metrics */}
                    <Grid item xs={12}>
                        <Typography variant="body2" sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            Day's High: <strong>${high?.toFixed(2) || 'N/A'}</strong>
                            Day's Low: <strong>${low?.toFixed(2) || 'N/A'}</strong>
                            Est. Cost: <strong>${estimatedCost.toFixed(2)}</strong>
                            Cash: <strong>${portfolio?.cash?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '...'}</strong>
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    // Default vertical layout (no change)
    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Trade Ticket: {ticker}
            </Typography>
            <TextField fullWidth disabled margin="dense" label="Market Price" value={price ? `$${price.toFixed(2)}` : 'N/A'} />
            <TextField fullWidth margin="dense" label="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} InputProps={{ inputProps: { min: 1 } }} />
            <Typography variant="body1" sx={{ mt: 1 }}>Estimated Cost: <strong>${estimatedCost.toFixed(2)}</strong></Typography>
            <Typography variant="body2" color="text.secondary">Cash Available: ${portfolio?.cash?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '...'}</Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button fullWidth variant="contained" color="success" onClick={() => handleTrade('buy')}>Buy</Button>
                <Button fullWidth variant="contained" color="error" onClick={() => handleTrade('sell')}>Sell</Button>
            </Box>
        </Box>
    );
};

export default AdvancedTradeTicket;
