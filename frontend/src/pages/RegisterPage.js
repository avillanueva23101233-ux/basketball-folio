// frontend/src/pages/RegisterPage.js

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Nav from "../components/Nav";
import registerpic from "../assets/registerpic.jpg";

function RegisterPage({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const { register, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "", 
    dob: "", 
    level: "", 
    terms: false 
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!form.name.trim()) newErrors.name = "⚠ Full name is required";
    if (!form.email.trim()) newErrors.email = "⚠ Email is required";
    else if (!validateEmail(form.email)) newErrors.email = "⚠ Invalid email format";
    if (!form.password) newErrors.password = "⚠ Password is required";
    else if (form.password.length < 8) newErrors.password = "⚠ Password must be at least 8 characters";
    if (!form.confirmPassword) newErrors.confirmPassword = "⚠ Confirm password is required";
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = "⚠ Passwords do not match";
    if (!form.level) newErrors.level = "⚠ Please select skill level";
    if (!form.terms) newErrors.terms = "⚠ You must agree to terms and conditions";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setRegisterError(""); 
      setLoading(true);
      const result = await register({ 
        name: form.name, 
        email: form.email, 
        password: form.password, 
        dob: form.dob, 
        skillLevel: form.level 
      });
      if (result.success) { 
        setSuccess(true); 
        setForm({ 
          name: "", 
          email: "", 
          password: "", 
          confirmPassword: "", 
          dob: "", 
          level: "", 
          terms: false 
        }); 
        setTimeout(() => navigate("/login"), 2000); 
      } else {
        setRegisterError(result.error || "Registration failed");
      }
      setLoading(false);
    }
  };

  return (
    <>
      <Nav darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="about-container">
        <section className="registerie">
          <h2>🏀 Sign Up for Basketball Updates</h2>
          <p style={{ textAlign: "center", marginBottom: "20px" }}>
            Join our community! Get basketball tips, drills, and exclusive content.
          </p>
          
          {registerError && (
            <div style={{
              background: "#ffebee", 
              color: "#c62828", 
              padding: "10px", 
              borderRadius: "5px", 
              marginBottom: "20px"
            }}>
              ❌ {registerError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <label>👤 Full Name:</label>
            <input 
              type="text" 
              placeholder="Enter your full name"
              value={form.name} 
              onChange={(e)=>setForm({...form, name:e.target.value})} 
              disabled={loading||authLoading} 
            />
            {errors.name && <span className="error">{errors.name}</span>}
            
            {/* Email */}
            <label>📧 Email:</label>
            <input 
              type="email" 
              placeholder="your@email.com"
              value={form.email} 
              onChange={(e)=>setForm({...form, email:e.target.value})} 
              disabled={loading||authLoading} 
            />
            {errors.email && <span className="error">{errors.email}</span>}
            
            {/* Password */}
            <label>🔒 Password:</label>
            <input 
              type="password" 
              placeholder="At least 8 characters"
              value={form.password} 
              onChange={(e)=>setForm({...form, password:e.target.value})} 
              disabled={loading||authLoading} 
            />
            {errors.password && <span className="error">{errors.password}</span>}
            
            {/* Confirm Password */}
            <label>🔒 Confirm Password:</label>
            <input 
              type="password" 
              placeholder="Re-enter your password"
              value={form.confirmPassword} 
              onChange={(e)=>setForm({...form, confirmPassword:e.target.value})} 
              disabled={loading||authLoading} 
            />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            
            {/* Date of Birth */}
            <label>📅 Date of Birth:</label>
            <input 
              type="date" 
              value={form.dob} 
              onChange={(e)=>setForm({...form, dob:e.target.value})} 
              disabled={loading||authLoading} 
            />
            
            {/* Skill Level */}
            <label>🏀 Skill Level:</label>
            <div style={{ display: "flex", gap: "20px", marginTop: "5px", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <input 
                  type="radio" 
                  name="level" 
                  value="Beginner" 
                  checked={form.level === "Beginner"} 
                  onChange={(e)=>setForm({...form, level:e.target.value})} 
                  disabled={loading||authLoading} 
                />
                🌱 Beginner
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <input 
                  type="radio" 
                  name="level" 
                  value="Intermediate" 
                  checked={form.level === "Intermediate"} 
                  onChange={(e)=>setForm({...form, level:e.target.value})} 
                  disabled={loading||authLoading} 
                />
                ⭐ Intermediate
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <input 
                  type="radio" 
                  name="level" 
                  value="Expert" 
                  checked={form.level === "Expert"} 
                  onChange={(e)=>setForm({...form, level:e.target.value})} 
                  disabled={loading||authLoading} 
                />
                🏆 Expert
              </label>
            </div>
            {errors.level && <span className="error">{errors.level}</span>}
            
            {/* Terms and Conditions - FIXED CHECKBOX PLACEMENT */}
            <div style={{ marginTop: "20px", marginBottom: "10px" }}>
              <label style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px", 
                cursor: "pointer",
                fontWeight: "normal"
              }}>
                <input 
                  type="checkbox" 
                  checked={form.terms} 
                  onChange={(e)=>setForm({...form, terms:e.target.checked})} 
                  disabled={loading||authLoading}
                  style={{ 
                    width: "18px", 
                    height: "18px", 
                    cursor: "pointer",
                    margin: 0
                  }}
                />
                <span>I agree to the <Link to="/terms" style={{ color: "orange" }}>terms and conditions</Link> and <Link to="/privacy" style={{ color: "orange" }}>privacy policy</Link></span>
              </label>
              {errors.terms && <span className="error">{errors.terms}</span>}
            </div>
            
            {/* Submit Button */}
            <button type="submit" disabled={loading||authLoading}>
              {(loading||authLoading) ? "Registering..." : "Register Now 🏀"}
            </button>
          </form>
          
          {success && (
            <div style={{
              color: "green", 
              marginTop: "20px", 
              textAlign: "center",
              padding: "10px",
              backgroundColor: "#d4edda",
              borderRadius: "5px"
            }}>
              ✅ Registration successful! Redirecting to login...
            </div>
          )}
          
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            Already have an account? <Link to="/login" style={{ color: "orange" }}>Login here</Link>
          </p>
          
          <img 
            src={registerpic} 
            alt="Basketball training" 
            style={{ width: "100%", maxWidth: "500px", marginTop: "20px", borderRadius: "8px" }} 
          />
        </section>
      </div>
      
      <footer>
        <p>📧 Email: aldrinvillanueva@email.com | 📞 Phone: 099-192-31885</p>
        <p>🏀 &copy; 2026 Basketball Portfolio Project</p>
      </footer>
    </>
  );
}

export default RegisterPage;