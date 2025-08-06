import React, { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import { Box, Typography, List, ListItem, ListItemText, CircularProgress, Paper } from "@mui/material";

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
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Paper sx={{ p: 1, minHeight: 100 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        News & GenAI Sentiment for {ticker}
      </Typography>
      <List dense>
        {sentimentData.map((item, i) => (
          <ListItem key={i} disableGutters>
            <ListItemText
              primary={item.headline}
              secondary={
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    fontWeight: "bold",
                    color: getSentimentColor(item.sentiment),
                  }}
                >
                  {item.sentiment}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default NewsSentiment;
