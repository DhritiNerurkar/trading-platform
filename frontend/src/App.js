import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PortfolioPage from './pages/PortfolioPage'; // CORRECTED IMPORT PATH
import NewsSentimentPage from './pages/NewsSentimentPage';
import Layout from './components/Layout';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#90caf9' }, secondary: { main: '#f48fb1' }, background: { default: '#121212', paper: '#1e1e1e' } },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <ToastContainer theme="dark" position="bottom-right" autoClose={3000} hideProgressBar={false} />
        <AuthProvider><Router><AppRoutes /></Router></AuthProvider>
    </ThemeProvider>
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
                <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Layout></DataProvider>
    )
}

export default App;