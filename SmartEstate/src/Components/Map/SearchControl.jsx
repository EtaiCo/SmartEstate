// SearchControl.jsx
import React, { useState } from "react";
import axios from "axios";
import "../MapStyles.css";

function SearchControl({ onSearch }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/search?q=${encodeURIComponent(query)}`
      );
      setResults(response.data);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getResultIcon = (type) => {
    const icons = {
      address: "📍",
      school: "🏫",
      kindergarten: "👶",
      university: "🎓",
      shelter: "🏢",
      hospital: "🏥",
      pharmacy: "💊",
      park: "🌳",
      playground: "🎪",
    };
    return icons[type] || "📌";
  };

  return (
    <div className="search-control">
      <div className="search-input-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="הזן כתובת או שם מקום..."
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "..." : "🔍"}
        </button>
      </div>
      {results.length > 0 && (
        <div className="search-results">
          {results.map((result, index) => (
            <div
              key={index}
              className="search-result-item"
              onClick={() => {
                onSearch(result);
                setResults([]);
                setQuery("");
              }}
            >
              <span className="result-icon">{getResultIcon(result.type)}</span>
              <div className="result-details">
                <div className="result-name">{result.name}</div>
                {result.address && result.address !== result.name && (
                  <div className="result-address">{result.address}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchControl;
