import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PortfolioPage from './pages/PortfolioPage';
import NewsSentimentPage from './pages/NewsSentimentPage';
import ReportingPage from './pages/ReportingPage'; // NEW PAGE
import Layout from './components/Layout';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// --- NEW: Date Picker Provider ---
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#90caf9' }, secondary: { main: '#f48fb1' }, background: { default: '#121212', paper: '#1e1e1e' } },
});

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <ToastContainer theme="dark" position="bottom-right" autoClose={3000} hideProgressBar={false} />
            <AuthProvider><Router><AppRoutes /></Router></AuthProvider>
        </ThemeProvider>
    </LocalizationProvider>
  );
}

const AppRoutes = () => {
    const { isAuthenticated } = useContext(AuthContext);
    if (!isAuthenticated) {
        return ( <Routes><Route path="/login" element={<LoginPage />} /><Route path="*" element={<Navigate to="/login" />} /></Routes> )
    }
    return (
        <DataProvider><Layout>
            <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/news" element={<NewsSentimentPage />} />
                <Route path="/reporting" element={<ReportingPage />} /> {/* NEW ROUTE */}
                <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Layout></DataProvider>
    )
}

export default App;