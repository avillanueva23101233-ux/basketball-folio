// frontend/src/pages/ForgotPasswordPage.js

import { useState } from "react";
import { Link } from "react-router-dom";
// ✅ REMOVED unused import: import { authAPI } from "../api/axios";
import Nav from "../components/Nav";

function ForgotPasswordPage({ darkMode, toggleDarkMode }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim()) {
      setError("⚠ Email is required");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("⚠ Invalid email format");
      return;
    }
    
    setLoading(true);
    
    try {
      // TODO: Replace with actual API call when backend is ready
      // await authAPI.forgotPassword(email);
      
      // Mock success
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to send reset email. Please try again.");
      setLoading(false);
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
      textAlign: "center",
      fontSize: "14px"
    },
    successBox: {
      background: "#d4edda",
      color: "#155724",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "20px",
      textAlign: "center",
      fontSize: "14px"
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
          <h2 style={styles.title}>🔐 Forgot Password?</h2>
          <p style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          {error && <div style={styles.errorBox}>❌ {error}</div>}
          {success && (
            <div style={styles.successBox}>
              ✅ Password reset link sent! Please check your email.
            </div>
          )}
          
          {!success ? (
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>📧 Email Address</label>
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  disabled={loading}
                  style={styles.input}
                />
              </div>
              
              <button 
                type="submit" 
                style={{
                  ...styles.button,
                  ...(loading ? styles.buttonDisabled : {})
                }}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <div style={styles.backLink}>
              <Link to="/login" style={styles.link}>← Back to Login</Link>
            </div>
          )}
          
          {!success && (
            <div style={styles.backLink}>
              <Link to="/login" style={styles.link}>← Back to Login</Link>
            </div>
          )}
        </section>
      </div>
      
      <footer>
        <p>📧 Email: aldrinvillanueva@email.com | 📞 Phone: 099-192-31885</p>
        <p>🏀 &copy; 2026 Basketball Portfolio Project</p>
      </footer>
    </>
  );
}

export default ForgotPasswordPage;