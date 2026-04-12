// frontend/src/pages/EditPostPage.js

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postsAPI } from "../api/axios";
import Nav from "../components/Nav";

function EditPostPage({ darkMode, toggleDarkMode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const fileInputRef = useRef(null);
  
  const [form, setForm] = useState({ 
    title: "", 
    category: "", 
    content: "", 
    imageUrl: "",
    imageFile: null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [postAuthorId, setPostAuthorId] = useState(null);
  
  // Base URL for images
  const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  const categories = ["Personal Story", "Training Tips", "Life Lessons", "Game Analysis", "Equipment Review"];

  // Fetch existing post data
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await postsAPI.getPostById(id);
        const postData = response.post || response;
        
        console.log("Fetched post data:", postData);
        
        setForm({
          title: postData.title || "",
          category: postData.category || "",
          content: postData.content || "",
          imageUrl: postData.imageUrl || "",
          imageFile: null
        });
        setImagePreview(postData.imageUrl ? `${API_BASE_URL}${postData.imageUrl}` : "");
        setPostAuthorId(postData.authorId);
      } catch (error) {
        console.error("Error fetching post:", error);
        setError(error.response?.data?.message || "Failed to load post. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, API_BASE_URL]);

  // Check permissions
  useEffect(() => {
    if (!loading && user && postAuthorId) {
      const hasPermission = user.id === postAuthorId || isAdmin;
      if (!hasPermission) {
        setError("You don't have permission to edit this post.");
        setTimeout(() => {
          navigate("/home");
        }, 2000);
      }
    }
  }, [loading, user, isAdmin, postAuthorId, navigate]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file (JPG, PNG, GIF)");
        return;
      }
      
      setUploadingImage(true);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setForm({ ...form, imageFile: file, imageUrl: "" });
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    console.log("Removing image...");
    setImagePreview("");
    setForm({ ...form, imageUrl: "", imageFile: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await postsAPI.uploadImage(formData);
      console.log("Upload response:", response);
      return response.imageUrl || response.url;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    let newErrors = {};
    if (!form.title.trim()) {
      newErrors.title = "⚠ Title is required";
    } else if (form.title.length < 5) {
      newErrors.title = "⚠ Title must be at least 5 characters";
    } else if (form.title.length > 100) {
      newErrors.title = "⚠ Title must be less than 100 characters";
    }
    
    if (!form.category) {
      newErrors.category = "⚠ Please select a category";
    }
    
    if (!form.content.trim()) {
      newErrors.content = "⚠ Content is required";
    } else if (form.content.length < 50) {
      newErrors.content = "⚠ Content must be at least 50 characters";
    } else if (form.content.length > 5000) {
      newErrors.content = "⚠ Content must be less than 5000 characters";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setSaving(true);
      
      try {
        let finalImageUrl = form.imageUrl;
        
        if (form.imageFile) {
          finalImageUrl = await uploadImage(form.imageFile);
          console.log("New image uploaded:", finalImageUrl);
        } else if (form.imageUrl === "" && !form.imageFile) {
          finalImageUrl = "";
          console.log("Image was removed, sending empty string");
        }
        
        const updateData = {
          title: form.title.trim(),
          category: form.category,
          content: form.content.trim(),
          imageUrl: finalImageUrl
        };
        
        console.log("Sending update data:", updateData);
        
        const response = await postsAPI.updatePost(id, updateData);
        console.log("Update response:", response);
        
        setSuccess(true);
        setTimeout(() => {
          navigate(`/post/${id}`);
        }, 2000);
      } catch (error) {
        console.error("Error updating post:", error);
        setError(error.response?.data?.message || "❌ Failed to update post. Please try again.");
      } finally {
        setSaving(false);
      }
    }
  };

  const contentLength = form.content.length;
  const isContentValid = contentLength >= 50 && contentLength <= 5000;

  if (loading) {
    return (
      <>
        <Nav darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <div style={{ textAlign: "center", padding: "60px" }}>
          <div className="spinner"></div>
          <p>Loading post data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <div className="about-container">
        <section className="registerie" style={{ 
          maxWidth: "800px", 
          width: "95%",
          margin: "30px auto",
          padding: "25px"
        }}>
          
          <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <Link to="/profile" style={{ color: "orange", textDecoration: "none" }}>
              ← Back to Profile
            </Link>
            <Link to={`/post/${id}`} style={{ color: "orange", textDecoration: "none" }}>
              View Post →
            </Link>
          </div>
          
          <h2 style={{ textAlign: "center" }}>✏️ Edit Post</h2>
          <p style={{ marginBottom: "20px", color: "#666", textAlign: "center" }}>
            Update your basketball post content and images
          </p>
          
          {error && (
            <div style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "12px",
              borderRadius: "5px",
              marginBottom: "20px",
              textAlign: "center"
            }}>
              ❌ {error}
            </div>
          )}
          
          {success && (
            <div style={{
              backgroundColor: "#d4edda",
              color: "#155724",
              padding: "12px",
              borderRadius: "5px",
              marginBottom: "20px",
              textAlign: "center"
            }}>
              ✅ Post updated successfully! Redirecting to post...
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            {/* Title Field */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                📌 Title <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Enter an engaging title (min. 5 characters)"
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                disabled={saving}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "2px solid orange",
                  backgroundColor: "var(--form-bg)",
                  color: "var(--text-color)",
                  boxSizing: "border-box"
                }}
              />
              {errors.title && <span className="error">{errors.title}</span>}
              <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                {form.title.length}/100 characters
              </div>
            </div>
            
            {/* Category Field */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                🏷️ Category <span style={{ color: "red" }}>*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
                disabled={saving}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "2px solid orange",
                  backgroundColor: "var(--form-bg)",
                  color: "var(--text-color)",
                  boxSizing: "border-box"
                }}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <span className="error">{errors.category}</span>}
            </div>
            
            {/* Image Upload Section */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                🖼️ Featured Image (Optional)
              </label>
              
              {/* Image Preview with Remove Button */}
              {(imagePreview || form.imageUrl) && (
                <div style={{ 
                  marginBottom: "15px", 
                  position: "relative",
                  width: "100%",
                  borderRadius: "8px",
                  overflow: "hidden"
                }}>
                  <img 
                    src={imagePreview || (form.imageUrl ? `${API_BASE_URL}${form.imageUrl}` : '')} 
                    alt="Preview" 
                    style={{
                      width: "100%",
                      maxHeight: "250px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "2px solid orange"
                    }}
                    onError={(e) => {
                      console.log("Image failed to load");
                      e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      padding: "6px 12px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                      zIndex: 10,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                    }}
                  >
                    🗑️ Remove Image
                  </button>
                </div>
              )}
              
              {/* Image URL Input */}
              <input
                type="url"
                placeholder="Or enter image URL: https://example.com/basketball-image.jpg"
                value={form.imageUrl}
                onChange={(e) => {
                  setForm({...form, imageUrl: e.target.value, imageFile: null});
                  setImagePreview("");
                }}
                disabled={saving || uploadingImage}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "2px solid orange",
                  backgroundColor: "var(--form-bg)",
                  color: "var(--text-color)",
                  marginBottom: "10px",
                  boxSizing: "border-box"
                }}
              />
              
              <div style={{ textAlign: "center", margin: "10px 0", color: "#666" }}>
                <span>──────── OR ────────</span>
              </div>
              
              {/* File Upload Button */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handleImageClick}
                  disabled={saving || uploadingImage}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    width: "auto"
                  }}
                >
                  📁 Upload Image from Computer
                </button>
                <span style={{ fontSize: "12px", color: "#666" }}>
                  (Max 5MB, JPG/PNG/GIF)
                </span>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
                disabled={saving || uploadingImage}
              />
              
              {uploadingImage && (
                <div style={{ marginTop: "10px" }}>
                  <div className="spinner" style={{ width: "30px", height: "30px" }}></div>
                  <p>Uploading image...</p>
                </div>
              )}
            </div>
            
            {/* Content Field */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                📝 Content <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                rows="10"
                placeholder="Write your post content here... (minimum 50 characters, maximum 5000 characters)"
                value={form.content}
                onChange={(e) => setForm({...form, content: e.target.value})}
                disabled={saving}
                style={{
                  resize: "vertical",
                  width: "100%",
                  minHeight: "200px",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "2px solid orange",
                  backgroundColor: "var(--form-bg)",
                  color: "var(--text-color)",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  overflowWrap: "break-word"
                }}
              />
              {errors.content && <span className="error">{errors.content}</span>}
              <div style={{ 
                fontSize: "12px", 
                color: isContentValid ? "#28a745" : "#666", 
                marginTop: "5px",
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap"
              }}>
                <span>{contentLength}/5000 characters</span>
                {contentLength > 0 && contentLength < 50 && (
                  <span style={{ color: "orange" }}>Need {50 - contentLength} more characters</span>
                )}
                {contentLength >= 50 && contentLength <= 5000 && (
                  <span style={{ color: "#28a745" }}>✅ Length is good</span>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button type="submit" disabled={saving || uploadingImage}>
                {saving ? "💾 Saving..." : "💾 Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/post/${id}`)}
                style={{ backgroundColor: "#6c757d" }}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
          
        </section>
      </div>
      
      <footer>
        <p>📧 Email: aldrinvillanueva@email.com | 📞 Phone: 099-192-31885</p>
        <p>🏀 &copy; 2026 Basketball Portfolio Project | Passion for the Game</p>
      </footer>
    </>
  );
}

export default EditPostPage;