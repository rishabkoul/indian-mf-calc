import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import "./InvestmentGraph.css";

const InvestmentGraph = ({ dayWiseData }) => {
  if (!dayWiseData || dayWiseData.length === 0) return null;

  // Find the first predicted date
  const firstPredictedIndex = dayWiseData.findIndex(
    (data) => data.is_predicted
  );
  const firstPredictedDate =
    firstPredictedIndex !== -1 ? dayWiseData[firstPredictedIndex].date : null;

  // Format date for tooltip and axis
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
    });
  };

  // Format currency
  const formatCurrency = (value) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(2)}K`;
    }
    return `₹${value.toFixed(2)}`;
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = data[payload[0].dataKey];

      // Format the value based on the data type
      let formattedValue;
      if (payload[0].dataKey === "units_till_date") {
        formattedValue = value.toFixed(4);
      } else {
        formattedValue = formatCurrency(value);
      }

      return (
        <div className="custom-tooltip">
          <p className="date">
            {new Date(label).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className={payload[0].dataKey}>
            {payload[0].name}: {formattedValue}
          </p>
          {data.is_predicted && <p className="predicted">⚡ Predicted Value</p>}
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = () => (
    <div className="custom-legend">
      <div className="legend-section">
        <div className="legend-item">
          <span className="legend-line solid"></span>
          <span>Data before red line: Actual historical data</span>
        </div>
        <div className="legend-item">
          <span className="legend-line dashed"></span>
          <span>Data after red line: AI predicted values</span>
        </div>
      </div>
      <div className="legend-separator"></div>
      <div className="legend-item">
        <span className="legend-line divider"></span>
        <span>Red dotted line: Prediction start date</span>
      </div>
    </div>
  );

  const commonChartProps = {
    data: dayWiseData,
    margin: { top: 20, right: 30, left: 20, bottom: 20 },
    width: "100%",
    height: 250,
  };

  const commonAxisProps = {
    tickFormatter: formatDate,
    angle: -30,
    textAnchor: "end",
    height: 50,
    stroke: "#666",
    tick: { fill: "#666", fontSize: 12 },
    interval: "preserveStartEnd",
  };

  const commonGridProps = {
    strokeDasharray: "3 3",
    stroke: "#eee",
  };

  const commonLineProps = {
    type: "monotone",
    strokeWidth: 2,
    dot: false,
    activeDot: {
      r: 4,
      strokeWidth: 2,
      fill: "#fff",
    },
  };

  const renderReferenceLine = () =>
    firstPredictedDate && (
      <ReferenceLine
        x={firstPredictedDate}
        stroke="#ff6b6b"
        strokeDasharray="3 3"
        strokeWidth={2}
      />
    );

  return (
    <div className="investment-graph-container">
      <h3>Investment Progress Over Time</h3>
      <CustomLegend />

      {/* NAV Graph */}
      <div className="graph-section">
        <h4>Net Asset Value (NAV)</h4>
        <ResponsiveContainer {...commonChartProps}>
          <LineChart {...commonChartProps}>
            <CartesianGrid {...commonGridProps} />
            <XAxis dataKey="date" {...commonAxisProps} />
            <YAxis
              tickFormatter={(value) => `₹${value.toFixed(2)}`}
              stroke="#8884d8"
              tick={{ fill: "#666", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              {...commonLineProps}
              dataKey="nav"
              name="NAV"
              stroke="#8884d8"
              activeDot={{ ...commonLineProps.activeDot, stroke: "#8884d8" }}
            />
            {renderReferenceLine()}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Current Value Graph */}
      <div className="graph-section">
        <h4>Current Value</h4>
        <ResponsiveContainer {...commonChartProps}>
          <LineChart {...commonChartProps}>
            <CartesianGrid {...commonGridProps} />
            <XAxis dataKey="date" {...commonAxisProps} />
            <YAxis
              tickFormatter={(value) => formatCurrency(value).replace("₹", "")}
              stroke="#82ca9d"
              tick={{ fill: "#666", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              {...commonLineProps}
              dataKey="current_value"
              name="Current Value"
              stroke="#82ca9d"
              activeDot={{ ...commonLineProps.activeDot, stroke: "#82ca9d" }}
            />
            {renderReferenceLine()}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Units Graph */}
      <div className="graph-section">
        <h4>Units</h4>
        <ResponsiveContainer {...commonChartProps}>
          <LineChart {...commonChartProps}>
            <CartesianGrid {...commonGridProps} />
            <XAxis dataKey="date" {...commonAxisProps} />
            <YAxis
              tickFormatter={(value) => value.toFixed(2)}
              stroke="#ffc658"
              tick={{ fill: "#666", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              {...commonLineProps}
              dataKey="units_till_date"
              name="Units"
              stroke="#ffc658"
              activeDot={{ ...commonLineProps.activeDot, stroke: "#ffc658" }}
            />
            {renderReferenceLine()}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InvestmentGraph;
