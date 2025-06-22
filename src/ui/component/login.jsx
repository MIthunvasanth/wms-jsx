import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import "./Auth.css";

function Login({ setUser }) {
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = "Username or email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
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
      const response = await window.electronAPI.auth.login({
        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password,
        remember: rememberMe,
      });

      if (response.success) {
        setUser({ username: formData.usernameOrEmail });
        navigate("/add-machine");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        submit: error.message || "Invalid credentials. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Logging in with ${provider}`);
    // Implement social login logic
  };

  return (
    <div className="auth-container">
      <div className="auth-left-panel">
        <div className="auth-logo">Process Scheduler</div>
        <div className="auth-left-content">
          <h1>Access Your Control Panel</h1>
          <p>
            Log in to manage machine schedules, monitor production,
            and streamline your entire operational workflow.
          </p>
        </div>
        <div className="auth-footer-text">
          © {new Date().getFullYear()} Process Scheduler. All rights reserved.
        </div>
      </div>

      <div className="auth-right-panel">
        <div className="auth-form-container">
          <h2>Login to your account</h2>

          {errors.submit && (
            <div className="error-message" style={{ marginBottom: "20px" }}>
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label htmlFor="usernameOrEmail">Username or Email</label>
              <input
                type="text"
                id="usernameOrEmail"
                name="usernameOrEmail"
                placeholder="Enter your username or email"
                value={formData.usernameOrEmail}
                onChange={handleChange}
                className={`auth-input ${
                  errors.usernameOrEmail ? "error" : ""
                }`}
                autoFocus
              />
              {errors.usernameOrEmail && (
                <span className="error-message">{errors.usernameOrEmail}</span>
              )}
            </div>

            <div className="auth-form-group">
              <label htmlFor="password">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
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
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div
              className="auth-checkbox-group"
              style={{ justifyContent: "space-between" }}
            >
              <div>
                <input
                  type="checkbox"
                  id="remember"
                  className="auth-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember" className="auth-checkbox-label">
                  Remember me
                </label>
              </div>
              <a
                href="/forgot-password"
                style={{ fontSize: "14px", color: "var(--primary-light)" }}
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging In..." : "Login"}{" "}
              <FiArrowRight style={{ marginLeft: "8px" }} />
            </button>

            <div className="auth-social-divider">Or continue with</div>

            {/* <div className="auth-social-buttons">
              <button
                type="button"
                className="auth-social-button"
                onClick={() => handleSocialLogin("google")}
              >
                <FiGoogle className="auth-social-icon" />
                Google
              </button>
              <button
                type="button"
                className="auth-social-button"
                onClick={() => handleSocialLogin("github")}
              >
                <FiGithub className="auth-social-icon" />
                GitHub
              </button>
              <button
                type="button"
                className="auth-social-button"
                onClick={() => handleSocialLogin("twitter")}
              >
                <FiTwitter className="auth-social-icon" />
                Twitter
              </button>
            </div> */}

            <p className="auth-switch-text">
              Don't have an account?
              <Link to="/signup" className="auth-switch-link">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
