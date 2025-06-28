import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Package,
  Calendar,
  Clock,
  Search,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "./CompanyOrders.css";

function CompanyOrders() {
  const [company, setCompany] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { companyId } = useParams();

  useEffect(() => {
    loadData();
  }, [companyId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load company data
      const companies = await window.companyAPI.getCompanies();
      const companyData = companies.find((c) => c.id === companyId);
      setCompany(companyData);

      // Load orders for this company
      const ordersData = await window.orderAPI.getOrders(companyId);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrder = () => {
    navigate(`/add-order/${companyId}`);
  };

  const handleBack = () => {
    navigate("/list-comapany");
  };

  const handleOrderClick = (order) => {
    navigate(`/machine-schedule/order/${order.id}`);
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.machineName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="company-orders-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="company-orders-container">
        <div className="error-state">
          <h2>Company Not Found</h2>
          <p>The company you're looking for doesn't exist.</p>
          <button onClick={handleBack} className="back-btn">
            <ArrowLeft size={16} />
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="company-orders-container">
      <div className="company-orders-header">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft size={20} />
          Back to Companies
        </button>
        <div className="header-content">
          <h1>Orders for {company.name}</h1>
          <div className="company-info">
            <span className="company-details">
              <Package size={16} />
              {company.gst}
            </span>
            <span className="company-details">
              <Clock size={16} />
              {company.dailyHours} hours/day
            </span>
          </div>
        </div>
        <button className="add-order-btn" onClick={handleAddOrder}>
          <Plus size={20} />
          Add Order
        </button>
      </div>

      <div className="orders-controls">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="orders-count">{filteredOrders.length} orders</div>
      </div>

      <div className="orders-table-container">
        {filteredOrders.length > 0 ? (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Part Number</th>
                <th>Process</th>
                <th>Machine</th>
                <th>Units</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => handleOrderClick(order)}
                  className="order-row"
                >
                  <td>
                    <div className="product-info">
                      <Package size={16} className="product-icon" />
                      <span
                        title={
                          order.productName.length > 25
                            ? order.productName
                            : undefined
                        }
                      >
                        {order.productName}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="part-number"
                      title={
                        order.partNumber.length > 15
                          ? order.partNumber
                          : undefined
                      }
                    >
                      {order.partNumber}
                    </span>
                  </td>
                  <td>
                    <span
                      className="process-name"
                      title={
                        order.processName.length > 20
                          ? order.processName
                          : undefined
                      }
                    >
                      {order.processName}
                    </span>
                  </td>
                  <td>
                    <span
                      className="machine-name"
                      title={
                        order.machineName.length > 20
                          ? order.machineName
                          : undefined
                      }
                    >
                      {order.machineName}
                    </span>
                  </td>
                  <td>
                    <span className="units-count">{order.units}</span>
                  </td>
                  <td>
                    <div className="date-info">
                      <Calendar size={14} />
                      <span>
                        {new Date(order.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="date-info">
                      <Calendar size={14} />
                      <span>
                        {new Date(order.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge status-${order.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <Package size={48} className="empty-icon" />
            <h3>No Orders Found</h3>
            <p>
              {searchTerm
                ? "No orders match your search criteria."
                : "Get started by creating your first order."}
            </p>
            {!searchTerm && (
              <button className="add-order-btn" onClick={handleAddOrder}>
                <Plus size={20} />
                Add Order
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyOrders;
