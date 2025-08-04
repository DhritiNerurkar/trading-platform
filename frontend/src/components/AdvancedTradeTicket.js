import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, TextField, Button, Grid, Divider } from '@mui/material';
import { toast } from 'react-toastify';
import apiClient from '../api/apiClient';

// --- THE FIX: The component now accepts `high` and `low` as props ---
const AdvancedTradeTicket = ({ ticker, price, high, low, portfolio }) => {
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
        <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ borderBottom: '1px solid grey', pb: 1, mb: 2 }}>
                Trade Ticket: {ticker}
            </Typography>
            
            <Box sx={{ flexGrow: 1 }}>
                <TextField fullWidth disabled margin="dense" label="Market Price" value={price ? `$${price.toFixed(2)}` : 'N/A'} />
                <TextField fullWidth margin="dense" label="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} InputProps={{ inputProps: { min: 1 } }} />
                
                {/* --- THE FIX: Display the Day's High and Low prices --- */}
                <Grid container spacing={1} sx={{ mt: 1, mb: 2 }}>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Day's High: <span style={{ color: 'white' }}>{high ? `$${high.toFixed(2)}` : 'N/A'}</span></Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Day's Low: <span style={{ color: 'white' }}>{low ? `$${low.toFixed(2)}` : 'N/A'}</span></Typography>
                    </Grid>
                </Grid>
                <Divider sx={{ my: 2 }}/>
                 {/* --- --- */}

                <Typography variant="body1">
                    Estimated Cost: <span style={{ fontWeight: 'bold' }}>${estimatedCost.toFixed(2)}</span>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Cash Available: ${portfolio?.cash?.toLocaleString('en-US', {minimumFractionDigits: 2}) || '...'}
                </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button fullWidth variant="contained" color="success" onClick={() => handleTrade('buy')}>Buy</Button>
                <Button fullWidth variant="contained" color="error" onClick={() => handleTrade('sell')}>Sell</Button>
            </Box>
        </Paper>
    );
};

export default AdvancedTradeTicket;