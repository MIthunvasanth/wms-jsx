import React, { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Package,
  Settings,
  Save,
  X,
  CheckCircle,
  Info,
} from "lucide-react";
import "./ConflictResolutionModal.css";

function ConflictResolutionModal({
  isOpen,
  onClose,
  conflicts,
  newOrderData,
  onResolve,
  isResolving,
}) {
  const [conflictResolutions, setConflictResolutions] = useState({});

  if (!isOpen) return null;

  const handleEndDateChange = (orderId, newEndDate) => {
    setConflictResolutions((prev) => ({
      ...prev,
      [orderId]: newEndDate,
    }));
  };

  const handleResolve = async () => {
    const resolutions = Object.entries(conflictResolutions).map(
      ([orderId, newEndDate]) => ({
        orderId,
        newEndDate,
      })
    );

    await onResolve({
      newOrderData,
      conflictResolutions: resolutions,
    });
  };

  const handleCancel = () => {
    setConflictResolutions({});
    onClose();
  };

  const isResolveDisabled =
    conflicts.length !== Object.keys(conflictResolutions).length;

  return (
    <div className="conflict-modal-overlay">
      <div className="conflict-modal">
        <div className="conflict-modal-header">
          <div className="header-content">
            <div className="header-icon">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2>Machine Schedule Conflict</h2>
              <p>Resolve conflicts to proceed with order creation</p>
            </div>
          </div>
          <button className="close-button" onClick={handleCancel}>
            <X size={20} />
          </button>
        </div>

        <div className="conflict-modal-body">
          <div className="new-order-info">
            <div className="info-header">
              <Package size={16} />
              <span>New Order Details</span>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Product:</span>
                <span className="value">{newOrderData.productName}</span>
              </div>
              <div className="info-item">
                <span className="label">Machine:</span>
                <span className="value">{newOrderData.machineName}</span>
              </div>
              <div className="info-item">
                <span className="label">Start Date:</span>
                <span className="value">
                  {new Date(newOrderData.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="info-item">
                <span className="label">End Date:</span>
                <span className="value">
                  {new Date(newOrderData.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="conflicts-section">
            <div className="section-header">
              <AlertTriangle size={16} />
              <span>Conflicting Orders</span>
              <span className="conflict-count">
                {conflicts.length} conflict(s)
              </span>
            </div>

            <div className="conflicts-list">
              {conflicts.map((conflict, index) => (
                <div key={conflict.orderId} className="conflict-item">
                  <div className="conflict-header">
                    <div className="conflict-info">
                      <h4>{conflict.productName}</h4>
                      <div className="conflict-details">
                        <span className="machine-name">
                          <Settings size={14} />
                          {conflict.machineName}
                        </span>
                        <span
                          className={`status-badge status-${conflict.status}`}
                        >
                          {conflict.status}
                        </span>
                      </div>
                    </div>
                    <div className="conflict-number">#{index + 1}</div>
                  </div>

                  <div className="conflict-dates">
                    <div className="date-range">
                      <div className="date-item">
                        <Calendar size={14} />
                        <span className="label">Current Start:</span>
                        <span className="value">
                          {new Date(conflict.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="date-item">
                        <Calendar size={14} />
                        <span className="label">Current End:</span>
                        <span className="value">
                          {new Date(conflict.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="resolution-section">
                      <div className="resolution-header">
                        <Info size={14} />
                        <span>Adjust End Date to Resolve Conflict</span>
                      </div>
                      <div className="date-input-group">
                        <label htmlFor={`endDate_${conflict.orderId}`}>
                          New End Date:
                        </label>
                        <input
                          id={`endDate_${conflict.orderId}`}
                          type="date"
                          value={conflictResolutions[conflict.orderId] || ""}
                          onChange={(e) =>
                            handleEndDateChange(
                              conflict.orderId,
                              e.target.value
                            )
                          }
                          min={conflict.startDate}
                          className="date-input"
                        />
                        {conflictResolutions[conflict.orderId] && (
                          <div className="date-preview">
                            <CheckCircle size={14} />
                            <span>
                              Will end on{" "}
                              {new Date(
                                conflictResolutions[conflict.orderId]
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="resolution-summary">
            <div className="summary-header">
              <Info size={16} />
              <span>Resolution Summary</span>
            </div>
            <div className="summary-content">
              <p>
                {Object.keys(conflictResolutions).length === conflicts.length
                  ? "All conflicts will be resolved by adjusting the end dates of existing orders."
                  : `Please adjust the end dates for ${
                      conflicts.length - Object.keys(conflictResolutions).length
                    } more order(s) to proceed.`}
              </p>
            </div>
          </div>
        </div>

        <div className="conflict-modal-footer">
          <button
            className="cancel-button"
            onClick={handleCancel}
            disabled={isResolving}
          >
            <X size={16} />
            Cancel
          </button>
          <button
            className="resolve-button"
            onClick={handleResolve}
            disabled={isResolveDisabled || isResolving}
          >
            <Save size={16} />
            {isResolving ? "Resolving..." : "Resolve & Create Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConflictResolutionModal;
