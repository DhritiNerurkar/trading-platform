import React, { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import { Box, Typography, List, ListItem, ListItemText, CircularProgress, Card, CardContent } from "@mui/material";
import NewspaperIcon from "@mui/icons-material/Newspaper";

const NewsSentiment = ({ ticker }) => {
  const [sentimentData, setSentimentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSentiment = async () => {
      if (!ticker) return;
      setLoading(true);
      try {
        const res = await apiClient.get(`/news/${ticker}`);
        setSentimentData(res.data);
      } catch (err) {
        console.error("Failed to fetch sentiment", err);
        setSentimentData([]);
      }
      setLoading(false);
    };
    fetchSentiment();
  }, [ticker]);

  const getSentimentColor = (sentiment) => {
    if (sentiment === "Bullish") return "success.main";
    if (sentiment === "Bearish") return "error.main";
    return "text.secondary";
  };

  if (loading)
    return (
      <Card sx={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #111111 100%)',
        border: '1px solid #2a2a2a',
        borderRadius: 3,
        height: '200px'
      }}>
        <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{
            p: 3,
            borderBottom: '1px solid #2a2a2a',
            background: 'rgba(255, 255, 255, 0.02)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <NewspaperIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                News & Sentiment
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Loading market sentiment...
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress size={40} sx={{ color: 'primary.main' }} />
          </Box>
        </CardContent>
      </Card>
    );

  return (
    <Card sx={{
      background: 'linear-gradient(135deg, #1a1a1a 0%, #111111 100%)',
      border: '1px solid #2a2a2a',
      borderRadius: 3,
      height: '200px'
    }}>
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{
          p: 3,
          borderBottom: '1px solid #2a2a2a',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <NewspaperIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              News & Sentiment for {ticker}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            AI-powered market sentiment analysis
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {sentimentData.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No sentiment data available for {ticker}
              </Typography>
            </Box>
          ) : (
            <List dense sx={{ p: 2 }}>
              {sentimentData.map((item, i) => (
                <ListItem key={i} disableGutters sx={{ 
                  mb: 1, 
                  p: 1.5, 
                  borderRadius: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.04)'
                  }
                }}>
                  <ListItemText
                    primary={item.headline}
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      sx: { fontWeight: 500, mb: 0.5 }
                    }}
                    secondary={
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: getSentimentColor(item.sentiment),
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {item.sentiment}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default NewsSentiment;
