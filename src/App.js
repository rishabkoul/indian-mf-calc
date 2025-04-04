import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import "./App.css";
import InvestmentGraph from "./InvestmentGraph";

// API Configuration
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:3001",
  ENDPOINTS: {
    CALCULATE_RETURNS: "/calculate-returns",
    SCHEMES: "/schemes",
  },
  EXTERNAL_LINKS: {
    RAPIDAPI: "https://rapidapi.com/rishabkoul2001/api/sipcalc-mf-india-api",
    DOCS: "https://rishabkoul.github.io/SIPCalc_MF_India_docs/",
    PRICING:
      "https://rapidapi.com/rishabkoul2001/api/sipcalc-mf-india-api/pricing",
  },
};

function App() {
  const [formData, setFormData] = useState({
    scheme_code: "",
    start_date: "",
    end_date: "",
    amount: "",
    frequency: "monthly",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllSchemes, setShowAllSchemes] = useState(false);
  const [showGraph, setShowGraph] = useState(false);

  // Fetch schemes based on search term
  const searchSchemes = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SCHEMES}${
          searchTerm ? `?search=${searchTerm}` : ""
        }`
      );
      setSchemes(
        Object.entries(response.data).map(([code, name]) => ({ code, name }))
      );
    } catch (err) {
      console.error("Error fetching schemes:", err);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (showAllSchemes) {
      searchSchemes();
    }
  }, [showAllSchemes, searchSchemes]);

  const handleSchemeSelect = (scheme) => {
    setFormData((prev) => ({ ...prev, scheme_code: scheme.code }));
    setSearchTerm(scheme.name);
    setShowAllSchemes(false);
  };

  // Clear results when form data changes
  useEffect(() => {
    setResult(null);
  }, [formData]);

  // Memoize the filtered day wise data to prevent unnecessary recalculations
  const memoizedDayWiseData = useMemo(() => {
    return result?.day_wise_nav || null;
  }, [result?.day_wise_nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Clear previous results immediately
    setResult(null);

    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CALCULATE_RETURNS}${
          showGraph ? "?show_day_wise_nav=true" : ""
        }`,
        {
          ...formData,
          amount: parseFloat(formData.amount),
        }
      );
      setResult(response.data);
    } catch (err) {
      if (err.response?.status === 429) {
        setError(
          "Too many requests. Please wait a moment before trying again."
        );
      } else if (err.response?.data?.detail) {
        // Handle structured error messages from the API
        setError(err.response.data.detail);
      } else {
        setError(
          err.response?.data?.error ||
            "An unexpected error occurred. Please try again."
        );
      }

      // Clear error after 10 seconds only for rate limit errors
      if (err.response?.status === 429) {
        setTimeout(() => {
          setError(null);
        }, 10000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Update the prediction description
  const predictionDescription = `
Uses advanced multi-timeframe analysis combining CAGR, market cycles, and risk-adjusted growth factors
for accurate future NAV predictions. The model analyzes multiple timeframes (7d, 15d, 30d, 90d) and
adjusts predictions based on market cycles and volatility.
`;

  // Update the footer text
  const footerText = `Data provided by AMFI India • Powered by Advanced Multi-timeframe Analysis • © ${new Date().getFullYear()}`;

  return (
    <div className="App">
      <header className="App-header">
        <div className="logo-container">
          <img
            src="/sip_calc_mf_india.png"
            alt="SIP Calculator Logo"
            className="app-logo"
          />
          <h1>Indian Mutual Fund Returns Calculator</h1>
        </div>
      </header>

      <main className="App-main">
        {/* Important Notice Section */}
        <div className="notice-section">
          <h3>⚡ Important Notice</h3>
          <p>
            This demo site uses a free-tier server which may experience cold
            starts (15-30 seconds delay on first request). For production use,
            please use our{" "}
            <a
              href="https://rapidapi.com/rishabkoul2001/api/sipcalc-mf-india-api"
              target="_blank"
              rel="noopener noreferrer"
            >
              RapidAPI endpoint
            </a>{" "}
            which is hosted on DigitalOcean with zero cold starts and better
            performance.
          </p>
        </div>

        {/* Info Section */}
        <div className="info-section">
          <h2>About This Calculator</h2>
          <p>
            Welcome to the Indian Mutual Fund Investment Calculator! This tool
            helps you calculate potential returns on your mutual fund
            investments using real-time data from AMFI (Association of Mutual
            Funds in India).
          </p>
          <div className="features">
            <div className="feature-item">
              <h3>🔮 Advanced Predictions</h3>
              <p>{predictionDescription}</p>
            </div>
            <div className="feature-item">
              <h3>📊 Real-Time Data</h3>
              <p>
                All calculations use the latest NAV data from AMFI's official
                database, ensuring up-to-date and accurate results.
              </p>
            </div>
            <div className="feature-item">
              <h3>⚡ API Access</h3>
              <p>
                This calculator is powered by our API available on RapidAPI.
                Free tier includes 10 requests/second. Premium plans available
                for higher limits.
              </p>
            </div>
          </div>
          <div className="api-links">
            <a
              href={API_CONFIG.EXTERNAL_LINKS.RAPIDAPI}
              target="_blank"
              rel="noopener noreferrer"
              className="api-button"
            >
              View on RapidAPI
            </a>
            <a
              href={API_CONFIG.EXTERNAL_LINKS.DOCS}
              target="_blank"
              rel="noopener noreferrer"
              className="api-button"
            >
              API Documentation
            </a>
          </div>
        </div>

        {/* Scheme Search Section */}
        <div className="scheme-search-section">
          <h2>Find Your Scheme</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search for mutual fund schemes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="scheme-search-input"
            />
            <button
              onClick={() => setShowAllSchemes(true)}
              className="search-button"
            >
              Search Schemes
            </button>
          </div>

          {showAllSchemes && schemes.length > 0 && (
            <div className="schemes-list">
              {schemes.map((scheme) => (
                <div
                  key={scheme.code}
                  className="scheme-item"
                  onClick={() => handleSchemeSelect(scheme)}
                >
                  <span className="scheme-code">{scheme.code}</span>
                  <span className="scheme-name">{scheme.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="calculator-form">
          <div className="form-group">
            <label htmlFor="scheme_code">Scheme Code</label>
            <input
              type="text"
              id="scheme_code"
              name="scheme_code"
              value={formData.scheme_code}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="start_date">Start Date</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_date">End Date</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Investment Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="frequency">Investment Frequency</label>
            <select
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              required
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="lumpsum">Lumpsum</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showGraph}
                onChange={(e) => setShowGraph(e.target.checked)}
              />
              <span>Show detailed graphs</span>
              <small className="performance-note">
                ⚡ Enabling graphs may increase response time as it requires
                additional calculations
              </small>
            </label>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Calculating..." : "Calculate Returns"}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {/* Results Section */}
        {result && (
          <div className="results-section">
            <h2>Investment Results</h2>
            <div className="results-grid">
              <div className="result-item">
                <h3>Total Investment</h3>
                <p>₹{result.total_investment.toFixed(2)}</p>
              </div>
              <div className="result-item">
                <h3>Current Value</h3>
                <p>₹{result.current_value.toFixed(2)}</p>
              </div>
              <div className="result-item">
                <h3>Absolute Returns</h3>
                <p>₹{result.absolute_returns.toFixed(2)}</p>
              </div>
              <div className="result-item">
                <h3>Returns %</h3>
                <p>{result.percentage_returns.toFixed(2)}%</p>
              </div>
              <div className="result-item">
                <h3>Number of Installments</h3>
                <p>{result.number_of_installments}</p>
              </div>
              <div className="result-item">
                <h3>Average NAV</h3>
                <p>₹{result.average_nav.toFixed(2)}</p>
              </div>
              <div className="result-item">
                <h3>Highest NAV</h3>
                <p>₹{result.highest_nav.toFixed(2)}</p>
              </div>
              <div className="result-item">
                <h3>Lowest NAV</h3>
                <p>₹{result.lowest_nav.toFixed(2)}</p>
              </div>
            </div>

            {/* Investment Graph */}
            {showGraph && !loading && result && (
              <div className="graph-container">
                <InvestmentGraph dayWiseData={memoizedDayWiseData} />
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>{footerText}</p>
        <p className="rate-limit-info">
          Free tier: 10 requests/second • Need more?{" "}
          <a
            href={API_CONFIG.EXTERNAL_LINKS.PRICING}
            target="_blank"
            rel="noopener noreferrer"
          >
            Check our pricing plans
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
