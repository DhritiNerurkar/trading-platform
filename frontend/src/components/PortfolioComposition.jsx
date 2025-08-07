import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import Plot from 'react-plotly.js';
import PieChartIcon from '@mui/icons-material/PieChart';

const PortfolioComposition = ({ holdings }) => {
    const labels = Object.keys(holdings);
    const values = Object.values(holdings).map(h => (h.shares || 0) * (h.market_price || 0));

    // Calculate total market value to filter out zero-value holdings
    const totalMarketValue = values.reduce((sum, current) => sum + current, 0);

    return (
        <Card sx={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #111111 100%)',
            border: '1px solid #2a2a2a',
            borderRadius: 3,
            height: '350px',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{
                    p: 3,
                    borderBottom: '1px solid #2a2a2a',
                    background: 'rgba(255, 255, 255, 0.02)'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <PieChartIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Portfolio Composition
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Asset allocation breakdown
                    </Typography>
                </Box>

                <Box sx={{ flexGrow: 1, p: 2 }}>
                    {/* Check if there's anything to display */}
                    {(labels.length === 0 || totalMarketValue === 0) ? (
                        <Box sx={{
                            flexGrow: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%'
                        }}>
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
                                insidetextorientation: 'radial',
                                marker: {
                                    colors: ['#00d4aa', '#4dffdb', '#90caf9', '#f48fb1', '#ffab91', '#ffcc80', '#c5cae9', '#f8bbd9']
                                }
                            }]}
                            layout={{
                                template: 'plotly_dark',
                                showlegend: false,
                                paper_bgcolor: 'rgba(0,0,0,0)',
                                plot_bgcolor: 'rgba(0,0,0,0)',
                                margin: { t: 10, b: 10, l: 10, r: 10 },
                                height: 280,
                                font: {
                                    color: '#ffffff'
                                }
                            }}
                            useResizeHandler={true}
                            style={{ width: '100%', height: '100%' }}
                            config={{ responsive: true }}
                        />
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default PortfolioComposition;