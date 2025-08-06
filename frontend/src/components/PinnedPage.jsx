import React from "react";
import { Box, Typography, Paper, Divider, IconButton, Tooltip } from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import usePinnedTickers from "./usePinnedTickers";
import { useData } from "../context/DataContext";
import MainChart from "./MainChart";
import PortfolioAnalytics from "./PortfolioAnalytics";
import NewsSentiment from "./NewsSentiment";

const PinnedPage = () => {
  const { liveData } = useData();
  const { pinned, toggle } = usePinnedTickers();

  const pinnedStocks = pinned.map((ticker) => liveData[ticker]).filter(Boolean);

  if (!pinnedStocks.length) {
    return (
      <Box p={4}>
        <Typography>No pinned stocks yet. Pin your favorites from the main Watchlist!</Typography>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Pinned Stocks
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {pinnedStocks.map((stock) => (
        <Paper key={stock.ticker} sx={{ mb: 4, p: 2, boxShadow: 3 }}>

              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography variant="h5" sx={{ mr: 2 }}>{stock.ticker}</Typography>
                  {/* --- Live Price --- */}
                  <Typography sx={{ fontSize: 22, fontWeight: 700, mr: 2 }}>
                      ${stock.price?.toFixed(2)}
                  </Typography>
                  {/* --- Price Change with color --- */}
                  <Typography
                      sx={{
                          fontWeight: 700,
                          color: stock.change >= 0 ? 'success.main' : 'error.main',
                          mr: 2,
                      }}
                  >
                      {stock.change >= 0 ? '+' : ''}
                      {stock.change?.toFixed(2)} ({stock.change_percent?.toFixed(2)}%)
                  </Typography>
                  {/* --- Unpin button --- */}
                  <Tooltip title="Unpin from Watchlist">
                      <IconButton color="warning" size="small" onClick={() => toggle(stock.ticker)} sx={{ ml: 1 }}>
                          <PushPinIcon />
                      </IconButton>
                  </Tooltip>
              </Box>

          <Box sx={{ minHeight: 360, mb: 2 }}>
            <MainChart ticker={stock.ticker} />
          </Box>
          <Box sx={{ mt: 18 }}>
            <NewsSentiment ticker={stock.ticker} />
          </Box>
        </Paper>
      ))}
      {/* <Box sx={{ mt: 4 }}>
        <PortfolioAnalytics />
      </Box> */}
    </Box>
  );
};

export default PinnedPage;
