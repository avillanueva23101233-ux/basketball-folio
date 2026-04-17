// frontend/src/components/Nav.js

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logopic.jpg";

function Nav({ darkMode, toggleDarkMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // ✅ REMOVED unused isActive function (lines 24-27 were deleted)

  const handleLogout = () => {
    logout();
    navigate('/home');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getUserInitials = () => {
    if (user && user.name) {
      return user.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  // Base URL for avatar images
  const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  // Get full avatar URL
  const getAvatarUrl = () => {
    if (user?.avatar && !avatarError) {
      return `${API_BASE_URL}${user.avatar}`;
    }
    return null;
  };

  const avatarUrl = getAvatarUrl();

  // Styles
  const styles = {
    header: {
      backgroundColor: "#17395f",
      color: "white",
      padding: "15px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      flexWrap: "wrap"
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "10px"
    },
    logoImage: {
      width: "50px",
      height: "40px",
      objectFit: "contain"
    },
    logoText: {
      margin: 0,
      fontSize: "1.2rem",
      letterSpacing: "1px"
    },
    mobileMenuBtn: {
      display: "none",
      background: "none",
      border: "none",
      color: "white",
      fontSize: "24px",
      cursor: "pointer",
      padding: "8px 12px"
    },
    nav: {
      flex: 1
    },
    navList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
      display: "flex",
      gap: "20px",
      alignItems: "center",
      justifyContent: "flex-end"
    },
    navLink: {
      color: "white",
      textDecoration: "none",
      fontWeight: "600",
      paddingBottom: "4px",
      transition: "all 0.3s ease"
    },
    activeLink: {
      borderBottom: "3px solid orange",
      color: "orange"
    },
    userGreeting: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginLeft: "10px"
    },
    userAvatarWrapper: {
      width: "35px",
      height: "35px",
      borderRadius: "50%",
      overflow: "hidden",
      border: "2px solid orange"
    },
    userAvatarImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    },
    userAvatar: {
      width: "35px",
      height: "35px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #E68C3A, #ff9800)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "transform 0.3s ease"
    },
    userAvatarSpan: {
      color: "white",
      fontWeight: "bold",
      fontSize: "14px"
    },
    userName: {
      fontSize: "14px",
      fontWeight: "500",
      color: "white"
    },
    logoutBtn: {
      background: "none",
      border: "none",
      color: "white",
      fontWeight: "600",
      padding: "8px 12px",
      cursor: "pointer",
      fontSize: "16px",
      borderRadius: "5px",
      transition: "all 0.3s ease"
    },
    darkModeBtn: {
      background: "none",
      border: "none",
      fontSize: "18px",
      cursor: "pointer",
      padding: "8px",
      borderRadius: "50%",
      transition: "all 0.3s ease",
      width: "35px",
      height: "35px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    // Mobile responsive styles
    mobileNavList: {
      flexDirection: "column",
      gap: 0,
      width: "100%",
      position: "absolute",
      top: "70px",
      left: "-100%",
      backgroundColor: "#17395f",
      transition: "left 0.3s ease",
      zIndex: 1000,
      padding: 0,
      margin: 0
    },
    mobileNavListOpen: {
      left: 0
    },
    mobileNavItem: {
      width: "100%",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
    },
    mobileNavLink: {
      display: "block",
      padding: "15px 20px",
      width: "100%",
      textAlign: "left",
      color: "white",
      textDecoration: "none"
    }
  };

  // Check if mobile (you can use a state for this)
  const isMobile = window.innerWidth <= 768;
  const currentNavListStyle = isMobile && isMenuOpen ? { ...styles.mobileNavList, ...styles.mobileNavListOpen } : (isMobile ? styles.mobileNavList : styles.navList);

  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <img src={logo} alt="Basketball Logo" style={styles.logoImage} />
        <h1 style={styles.logoText}>Basketball Portfolio</h1>
      </div>

      <button 
        className="mobile-menu-btn" 
        onClick={toggleMenu} 
        aria-label="Menu"
        style={styles.mobileMenuBtn}
      >
        {isMenuOpen ? "✕" : "☰"}
      </button>

      <nav style={styles.nav}>
        <ul style={currentNavListStyle}>
          <li style={isMobile ? styles.mobileNavItem : {}}>
            <Link 
              to="/home" 
              onClick={() => setIsMenuOpen(false)}
              style={location.pathname === "/home" ? { ...styles.navLink, ...styles.activeLink } : styles.navLink}
            >
              Home
            </Link>
          </li>
          <li style={isMobile ? styles.mobileNavItem : {}}>
            <Link 
              to="/about" 
              onClick={() => setIsMenuOpen(false)}
              style={location.pathname === "/about" ? { ...styles.navLink, ...styles.activeLink } : styles.navLink}
            >
              About
            </Link>
          </li>
          <li style={isMobile ? styles.mobileNavItem : {}}>
            <Link 
              to="/contact" 
              onClick={() => setIsMenuOpen(false)}
              style={location.pathname === "/contact" ? { ...styles.navLink, ...styles.activeLink } : styles.navLink}
            >
              Contact
            </Link>
          </li>
          
          {!isAuthenticated() && (
            <li style={isMobile ? styles.mobileNavItem : {}}>
              <Link 
                to="/register" 
                onClick={() => setIsMenuOpen(false)}
                style={location.pathname === "/register" ? { ...styles.navLink, ...styles.activeLink } : styles.navLink}
              >
                Register
              </Link>
            </li>
          )}
          
          {isAuthenticated() ? (
            <>
              <li style={isMobile ? styles.mobileNavItem : {}}>
                <div style={styles.userGreeting}>
                  {avatarUrl ? (
                    <div style={styles.userAvatarWrapper}>
                      <img 
                        src={avatarUrl} 
                        alt={user?.name}
                        style={styles.userAvatarImg}
                        onError={() => setAvatarError(true)}
                      />
                    </div>
                  ) : (
                    <div style={styles.userAvatar} title={user?.name}>
                      <span style={styles.userAvatarSpan}>{getUserInitials()}</span>
                    </div>
                  )}
                  <span style={styles.userName}>{user?.name?.split(' ')[0]}</span>
                </div>
              </li>
              
              {isAdmin() && (
                <li style={isMobile ? styles.mobileNavItem : {}}>
                  <Link 
                    to="/admin" 
                    onClick={() => setIsMenuOpen(false)}
                    style={location.pathname === "/admin" ? { ...styles.navLink, ...styles.activeLink } : styles.navLink}
                  >
                    📊 Admin
                  </Link>
                </li>
              )}
              
              <li style={isMobile ? styles.mobileNavItem : {}}>
                <Link 
                  to="/profile" 
                  onClick={() => setIsMenuOpen(false)}
                  style={location.pathname === "/profile" ? { ...styles.navLink, ...styles.activeLink } : styles.navLink}
                >
                  👤 Profile
                </Link>
              </li>
              
              <li style={isMobile ? styles.mobileNavItem : {}}>
                <Link 
                  to="/create-post" 
                  onClick={() => setIsMenuOpen(false)}
                  style={location.pathname === "/create-post" ? { ...styles.navLink, ...styles.activeLink } : styles.navLink}
                >
                  ✍️ Create Post
                </Link>
              </li>
              
              <li style={isMobile ? styles.mobileNavItem : {}}>
                <button 
                  onClick={handleLogout} 
                  style={styles.logoutBtn}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(220, 53, 69, 0.3)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  🚪 Logout
                </button>
              </li>
            </>
          ) : (
            <li style={isMobile ? styles.mobileNavItem : {}}>
              <Link 
                to="/login" 
                onClick={() => setIsMenuOpen(false)}
                style={location.pathname === "/login" ? { ...styles.navLink, ...styles.activeLink } : styles.navLink}
              >
                🔑 Login
              </Link>
            </li>
          )}
          
          <li style={isMobile ? styles.mobileNavItem : {}}>
            <button 
              onClick={() => {
                toggleDarkMode();
                setIsMenuOpen(false);
              }}
              style={styles.darkModeBtn}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Nav;