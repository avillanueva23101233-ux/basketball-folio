// frontend/src/App.js

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Import Pages
import SplashPage from "./pages/SplashPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PostPage from "./pages/PostPage";
import ProfilePage from "./pages/ProfilePage";
import CreatePostPage from "./pages/CreatePostPage";
import EditPostPage from "./pages/EditPostPage";
import AdminPage from "./pages/AdminPage";

import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }
    setLoading(false);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        backgroundColor: "#f5f5f5"
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<SplashPage />} />
          <Route path="/home" element={<HomePage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/about" element={<AboutPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/contact" element={<ContactPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/register" element={<RegisterPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/login" element={<LoginPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          
          {/* Forgot Password Routes */}
          <Route path="/forgot-password" element={<ForgotPasswordPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          
          {/* Post Routes */}
          <Route path="/post/:id" element={<PostPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />

          {/* Protected Routes - Require Authentication */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </ProtectedRoute>
          } />
          <Route path="/create-post" element={
            <ProtectedRoute>
              <CreatePostPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </ProtectedRoute>
          } />
          <Route path="/edit-post/:id" element={
            <ProtectedRoute>
              <EditPostPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </ProtectedRoute>
          } />

          {/* Admin Only Routes */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </ProtectedRoute>
          } />

          {/* 404 Not Found Route */}
          <Route path="*" element={
            <div style={{ 
              textAlign: "center", 
              padding: "60px 20px",
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <h1 style={{ fontSize: "72px", color: "#E68C3A", marginBottom: "20px" }}>404</h1>
              <h2 style={{ marginBottom: "20px" }}>Page Not Found</h2>
              <p style={{ marginBottom: "30px" }}>The page you're looking for doesn't exist or has been moved.</p>
              <a href="/home" style={{ 
                padding: "12px 24px", 
                backgroundColor: "#E68C3A", 
                color: "white", 
                textDecoration: "none", 
                borderRadius: "5px",
                transition: "all 0.3s ease"
              }}>
                Go Back Home
              </a>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;