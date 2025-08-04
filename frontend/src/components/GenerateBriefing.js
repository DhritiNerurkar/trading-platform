import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Modal, CircularProgress } from '@mui/material';
import { TypeAnimation } from 'react-type-animation';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import apiClient from '../api/apiClient';
const GenerateBriefing = () => {
const [open, setOpen] = useState(false);
const [briefing, setBriefing] = useState("");
const [loading, setLoading] = useState(false);
const handleOpen = async () => {
    setOpen(true);
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

const handleClose = () => {
    setOpen(false);
    setBriefing("");
};

return (
    <>
        <Button
            variant="outlined"
            size="small"
            startIcon={<AutoAwesomeIcon />}
            onClick={handleOpen}
        >
            Generate Briefing
        </Button>
        
        <Modal open={open} onClose={handleClose}>
            <Paper sx={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: 'clamp(300px, 50vw, 700px)', p: 3,
            }}>
                <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AutoAwesomeIcon color="primary" />
                    GenAI Performance Briefing
                </Typography>
                
                <Box sx={{ bgcolor: 'background.default', borderRadius: 1, p: 2, minHeight: '150px' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TypeAnimation
                            sequence={[briefing]}
                            wrapper="p"
                            speed={70}
                            cursor={false}
                            style={{ margin: 0, whiteSpace: 'pre-wrap' }}
                        />
                    )}
                </Box>
            </Paper>
        </Modal>
    </>
);
};
export default GenerateBriefing;