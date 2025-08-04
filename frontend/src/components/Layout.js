import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, CssBaseline, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import AskAI from './AskAI'; // Import the new component

const drawerWidth = 200;

const Layout = ({ children }) => {
    const navigate = useNavigate();
    
    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Portfolio', icon: <ShowChartIcon />, path: '/portfolio' },
        { text: 'News & Sentiment', icon: <NewspaperIcon />, path: '/news' },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    {/* Title takes up most of the space */}
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Nomura Next-Gen Trading
                    </Typography>
                    {/* Add the "Ask AI" button to the top bar */}
                    <AskAI />
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' } }}>
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}><List>
                    {menuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton onClick={() => navigate(item.path)}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List></Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
};

export default Layout;