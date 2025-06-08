import React, { useEffect, useState } from "react";
import {
  FiClock,
  FiCalendar,
  FiMapPin,
  FiChevronRight,
  FiLoader,
  FiAlertCircle,
  FiBriefcase,
} from "react-icons/fi";
import "../style/companylist.css";
import { useNavigate } from "react-router-dom";

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.machineAPI
      .getCompanies()
      .then((data) => {
        setCompanies(data);
      })
      .catch(() => {
        setError("Failed to fetch companies data. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const routeWithData = (id) => {
    navigate(`/machine-schedule/${id}`);
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-content">
          <FiLoader className="spin-icon" size={32} />
          <h2>Loading Companies</h2>
          <p>Please wait while we fetch your data...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <div className="error-content">
          <FiAlertCircle size={32} className="error-icon" />
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="company-app-container">
      <div className="company-header">
        <FiBriefcase size={28} className="header-icon" />
        <h1>Company Directory</h1>
        <div className="company-count">{companies.length} companies</div>
      </div>

      <div className="company-list-wrapper">
        {companies.length > 0 ? (
          <div className="company-grid">
            {companies.map((company, index) => (
              <div
                key={index}
                className="company-card"
                onClick={() => routeWithData(company?.id)}
              >
                <div className="card-header">
                  <div className="company-avatar">
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="company-title">
                    <h2>{company?.name}</h2>
                    <p className="company-location">
                      <FiMapPin size={14} /> {company?.address}
                    </p>
                  </div>
                  <FiChevronRight className="arrow-icon" size={20} />
                </div>

                <div className="card-divider"></div>

                <div className="time-details">
                  <div className="time-detail">
                    <div className="detail-label">
                      <FiCalendar className="detail-icon" />
                      <span>Start Date</span>
                    </div>
                    <p className="detail-value">
                      {new Date(company?.startDateTime).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="time-detail">
                    <div className="detail-label">
                      <FiCalendar className="detail-icon" />
                      <span>End Date</span>
                    </div>
                    <p className="detail-value">
                      {new Date(company?.endDateTime).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="time-detail">
                    <div className="detail-label">
                      <FiClock className="detail-icon" />
                      <span>Daily Hours</span>
                    </div>
                    <p className="detail-value">{company?.dailyHours}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FiBriefcase size={48} className="empty-icon" />
            <h3>No Companies Found</h3>
            <p>There are currently no companies to display.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyList;
