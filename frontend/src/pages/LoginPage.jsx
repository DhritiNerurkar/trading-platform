import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Container } from '@mui/material';

const LoginPage = () => {
    const [username, setUsername] = useState('trader');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient.post('/login', { username, password });
            if (response.data.success) {
                login();
                navigate('/dashboard');
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Failed to connect to the server.');
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={6} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
                <Typography component="h1" variant="h5">Tradely</Typography>
                <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
                    <TextField margin="normal" required fullWidth id="username" label="Username" name="username" autoComplete="username" autoFocus value={username} onChange={(e) => setUsername(e.target.value)} />
                    <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Sign In</Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default LoginPage;