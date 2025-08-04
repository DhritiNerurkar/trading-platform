import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useData } from '../context/DataContext';
import GenerateBriefing from '../components/GenerateBriefing';
import apiClient from '../api/apiClient';

const PortfolioPage = () => {
    const { portfolio, isConnected } = useData();
    const [view, setView] = useState('holdings');
    const [transactions, setTransactions] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoadingHistory(true);
            try {
                const response = await apiClient.get('/portfolio/transactions');
                setTransactions(response.data);
            } catch (error) {
                console.error("Failed to fetch transaction history", error);
            }
            setLoadingHistory(false);
        };
        if (isConnected) {
            fetchHistory();
        }
    }, [portfolio, isConnected]);

    const safeNumber = (val) => {
        if (val === null || val === undefined) return 0;
        const num = typeof val === 'string' ? parseFloat(val.replace(/[$,%]/g, '').trim()) : val;
        return isNaN(num) ? 0 : num;
    };

    // --- HOLDINGS DATA (Working Correctly) ---
    const holdingsRows = Object.entries(portfolio.holdings).map(([ticker, holding]) => {
        const shares = safeNumber(holding.shares);
        const avg_price = safeNumber(holding.avg_price);
        const market_price = safeNumber(holding.market_price);
        const market_value = market_price * shares;
        const cost_basis = avg_price * shares;
        const pnl = market_value - cost_basis;
        const pnl_percent = cost_basis > 0 ? (pnl / cost_basis) * 100 : 0;
        return { id: ticker, ticker, shares, avg_price, market_price, market_value, total_pnl: pnl, total_pnl_percent: pnl_percent };
    });

    const totalPnlValue = holdingsRows.reduce((acc, row) => acc + row.total_pnl, 0);

    const holdingsColumns = [
        { field: 'ticker', headerName: 'Ticker', width: 100 }, { field: 'shares', headerName: 'Shares', type: 'number', width: 120 },
        { field: 'avg_price', headerName: 'Avg. Cost', type: 'number', width: 130, renderCell: (params) => `$${safeNumber(params.value).toFixed(2)}` },
        { field: 'market_price', headerName: 'Last Price', type: 'number', width: 130, renderCell: (params) => params.value ? `$${safeNumber(params.value).toFixed(2)}` : '...' },
        { field: 'market_value', headerName: 'Market Value', type: 'number', width: 150, renderCell: (params) => `$${safeNumber(params.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { field: 'total_pnl', headerName: 'Total P&L', type: 'number', width: 150, cellClassName: (params) => safeNumber(params.value) >= 0 ? 'super-app-theme--positive' : 'super-app-theme--negative', renderCell: (params) => `$${safeNumber(params.value).toFixed(2)}` },
        { field: 'total_pnl_percent', headerName: 'Total P&L %', type: 'number', width: 150, cellClassName: (params) => safeNumber(params.value) >= 0 ? 'super-app-theme--positive' : 'super-app-theme--negative', renderCell: (params) => params.row.market_price ? `${safeNumber(params.value).toFixed(2)}%` : '...' },
    ];

    // --- TRANSACTION HISTORY DATA (The Fix) ---
    const historyRows = transactions.map((tx, index) => ({
        id: index, // Use index as a stable ID for the transaction list
        timestamp: tx.timestamp,
        ticker: tx.ticker,
        action: tx.action,
        quantity: safeNumber(tx.quantity),
        price: safeNumber(tx.price),
        total_value: safeNumber(tx.total_value),
    }));

    const historyColumns = [
        { field: 'timestamp', headerName: 'Date', width: 200, renderCell: (params) => new Date(params.value).toLocaleString() },
        { field: 'ticker', headerName: 'Ticker', width: 100 },
        { field: 'action', headerName: 'Action', width: 100, renderCell: (params) => (
            <Typography sx={{ fontWeight: 'bold', color: params.value === 'BUY' ? 'success.main' : 'error.main' }}>
                {params.value}
            </Typography>
        )},
        { field: 'quantity', headerName: 'Quantity', type: 'number', width: 100 },
        { field: 'price', headerName: 'Price', type: 'number', width: 130, renderCell: (params) => `$${safeNumber(params.value).toFixed(2)}` },
        { field: 'total_value', headerName: 'Total Value', type: 'number', width: 150, renderCell: (params) => `$${safeNumber(params.value).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` },
    ];
    // --- END FIX ---

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">My Portfolio</Typography>
                <GenerateBriefing />
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={3} textAlign="center">
                    <Grid item xs={12} sm={4}><Typography variant="h6" color="text.secondary">Total Portfolio Value</Typography><Typography variant="h4" color="primary">${safeNumber(portfolio.total_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography></Grid>
                    <Grid item xs={12} sm={4}><Typography variant="h6" color="text.secondary">Total P&L</Typography><Typography variant="h4" color={totalPnlValue >= 0 ? 'success.main' : 'error.main'}>${totalPnlValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography></Grid>
                    <Grid item xs={12} sm={4}><Typography variant="h6" color="text.secondary">Available Cash</Typography><Typography variant="h4">${safeNumber(portfolio.cash).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography></Grid>
                </Grid>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <ToggleButtonGroup color="primary" value={view} exclusive onChange={(event, newView) => { if (newView !== null) setView(newView); }}>
                    <ToggleButton value="holdings">Current Holdings</ToggleButton>
                    <ToggleButton value="history">Transaction History</ToggleButton>
                </ToggleButtonGroup>
            </Box>
            
            <Paper sx={{ height: 600, width: '100%' }}>
                {view === 'holdings' && (
                    <DataGrid
                        rows={holdingsRows} columns={holdingsColumns}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} pageSizeOptions={[10]} disableRowSelectionOnClick
                        sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { borderBottom: '1px solid #444' }, '& .MuiDataGrid-cell': { borderBottom: '1px solid #444' }, '& .super-app-theme--negative': { color: 'error.main', fontWeight: '600' }, '& .super-app-theme--positive': { color: 'success.main', fontWeight: '600' } }}
                    />
                )}
                {view === 'history' && (
                     <DataGrid
                        rows={historyRows} columns={historyColumns} loading={loadingHistory}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} pageSizeOptions={[10]} disableRowSelectionOnClick
                        sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { borderBottom: '1px solid #444' }, '& .MuiDataGrid-cell': { borderBottom: '1px solid #444' } }}
                    />
                )}
            </Paper>
        </Box>
    );
};

export default PortfolioPage;