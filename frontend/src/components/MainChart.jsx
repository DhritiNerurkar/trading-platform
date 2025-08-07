import React, { useState, useEffect, useRef } from "react";
import apiClient from "../api/apiClient";
import Plot from "react-plotly.js";
import Plotly from "plotly.js-dist-min";
import { Card, CardContent, Box, Typography, Button, Collapse, CircularProgress, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { TypeAnimation } from "react-type-animation";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CandlestickChartIcon from "@mui/icons-material/CandlestickChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { useData } from "../context/DataContext";

const MainChart = React.memo(({ ticker }) => {
  const { liveData } = useData();
  const [chartData, setChartData] = useState({ prices: [], plotData: [] });
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [chartType, setChartType] = useState("candlestick");
  const plotRef = useRef(null);

  useEffect(() => {
    setAnalysis("");
    const fetchChartData = async () => {
      if (!ticker) return;
      setLoading(true);
      try {
        const response = await apiClient.get(`/historical/${ticker}`);
        const data = response.data;
        let priceTrace;
        if (chartType === "candlestick") {
          priceTrace = {
            x: data.map((d) => d.timestamp),
            open: data.map((d) => d.open),
            high: data.map((d) => d.high),
            low: data.map((d) => d.low),
            close: data.map((d) => d.close),
            type: "candlestick",
            name: ticker,
            yaxis: "y1",
            increasing: { line: { color: "limegreen" } },
            decreasing: { line: { color: "red" } }
          };
        } else {
          priceTrace = {
            x: data.map((d) => d.timestamp),
            y: data.map((d) => d.close),
            type: "scatter",
            mode: "lines",
            name: ticker,
            yaxis: "y1",
            line: { color: "#90caf9", width: 2 }
          };
        }
        const volumeTrace = {
          x: data.map((d) => d.timestamp),
          y: data.map((d) => d.volume),
          type: "bar",
          name: "Volume",
          yaxis: "y2",
          marker: { color: "#f48fb1" }
        };
        setChartData({ prices: data, plotData: [priceTrace, volumeTrace] });
      } catch (error) { console.error("Failed to fetch chart data", error); }
      setLoading(false);
    };
    fetchChartData();
  }, [ticker, chartType]);

  useEffect(() => {
    const liveTickData = liveData[ticker];
    if (
      plotRef.current &&
      plotRef.current.el &&
      liveTickData &&
      chartData.prices.length > 0 &&
      liveTickData.volume
    ) {
      const plotlyInstance = plotRef.current.el;
      const lastTimestamp = plotlyInstance.data[0].x.slice(-1)[0];
      if (new Date(liveTickData.timestamp) > new Date(lastTimestamp)) {
        let newPoint;
        if (chartType === "candlestick") {
          newPoint = {
            x: [[liveTickData.timestamp]],
            open: [[liveTickData.open]],
            high: [[liveTickData.high]],
            low: [[liveTickData.low]],
            close: [[liveTickData.price]],
          };
        } else {
          newPoint = {
            x: [[liveTickData.timestamp]],
            y: [[liveTickData.price]],
          };
        }
        const newVolume = {
          x: [[liveTickData.timestamp]],
          y: [[liveTickData.volume]],
        };
        Plotly.extendTraces(plotlyInstance, newPoint, [0]);
        Plotly.extendTraces(plotlyInstance, newVolume, [1]);
      }
    }
  }, [liveData, ticker, chartData.prices, chartType]);

  const handleAnalyzeChart = async () => {
    if (!chartData.prices.length) return;
    setAnalysisLoading(true);
    try {
      const response = await apiClient.post('/genai/chart-analysis', { ticker, prices: chartData.prices });
      setAnalysis(response.data.analysis);
    } catch (error) { setAnalysis("Error fetching analysis."); }
    setAnalysisLoading(false);
  };

  const handleChartTypeChange = (event, newChartType) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  if (loading) {
    return (
      <Card sx={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #111111 100%)',
        border: '1px solid #2a2a2a',
        borderRadius: 3,
        height: '400px'
      }}>
        <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{
            p: 3,
            borderBottom: '1px solid #2a2a2a',
            background: 'rgba(255, 255, 255, 0.02)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <ShowChartIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {ticker} Price Chart
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Loading chart data...
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress size={40} sx={{ color: 'primary.main' }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{
      background: 'linear-gradient(135deg, #1a1a1a 0%, #111111 100%)',
      border: '1px solid #2a2a2a',
      borderRadius: 3,
      height: '400px'
    }}>
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{
          p: 3,
          borderBottom: '1px solid #2a2a2a',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <ShowChartIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {ticker} Price Chart
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Real-time price data and volume analysis
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <ToggleButtonGroup
                value={chartType}
                exclusive
                onChange={handleChartTypeChange}
                size="small"
                aria-label="chart type"
                sx={{
                  '& .MuiToggleButton-root': {
                    borderColor: '#2a2a2a',
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="candlestick" aria-label="candlestick chart">
                  <CandlestickChartIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="line" aria-label="line chart">
                  <ShowChartIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
              
              <Button
                variant="contained"
                size="small"
                startIcon={<AutoAwesomeIcon />}
                onClick={handleAnalyzeChart}
                disabled={analysisLoading}
                sx={{
                  background: 'linear-gradient(135deg, #00d4aa 0%, #4dffdb 100%)',
                  color: '#000',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00a37a 0%, #00d4aa 100%)',
                  },
                }}
              >
                {analysisLoading ? "Analyzing..." : "AI Analysis"}
              </Button>
            </Box>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
          <Plot
            ref={plotRef}
            data={chartData.plotData}
            layout={{
              dragmode: 'pan',
              template: 'plotly_dark',
              showlegend: false,
              xaxis: {
                rangeslider: { visible: false },
                gridcolor: '#2a2a2a',
                zerolinecolor: '#2a2a2a',
              },
              yaxis: {
                title: 'Price (USD)',
                domain: [0.25, 1],
                autorange: true,
                gridcolor: '#2a2a2a',
                zerolinecolor: '#2a2a2a',
              },
              yaxis2: {
                title: 'Volume',
                domain: [0, 0.2],
                autorange: true,
                showgrid: false,
                gridcolor: '#2a2a2a',
                zerolinecolor: '#2a2a2a',
              },
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              margin: { t: 20, b: 40, l: 50, r: 20 },
              font: {
                color: '#ffffff'
              }
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
            config={{ responsive: true, scrollZoom: true }}
          />
        </Box>

        <Collapse in={!!analysis || analysisLoading}>
          <Box sx={{
            p: 3,
            borderTop: '1px solid #2a2a2a',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #111111 100%)',
            borderLeft: '4px solid #00d4aa'
          }}>
            <Typography variant="subtitle1" sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2,
              fontWeight: 600,
              color: 'primary.main'
            }}>
              <AutoAwesomeIcon fontSize="small" />
              AI Market Analysis
            </Typography>
            {analysisLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} sx={{ color: 'primary.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Analyzing market patterns...
                </Typography>
              </Box>
            ) : (
              <TypeAnimation
                sequence={[analysis]}
                wrapper="span"
                speed={70}
                cursor={false}
                style={{
                  fontSize: '0.9rem',
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                  color: '#e5e5e5'
                }}
              />
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
});

export default MainChart;
