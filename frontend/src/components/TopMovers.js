import React, { useState } from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText, Grid, ToggleButtonGroup, ToggleButton } from '@mui/material';

const TopMovers = ({ holdings, prevDayCloses }) => {
    // --- THE FIX: Add a toggle state for Gainers/Losers ---
    const [view, setView] = useState('gainers'); 

    if (!prevDayCloses) {
        return (
            <Paper sx={{ p: 2, height: '350px' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Today's Movers</Typography>
                <Typography color="text.secondary">Awaiting market data...</Typography>
            </Paper>
        );
    }

    const movers = Object.entries(holdings).map(([ticker, data]) => {
        const prevClose = prevDayCloses[ticker];
        const marketPrice = typeof data.market_price === 'number' ? data.market_price : 0;
        const shares = typeof data.shares === 'number' ? data.shares : 0;
        const pnl = prevClose ? (marketPrice - prevClose) * shares : 0;
        const pnlPercent = (prevClose && shares > 0) ? (pnl / (prevClose * shares)) * 100 : 0;
        return { ticker, pnl, pnlPercent };
    }).filter(m => m.pnl !== 0);

    const topGainers = [...movers].sort((a, b) => b.pnl - a.pnl).slice(0, 5); // Show top 5
    const topLosers = [...movers].sort((a, b) => a.pnl - b.pnl).slice(0, 5); // Show top 5
    
    return (
        // --- THE FIX: Ensure the Paper component has a fixed height and is a flex container ---
        <Paper sx={{ p: 2, height: '350px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Today's Movers</Typography>

            <ToggleButtonGroup
                color="primary"
                value={view}
                exclusive
                onChange={(e, newView) => { if(newView) setView(newView); }}
                size="small"
                sx={{ mb: 1 }}
            >
                <ToggleButton value="gainers" sx={{color: 'success.main'}}>Top Gainers</ToggleButton>
                <ToggleButton value="losers" sx={{color: 'error.main'}}>Top Losers</ToggleButton>
            </ToggleButtonGroup>

            {movers.length === 0 ? (
                <Box sx={{flexGrow: 1, display: 'flex', alignItems: 'center'}}>
                    <Typography color="text.secondary">No significant price movement in your holdings yet today.</Typography>
                </Box>
            ) : (
                <List dense sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {view === 'gainers' && topGainers.map(g => g.pnl > 0 && (
                        <ListItem key={g.ticker} disableGutters>
                            <ListItemText primary={g.ticker} />
                            <Typography color="success.main">{`+${g.pnlPercent.toFixed(2)}%`}</Typography>
                        </ListItem>
                    ))}
                    {view === 'losers' && topLosers.map(l => l.pnl < 0 && (
                        <ListItem key={l.ticker} disableGutters>
                            <ListItemText primary={l.ticker} />
                            <Typography color="error.main">{`${l.pnlPercent.toFixed(2)}%`}</Typography>
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>
    );
};

export default TopMovers;