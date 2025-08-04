import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Button, Divider } from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import apiClient from '../api/apiClient';
import Plot from 'react-plotly.js';

const ReportingPage = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                const response = await apiClient.get('/reports/performance-summary');
                setReportData(response.data);
            } catch (error) {
                console.error("Failed to fetch report data", error);
            }
            setLoading(false);
        };
        fetchReportData();
    }, []);

    const handleDownloadPdf = () => {
        if (!reportData) return;
        const doc = new jsPDF();
        
        doc.text("Portfolio Performance Report", 14, 16);
        doc.setFontSize(10);
        doc.text(`Report Generated: ${new Date().toLocaleString()}`, 14, 22);

        const summary = [
            ["Total Invested Capital", `$${reportData.total_invested_capital.toFixed(2)}`],
            ["Current Market Value", `$${reportData.current_market_value.toFixed(2)}`],
            ["Total P&L", `$${reportData.total_pnl.toFixed(2)}`],
            ["P&L Today", `$${reportData.pnl_today.toFixed(2)}`],
        ];
        autoTable(doc, { startY: 30, head: [['Metric', 'Value']], body: summary });
        
        const holdingsHead = [['Ticker', 'Shares', 'Avg. Cost', 'Market Price', 'Market Value']];
        const holdingsBody = Object.entries(reportData.holdings).map(([ticker, data]) => [
            ticker, data.shares, `$${data.avg_price.toFixed(2)}`, `$${data.market_price.toFixed(2)}`, `$${(data.shares * data.market_price).toFixed(2)}`
        ]);

        // --- THE FIX IS HERE ---
        // We access the 'previous' autoTable instance directly from the returned object.
        const summaryTable = doc.lastAutoTable; // Get the instance of the table we just created
        autoTable(doc, { 
            startY: summaryTable.finalY + 10, // Start the next table 10 units below the previous one
            head: holdingsHead, 
            body: holdingsBody 
        });
        
        doc.save(`Nomura_Portfolio_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (!reportData) {
        return <Typography>Could not load report data.</Typography>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Reporting</Typography>
                <Button variant="contained" onClick={handleDownloadPdf}>Download PDF Report</Button>
            </Box>
            
            <Paper sx={{ p: 2 }}>
                 <Grid container spacing={3} sx={{ mb: 3 }}>
                    <StatCard title="Total Invested Capital" value={reportData.total_invested_capital} isCurrency />
                    <StatCard title="Current Market Value" value={reportData.current_market_value} isCurrency />
                    <StatCard title="Total P&L" value={reportData.total_pnl} isCurrency isPnl />
                    <StatCard title="P&L Today" value={reportData.pnl_today} isCurrency isPnl />
                 </Grid>
                
                <Divider sx={{ my: 3 }} />

                <Typography variant="h5" gutterBottom>Portfolio History</Typography>
                <Box sx={{ height: 400, width: '100%' }}>
                     <Plot
                        data={[{ x: reportData.portfolio_history.map(d => d.timestamp), y: reportData.portfolio_history.map(d => d.value), type: 'scatter', mode: 'lines', line: { color: '#90caf9' } }]}
                        layout={{ template: 'plotly_dark', paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', xaxis: { showgrid: false }, yaxis: { title: 'Portfolio Value (USD)', showgrid: true, gridcolor: '#444' } }}
                        useResizeHandler={true} style={{ width: '100%', height: '100%' }} config={{ responsive: true }}
                    />
                </Box>
            </Paper>
        </Box>
    );
};

// --- FIX: Corrected MUI Grid syntax ---
const StatCard = ({ title, value, isCurrency, isPnl }) => {
    const formattedValue = isCurrency ? `$${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : value;
    let color = 'text.primary';
    if(isPnl) {
        color = value >= 0 ? 'success.main' : 'error.main';
    }

    return (
        <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary">{title}</Typography>
                <Typography variant="h5" sx={{ color }}>{formattedValue}</Typography>
            </Paper>
        </Grid>
    );
};

export default ReportingPage;