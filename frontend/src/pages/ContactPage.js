// frontend/src/pages/ContactPage.js

import { useState } from "react";
import Nav from "../components/Nav";

function ContactPage({ darkMode, toggleDarkMode }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "⚠ Name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "⚠ Email is required";
    } 
    else if (!validateEmail(form.email)) {
      newErrors.email = "⚠ Invalid email format";
    }

    if (!form.message.trim()) {
      newErrors.message = "⚠ Message is required";
    } else if (form.message.trim().length < 10) {
      newErrors.message = "⚠ Message must be at least 10 characters";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      
      // Simulate form submission
      setTimeout(() => {
        setSuccess(true);
        setForm({
          name: "",
          email: "",
          message: ""
        });

        setTimeout(() => {
          setSuccess(false);
        }, 3000);
        setLoading(false);
      }, 1000);
    }
  };

  // Basketball resources with functioning links
  const resources = [
    {
      name: "NBA Official Site",
      description: "Professional basketball news, scores, and official rules",
      type: "News & Updates",
      url: "https://www.nba.com",
      icon: "🏀"
    },
    {
      name: "Breakthrough Basketball",
      description: "Training tips, drills, and skill development resources",
      type: "Training",
      url: "https://www.breakthroughbasketball.com",
      icon: "💪"
    },
    {
      name: "FIBA Rules",
      description: "Official international basketball rules and regulations",
      type: "Reference",
      url: "http://www.fiba.basketball",
      icon: "📋"
    },
    {
      name: "Samahang Basketbol ng Pilipinas (SBP)",
      description: "Official governing body for basketball in the Philippines",
      type: "Local Organization",
      url: "https://sbp.ph",
      icon: "🇵🇭"
    },
    {
      name: "PBA (Philippine Basketball Association)",
      description: "Asia's first professional basketball league",
      type: "Local League",
      url: "https://www.pba.ph",
      icon: "🏆"
    }
  ];

  // Philippine basketball courts with Google Maps links
  const philippineCourts = [
    {
      name: "Araneta Coliseum",
      location: "Quezon City, Metro Manila",
      description: "The Big Dome - Home of the PBA and UAAP games",
      mapsUrl: "https://www.google.com/maps/search/Araneta+Coliseum+Quezon+City",
      icon: "🏟️"
    },
    {
      name: "Mall of Asia Arena",
      location: "Pasay City, Metro Manila",
      description: "World-class arena hosting major basketball events",
      mapsUrl: "https://www.google.com/maps/search/Mall+of+Asia+Arena+Pasay",
      icon: "🏀"
    },
    {
      name: "PhilSports Arena",
      location: "Pasig City, Metro Manila",
      description: "Formerly ULTRA, home to many basketball tournaments",
      mapsUrl: "https://www.google.com/maps/search/PhilSports+Arena+Pasig",
      icon: "🏀"
    },
    {
      name: "Cebu Coliseum",
      location: "Cebu City",
      description: "Historic basketball venue in the Visayas",
      mapsUrl: "https://www.google.com/maps/search/Cebu+Coliseum",
      icon: "🏟️"
    }
  ];

  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "20px"
    },
    header: {
      textAlign: "center",
      marginBottom: "30px"
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "30px",
      marginBottom: "40px"
    },
    formCard: {
      backgroundColor: "var(--section-bg)",
      padding: "25px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px var(--shadow-color)"
    },
    infoCard: {
      backgroundColor: "var(--section-bg)",
      padding: "25px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px var(--shadow-color)"
    },
    formGroup: {
      marginBottom: "15px"
    },
    label: {
      display: "block",
      marginBottom: "5px",
      fontWeight: "600",
      color: "var(--text-color)"
    },
    input: {
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "2px solid var(--accent-color)",
      backgroundColor: "var(--form-bg)",
      color: "var(--text-color)",
      fontSize: "14px",
      boxSizing: "border-box"
    },
    textarea: {
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "2px solid var(--accent-color)",
      backgroundColor: "var(--form-bg)",
      color: "var(--text-color)",
      fontSize: "14px",
      boxSizing: "border-box",
      resize: "vertical",
      minHeight: "100px"
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "orange",
      color: "#17395f",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "all 0.3s ease"
    },
    errorBox: {
      backgroundColor: "#ffebee",
      color: "#c62828",
      padding: "10px",
      borderRadius: "8px",
      marginBottom: "15px",
      textAlign: "center"
    },
    successBox: {
      backgroundColor: "#d4edda",
      color: "#155724",
      padding: "10px",
      borderRadius: "8px",
      marginBottom: "15px",
      textAlign: "center"
    },
    errorText: {
      color: "#dc3545",
      fontSize: "12px",
      marginTop: "4px",
      display: "block"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginBottom: "40px"
    },
    th: {
      backgroundColor: "#17395f",
      color: "white",
      padding: "12px",
      textAlign: "left"
    },
    td: {
      backgroundColor: "var(--form-bg)",
      padding: "12px",
      color: "var(--text-color)",
      borderBottom: "1px solid var(--border-color)"
    },
    courtGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "20px",
      marginBottom: "40px"
    },
    courtCard: {
      backgroundColor: "var(--section-bg)",
      padding: "20px",
      borderRadius: "10px",
      transition: "all 0.3s ease",
      cursor: "pointer",
      textDecoration: "none",
      color: "inherit",
      display: "block"
    },
    footer: {
      textAlign: "center",
      padding: "20px",
      backgroundColor: "var(--footer-bg)",
      color: "white",
      marginTop: "40px"
    }
  };

  return (
    <>
      <Nav darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <div style={styles.container}>
        <div style={styles.header}>
          <h2>📬 Contact Me</h2>
          <p>Have questions about basketball? Want to share your own journey? I'd love to hear from you!</p>
        </div>

        {/* Contact Form and Info Grid */}
        <div style={styles.grid}>
          {/* Contact Form */}
          <div style={styles.formCard}>
            <h3 style={{ marginBottom: "20px" }}>Send me a message</h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>👤 Name</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  disabled={loading}
                  style={styles.input}
                />
                {errors.name && <span style={styles.errorText}>{errors.name}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>📧 Email</label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  disabled={loading}
                  style={styles.input}
                />
                {errors.email && <span style={styles.errorText}>{errors.email}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>💬 Message</label>
                <textarea
                  rows="5"
                  placeholder="Your message here..."
                  value={form.message}
                  onChange={(e) => setForm({...form, message: e.target.value})}
                  disabled={loading}
                  style={styles.textarea}
                />
                {errors.message && <span style={styles.errorText}>{errors.message}</span>}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={styles.button}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#ff9800";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "orange";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                {loading ? "Sending..." : "Send Message ✉️"}
              </button>

              {success && (
                <div style={styles.successBox}>
                  ✅ Thank you! Your message has been sent. I'll get back to you soon!
                </div>
              )}
            </form>
          </div>

          {/* Contact Information */}
          <div style={styles.infoCard}>
            <h3 style={{ marginBottom: "20px" }}>Contact Information</h3>
            <div style={{ marginBottom: "15px" }}>
              <p>📧 <strong>Email:</strong> aldrinvillanueva@email.com</p>
              <p>📞 <strong>Phone:</strong> 099-192-31885</p>
              <p>📍 <strong>Location:</strong> Philippines</p>
            </div>
            <hr style={{ margin: "20px 0", borderColor: "var(--border-color)" }} />
            <h4>Follow Basketball Updates:</h4>
            <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
              <a href="https://www.facebook.com/PBA" target="_blank" rel="noopener noreferrer" style={{ fontSize: "24px", textDecoration: "none" }}>📘</a>
              <a href="https://twitter.com/PBA" target="_blank" rel="noopener noreferrer" style={{ fontSize: "24px", textDecoration: "none" }}>🐦</a>
              <a href="https://www.instagram.com/pba" target="_blank" rel="noopener noreferrer" style={{ fontSize: "24px", textDecoration: "none" }}>📷</a>
              <a href="https://www.youtube.com/results?search_query=PBA" target="_blank" rel="noopener noreferrer" style={{ fontSize: "24px", textDecoration: "none" }}>▶️</a>
            </div>
          </div>
        </div>

        {/* Basketball Resources Table */}
        <h2 style={{ marginBottom: "20px" }}>🏀 Basketball Resources</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Icon</th>
              <th style={styles.th}>Resource Name</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource, index) => (
              <tr key={index}>
                <td style={styles.td}>{resource.icon}</td>
                <td style={styles.td}><strong>{resource.name}</strong></td>
                <td style={styles.td}>{resource.description}</td>
                <td style={styles.td}>
                  <span style={{
                    backgroundColor: "orange",
                    color: "#17395f",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}>
                    {resource.type}
                  </span>
                </td>
                <td style={styles.td}>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" style={{
                    padding: "6px 12px",
                    backgroundColor: "#17395f",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "5px",
                    fontSize: "12px"
                  }}>
                    Visit →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Basketball Courts in the Philippines */}
        <h2 style={{ marginBottom: "20px" }}>📍 Basketball Courts in the Philippines</h2>
        <div style={styles.courtGrid}>
          {philippineCourts.map((court, index) => (
            <a
              key={index}
              href={court.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.courtCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: "48px", textAlign: "center" }}>{court.icon}</div>
              <h3 style={{ textAlign: "center", margin: "10px 0" }}>{court.name}</h3>
              <p style={{ textAlign: "center", color: "#666" }}>📍 {court.location}</p>
              <p style={{ textAlign: "center", fontSize: "14px", marginTop: "10px" }}>{court.description}</p>
              <div style={{
                textAlign: "center",
                marginTop: "15px",
                padding: "8px",
                backgroundColor: "orange",
                color: "#17395f",
                borderRadius: "5px"
              }}>
                Open in Google Maps 🗺️
              </div>
            </a>
          ))}
        </div>

        {/* Embedded Google Maps - Philippines */}
        <div style={{
          marginTop: "20px",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <iframe
            title="Philippines Basketball Courts"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d247540.92662534395!2d120.97358898161115!3d14.587550981584437!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c9a4b4c9e9e1%3A0x8b3c5e3d9a2c5b3f!2sAraneta%20Coliseum!5e0!3m2!1sen!2sph!4v1644260000000!5m2!1sen!2sph"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          ></iframe>
          <div style={{
            padding: "15px",
            textAlign: "center",
            backgroundColor: "var(--section-bg)"
          }}>
            <p>🇵🇭 <strong>Map of Basketball Courts in the Philippines</strong></p>
            <a 
              href="https://www.google.com/maps/search/basketball+courts+Philippines"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "10px 20px",
                backgroundColor: "orange",
                color: "#17395f",
                textDecoration: "none",
                borderRadius: "5px",
                display: "inline-block"
              }}
            >
              Find Courts in the Philippines →
            </a>
          </div>
        </div>
      </div>

      <footer style={styles.footer}>
        <p>📧 Email: aldrinvillanueva@email.com | 📞 Phone: 099-192-31885</p>
        <p>🏀 &copy; 2026 Basketball Portfolio Project | Passion for the Game</p>
      </footer>
    </>
  );
}

export default ContactPage;