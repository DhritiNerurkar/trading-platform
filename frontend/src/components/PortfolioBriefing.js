import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import { Box, Paper, Typography, Button, Collapse, CircularProgress } from '@mui/material';
import { TypeAnimation } from 'react-type-animation';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const PortfolioBriefing = () => {
    const [briefing, setBriefing] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGenerateBriefing = async () => {
        setBriefing("");
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
        <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">GenAI Performance Briefing</Typography>
                <Button variant="outlined" size="small" startIcon={<AutoAwesomeIcon />} onClick={handleGenerateBriefing} disabled={loading}>
                    {loading ? "Generating..." : "Generate Briefing"}
                </Button>
            </Box>
            
            <Collapse in={!!briefing || loading} sx={{ flexGrow: 1, minHeight: 0 }}>
                <Box sx={{ 
                    p: 2, 
                    borderTop: '1px solid #444',
                    mt: 1,
                    height: '100%',
                    overflowY: 'auto'
                }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : (
                        // Use pre-wrap to respect newlines from the AI's formatted response
                        <TypeAnimation
                            sequence={[briefing]}
                            wrapper="p"
                            speed={70}
                            cursor={false}
                            style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.9em' }}
                        />
                    )}
                </Box>
            </Collapse>
        </Paper>
    );
};

export default PortfolioBriefing;