import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Modal, TextField, ToggleButton, ToggleButtonGroup, Switch, FormControlLabel, Divider } from '@mui/material';
import { toast } from 'react-toastify';
import apiClient from '../api/apiClient';

const PriceAlertModal = ({ open, onClose, ticker }) => {
    const [targetPrice, setTargetPrice] = useState('');
    const [condition, setCondition] = useState('above');
    
    // --- THE FIX: New state for the auto-trade feature ---
    const [autoTrade, setAutoTrade] = useState(false);
    const [tradeAction, setTradeAction] = useState('buy');
    const [tradeQuantity, setTradeQuantity] = useState(1);

    const handleSetAlert = async () => {
        if (!targetPrice || isNaN(parseFloat(targetPrice))) {
            toast.error("Please enter a valid target price.");
            return;
        }

        // Construct the payload for the backend
        const payload = { 
            ticker, 
            target_price: parseFloat(targetPrice), 
            condition 
        };

        if (autoTrade) {
            if (tradeQuantity < 1) {
                toast.error("Auto-trade quantity must be at least 1.");
                return;
            }
            payload.auto_trade_action = tradeAction;
            payload.auto_trade_quantity = tradeQuantity;
        }

        try {
            const response = await apiClient.post('/alerts/set-price-alert', payload);
            if (response.data.success) {
                toast.success(response.data.message);
                onClose();
            } else {
                toast.warn(response.data.message);
            }
        } catch (error) {
            toast.error("Failed to set price alert.");
        }
    };

    // Reset state when the modal is closed
    const handleClose = () => {
        setTargetPrice('');
        setCondition('above');
        setAutoTrade(false);
        setTradeAction('buy');
        setTradeQuantity(1);
        onClose();
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, p: 3 }}>
                <Typography variant="h6" component="h2">Set Price Alert for {ticker}</Typography>
                
                <ToggleButtonGroup color="primary" value={condition} exclusive onChange={(e, val) => { if(val) setCondition(val); }} sx={{ my: 2 }}>
                    <ToggleButton value="above">Price Is Above</ToggleButton>
                    <ToggleButton value="below">Price Is Below</ToggleButton>
                </ToggleButtonGroup>
                
                <TextField fullWidth label="Target Price" type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} />
                
                <Divider sx={{ my: 2 }} />

                {/* --- THE FIX: New UI for Auto-Trading --- */}
                <FormControlLabel
                    control={<Switch checked={autoTrade} onChange={(e) => setAutoTrade(e.target.checked)} />}
                    label="Execute Trade Automatically"
                />
                
                {autoTrade && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                         <ToggleButtonGroup color="primary" value={tradeAction} exclusive onChange={(e, val) => { if(val) setTradeAction(val); }}>
                            <ToggleButton value="buy" sx={{color: 'success.main'}}>Buy</ToggleButton>
                            <ToggleButton value="sell" sx={{color: 'error.main'}}>Sell</ToggleButton>
                        </ToggleButtonGroup>
                         <TextField
                            label="Quantity"
                            type="number"
                            value={tradeQuantity}
                            onChange={(e) => setTradeQuantity(Number(e.target.value))}
                            InputProps={{ inputProps: { min: 1 } }}
                            size="small"
                        />
                    </Box>
                )}
                
                <Button fullWidth variant="contained" sx={{ mt: 3 }} onClick={handleSetAlert}>Set Alert</Button>
            </Paper>
        </Modal>
    );
};

export default PriceAlertModal;