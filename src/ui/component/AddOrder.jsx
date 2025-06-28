import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  X,
  Package,
  Calendar,
  Clock,
  Settings,
  AlertTriangle,
  CheckCircle,
  Plus,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "./AddOrder.css";
import ConflictResolutionModal from "./ConflictResolutionModal";

function AddOrder() {
  const [formData, setFormData] = useState({
    productName: "",
    partNumber: "",
    startDate: "",
    endDate: "",
    units: 1,
  });
  const [processes, setProcesses] = useState([
    { id: 1, processName: "", machineId: "" },
  ]);
  const [company, setCompany] = useState(null);
  const [machines, setMachines] = useState([]);
  const [machineConflicts, setMachineConflicts] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [processErrors, setProcessErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
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

      // Load all machines from machineAPI
      const machinesData = await window.machineAPI.loadMachines();
      setMachines(machinesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePartNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `PN-${timestamp}-${random}`;
  };

  const validateForm = () => {
    const newErrors = {};
    const newProcessErrors = {};

    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    if (!formData.units || formData.units < 1) {
      newErrors.units = "Units must be at least 1";
    }

    // Validate processes
    processes.forEach((process, index) => {
      if (!process.processName.trim()) {
        newProcessErrors[`processName_${process.id}`] =
          "Process name is required";
      }
      if (!process.machineId) {
        newProcessErrors[`machineId_${process.id}`] = "Please select a machine";
      }
    });

    setErrors(newErrors);
    setProcessErrors(newProcessErrors);
    return (
      Object.keys(newErrors).length === 0 &&
      Object.keys(newProcessErrors).length === 0
    );
  };

  const addProcess = () => {
    const newId = Math.max(...processes.map((p) => p.id)) + 1;
    setProcesses([...processes, { id: newId, processName: "", machineId: "" }]);
  };

  const removeProcess = (processId) => {
    if (processes.length > 1) {
      setProcesses(processes.filter((p) => p.id !== processId));
    }
  };

  const updateProcess = (processId, field, value) => {
    setProcesses(
      processes.map((process) =>
        process.id === processId ? { ...process, [field]: value } : process
      )
    );

    // Clear error when user starts typing
    if (processErrors[`${field}_${processId}`]) {
      setProcessErrors((prev) => ({
        ...prev,
        [`${field}_${processId}`]: "",
      }));
    }

    // Handle machine change - check for conflicts
    if (
      field === "machineId" &&
      value &&
      formData.startDate &&
      formData.endDate
    ) {
      checkMachineConflicts(value, formData.startDate, formData.endDate);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Handle machine change - check for conflicts
    if (
      field === "machineId" &&
      value &&
      formData.startDate &&
      formData.endDate
    ) {
      checkMachineConflicts(value, formData.startDate, formData.endDate);
    }

    // Handle date changes - check for conflicts if machine is selected
    if ((field === "startDate" || field === "endDate") && formData.machineId) {
      const startDate = field === "startDate" ? value : formData.startDate;
      const endDate = field === "endDate" ? value : formData.endDate;
      if (startDate && endDate) {
        checkMachineConflicts(formData.machineId, startDate, endDate);
      }
    }
  };

  const checkMachineConflicts = async (machineId, startDate, endDate) => {
    try {
      const orders = await window.orderAPI.getOrders(companyId);
      const conflictingOrders = orders.filter(
        (order) =>
          order.machineId === machineId &&
          order.status !== "completed" &&
          order.status !== "cancelled" &&
          new Date(startDate) <= new Date(order.endDate) &&
          new Date(endDate) >= new Date(order.startDate)
      );

      if (conflictingOrders.length > 0) {
        setMachineConflicts({
          machineId,
          conflicts: conflictingOrders,
        });
      } else {
        setMachineConflicts(null);
      }
    } catch (error) {
      console.error("Error checking conflicts:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create an order for each process
      const orderPromises = processes.map(async (process) => {
        const selectedMachine = machines.find(
          (m) => m.id === process.machineId
        );

        const orderData = {
          companyId,
          productName: formData.productName,
          partNumber: formData.partNumber || generatePartNumber(),
          processName: process.processName,
          machineId: process.machineId,
          machineName: selectedMachine?.name || "",
          startDate: formData.startDate,
          endDate: formData.endDate,
          units: formData.units,
          status: "pending",
        };

        const result = await window.orderAPI.createOrder(orderData);

        // Check if there's a conflict
        if (!result.success && result.type === "MACHINE_CONFLICT") {
          setConflictData({
            conflicts: result.conflicts,
            newOrderData: orderData,
          });
          setShowConflictModal(true);
          setIsSubmitting(false);
          return null; // Stop processing
        }

        return result.order;
      });

      const results = await Promise.all(orderPromises);

      // Check if any orders had conflicts
      if (results.some((result) => result === null)) {
        return; // Conflict modal is already shown
      }

      alert("Orders created successfully!");
      navigate(`/company-orders/${companyId}`);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("An error occurred while creating the order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/company-orders/${companyId}`);
  };

  const handleConflictResolve = async (resolutionData) => {
    setIsResolving(true);
    try {
      const result = await window.orderAPI.resolveConflictAndCreateOrder(
        resolutionData
      );
      if (result.success) {
        alert("Order created successfully! Conflicts have been resolved.");
        setShowConflictModal(false);
        setConflictData(null);
        navigate(`/company-orders/${companyId}`);
      }
    } catch (error) {
      console.error("Error resolving conflict:", error);
      alert(
        "An error occurred while resolving the conflict. Please try again."
      );
    } finally {
      setIsResolving(false);
    }
  };

  const handleConflictCancel = () => {
    setShowConflictModal(false);
    setConflictData(null);
  };

  if (loading) {
    return (
      <div className="add-order-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading order form...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="add-order-container">
        <div className="error-state">
          <h2>Company Not Found</h2>
          <p>The company you're looking for doesn't exist.</p>
          <button onClick={handleCancel} className="back-btn">
            <ArrowLeft size={16} />
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="add-order-container">
      <div className="add-order-header">
        <button className="back-button" onClick={handleCancel}>
          <ArrowLeft size={20} />
          Back to Orders
        </button>
        <h1>Create New Order</h1>
        <div className="company-info">
          <span
            className="company-name"
            title={company.name.length > 25 ? company.name : undefined}
          >
            {company.name}
          </span>
        </div>
      </div>

      <div className="add-order-form-container">
        <form onSubmit={handleSubmit} className="add-order-form">
          <div className="form-section">
            <h2>Order Information</h2>
            <p>Enter the details for the new order</p>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="productName">
                  <Package size={18} />
                  Product Name <span className="required">*</span>
                </label>
                <input
                  id="productName"
                  type="text"
                  value={formData.productName}
                  onChange={(e) =>
                    handleInputChange("productName", e.target.value)
                  }
                  placeholder="Enter product name"
                  className={errors.productName ? "error" : ""}
                />
                {errors.productName && (
                  <span className="error-message">{errors.productName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="partNumber">
                  <Package size={18} />
                  Part Number
                </label>
                <input
                  id="partNumber"
                  type="text"
                  value={formData.partNumber}
                  onChange={(e) =>
                    handleInputChange("partNumber", e.target.value)
                  }
                  placeholder="Auto-generated if left empty"
                  readOnly={!formData.partNumber}
                />
                <small className="help-text">
                  Leave empty to auto-generate, or enter a custom part number
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="units">
                  <Package size={18} />
                  Units <span className="required">*</span>
                </label>
                <input
                  id="units"
                  type="number"
                  min="1"
                  value={formData.units}
                  onChange={(e) =>
                    handleInputChange("units", parseInt(e.target.value) || 1)
                  }
                  className={errors.units ? "error" : ""}
                />
                {errors.units && (
                  <span className="error-message">{errors.units}</span>
                )}
                <small className="help-text">Number of units to produce</small>
              </div>

              <div className="form-group">
                <label htmlFor="startDate">
                  <Calendar size={18} />
                  Start Date <span className="required">*</span>
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                  className={errors.startDate ? "error" : ""}
                />
                {errors.startDate && (
                  <span className="error-message">{errors.startDate}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="endDate">
                  <Calendar size={18} />
                  End Date <span className="required">*</span>
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className={errors.endDate ? "error" : ""}
                />
                {errors.endDate && (
                  <span className="error-message">{errors.endDate}</span>
                )}
              </div>
            </div>

            {/* Processes Section */}
            <div className="processes-section">
              <div className="section-header">
                <h3>Processes & Machines</h3>
                <button
                  type="button"
                  className="add-process-btn"
                  onClick={addProcess}
                >
                  <Plus size={16} />
                  Add Process
                </button>
              </div>

              {processes.map((process, index) => (
                <div key={process.id} className="process-item">
                  <div className="process-header">
                    <span className="process-number">Process {index + 1}</span>
                    {processes.length > 1 && (
                      <button
                        type="button"
                        className="remove-process-btn"
                        onClick={() => removeProcess(process.id)}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="process-fields">
                    <div className="form-group">
                      <label htmlFor={`processName_${process.id}`}>
                        <Settings size={18} />
                        Process Name <span className="required">*</span>
                      </label>
                      <input
                        id={`processName_${process.id}`}
                        type="text"
                        value={process.processName}
                        onChange={(e) =>
                          updateProcess(
                            process.id,
                            "processName",
                            e.target.value
                          )
                        }
                        placeholder="Enter process name"
                        className={
                          processErrors[`processName_${process.id}`]
                            ? "error"
                            : ""
                        }
                      />
                      {processErrors[`processName_${process.id}`] && (
                        <span className="error-message">
                          {processErrors[`processName_${process.id}`]}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor={`machineId_${process.id}`}>
                        <Settings size={18} />
                        Select Machine <span className="required">*</span>
                      </label>
                      <select
                        id={`machineId_${process.id}`}
                        value={process.machineId}
                        onChange={(e) =>
                          updateProcess(process.id, "machineId", e.target.value)
                        }
                        className={
                          processErrors[`machineId_${process.id}`]
                            ? "error"
                            : ""
                        }
                      >
                        <option value="">Choose a machine...</option>
                        {machines.map((machine) => (
                          <option key={machine.id} value={machine.id}>
                            {machine.name} ({machine.units} units) -{" "}
                            {machine.status}
                          </option>
                        ))}
                      </select>
                      {processErrors[`machineId_${process.id}`] && (
                        <span className="error-message">
                          {processErrors[`machineId_${process.id}`]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <X size={18} />
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={isSubmitting}
            >
              <Save size={18} />
              {isSubmitting ? "Creating Order..." : "Create Order"}
            </button>
          </div>
        </form>
      </div>

      {/* Conflict Resolution Modal */}
      {conflictData && (
        <ConflictResolutionModal
          isOpen={showConflictModal}
          onClose={handleConflictCancel}
          conflicts={conflictData.conflicts}
          newOrderData={conflictData.newOrderData}
          onResolve={handleConflictResolve}
          isResolving={isResolving}
        />
      )}
    </div>
  );
}

export default AddOrder;
