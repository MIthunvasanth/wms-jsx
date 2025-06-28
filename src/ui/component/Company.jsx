import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Company.css";

function Company() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      if (!window.companyAPI) {
        console.error("companyAPI not available");
        return;
      }
      const data = await window.companyAPI.getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error("Error loading companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = () => {
    navigate("/add-company");
  };

  const handleEditCompany = (company) => {
    navigate(`/edit-company/${company.id}`, { state: { company } });
  };

  const handleDeleteClick = (company) => {
    setCompanyToDelete(company);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await window.companyAPI.deleteCompany(companyToDelete.id);
      await loadCompanies();
      setShowDeleteModal(false);
      setCompanyToDelete(null);
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.gst.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="company-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="company-container">
      <div className="company-header">
        <div className="header-left">
          <h1>Company Management</h1>
          <p>Manage your company information and details</p>
        </div>
        <button className="add-company-btn" onClick={handleAddCompany}>
          <Plus size={20} />
          Add Company
        </button>
      </div>

      <div className="company-controls">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-container">
          <Filter size={20} />
          <span>Filter</span>
        </div>
      </div>

      <div className="company-table-container">
        {filteredCompanies.length > 0 ? (
          <table className="company-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Address</th>
                <th>GST Number</th>
                <th>Daily Hours</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company.id}>
                  <td>
                    <div className="company-name">
                      <div className="company-avatar">
                        {company.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="company-info">
                        <span
                          className="company-name-text"
                          title={
                            company.name.length > 20 ? company.name : undefined
                          }
                        >
                          {company.name}
                        </span>
                        <span className="status-badge status-active">
                          Active
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="address-info">
                      <span
                        className="address-text"
                        title={
                          company.address.length > 35
                            ? company.address
                            : undefined
                        }
                      >
                        {company.address}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="gst-info">
                      <span
                        className="gst-text"
                        title={
                          company.gst.length > 15 ? company.gst : undefined
                        }
                      >
                        {company.gst}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="hours-info">
                      <span className="hours-text">
                        {company.dailyHours} hours
                      </span>
                      <span className="hours-label">per day</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditCompany(company)}
                        title="Edit Company"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteClick(company)}
                        title="Delete Company"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Plus size={48} />
            </div>
            <h3>No Companies Found</h3>
            <p>
              {searchTerm
                ? "No companies match your search criteria."
                : "Get started by adding your first company."}
            </p>
            {!searchTerm && (
              <button className="add-company-btn" onClick={handleAddCompany}>
                <Plus size={20} />
                Add Company
              </button>
            )}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Delete Company</h3>
            <p>
              Are you sure you want to delete "{companyToDelete?.name}"? This
              action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="delete-confirm-btn"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Company;
