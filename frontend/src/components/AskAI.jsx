import React, { useState } from 'react';
import { Box, TextField, IconButton, Modal, Paper, Typography, CircularProgress, Chip, Stack } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIcon from '@mui/icons-material/Search';
import { TypeAnimation } from 'react-type-animation';
import apiClient from '../api/apiClient';

// --- THE FIX: Define a list of suggested questions ---
const suggestedQuestions = [
    "What was my best performing stock today?",
    "Summarize the latest news for TSLA.",
    "What is the current sentiment for Microsoft?",
    "Show me my current holdings.",
];

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

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion);
    };

    return (
        <>
            <IconButton onClick={handleOpen} color="inherit" title="Ask Nomura AI">
                <AutoAwesomeIcon />
            </IconButton>
            <Modal open={open} onClose={handleClose}>
                <Paper sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: 'clamp(300px, 60vw, 800px)', p: 3,
                }}>
                    <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AutoAwesomeIcon color="primary" />
                        Ask AI
                    </Typography>
                    <Typography sx={{ mt: 1, mb: 2 }} color="text.secondary">
                        Ask about your portfolio, stock news, or market sentiment.
                    </Typography>
                    
                    {/* --- THE FIX: Add the suggestion chips --- */}
                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        {suggestedQuestions.map((q, index) => (
                            <Chip
                                key={index}
                                label={q}
                                onClick={() => handleSuggestionClick(q)}
                                variant="outlined"
                            />
                        ))}
                    </Stack>

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Type your question here..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <IconButton type="submit" color="primary" disabled={loading || !query}>
                            <SearchIcon />
                        </IconButton>
                    </Box>

                    { (loading || response) && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1, minHeight: '100px' }}>
                            {loading ? (
                                <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : (
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