import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, TextField, Button } from '@mui/material';
import { toast } from 'react-toastify';
import apiClient from '../api/apiClient';

const AdvancedTradeTicket = ({ ticker, price, portfolio }) => {
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
        if (quantity < 1) {
            toast.error("Quantity must be at least 1.");
            return;
        }
        try {
            const response = await apiClient.post(`/${action}`, { ticker, quantity: parseInt(quantity, 10) });
            if(response.data.success) {
                toast.success(`Successfully ${action === 'buy' ? 'bought' : 'sold'} ${quantity} of ${ticker}`);
            } else {
                toast.error(`Trade failed: ${response.data.message}`);
            }
        } catch (error) {
            toast.error(`Trade failed: ${error.response?.data?.message || 'Server error'}`);
        }
    };

    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ borderBottom: '1px solid grey', pb: 1, mb: 2 }}>
                Trade Ticket: {ticker}
            </Typography>
            <Box>
                <TextField fullWidth disabled margin="dense" label="Market Price" value={price ? `$${price.toFixed(2)}` : 'N/A'} />
                <TextField fullWidth margin="dense" label="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} InputProps={{ inputProps: { min: 1 } }} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Estimated Cost: ${estimatedCost.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Cash Available: ${portfolio?.cash?.toLocaleString('en-US', {minimumFractionDigits: 2}) || '...'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button fullWidth variant="contained" color="success" onClick={() => handleTrade('buy')}>Buy</Button>
                    <Button fullWidth variant="contained" color="error" onClick={() => handleTrade('sell')}>Sell</Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default AdvancedTradeTicket;