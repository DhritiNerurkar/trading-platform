import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, CircularProgress, Grid, ToggleButton, ToggleButtonGroup, Card, CardContent, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useData } from '../context/DataContext';
import GenerateBriefing from '../components/GenerateBriefing';
import apiClient from '../api/apiClient';
import PortfolioComposition from '../components/PortfolioComposition';
import TopMovers from '../components/TopMovers';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import RefreshIcon from '@mui/icons-material/Refresh';

const PortfolioPage = () => {
    const { portfolio, liveData, isConnected } = useData();
    const [view, setView] = useState('holdings');
    const [transactions, setTransactions] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [sellDialogOpen, setSellDialogOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [sellQuantity, setSellQuantity] = useState('');
    const [sellLoading, setSellLoading] = useState(false);

    const fetchTransactionHistory = async () => {
        console.log('Fetching transaction history...');
        setLoadingHistory(true);
        try {
            const response = await apiClient.get('/portfolio/transactions');
            console.log('Transaction history response:', response.data);
            console.log('Transaction history length:', response.data.length);
            console.log('Response data type:', typeof response.data);
            console.log('Is array:', Array.isArray(response.data));
            setTransactions(response.data || []);
            console.log('Transactions state set to:', response.data || []);
        } catch (error) {
            console.error("Failed to fetch transaction history", error);
            setTransactions([]);
        }
        setLoadingHistory(false);
    };

    // Enhanced fetch with retry mechanism for immediate updates
    const fetchTransactionHistoryWithRetry = async () => {
        await fetchTransactionHistory();
        // If no transactions found, retry after a short delay (for immediate trade updates)
        if (transactions.length === 0) {
            setTimeout(async () => {
                console.log('Retrying transaction history fetch...');
                await fetchTransactionHistory();
            }, 1000);
        }
    };

    const handleSellPosition = (position) => {
        setSelectedPosition(position);
        setSellQuantity(position.shares.toString());
        setSellDialogOpen(true);
    };

    const handleSellConfirm = async () => {
        if (!selectedPosition || !sellQuantity || sellQuantity <= 0) {
            return;
        }

        const quantity = parseInt(sellQuantity);
        if (quantity > selectedPosition.shares) {
            alert('Cannot sell more shares than you own');
            return;
        }

        setSellLoading(true);
        try {
            const response = await apiClient.post('/sell', {
                ticker: selectedPosition.ticker,
                quantity: quantity
            });

            if (response.data.success) {
                setSellDialogOpen(false);
                setSelectedPosition(null);
                setSellQuantity('');
                // Refresh transaction history
                fetchTransactionHistoryWithRetry();
            } else {
                alert(`Sell failed: ${response.data.message}`);
            }
        } catch (error) {
            alert(`Sell failed: ${error.response?.data?.message || 'Server error'}`);
        }
        setSellLoading(false);
    };

    const handleSellCancel = () => {
        setSellDialogOpen(false);
        setSelectedPosition(null);
        setSellQuantity('');
    };

    useEffect(() => {
        // Fetch immediately when component mounts
        fetchTransactionHistoryWithRetry();

        // Set up interval to refresh transaction history every 5 seconds
        const interval = setInterval(fetchTransactionHistory, 5000);

        return () => clearInterval(interval);
    }, [portfolio]); // Add portfolio as dependency to refresh when portfolio changes

    if (!isConnected || !portfolio) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '80vh',
                flexDirection: 'column',
                gap: 2
            }}>
                <CircularProgress size={60} sx={{ color: 'primary.main' }} />
                <Typography variant="h6" color="text.secondary">
                    Connecting to Tradely...
                </Typography>
            </Box>
        );
    }

    const safeNumber = (val) => {
        if (val === null || val === undefined) return 0;
        const num = typeof val === 'string' ? parseFloat(val.replace(/[$,%]/g, '').trim()) : val;
        return isNaN(num) ? 0 : num;
    };

    const holdingsRows = useMemo(() => {
        return Object.entries(portfolio.holdings).map(([ticker, holding]) => {
            const shares = safeNumber(holding.shares);
            const avg_price = safeNumber(holding.avg_price);
            const market_price = safeNumber(holding.market_price);
            const market_value = market_price * shares;
            const cost_basis = avg_price * shares;
            const pnl = market_value - cost_basis;
            const pnl_percent = cost_basis > 0 ? (pnl / cost_basis) * 100 : 0;
            return { id: ticker, ticker, shares, avg_price, market_price, market_value, total_pnl: pnl, total_pnl_percent: pnl_percent };
        });
    }, [portfolio.holdings]);

    const totalPnlValue = useMemo(() => {
        return holdingsRows.reduce((acc, row) => acc + row.total_pnl, 0);
    }, [holdingsRows]);

    const holdingsColumns = [
        { field: 'ticker', headerName: 'Ticker', flex: 1 },
        { field: 'shares', headerName: 'Shares', type: 'number', flex: 1 },
        { field: 'avg_price', headerName: 'Avg. Cost', type: 'number', flex: 1, renderCell: (params) => `$${safeNumber(params.value).toFixed(2)}` },
        { field: 'market_price', headerName: 'Last Price', type: 'number', flex: 1, renderCell: (params) => params.value ? `$${safeNumber(params.value).toFixed(2)}` : '...' },
        { field: 'market_value', headerName: 'Market Value', type: 'number', flex: 1, renderCell: (params) => `$${safeNumber(params.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { field: 'total_pnl', headerName: 'Total P&L', type: 'number', flex: 1, cellClassName: (params) => safeNumber(params.value) >= 0 ? 'super-app-theme--positive' : 'super-app-theme--negative', renderCell: (params) => `$${safeNumber(params.value).toFixed(2)}` },
        { field: 'total_pnl_percent', headerName: 'Total P&L %', type: 'number', flex: 1, cellClassName: (params) => safeNumber(params.value) >= 0 ? 'super-app-theme--positive' : 'super-app-theme--negative', renderCell: (params) => params.row.market_price ? `${safeNumber(params.value).toFixed(2)}%` : '...' },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSellPosition(params.row);
                    }}
                    sx={{
                        minWidth: 'auto',
                        px: 2,
                        py: 0.5,
                        fontSize: '0.75rem',
                        fontWeight: 600
                    }}
                >
                    Sell
                </Button>
            )
        },
    ];

    const historyRows = useMemo(() => {
        console.log('Calculating historyRows from transactions:', transactions);
        console.log('Transactions length:', transactions.length);
        const rows = transactions.map((tx, index) => ({
            id: `tx-${index}`, // Use unique string ID
            timestamp: tx.timestamp,
            ticker: tx.ticker,
            action: tx.action,
            quantity: safeNumber(tx.quantity),
            price: safeNumber(tx.price),
            total_value: safeNumber(tx.total_value),
        }));
        console.log('Generated historyRows:', rows);
        return rows;
    }, [transactions]);

    const historyColumns = [
        { field: 'timestamp', headerName: 'Date', width: 200, renderCell: (params) => new Date(params.value).toLocaleString() },
        { field: 'ticker', headerName: 'Ticker', width: 100 },
        { field: 'action', headerName: 'Action', width: 100, renderCell: (params) => (<Typography sx={{ fontWeight: 'bold', color: params.value === 'BUY' ? 'success.main' : 'error.main' }}>{params.value}</Typography>) },
        { field: 'quantity', headerName: 'Quantity', type: 'number', width: 100 },
        { field: 'price', headerName: 'Price', type: 'number', width: 130, renderCell: (params) => `$${safeNumber(params.value).toFixed(2)}` },
        { field: 'total_value', headerName: 'Total Value', type: 'number', flex: 1, renderCell: (params) => `$${safeNumber(params.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    ];

    const prevDayCloses = Object.fromEntries(
        Object.values(liveData).map(stock => [stock.ticker, stock.price - stock.change])
    );

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 120px)',
            gap: 3
        }}>
            {/* Header Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        My Portfolio
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Portfolio management and performance analytics
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Chip
                        label="Live Portfolio"
                        color="success"
                        icon={<TrendingUpIcon />}
                        sx={{ fontWeight: 600 }}
                    />
                    <GenerateBriefing />
                </Box>
            </Box>

            {/* Portfolio Summary Cards */}
            <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #111111 100%)',
                        border: '1px solid #2a2a2a',
                        borderRadius: 3,
                        height: '100%'
                    }}>
                        <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                            </Box>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                Total Portfolio Value
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                ${safeNumber(portfolio.total_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #111111 100%)',
                        border: '1px solid #2a2a2a',
                        borderRadius: 3,
                        height: '100%'
                    }}>
                        <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <TrendingUpIcon sx={{ fontSize: 40, color: totalPnlValue >= 0 ? 'success.main' : 'error.main' }} />
                            </Box>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                Total P&L
                            </Typography>
                            <Typography variant="h4" sx={{
                                fontWeight: 700,
                                color: totalPnlValue >= 0 ? 'success.main' : 'error.main'
                            }}>
                                ${totalPnlValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #111111 100%)',
                        border: '1px solid #2a2a2a',
                        borderRadius: 3,
                        height: '100%'
                    }}>
                        <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <AttachMoneyIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                            </Box>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                Available Cash
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                ${safeNumber(portfolio.cash).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Data Table Section */}
            <Box sx={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #111111 100%)',
                border: '1px solid #2a2a2a',
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Box sx={{
                    p: 3,
                    borderBottom: '1px solid #2a2a2a',
                    background: 'rgba(255, 255, 255, 0.02)'
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <ToggleButtonGroup
                            color="primary"
                            value={view}
                            exclusive
                            onChange={(event, newView) => { if (newView !== null) setView(newView); }}
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
                            <ToggleButton value="holdings">Current Holdings</ToggleButton>
                            <ToggleButton value="history">Transaction History</ToggleButton>
                        </ToggleButtonGroup>

                        {view === 'history' && (
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<RefreshIcon />}
                                onClick={fetchTransactionHistoryWithRetry}
                                disabled={loadingHistory}
                                sx={{
                                    borderColor: '#2a2a2a',
                                    color: 'text.secondary',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        color: 'primary.main',
                                    },
                                }}
                            >
                                Refresh
                            </Button>
                        )}
                    </Box>
                </Box>
                <Box sx={{
                    flexGrow: 1,
                    height: '100%',
                    minHeight: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Fixed height container for data grids */}
                    <Box sx={{ height: '400px', minHeight: '400px' }}>
                        {view === 'holdings' && (
                            <DataGrid
                                rows={holdingsRows}
                                columns={holdingsColumns}
                                getRowId={(row) => row.ticker}
                                disableRowSelectionOnClick
                                disableColumnFilter
                                disableColumnSelector
                                disableDensitySelector
                                pageSizeOptions={[10, 25, 50]}
                                initialState={{
                                    pagination: {
                                        paginationModel: { page: 0, pageSize: 10 },
                                    },
                                }}
                                sx={{
                                    border: 0,
                                    '& .MuiDataGrid-root': {
                                        border: 'none',
                                    },
                                    '& .MuiDataGrid-columnHeaders': {
                                        borderBottom: '1px solid #2a2a2a',
                                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                        minHeight: '48px !important',
                                        maxHeight: '48px !important',
                                    },
                                    '& .MuiDataGrid-cell': {
                                        borderBottom: '1px solid #2a2a2a',
                                        minHeight: '48px !important',
                                        maxHeight: '48px !important',
                                    },
                                    '& .MuiDataGrid-row': {
                                        minHeight: '48px !important',
                                        maxHeight: '48px !important',
                                    },
                                    '& .super-app-theme--negative': {
                                        color: 'error.main',
                                        fontWeight: '600'
                                    },
                                    '& .super-app-theme--positive': {
                                        color: 'success.main',
                                        fontWeight: '600'
                                    },
                                    '& .MuiDataGrid-row:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.02)'
                                    },
                                    '& .MuiDataGrid-virtualScroller': {
                                        backgroundColor: 'transparent',
                                    },
                                    '& .MuiDataGrid-footerContainer': {
                                        borderTop: '1px solid #2a2a2a',
                                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                    }
                                }}
                            />
                        )}
                        {view === 'history' && (
                            <>
                                {!loadingHistory && historyRows.length === 0 ? (
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        p: 3,
                                        color: 'text.secondary'
                                    }}>
                                        <Typography variant="h6" sx={{ mb: 1 }}>
                                            No Transactions Found
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                                            Your transaction history will appear here after you make trades.
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<RefreshIcon />}
                                            onClick={fetchTransactionHistoryWithRetry}
                                            sx={{
                                                borderColor: '#2a2a2a',
                                                color: 'text.secondary',
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    color: 'primary.main',
                                                },
                                            }}
                                        >
                                            Refresh
                                        </Button>
                                    </Box>
                                ) : (
                                    <>
                                        <Box sx={{ p: 2, borderBottom: '1px solid #2a2a2a', backgroundColor: 'rgba(255, 255, 255, 0.02)', flexShrink: 0 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Debug Info: {historyRows.length} transactions loaded
                                            </Typography>
                                        </Box>

                                        {/* Simple HTML Table */}
                                        <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ffffff' }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid #2a2a2a' }}>
                                                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                                                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Ticker</th>
                                                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Action</th>
                                                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Quantity</th>
                                                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Price</th>
                                                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Total Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {historyRows.map((row) => (
                                                        <tr key={row.id} style={{ borderBottom: '1px solid #2a2a2a', cursor: 'pointer' }}
                                                            onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                                                            onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}>
                                                            <td style={{ padding: '12px' }}>{new Date(row.timestamp).toLocaleString()}</td>
                                                            <td style={{ padding: '12px', fontWeight: '600' }}>{row.ticker}</td>
                                                            <td style={{ padding: '12px' }}>
                                                                <span style={{
                                                                    padding: '4px 8px',
                                                                    borderRadius: '4px',
                                                                    fontSize: '12px',
                                                                    fontWeight: '600',
                                                                    backgroundColor: row.action === 'BUY' ? '#10b981' : '#ef4444',
                                                                    color: '#ffffff'
                                                                }}>
                                                                    {row.action}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '12px', textAlign: 'right' }}>{row.quantity}</td>
                                                            <td style={{ padding: '12px', textAlign: 'right' }}>${row.price.toFixed(2)}</td>
                                                            <td style={{ padding: '12px', textAlign: 'right' }}>${row.total_value.toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </Box>

                                        {/* DataGrid (keeping as backup) */}
                                        <Box sx={{ display: 'none' }}>
                                            <DataGrid
                                                rows={historyRows}
                                                columns={historyColumns}
                                                loading={loadingHistory}
                                                getRowId={(row) => row.id}
                                                disableRowSelectionOnClick
                                                disableColumnFilter
                                                disableColumnSelector
                                                disableDensitySelector
                                                autoHeight
                                                pageSizeOptions={[10, 25, 50]}
                                                initialState={{
                                                    pagination: {
                                                        paginationModel: { page: 0, pageSize: 10 },
                                                    },
                                                }}
                                                sx={{
                                                    border: 0,
                                                    '& .MuiDataGrid-root': {
                                                        border: 'none',
                                                    },
                                                    '& .MuiDataGrid-columnHeaders': {
                                                        borderBottom: '1px solid #2a2a2a',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                                        minHeight: '48px !important',
                                                        maxHeight: '48px !important',
                                                    },
                                                    '& .MuiDataGrid-cell': {
                                                        borderBottom: '1px solid #2a2a2a',
                                                        minHeight: '48px !important',
                                                        maxHeight: '48px !important',
                                                    },
                                                    '& .MuiDataGrid-row': {
                                                        minHeight: '48px !important',
                                                        maxHeight: '48px !important',
                                                    },
                                                    '& .MuiDataGrid-row:hover': {
                                                        backgroundColor: 'rgba(255, 255, 255, 0.02)'
                                                    },
                                                    '& .MuiDataGrid-virtualScroller': {
                                                        backgroundColor: 'transparent',
                                                    },
                                                    '& .MuiDataGrid-footerContainer': {
                                                        borderTop: '1px solid #2a2a2a',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </>
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Analytics Widgets */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <PortfolioComposition holdings={portfolio.holdings} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TopMovers holdings={portfolio.holdings} prevDayCloses={prevDayCloses} />
                </Grid>
            </Grid>

            {/* Sell Position Dialog */}
            <Dialog
                open={sellDialogOpen}
                onClose={handleSellCancel}
                maxWidth="sm"
                fullWidth
                BackdropProps={{
                    sx: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(4px)'
                    }
                }}
                PaperProps={{
                    sx: {
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #111111 100%)',
                        border: '1px solid #2a2a2a',
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(8px)',
                        '& .MuiDialog-paper': {
                            backgroundColor: '#1a1a1a !important',
                        }
                    }
                }}
            >
                <DialogTitle sx={{
                    color: 'text.primary',
                    borderBottom: '1px solid #2a2a2a',
                    pb: 2
                }}>
                    Sell {selectedPosition?.ticker} Position
                </DialogTitle>
                <DialogContent sx={{ pt: 3, backgroundColor: '#1a1a1a' }}>
                    {selectedPosition && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2, border: '1px solid #2a2a2a' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Current Holdings
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {selectedPosition.shares.toLocaleString()} shares
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2, border: '1px solid #2a2a2a' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Current Price
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                    ${selectedPosition.market_price?.toFixed(2) || '...'}
                                </Typography>
                            </Box>

                            <TextField
                                fullWidth
                                label="Quantity to Sell"
                                type="number"
                                value={sellQuantity}
                                onChange={(e) => setSellQuantity(e.target.value)}
                                InputProps={{
                                    inputProps: {
                                        min: 1,
                                        max: selectedPosition.shares
                                    }
                                }}
                                helperText={`Maximum: ${selectedPosition.shares.toLocaleString()} shares`}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#2a2a2a',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'text.secondary',
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'text.primary',
                                    },
                                    '& .MuiFormHelperText-root': {
                                        color: 'text.secondary',
                                    },
                                }}
                            />

                            {sellQuantity && (
                                <Box sx={{ p: 2, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2, border: '1px solid #2a2a2a' }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Estimated Proceeds
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'error.main' }}>
                                        ${(parseInt(sellQuantity) * (selectedPosition.market_price || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button
                        onClick={handleSellCancel}
                        sx={{
                            color: 'text.secondary',
                            borderColor: '#2a2a2a',
                            '&:hover': {
                                borderColor: 'text.secondary',
                            },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSellConfirm}
                        disabled={sellLoading || !sellQuantity || parseInt(sellQuantity) <= 0 || parseInt(sellQuantity) > (selectedPosition?.shares || 0)}
                        variant="contained"
                        color="error"
                        sx={{
                            fontWeight: 600,
                            px: 3,
                        }}
                    >
                        {sellLoading ? 'Selling...' : 'Sell Position'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PortfolioPage;