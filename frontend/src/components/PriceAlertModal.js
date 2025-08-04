import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Modal, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { toast } from 'react-toastify';
import apiClient from '../api/apiClient';

const PriceAlertModal = ({ open, onClose, ticker }) => {
    const [targetPrice, setTargetPrice] = useState('');
    const [condition, setCondition] = useState('above'); // 'above' or 'below'

    const handleSetAlert = async () => {
        if (!targetPrice || isNaN(parseFloat(targetPrice))) {
            toast.error("Please enter a valid target price.");
            return;
        }
        try {
            const response = await apiClient.post('/alerts/set-price-alert', { 
                ticker, 
                target_price: parseFloat(targetPrice), 
                condition 
            });
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

    return (
        <Modal open={open} onClose={onClose}>
            <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, p: 3 }}>
                <Typography variant="h6" component="h2">Set Price Alert for {ticker}</Typography>
                <ToggleButtonGroup color="primary" value={condition} exclusive onChange={(e, val) => setCondition(val)} sx={{ my: 2 }}>
                    <ToggleButton value="above">Price Above</ToggleButton>
                    <ToggleButton value="below">Price Below</ToggleButton>
                </ToggleButtonGroup>
                <TextField fullWidth label="Target Price" type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} />
                <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleSetAlert}>Set Alert</Button>
            </Paper>
        </Modal>
    );
};

export default PriceAlertModal;