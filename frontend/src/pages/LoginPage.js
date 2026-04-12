// frontend/src/pages/LoginPage.js

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Nav from "../components/Nav";

function LoginPage({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const { login, error: authError, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    
    if (!form.email.trim()) {
      newErrors.email = "⚠ Email is required";
    } else if (!validateEmail(form.email)) {
      newErrors.email = "⚠ Invalid email format";
    }
    
    if (!form.password) {
      newErrors.password = "⚠ Password is required";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setLoginError(""); 
      setLoading(true);
      const result = await login(form.email, form.password);
      if (result.success) {
        result.user.role === "admin" ? navigate("/admin") : navigate("/profile");
      } else {
        setLoginError(result.error || "Login failed. Please check your credentials.");
      }
      setLoading(false);
    }
  };

  // Styles
  const styles = {
    container: {
      maxWidth: "800px",
      margin: "30px auto",
      padding: "30px",
      backgroundColor: "var(--section-bg)",
      borderRadius: "12px",
      borderLeft: "7px solid var(--accent-color)",
      boxShadow: "0 6px 12px var(--shadow-color)"
    },
    title: {
      textAlign: "center",
      fontSize: "28px",
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
      boxSizing: "border-box",
      outline: "none",
      transition: "border-color 0.3s"
    },
    inputFocus: {
      borderColor: "var(--primary-color)"
    },
    errorText: {
      color: "#dc3545",
      fontSize: "12px",
      marginTop: "5px",
      display: "block"
    },
    button: {
      width: "100%",
      padding: "14px",
      background: "linear-gradient(135deg, #e67e22, #f39c12)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginTop: "10px"
    },
    buttonHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 5px 15px rgba(230, 126, 34, 0.3)"
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
      transform: "none"
    },
    authLinks: {
      textAlign: "center",
      marginTop: "25px",
      paddingTop: "20px",
      borderTop: "1px solid var(--border-color)"
    },
    forgotPassword: {
      display: "inline-block",
      color: "#666",
      textDecoration: "none",
      fontSize: "14px",
      marginBottom: "12px",
      transition: "color 0.3s ease"
    },
    registerLink: {
      margin: 0,
      fontSize: "14px"
    },
    registerLinkAnchor: {
      color: "#e67e22",
      textDecoration: "none",
      fontWeight: "600"
    },
    image: {
      marginTop: "30px",
      width: "100%",
      borderRadius: "12px",
      display: "block"
    }
  };

  return (
    <>
      <Nav darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <div className="about-container">
        <section style={styles.container}>
          <h2 style={styles.title}>🔐 Welcome Back</h2>
          <p style={styles.subtitle}>Login to access your basketball profile</p>
          
          {(loginError || authError) && (
            <div style={styles.errorBox}>
              ❌ {loginError || authError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>📧 Email Address</label>
              <input 
                type="email" 
                placeholder="your@email.com" 
                value={form.email} 
                onChange={(e) => setForm({...form, email: e.target.value})} 
                disabled={loading || authLoading}
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = styles.inputFocus.borderColor}
                onBlur={(e) => e.target.style.borderColor = styles.input.borderColor}
              />
              {errors.email && <span style={styles.errorText}>{errors.email}</span>}
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>🔒 Password</label>
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={form.password} 
                onChange={(e) => setForm({...form, password: e.target.value})} 
                disabled={loading || authLoading}
                style={styles.input}
              />
              {errors.password && <span style={styles.errorText}>{errors.password}</span>}
            </div>
            
            <button 
              type="submit" 
              style={{
                ...styles.button,
                ...((loading || authLoading) ? styles.buttonDisabled : {})
              }}
              onMouseEnter={(e) => {
                if (!(loading || authLoading)) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 5px 15px rgba(230, 126, 34, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!(loading || authLoading)) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }
              }}
              disabled={loading || authLoading}
            >
              {(loading || authLoading) ? "Logging in..." : "Login"}
            </button>
          </form>
          
          <div style={styles.authLinks}>
            <Link to="/forgot-password" style={styles.forgotPassword}>
              <strong>Forgot Password?</strong>
            </Link>
            <p style={styles.registerLink}>
              Don't have an account? <Link to="/register" style={styles.registerLinkAnchor}>Create Account</Link>
            </p>
          </div>
          
          <img 
            src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500" 
            alt="Basketball" 
            style={styles.image}
          />
        </section>
      </div>
      
      <footer>
        <p>📧 Email: aldrinvillanueva@email.com | 📞 Phone: 099-192-31885</p>
        <p>🏀 &copy; 2026 Basketball Portfolio Project | Passion for the Game</p>
      </footer>
    </>
  );
}

export default LoginPage;