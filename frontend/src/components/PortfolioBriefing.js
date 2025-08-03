import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import { Box, Paper, Typography, Button, Collapse, CircularProgress } from '@mui/material';
import { TypeAnimation } from 'react-type-animation';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const PortfolioBriefing = () => {
    const [briefing, setBriefing] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGenerateBriefing = async () => {
        setBriefing(""); // Clear previous briefing before generating a new one
        setLoading(true);
        try {
            const response = await apiClient.post('/genai/portfolio-briefing');
            setBriefing(response.data.briefing);
        } catch (error) {
            console.error("Failed to generate briefing:", error);
            setBriefing("Error fetching briefing from the AI model.");
        }
        setLoading(false);
    };

    return (
        // --- THE FIX: A robust flexbox layout for the component itself ---
        <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">GenAI Portfolio Briefing</Typography>
                <Button variant="outlined" size="small" startIcon={<AutoAwesomeIcon />} onClick={handleGenerateBriefing} disabled={loading}>
                    {loading ? "Generating..." : "Generate Briefing"}
                </Button>
            </Box>
            
            {/* This container will hold the animated text, making it scrollable */}
            <Box sx={{ 
                flexGrow: 1, 
                overflowY: 'auto', // Allow vertical scrolling if text is long
                borderTop: '1px solid #444',
                mt: 1,
                p: 1,
                minHeight: '150px'
            }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress size={24} />
                    </Box>
                )}

                {/* The TypeAnimation will only render when not loading and briefing exists */}
                {!loading && briefing && (
                    <TypeAnimation
                        sequence={[briefing]}
                        wrapper="p"
                        speed={70}
                        cursor={false}
                        style={{ margin: 0, whiteSpace: 'pre-wrap' }} // Ensures text wraps correctly
                    />
                )}
            </Box>
        </Paper>
    );
};

export default PortfolioBriefing;