import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, CssBaseline, Avatar, Chip, Divider,
    IconButton, Tooltip, Badge
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AskAI from './AskAI';
import PushPinIcon from "@mui/icons-material/PushPin";

const drawerWidth = 280;
const collapsedDrawerWidth = 80;

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const menuItems = [
        {
            text: 'Dashboard',
            icon: <DashboardIcon />,
            path: '/dashboard',
            description: 'Trading overview and charts'
        },
        {
            text: 'Watchlist',
            icon: <PushPinIcon />,
            path: '/pinned',
            description: 'Pinned stocks and favorites'
        },
        {
            text: 'Portfolio',
            icon: <AccountBalanceWalletIcon />,
            path: '/portfolio',
            description: 'Portfolio management and analytics'
        },
        {
            text: 'News & Sentiment',
            icon: <NewspaperIcon />,
            path: '/news',
            description: 'Market news and AI sentiment'
        },
        {
            text: 'Reporting',
            icon: <AssessmentIcon />,
            path: '/reporting',
            description: 'Performance reports and analytics'
        },
    ];

    const handleListItemClick = (index, path) => {
        setSelectedIndex(index);
        navigate(path);
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <CssBaseline />

            {/* Modern AppBar */}
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 100%)',
                    borderBottom: '1px solid #2a2a2a',
                }}
                elevation={0}
            >
                <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            onClick={toggleSidebar}
                            sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                    color: 'primary.main',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                },
                            }}
                        >
                            {sidebarCollapsed ? <MenuIcon /> : <ChevronLeftIcon />}
                        </IconButton>
                        <Avatar
                            sx={{
                                bgcolor: 'primary.main',
                                width: 40,
                                height: 40,
                                background: 'linear-gradient(135deg, #00d4aa 0%, #4dffdb 100%)'
                            }}
                        >
                            <TrendingUpIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                Tradely
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                                Next-Gen Platform
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                            label="Live"
                            color="success"
                            size="small"
                            sx={{
                                fontWeight: 600,
                                '& .MuiChip-label': { px: 1.5 }
                            }}
                        />
                        <AskAI />
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Modern Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth,
                    flexShrink: 0,
                    transition: 'width 0.3s ease',
                    '& .MuiDrawer-paper': {
                        width: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth,
                        boxSizing: 'border-box',
                        background: 'linear-gradient(180deg, #111111 0%, #0a0a0a 100%)',
                        borderRight: '1px solid #2a2a2a',
                        transition: 'width 0.3s ease',
                        overflow: 'hidden',
                    }
                }}
            >
                <Toolbar sx={{ height: 80 }} />
                <Box sx={{ overflow: 'auto', px: sidebarCollapsed ? 1 : 2 }}>
                    {!sidebarCollapsed && (
                        <Typography variant="overline" sx={{
                            color: 'text.secondary',
                            fontWeight: 600,
                            mb: 2,
                            display: 'block',
                            letterSpacing: '0.1em'
                        }}>
                            Navigation
                        </Typography>
                    )}

                    <List sx={{ pt: 0 }}>
                        {menuItems.map((item, index) => {
                            const isSelected = location.pathname === item.path;
                            return (
                                <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                                    <ListItemButton
                                        onClick={() => handleListItemClick(index, item.path)}
                                        selected={isSelected}
                                        sx={{
                                            borderRadius: 2,
                                            py: sidebarCollapsed ? 1 : 1.5,
                                            px: sidebarCollapsed ? 1 : 2,
                                            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                            '&.Mui-selected': {
                                                backgroundColor: 'primary.main',
                                                color: 'primary.contrastText',
                                                '&:hover': {
                                                    backgroundColor: 'primary.dark',
                                                },
                                                '& .MuiListItemIcon-root': {
                                                    color: 'primary.contrastText',
                                                },
                                            },
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            },
                                        }}
                                    >
                                        <ListItemIcon sx={{
                                            minWidth: sidebarCollapsed ? 0 : 40,
                                            justifyContent: 'center'
                                        }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        {!sidebarCollapsed && (
                                            <ListItemText
                                                primary={item.text}
                                                secondary={item.description}
                                                primaryTypographyProps={{
                                                    fontWeight: isSelected ? 600 : 500,
                                                    fontSize: '0.875rem',
                                                }}
                                                secondaryTypographyProps={{
                                                    fontSize: '0.75rem',
                                                    color: isSelected ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                                }}
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>

                    {!sidebarCollapsed && (
                        <>
                            <Divider sx={{ my: 3, borderColor: '#2a2a2a' }} />

                            <Box sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 2, border: '1px solid #2a2a2a' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                                    Platform Status
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: 'success.main',
                                        animation: 'pulse 2s infinite'
                                    }} />
                                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                                        Connected
                                    </Typography>
                                </Box>
                            </Box>
                        </>
                    )}
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 4,
                    backgroundColor: 'background.default',
                    minHeight: '100vh',
                }}
            >
                <Toolbar sx={{ height: 80 }} />
                {children}
            </Box>
        </Box>
    );
};

export default Layout;