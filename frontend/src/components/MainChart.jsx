import React, { useState, useEffect, useRef } from "react";
import apiClient from "../api/apiClient";
import Plot from "react-plotly.js";
import Plotly from "plotly.js-dist-min";
import { Paper, Box, Typography, Button, Collapse, CircularProgress, ToggleButton, ToggleButtonGroup } from "@mui/material";
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
  }, [liveData, ticker, chartData.prices]);

  const handleAnalyzeChart = async () => {
    if (!chartData.prices.length) return;
    setAnalysisLoading(true);
    try {
      const response = await apiClient.post("/genai/chart-analysis", { ticker, prices: chartData.prices });
      setAnalysis(response.data.analysis);
    } catch (error) {
      setAnalysis("Error fetching analysis.");
    }
    setAnalysisLoading(false);
  };

  if (loading)
    return (
      <Paper sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Paper>
    );

  const handleChartTypeChange = (event, newChartType) => {
    if (newChartType !== null) setChartType(newChartType);
  };

  return (
    <Paper sx={{ height: "100%", p: 2, display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="h6">{ticker} Price and Volume</Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            size="small"
            aria-label="chart type"
          >
            <ToggleButton value="candlestick" aria-label="candlestick chart">
              <CandlestickChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="line" aria-label="line chart">
              <ShowChartIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoAwesomeIcon />}
            onClick={handleAnalyzeChart}
            disabled={analysisLoading}
          >
            {analysisLoading ? "Analyzing..." : "Analyze Chart"}
          </Button>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, position: "relative" }}>
        <Plot
          ref={plotRef}
          data={chartData.plotData}
          layout={{
            dragmode: "pan",
            template: "plotly_dark",
            showlegend: false,
            xaxis: { rangeslider: { visible: false } },
            yaxis: { title: "Price (USD)", domain: [0.25, 1], autorange: true },
            yaxis2: { title: "Volume", domain: [0, 0.2], autorange: true, showgrid: false },
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            margin: { t: 20, b: 40, l: 50, r: 20 },
          }}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
          config={{ responsive: true, scrollZoom: true }}
        />
      </Box>

      <Collapse in={!!analysis || analysisLoading}>
        <Paper elevation={4} sx={{ p: 2, mt: 1 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
          >
            <AutoAwesomeIcon fontSize="small" />
            GenAI Analysis
          </Typography>
          {analysisLoading ? (
            <CircularProgress size={20} />
          ) : (
            <TypeAnimation
              sequence={[analysis]}
              wrapper="span"
              speed={70}
              cursor={false}
              style={{ fontSize: "0.9em", fontStyle: "italic" }}
            />
          )}
        </Paper>
      </Collapse>
    </Paper>
  );
});

export default MainChart;
