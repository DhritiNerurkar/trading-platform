import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PortfolioPage from './pages/PortfolioPage';
import NewsSentimentPage from './pages/NewsSentimentPage';
import ReportingPage from './pages/ReportingPage';
import Layout from './components/Layout';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import PinnedPage from "./components/PinnedPage";

const modernDarkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#00d4aa', // Modern teal
            light: '#4dffdb',
            dark: '#00a37a',
            contrastText: '#000000',
        },
        secondary: {
            main: '#6366f1', // Modern indigo
            light: '#8b5cf6',
            dark: '#4338ca',
        },
        background: {
            default: '#0a0a0a', // Very dark background
            paper: '#111111', // Slightly lighter paper
            card: '#1a1a1a', // Card background
        },
        text: {
            primary: '#ffffff',
            secondary: '#a1a1aa',
        },
        success: {
            main: '#10b981', // Modern green
            light: '#34d399',
            dark: '#059669',
        },
        error: {
            main: '#ef4444', // Modern red
            light: '#f87171',
            dark: '#dc2626',
        },
        warning: {
            main: '#f59e0b', // Modern amber
        },
        info: {
            main: '#3b82f6', // Modern blue
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
        },
        h2: {
            fontWeight: 600,
            fontSize: '2rem',
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.5rem',
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.25rem',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.125rem',
        },
        h6: {
            fontWeight: 600,
            fontSize: '1rem',
        },
        body1: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
        },
        body2: {
            fontSize: '0.8125rem',
            lineHeight: 1.4,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 8,
                    padding: '8px 16px',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: 'rgba(10, 10, 10, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid #2a2a2a',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundImage: 'none',
                    backgroundColor: '#111111',
                    borderRight: '1px solid #2a2a2a',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid #2a2a2a',
                },
            },
        },
    },
});

function App() {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <ThemeProvider theme={modernDarkTheme}>
                <CssBaseline />
                <ToastContainer
                    theme="dark"
                    position="bottom-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    toastStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #2a2a2a',
                    }}
                />
                <AuthProvider><Router><AppRoutes /></Router></AuthProvider>
            </ThemeProvider>
        </LocalizationProvider>
    );
}

const AppRoutes = () => {
    const { isAuthenticated } = useContext(AuthContext);
    if (!isAuthenticated) {
        return (<Routes><Route path="/login" element={<LoginPage />} /><Route path="*" element={<Navigate to="/login" />} /></Routes>)
    }
    return (
        <DataProvider><Layout>
            <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/news" element={<NewsSentimentPage />} />
                <Route path="/reporting" element={<ReportingPage />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
                <Route path="/pinned" element={<PinnedPage />} />
            </Routes>
        </Layout></DataProvider>
    )
}

export default App;