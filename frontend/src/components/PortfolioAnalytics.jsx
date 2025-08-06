import React from 'react';
import { Grid, Paper } from '@mui/material';
import HistoricalPortfolioChart from './HistoricalPortfolioChart';

const PortfolioAnalytics = () => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper sx={{ height: 400, p: 2 }}>
                    <HistoricalPortfolioChart />
                </Paper>
            </Grid>
            {/* Future widgets like Donut Chart or Top Movers can be added here as new Grid items */}
        </Grid>
    );
};

export default PortfolioAnalytics;