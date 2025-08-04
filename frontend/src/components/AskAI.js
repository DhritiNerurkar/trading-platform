import React, { useState } from 'react';
import { Box, TextField, IconButton, Modal, Paper, Typography, CircularProgress } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIcon from '@mui/icons-material/Search';
import { TypeAnimation } from 'react-type-animation';
import apiClient from '../api/apiClient';

const AskAI = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setQuery('');
        setResponse('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query) return;
        setLoading(true);
        setResponse('');
        try {
            const result = await apiClient.post('/genai/query', { query });
            setResponse(result.data.answer);
        } catch (error) {
            console.error("Failed to get AI response", error);
            setResponse("Sorry, I encountered an error. Please try again.");
        }
        setLoading(false);
    };

    return (
        <>
            <IconButton onClick={handleOpen} color="inherit">
                <AutoAwesomeIcon />
            </IconButton>
            <Modal open={open} onClose={handleClose}>
                <Paper sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: 'clamp(300px, 60vw, 800px)', p: 3,
                }}>
                    <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AutoAwesomeIcon color="primary" />
                        Ask Nomura AI
                    </Typography>
                    <Typography sx={{ mt: 1, mb: 2 }} color="text.secondary">
                        Ask about your portfolio, stock news, or market sentiment.
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="e.g., What was my best performer today?"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <IconButton type="submit" color="primary" disabled={loading}>
                            <SearchIcon />
                        </IconButton>
                    </Box>

                    { (loading || response) && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1, minHeight: '100px' }}>
                            {loading ? <CircularProgress size={24} /> : (
                                <TypeAnimation sequence={[response]} wrapper="p" speed={70} cursor={false} style={{ margin: 0, whiteSpace: 'pre-wrap' }}/>
                            )}
                        </Box>
                    )}
                </Paper>
            </Modal>
        </>
    );
};

export default AskAI;