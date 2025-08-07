import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, ToggleButtonGroup, ToggleButton, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';

const TopMovers = ({ holdings, prevDayCloses }) => {
    const [view, setView] = useState('gainers');

    if (!prevDayCloses) {
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
                            <ShowChartIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Today's Movers
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            Awaiting market data...
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
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

    const topGainers = [...movers].sort((a, b) => b.pnl - a.pnl).slice(0, 5);
    const topLosers = [...movers].sort((a, b) => a.pnl - b.pnl).slice(0, 5);

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
                        <ShowChartIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Today's Movers
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Top performers in your portfolio
                    </Typography>

                    <ToggleButtonGroup
                        color="primary"
                        value={view}
                        exclusive
                        onChange={(e, newView) => { if (newView) setView(newView); }}
                        size="small"
                        sx={{
                            '& .MuiToggleButton-root': {
                                borderColor: '#2a2a2a',
                                color: 'text.secondary',
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'primary.contrastText',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                },
                            },
                        }}
                    >
                        <ToggleButton value="gainers" sx={{ color: 'success.main' }}>
                            <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            Top Gainers
                        </ToggleButton>
                        <ToggleButton value="losers" sx={{ color: 'error.main' }}>
                            <TrendingDownIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            Top Losers
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Box sx={{ flexGrow: 1, p: 2 }}>
                    {movers.length === 0 ? (
                        <Box sx={{
                            flexGrow: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%'
                        }}>
                            <Typography color="text.secondary" textAlign="center">
                                No significant price movement in your holdings yet today.
                            </Typography>
                        </Box>
                    ) : (
                        <List dense sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            {view === 'gainers' && topGainers.map(g => g.pnl > 0 && (
                                <ListItem key={g.ticker} disableGutters sx={{
                                    mb: 1,
                                    p: 1.5,
                                    borderRadius: 1,
                                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.04)'
                                    }
                                }}>
                                    <ListItemText
                                        primary={g.ticker}
                                        primaryTypographyProps={{ fontWeight: 600 }}
                                    />
                                    <Chip
                                        label={`+${g.pnlPercent.toFixed(2)}%`}
                                        size="small"
                                        color="success"
                                        sx={{ fontWeight: 600 }}
                                    />
                                </ListItem>
                            ))}
                            {view === 'losers' && topLosers.map(l => l.pnl < 0 && (
                                <ListItem key={l.ticker} disableGutters sx={{
                                    mb: 1,
                                    p: 1.5,
                                    borderRadius: 1,
                                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.04)'
                                    }
                                }}>
                                    <ListItemText
                                        primary={l.ticker}
                                        primaryTypographyProps={{ fontWeight: 600 }}
                                    />
                                    <Chip
                                        label={`${l.pnlPercent.toFixed(2)}%`}
                                        size="small"
                                        color="error"
                                        sx={{ fontWeight: 600 }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default TopMovers;