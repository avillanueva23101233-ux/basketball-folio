// frontend/src/pages/SplashPage.js

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logopic.jpg";

function SplashPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Fade in animation on load
    setFadeIn(true);
  }, []);

  return (
    <div className={`splash-body ${fadeIn ? "fade-in" : ""}`}>
      <div className="splash-container">
        {/* Logo */}
        <div className="logo-wrapper">
          <img 
            src={logo} 
            alt="Basketball Logo" 
            className="splash-logo"
          />
        </div>
        
        {/* Welcome Message */}
        <h1>Passion for Basketball</h1>
        <p className="subtitle">Your journey starts here</p>
        
        {/* Description */}
        <p className="splash-description">
          Join a community of basketball enthusiasts. Share your journey, 
          learn new skills, and connect with players who share your passion 
          for the game.
        </p>
        
        {/* Action Buttons */}
        <div className="splash-buttons">
          <Link to="/home" className="btn btn-primary">
            🏀 Explore as Guest
          </Link>
          
          {!isAuthenticated() && (
            <>
              <Link to="/login" className="btn btn-outline">
                🔑 Login
              </Link>
              <Link to="/register" className="btn btn-success">
                📝 Register Now
              </Link>
            </>
          )}
          
          {isAuthenticated() && (
            <Link to="/home" className="btn btn-success">
              🏀 Go to Dashboard
            </Link>
          )}
        </div>
        
        {/* Features Section */}
        <div className="splash-features">
          <div className="feature">
            <div className="feature-icon">🏀</div>
            <h4>Learn & Improve</h4>
            <p>Basketball tips and drills</p>
          </div>
          <div className="feature">
            <div className="feature-icon">👥</div>
            <h4>Connect</h4>
            <p>Join the community</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📝</div>
            <h4>Share</h4>
            <p>Your basketball journey</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SplashPage;