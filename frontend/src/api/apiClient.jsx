import axios from 'axios';

// This configures the connection to your backend.
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // Ensures all requests go to the correct address
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;