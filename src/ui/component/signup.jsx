import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiEye,
  FiEyeOff,
  FiCheck,
  FiArrowRight,
  FiUser,
  FiLock,
  FiMail,
  FiBriefcase,
} from "react-icons/fi";
import "./Auth.css";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = await window.electronAPI.auth.signup({
        username: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({
        submit: error.message || "Signup failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left-panel">
        <div className="auth-logo">Process Scheduler</div>
        <div className="auth-left-content">
          <h1>Activate Your Digital Factory</h1>
          <p>
            This is the central control system for your production line. Create
            accounts for your team members to manage schedules, track machine
            performance, and streamline operations.
          </p>
          <div className="auth-features">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">✓</div>
              <span>Centralized Process & Machine Management</span>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">✓</div>
              <span>Dynamic Production Scheduling & Analytics</span>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">✓</div>
              <span>Secure, Role-Based Access for Your Entire Team</span>
            </div>
          </div>
        </div>
        <div className="auth-footer-text">
          © {new Date().getFullYear()} Process Scheduler. All rights reserved.
        </div>
      </div>

      <div className="auth-right-panel">
        <div className="auth-form-container">
          <h2>Create a User Account</h2>
          <p className="auth-subtitle">
            Fill in the details to grant access to the system.
          </p>

          {success && (
            <div className="auth-success-message">
              <FiCheck className="auth-success-icon" />
              Account created successfully! Redirecting to login...
            </div>
          )}

          {errors.submit && (
            <div className="error-message" style={{ marginBottom: "20px" }}>
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label htmlFor="name">Full Name</label>
              <div className="auth-input-wrapper">
                <FiUser className="auth-input-icon" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`auth-input ${errors.name ? "error" : ""}`}
                />
              </div>
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="auth-form-group">
              <label htmlFor="email">Email Address</label>
              <div className="auth-input-wrapper">
                <FiMail className="auth-input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`auth-input ${errors.email ? "error" : ""}`}
                />
              </div>
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="auth-form-group">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrapper">
                <FiLock className="auth-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`auth-input ${errors.password ? "error" : ""}`}
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="auth-form-group">
              <label htmlFor="role">Account Type</label>
              <div className="role-selector">
                <div
                  className={`role-option ${
                    formData.role === "user" ? "selected" : ""
                  }`}
                  onClick={() => setFormData({ ...formData, role: "user" })}
                >
                  <FiUser className="role-icon" />
                  <div>
                    <h4>Operator</h4>
                    <p>View schedules and update process status</p>
                  </div>
                </div>
                <div
                  className={`role-option ${
                    formData.role === "admin" ? "selected" : ""
                  }`}
                  onClick={() => setFormData({ ...formData, role: "admin" })}
                >
                  <FiBriefcase className="role-icon" />
                  <div>
                    <h4>Administrator</h4>
                    <p>Manage users, machines, and schedules</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="auth-checkbox-group">
              <input
                type="checkbox"
                id="terms"
                className="auth-checkbox"
                required
              />
              <label htmlFor="terms" className="auth-checkbox-label">
                I agree to the <a href="/terms">Terms of Service</a> and{" "}
                <a href="/privacy">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="auth-spinner"></span>
              ) : (
                <>
                  Create Account <FiArrowRight style={{ marginLeft: "8px" }} />
                </>
              )}
            </button>

            <div className="auth-switch-text">
              Already have an account?{" "}
              <Link to="/login" className="auth-switch-link">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default Signup;
