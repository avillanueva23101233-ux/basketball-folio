// frontend/src/pages/ResetPasswordPage.js

import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
// ✅ REMOVED unused import: import { authAPI } from "../api/axios";
import Nav from "../components/Nav";

function ResetPasswordPage({ darkMode, toggleDarkMode }) {
  // ✅ Keep token but add underscore to indicate intentionally unused
  const { token: _token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasMinLength = password.length >= 8;
    return { hasUpperCase, hasLowerCase, hasNumbers, hasMinLength };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    
    const passwordValidation = validatePassword(form.password);
    if (!form.password) {
      newErrors.password = "⚠ Password is required";
    } else if (!passwordValidation.hasMinLength) {
      newErrors.password = "⚠ Password must be at least 8 characters";
    } else if (!passwordValidation.hasUpperCase) {
      newErrors.password = "⚠ Password must contain at least one uppercase letter";
    } else if (!passwordValidation.hasLowerCase) {
      newErrors.password = "⚠ Password must contain at least one lowercase letter";
    } else if (!passwordValidation.hasNumbers) {
      newErrors.password = "⚠ Password must contain at least one number";
    }
    
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "⚠ Confirm password is required";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "⚠ Passwords do not match";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      setError("");
      
      try {
        // TODO: Replace with actual API call when backend is ready
        // await authAPI.resetPassword(_token, form.password);
        
        // Mock success
        setTimeout(() => {
          setSuccess(true);
          setTimeout(() => navigate("/login"), 3000);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError(err.message || "Failed to reset password. Please try again.");
        setLoading(false);
      }
    }
  };

  const styles = {
    container: {
      maxWidth: "500px",
      margin: "30px auto",
      padding: "30px",
      backgroundColor: "var(--section-bg)",
      borderRadius: "12px",
      borderLeft: "7px solid var(--accent-color)",
      boxShadow: "0 6px 12px var(--shadow-color)"
    },
    title: {
      textAlign: "center",
      fontSize: "24px",
      marginBottom: "10px",
      color: "var(--primary-color)"
    },
    subtitle: {
      textAlign: "center",
      marginBottom: "25px",
      color: "#666",
      fontSize: "14px"
    },
    errorBox: {
      background: "#ffebee",
      color: "#c62828",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "20px",
      textAlign: "center"
    },
    successBox: {
      background: "#d4edda",
      color: "#155724",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "20px",
      textAlign: "center"
    },
    formGroup: {
      marginBottom: "20px"
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "600",
      color: "var(--text-color)"
    },
    input: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "2px solid var(--accent-color)",
      backgroundColor: "var(--form-bg)",
      color: "var(--text-color)",
      fontSize: "14px",
      boxSizing: "border-box"
    },
    errorText: {
      color: "#dc3545",
      fontSize: "12px",
      marginTop: "5px",
      display: "block"
    },
    hintText: {
      color: "#666",
      fontSize: "11px",
      marginTop: "4px",
      display: "block"
    },
    button: {
      width: "100%",
      padding: "12px",
      background: "linear-gradient(135deg, #e67e22, #f39c12)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "15px",
      fontWeight: "bold",
      cursor: "pointer",
      marginTop: "10px"
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: "not-allowed"
    },
    backLink: {
      textAlign: "center",
      marginTop: "20px",
      paddingTop: "15px",
      borderTop: "1px solid var(--border-color)"
    },
    link: {
      color: "#e67e22",
      textDecoration: "none"
    }
  };

  return (
    <>
      <Nav darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <div className="about-container">
        <section style={styles.container}>
          <h2 style={styles.title}>🔐 Reset Password</h2>
          <p style={styles.subtitle}>Enter your new password below.</p>
          
          {error && <div style={styles.errorBox}>❌ {error}</div>}
          {success && (
            <div style={styles.successBox}>
              ✅ Password reset successful! Redirecting to login...
            </div>
          )}
          
          {!success && (
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>🔒 New Password</label>
                <input 
                  type="password" 
                  placeholder="Min 8 characters, 1 uppercase, 1 number"
                  value={form.password} 
                  onChange={(e) => setForm({...form, password: e.target.value})} 
                  disabled={loading}
                  style={styles.input}
                />
                {errors.password && <span style={styles.errorText}>{errors.password}</span>}
                <span style={styles.hintText}>Password must contain: 8+ chars, uppercase, lowercase, number</span>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>🔒 Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="Re-enter your new password"
                  value={form.confirmPassword} 
                  onChange={(e) => setForm({...form, confirmPassword: e.target.value})} 
                  disabled={loading}
                  style={styles.input}
                />
                {errors.confirmPassword && <span style={styles.errorText}>{errors.confirmPassword}</span>}
              </div>
              
              <button 
                type="submit" 
                style={{
                  ...styles.button,
                  ...(loading ? styles.buttonDisabled : {})
                }}
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
          
          <div style={styles.backLink}>
            <Link to="/login" style={styles.link}>← Back to Login</Link>
          </div>
        </section>
      </div>
      
      <footer>
        <p>📧 Email: aldrinvillanueva@email.com | 📞 Phone: 099-192-31885</p>
        <p>🏀 &copy; 2026 Basketball Portfolio Project</p>
      </footer>
    </>
  );
}

export default ResetPasswordPage;