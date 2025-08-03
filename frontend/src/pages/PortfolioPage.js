import React from 'react';
import { Box, Typography, Paper, CircularProgress, Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useData } from '../context/DataContext';

const PortfolioPage = () => {
    // Consume global state. The portfolio object now contains everything we need.
    const { portfolio, isConnected } = useData();

    if (!isConnected || !portfolio) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }
    
    const formatNumber = (value) => (typeof value === 'number' ? value : 0);

    const columns = [
        { field: 'ticker', headerName: 'Ticker', width: 100, sortable: false },
        { field: 'shares', headerName: 'Shares', type: 'number', width: 120, sortable: false },
        {
            field: 'avg_price', headerName: 'Avg. Cost', type: 'number', width: 130, sortable: false,
            valueFormatter: ({ value }) => `$${formatNumber(value).toFixed(2)}`
        },
        {
            field: 'market_price', headerName: 'Last Price', type: 'number', width: 130, sortable: false,
            // --- DEFINITIVE ROBUST CHECK ---
            valueGetter: (params) => (params && params.row) ? params.row.market_price : 0,
            renderCell: (params) => params.value ? `$${formatNumber(params.value).toFixed(2)}` : '...'
        },
        {
            field: 'market_value', headerName: 'Market Value', type: 'number', width: 150, sortable: false,
            // --- DEFINITIVE ROBUST CHECK ---
            valueGetter: (params) => (params && params.row) ? (params.row.market_price || 0) * params.row.shares : 0,
            renderCell: (params) => params.value ? `$${formatNumber(params.value).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '...'
        },
        {
            field: 'total_pnl', headerName: 'Total P&L', type: 'number', width: 150, sortable: false,
            // --- DEFINITIVE ROBUST CHECK ---
            cellClassName: (params) => (params && typeof params.value === 'number' && params.value >= 0) ? 'super-app-theme--positive' : 'super-app-theme--negative',
            valueGetter: (params) => {
                if (!params || !params.row) return 0;
                return ((params.row.market_price || 0) * params.row.shares) - (params.row.avg_price * params.row.shares);
            },
            renderCell: (params) => (params && params.row && params.row.market_price) ? `$${formatNumber(params.value).toFixed(2)}` : '...'
        },
        {
            field: 'total_pnl_percent', headerName: 'Total P&L %', type: 'number', width: 150, sortable: false,
            // --- DEFINITIVE ROBUST CHECK ---
            cellClassName: (params) => (params && typeof params.value === 'number' && params.value >= 0) ? 'super-app-theme--positive' : 'super-app-theme--negative',
            valueGetter: (params) => {
                if (!params || !params.row) return 0;
                const cost_basis = params.row.avg_price * params.row.shares;
                if (cost_basis === 0) return 0;
                const market_value = (params.row.market_price || 0) * params.row.shares;
                return ((market_value - cost_basis) / cost_basis) * 100;
            },
            renderCell: (params) => (params && params.row && params.row.market_price) ? `${formatNumber(params.value).toFixed(2)}%` : '...'
        },
    ];

    const rows = Object.entries(portfolio.holdings).map(([ticker, holding]) => ({
        id: ticker,
        ticker,
        ...holding
    }));
    
    const totalPnlValue = rows.reduce((acc, row) => {
        const market_value = (row.market_price || 0) * row.shares;
        const cost_basis = row.avg_price * row.shares;
        return acc + (market_value - cost_basis);
    }, 0);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>My Portfolio</Typography>
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={3} textAlign="center">
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" color="text.secondary">Total Portfolio Value</Typography>
                        <Typography variant="h4" color="primary">${formatNumber(portfolio.total_value).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" color="text.secondary">Total P&L</Typography>
                        <Typography variant="h4" color={totalPnlValue >= 0 ? 'success.main' : 'error.main'}>
                           ${totalPnlValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" color="text.secondary">Available Cash</Typography>
                        <Typography variant="h4">${formatNumber(portfolio.cash).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ height: 600, width: 'public/index.html' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    pageSizeOptions={[10]}
                    disableRowSelectionOnClick
                    sx={{
                        border: 0,
                        '& .MuiDataGrid-columnHeaders': { borderBottom: '1px solid #444' },
                        '& .MuiDataGrid-cell': { borderBottom: '1px solid #444' },
                        '& .super-app-theme--negative': { color: 'error.main', fontWeight: '600' },
                        '& .super-app-theme--positive': { color: 'success.main', fontWeight: '600' },
                    }}
                />
            </Paper>
        </Box>
    );
};

export default PortfolioPage;