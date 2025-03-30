import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./App.css";

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
    setShowAllSchemes(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CALCULATE_RETURNS}`,
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
      } else {
        setError(err.response?.data?.error || "An error occurred");
      }

      if (err.response?.status === 429) {
        setTimeout(() => {
          setError(null);
        }, 2000);
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
              <p>
                Uses SARIMA (Seasonal AutoRegressive Integrated Moving Average)
                model for future return predictions, considering market cycles
                and seasonal patterns for more accurate forecasting.
              </p>
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

          <button type="submit" disabled={loading}>
            {loading ? "Calculating..." : "Calculate Returns"}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {result && (
          <div className="result-container">
            <h2>Investment Results</h2>
            <div className="result-grid">
              <div className="result-item">
                <label>Scheme Name</label>
                <span>{result.scheme_name}</span>
              </div>
              <div className="result-item">
                <label>Total Investment</label>
                <span>₹{result.total_investment.toLocaleString()}</span>
              </div>
              <div className="result-item">
                <label>Current Value</label>
                <span>₹{result.current_value.toLocaleString()}</span>
              </div>
              <div className="result-item">
                <label>Absolute Returns</label>
                <span>₹{result.absolute_returns.toLocaleString()}</span>
              </div>
              <div className="result-item">
                <label>Returns (%)</label>
                <span>{result.percentage_returns.toFixed(2)}%</span>
              </div>
              <div className="result-item">
                <label>Number of Installments</label>
                <span>{result.number_of_installments}</span>
              </div>
              <div className="result-item">
                <label>Average NAV</label>
                <span>₹{result.average_nav}</span>
              </div>
              <div className="result-item">
                <label>Highest NAV</label>
                <span>₹{result.highest_nav}</span>
              </div>
              <div className="result-item">
                <label>Lowest NAV</label>
                <span>₹{result.lowest_nav}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>
          Data provided by AMFI India • Powered by SARIMA Predictions •
          Available on RapidAPI
        </p>
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
