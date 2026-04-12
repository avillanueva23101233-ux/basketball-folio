// frontend/src/pages/CreatePostPage.js

import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postsAPI } from "../api/axios";
import Nav from "../components/Nav";

function CreatePostPage({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  const [form, setForm] = useState({ 
    title: "", 
    category: "", 
    content: "", 
    imageUrl: "",
    imageFile: null
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const categories = ["Personal Story", "Training Tips", "Life Lessons", "Game Analysis", "Equipment Review"];

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
    setImagePreview("");
    setForm({ ...form, imageUrl: "", imageFile: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    
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
      setLoading(true);
      
      try {
        let finalImageUrl = form.imageUrl;
        
        // Upload image if a file was selected
        if (form.imageFile) {
          const formData = new FormData();
          formData.append('image', form.imageFile);
          
          try {
            const uploadResponse = await postsAPI.uploadImage(formData);
            finalImageUrl = uploadResponse.data?.url || uploadResponse.url || `/uploads/posts/${form.imageFile.name}`;
          } catch (uploadError) {
            console.error("Image upload error:", uploadError);
            // Continue without image if upload fails
          }
        }
        
        const postData = {
          title: form.title.trim(),
          category: form.category,
          content: form.content.trim(),
          imageUrl: finalImageUrl || "",
          authorId: user?.id,
          author: user?.name,
          status: "published"
        };
        
        console.log("Sending post data:", postData);
        
        // Make the actual API call
        const response = await postsAPI.createPost(postData);
        
        console.log("Create post response:", response);
        
        if (response.success || response.data) {
          setSuccess(true);
          setForm({ 
            title: "", 
            category: "", 
            content: "", 
            imageUrl: "",
            imageFile: null
          });
          setImagePreview("");
          
          // Redirect to HomePage after 2 seconds
          setTimeout(() => {
            setSuccess(false);
            navigate("/home");
          }, 2000);
        } else {
          throw new Error(response.message || "Failed to create post");
        }
      } catch (error) {
        console.error("Error creating post:", error);
        setErrorMessage(error.response?.data?.message || error.message || "❌ Failed to create post. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const contentLength = form.content.length;
  const isContentValid = contentLength >= 50 && contentLength <= 5000;

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
            <Link to="/home" style={{ color: "orange", textDecoration: "none" }}>
              🏠 View Home
            </Link>
          </div>
          
          <h2 style={{ textAlign: "center" }}>📝 Create New Post</h2>
          <p style={{ marginBottom: "20px", color: "#666", textAlign: "center" }}>
            Share your basketball experience, tips, or stories with the community
          </p>
          
          {errorMessage && (
            <div style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "12px",
              borderRadius: "5px",
              marginBottom: "20px",
              textAlign: "center"
            }}>
              ❌ {errorMessage}
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
              ✅ Post created successfully! Redirecting to home page...
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
                disabled={loading}
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
                disabled={loading}
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
            
            {/* Image Upload Section - IMPROVED */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                🖼️ Featured Image (Optional)
              </label>
              
              {/* Image Preview with Proper Remove Button */}
              {imagePreview && (
                <div style={{ 
                  marginBottom: "15px", 
                  position: "relative",
                  width: "100%",
                  borderRadius: "8px",
                  overflow: "hidden"
                }}>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{
                      width: "100%",
                      maxHeight: "250px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "2px solid orange"
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
                  {/* Display image URL */}
                  <div style={{
                    marginTop: "8px",
                    fontSize: "11px",
                    color: "#666",
                    wordBreak: "break-all",
                    backgroundColor: "rgba(0,0,0,0.05)",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    fontFamily: "monospace"
                  }}>
                    📍 Image URL: {form.imageUrl || imagePreview.substring(0, 50)}...
                  </div>
                </div>
              )}
              
              {/* Image URL Input */}
              <input
                type="url"
                placeholder="Or enter image URL: https://example.com/basketball-image.jpg"
                value={form.imageUrl}
                onChange={(e) => {
                  setForm({...form, imageUrl: e.target.value, imageFile: null});
                  setImagePreview(e.target.value);
                }}
                disabled={loading || uploadingImage}
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
                  disabled={loading || uploadingImage}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    width: "auto",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#5a6268"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#6c757d"}
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
                disabled={loading || uploadingImage}
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
                rows="6"
                placeholder="Write your post content here... (minimum 50 characters, maximum 5000 characters)"
                value={form.content}
                onChange={(e) => setForm({...form, content: e.target.value})}
                disabled={loading}
                style={{ 
                  resize: "none",
                  width: "100%",
                  height: "150px",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "2px solid orange",
                  backgroundColor: "var(--form-bg)",
                  color: "var(--text-color)",
                  fontFamily: "inherit",
                  overflowY: "auto",
                  boxSizing: "border-box"
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
            
            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading || uploadingImage}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "orange",
                color: "#17395f",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px",
                marginTop: "10px",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                if (!(loading || uploadingImage)) {
                  e.target.style.backgroundColor = "#ff9800";
                  e.target.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!(loading || uploadingImage)) {
                  e.target.style.backgroundColor = "orange";
                  e.target.style.transform = "translateY(0)";
                }
              }}
            >
              {loading ? "📤 Publishing..." : "📤 Publish Post"}
            </button>
          </form>
          
          {/* Live Preview Section */}
          {(form.title || form.content) && (
            <div style={{ 
              marginTop: "30px", 
              borderTop: "2px solid orange", 
              paddingTop: "20px"
            }}>
              <h3 style={{ textAlign: "center" }}>🔍 Live Preview</h3>
              <div style={{ 
                backgroundColor: "var(--section-bg)", 
                padding: "15px", 
                borderRadius: "8px",
                marginTop: "10px",
                maxHeight: "300px",
                overflowY: "auto",
                minHeight: "150px"
              }}>
                <h4 style={{ marginBottom: "10px", wordBreak: "break-word" }}>{form.title || "Your Title Here"}</h4>
                <p style={{ color: "#666", fontSize: "12px", marginBottom: "10px" }}>
                  By {user?.name || "You"} • Just now • Category: {form.category || "Uncategorized"}
                </p>
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ 
                      width: "100%", 
                      maxHeight: "150px", 
                      objectFit: "cover", 
                      borderRadius: "8px",
                      marginBottom: "10px"
                    }} 
                  />
                )}
                <p style={{ fontSize: "14px", lineHeight: "1.5", wordBreak: "break-word" }}>
                  {form.content.substring(0, 300)}{form.content.length > 300 ? "..." : ""}
                </p>
              </div>
            </div>
          )}
          
        </section>
      </div>
      
      <footer>
        <p>📧 Email: aldrinvillanueva@email.com | 📞 Phone: 099-192-31885</p>
        <p>🏀 &copy; 2026 Basketball Portfolio Project | Passion for the Game</p>
      </footer>
    </>
  );
}

export default CreatePostPage;