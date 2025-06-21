import React, { useState, useEffect } from "react";
import "./ProcessList.css";

const ProcessList = () => {
  const [processes, setProcesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const fetchedProcesses = await window.processAPI.fetchProcesses();
        setProcesses(fetchedProcesses);
      } catch (err) {
        console.error("Failed to fetch processes:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProcesses();
  }, []);

  if (isLoading) {
    return <div className='loading-indicator'>Loading Processes...</div>;
  }

  if (error) {
    return <div className='error-message'>Error: {error}</div>;
  }

  return (
    <div className='process-list-container'>
      <h2>Process List</h2>
      {processes.length === 0 ? (
        <p>No processes found. Create one to get started.</p>
      ) : (
        <ul className='process-list'>
          {processes.map((process) => (
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
      )}
    </div>
  );
};

export default ProcessList; 