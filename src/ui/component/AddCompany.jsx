import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  X,
  Building2,
  MapPin,
  Receipt,
  Clock,
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./AddCompany.css";

function AddCompany() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    gst: "",
    dailyHours: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  useEffect(() => {
    if (id && location.state?.company) {
      setFormData(location.state.company);
    }
  }, [id, location.state]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Company name is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Company address is required";
    }

    if (!formData.gst.trim()) {
      newErrors.gst = "GST number is required";
    } else if (
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        formData.gst
      )
    ) {
      newErrors.gst = "Please enter a valid GST number";
    }

    if (!formData.dailyHours) {
      newErrors.dailyHours = "Daily work hours is required";
    } else if (
      parseInt(formData.dailyHours) < 1 ||
      parseInt(formData.dailyHours) > 24
    ) {
      newErrors.dailyHours = "Daily hours must be between 1 and 24";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const companyData = {
        ...formData,
        dailyHours: parseInt(formData.dailyHours),
      };

      if (id) {
        await window.companyAPI.updateCompany({
          ...companyData,
          id,
        });
      } else {
        await window.companyAPI.createCompany(companyData);
      }

      navigate("/company");
    } catch (error) {
      console.error("Error saving company:", error);
      alert("An error occurred while saving the company. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/company");
  };

  return (
    <div className="add-company-container">
      <div className="add-company-header">
        <button className="back-button" onClick={handleCancel}>
          <ArrowLeft size={20} />
          Back to Companies
        </button>
        <h1>{id ? "Edit Company" : "Add New Company"}</h1>
      </div>

      <div className="add-company-form-container">
        <form onSubmit={handleSubmit} className="add-company-form">
          <div className="form-section">
            <h2>Company Information</h2>
            <p>Enter the basic details of the company</p>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">
                  <Building2 size={18} />
                  Company Name <span className="required">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter company name"
                  className={errors.name ? "error" : ""}
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>

              <div className="form-group address-field">
                <label htmlFor="address">
                  <MapPin size={18} />
                  Company Address <span className="required">*</span>
                </label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter company address"
                  rows="3"
                  className={errors.address ? "error" : ""}
                />
                {errors.address && (
                  <span className="error-message">{errors.address}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="gst">
                  <Receipt size={18} />
                  GST Number <span className="required">*</span>
                </label>
                <input
                  id="gst"
                  type="text"
                  value={formData.gst}
                  onChange={(e) =>
                    handleInputChange("gst", e.target.value.toUpperCase())
                  }
                  placeholder="Enter GST number (e.g., 22AAAAA0000A1Z5)"
                  className={errors.gst ? "error" : ""}
                />
                {errors.gst && (
                  <span className="error-message">{errors.gst}</span>
                )}
                <small className="help-text">
                  Format: 22AAAAA0000A1Z5 (2 digits + 5 letters + 4 digits + 1
                  letter + 1 digit + Z + 1 digit/letter)
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="dailyHours">
                  <Clock size={18} />
                  Daily Work Hours <span className="required">*</span>
                </label>
                <input
                  id="dailyHours"
                  type="number"
                  min="1"
                  max="24"
                  value={formData.dailyHours}
                  onChange={(e) =>
                    handleInputChange("dailyHours", e.target.value)
                  }
                  placeholder="Enter daily work hours"
                  className={errors.dailyHours ? "error" : ""}
                />
                {errors.dailyHours && (
                  <span className="error-message">{errors.dailyHours}</span>
                )}
                <small className="help-text">
                  Enter hours between 1 and 24
                </small>
              </div>
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
              {isSubmitting
                ? "Saving..."
                : id
                ? "Update Company"
                : "Create Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCompany;
