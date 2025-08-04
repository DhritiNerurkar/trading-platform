import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import Plot from 'react-plotly.js';

const PortfolioComposition = ({ holdings }) => {
    const labels = Object.keys(holdings);
    const values = Object.values(holdings).map(h => (h.shares || 0) * (h.market_price || 0));
    
    // Calculate total market value to filter out zero-value holdings
    const totalMarketValue = values.reduce((sum, current) => sum + current, 0);

    return (
        // --- THE FIX: Ensure the Paper component has a fixed height and is a flex container ---
        <Paper sx={{ p: 2, height: '350px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Portfolio Composition</Typography>
            
            {/* Check if there's anything to display */}
            {(labels.length === 0 || totalMarketValue === 0) ? (
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography color="text.secondary">No holdings to display.</Typography>
                </Box>
            ) : (
                <Plot
                    data={[{ 
                        values, 
                        labels, 
                        type: 'pie', 
                        hole: .4, 
                        textinfo: 'label+percent', 
                        insidetextorientation: 'radial' 
                    }]}
                    layout={{
                        template: 'plotly_dark', 
                        showlegend: false,
                        paper_bgcolor: 'rgba(0,0,0,0)', 
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        margin: { t: 10, b: 10, l: 10, r: 10 },
                        height: 280 // Give the plot a fixed height
                    }}
                    useResizeHandler={true} 
                    style={{ width: '100%', height: '100%' }} 
                    config={{ responsive: true }}
                />
            )}
        </Paper>
    );
};

export default PortfolioComposition;