import React from "react";
import { Box, Typography, Card, CardContent, Divider, IconButton, Tooltip, Chip } from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import usePinnedTickers from "./usePinnedTickers";
import { useData } from "../context/DataContext";
import MainChart from "./MainChart";
import NewsSentiment from "./NewsSentiment";

const PinnedPage = () => {
  const { liveData } = useData();
  const { pinned, toggle } = usePinnedTickers();

  const pinnedStocks = pinned.map((ticker) => liveData[ticker]).filter(Boolean);

  if (!pinnedStocks.length) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <Typography variant="h6" color="text.secondary">
          No pinned stocks yet. Pin your favorites from the main Watchlist!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 120px)',
      gap: 3
    }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Pinned Stocks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your favorite stocks with detailed analysis
          </Typography>
        </Box>
        <Chip
          label={`${pinnedStocks.length} Pinned`}
          color="primary"
          icon={<PushPinIcon />}
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {/* Pinned Stocks Grid */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {pinnedStocks.map((stock) => (
          <Card key={stock.ticker} sx={{
            mb: 3,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #111111 100%)',
            border: '1px solid #2a2a2a',
            borderRadius: 3,
          }}>
            <CardContent sx={{ p: 0 }}>
              {/* Stock Header */}
              <Box sx={{
                p: 3,
                borderBottom: '1px solid #2a2a2a',
                background: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {stock.ticker}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Real-time data and analysis
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {/* Live Price */}
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      ${stock.price?.toFixed(2)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {stock.change >= 0 ? (
                        <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />
                      ) : (
                        <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16 }} />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: stock.change >= 0 ? 'success.main' : 'error.main',
                        }}
                      >
                        {stock.change >= 0 ? '+' : ''}
                        {stock.change?.toFixed(2)} ({stock.change_percent?.toFixed(2)}%)
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Unpin button */}
                  <Tooltip title="Unpin from Watchlist">
                    <IconButton 
                      color="warning" 
                      size="small" 
                      onClick={() => toggle(stock.ticker)}
                      sx={{ 
                        border: '1px solid #2a2a2a',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.04)'
                        }
                      }}
                    >
                      <PushPinIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Chart Section */}
              <Box sx={{ p: 3 }}>
                <Box sx={{ minHeight: 400, mb: 3 }}>
                  <MainChart ticker={stock.ticker} />
                </Box>
                
                {/* News Sentiment Section */}
                <Box sx={{ mt: 2 }}>
                  <NewsSentiment ticker={stock.ticker} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default PinnedPage;
