import React, { useState, useCallback } from "react";
import "./ProcessSearch.css";

const ProcessSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMode, setSearchMode] = useState("name"); // 'name' or 'id'
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError("");
    setResults([]);

    try {
      let searchResults;
      if (searchMode === "name") {
        searchResults = await window.searchAPI.searchByName(searchTerm);
      } else {
        const result = await window.searchAPI.searchById(searchTerm);
        searchResults = result ? [result] : [];
      }
      setResults(searchResults);
    } catch (err) {
      console.error("Search failed:", err);
      setError(err.message || "An unexpected search error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className='process-search-container'>
      <h2>Search Processes</h2>
      <div className='search-controls'>
        <div className='search-input-wrapper'>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Enter process ${searchMode}...`}
            className='search-input'
          />
          <button onClick={handleSearch} disabled={isLoading} className='search-button'>
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
        <div className='search-mode-toggle'>
          <label>
            <input
              type='radio'
              name='searchMode'
              value='name'
              checked={searchMode === "name"}
              onChange={() => setSearchMode("name")}
            />
            By Name
          </label>
          <label>
            <input
              type='radio'
              name='searchMode'
              value='id'
              checked={searchMode === "id"}
              onChange={() => setSearchMode("id")}
            />
            By ID
          </label>
        </div>
      </div>

      {error && <div className='error-message'>Error: {error}</div>}

      <div className='search-results-container'>
        {results.length > 0 ? (
           <ul className='process-list'>
           {results.map((process) => (
             <li key={process.id} className='process-item'>
               <div className='process-item-header'>
                 <h3 className='process-name'>{process.name}</h3>
                 <span className={`process-status status-${process.status.toLowerCase().replace(" ", "-")}`}>
                   {process.status}
                 </span>
               </div>
               <p className='process-description'>{process.description}</p>
               <div className='process-item-footer'>
                 <small>ID: {process.id}</small>
                 <small>Created: {new Date(process.createdAt).toLocaleString()}</small>
               </div>
             </li>
           ))}
         </ul>
        ) : (
          !isLoading && <p>No results found.</p>
        )}
      </div>
    </div>
  );
};

export default ProcessSearch; 