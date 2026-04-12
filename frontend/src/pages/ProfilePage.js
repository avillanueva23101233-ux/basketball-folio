// frontend/src/pages/ProfilePage.js

import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userAPI, postsAPI } from "../api/axios";
import Nav from "../components/Nav";
import PostCard from "../components/PostCard";

function ProfilePage({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [userPosts, setUserPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingPost, setDeletingPost] = useState(null);
  const fileInputRef = useRef(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    bio: "",
    avatar: ""
  });
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0
  });

  // Base URL for avatar images
  const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    console.log("User data from AuthContext:", user);
    console.log("User avatar path:", user.avatar);
    console.log("Full avatar URL:", user.avatar ? `${API_BASE_URL}${user.avatar}` : 'No avatar');
    
    const userAvatar = user.avatar || "";
    
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      bio: user.bio || "🏀 Basketball enthusiast passionate about the game!",
      avatar: userAvatar
    });
    
    const fetchUserPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await postsAPI.getPostsByUser(user.id);
        
        let posts = [];
        if (response && Array.isArray(response)) {
          posts = response;
        } else if (response && response.posts && Array.isArray(response.posts)) {
          posts = response.posts;
        } else if (response && response.data && Array.isArray(response.data)) {
          posts = response.data;
        } else {
          posts = [];
        }
        
        const safePosts = Array.isArray(posts) ? posts : [];
        setUserPosts(safePosts);
        
        const totalLikes = safePosts.reduce((sum, post) => sum + (post?.likes || 0), 0);
        const totalComments = safePosts.reduce((sum, post) => sum + (post?.comments || 0), 0);
        const totalViews = safePosts.reduce((sum, post) => sum + (post?.views || 0), 0);
        
        setStats({
          totalPosts: safePosts.length,
          totalLikes: totalLikes,
          totalComments: totalComments,
          totalViews: totalViews
        });
      } catch (error) {
        console.error("Error fetching user posts:", error);
        setError("Failed to load your posts. Please try again.");
        setUserPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [user, navigate, API_BASE_URL]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log("Selected file:", file.name, file.size, file.type);
    
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB");
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      alert("Please select an image file (JPG, PNG, GIF)");
      return;
    }
    
    setUploadingAvatar(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await userAPI.updateAvatar(formData);
      console.log("Upload response:", response);
      
      if (response.success && response.avatarUrl) {
        console.log("Avatar URL received:", response.avatarUrl);
        
        setEditForm(prev => ({ ...prev, avatar: response.avatarUrl }));
        
        const updatedUser = {
          ...user,
          avatar: response.avatarUrl
        };
        updateUser(updatedUser);
        
        setAvatarKey(Date.now());
        
        setSuccessMessage("Avatar updated successfully!");
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setSuccessMessage("");
        }, 3000);
      } else {
        throw new Error(response.message || "No avatar URL returned from server");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setError(error.response?.data?.message || "Failed to upload avatar. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!editForm.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!editForm.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!editForm.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    
    try {
      const updateData = {
        name: editForm.name.trim(),
        email: editForm.email.trim().toLowerCase(),
        bio: editForm.bio.trim()
      };
      
      await userAPI.updateProfile(updateData);
      
      const updatedUser = {
        ...user,
        name: editForm.name.trim(),
        email: editForm.email.trim().toLowerCase(),
        bio: editForm.bio.trim()
      };
      updateUser(updatedUser);
      
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "Failed to update profile. Please try again.");
    }
  };

  // FIXED: Handle delete post with proper ID handling
  const handleDeletePost = async (postId) => {
    if (window.confirm("⚠️ Are you sure you want to delete this post? This action cannot be undone.")) {
      setDeletingPost(postId);
      try {
        console.log("Deleting post with ID:", postId);
        await postsAPI.deletePost(postId);
        
        // Find the post by either _id or id
        const deletedPost = userPosts.find(post => post?._id === postId || post?.id === postId);
        
        setUserPosts(prevPosts => prevPosts.filter(post => post?._id !== postId && post?.id !== postId));
        
        setStats(prev => ({
          totalPosts: Math.max(0, prev.totalPosts - 1),
          totalLikes: Math.max(0, prev.totalLikes - (deletedPost?.likes || 0)),
          totalComments: Math.max(0, prev.totalComments - (deletedPost?.comments || 0)),
          totalViews: Math.max(0, prev.totalViews - (deletedPost?.views || 0))
        }));
        
        alert("✅ Post deleted successfully!");
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("❌ Failed to delete post. Please try again.");
      } finally {
        setDeletingPost(null);
      }
    }
  };

  const getUserInitials = () => {
    if (editForm.name) {
      return editForm.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  if (!user) {
    return null;
  }

  const getFullAvatarUrl = () => {
    if (editForm.avatar) {
      return `${API_BASE_URL}${editForm.avatar}`;
    }
    if (user.avatar) {
      return `${API_BASE_URL}${user.avatar}`;
    }
    return "";
  };

  const avatarUrl = getFullAvatarUrl();
  console.log("Displaying avatar URL:", avatarUrl);

  return (
    <>
      <Nav darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <div className="about-container">
        <section className="aboutie" style={{ 
          width: "90%", 
          maxWidth: "1200px", 
          margin: "30px auto",
          padding: "25px"
        }}>
          
          {/* Header Section */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "30px", 
            flexWrap: "wrap", 
            gap: "15px" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
              {/* Avatar with Edit Option */}
              <div style={{ position: "relative" }}>
                {avatarUrl ? (
                  <img 
                    key={avatarKey}
                    src={avatarUrl} 
                    alt={user.name}
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      cursor: "pointer",
                      border: "3px solid orange"
                    }}
                    onClick={handleAvatarClick}
                    onError={(e) => {
                      console.log("Image failed to load:", avatarUrl);
                      e.target.style.display = "none";
                      const parent = e.target.parentElement;
                      const initialsDiv = document.createElement('div');
                      initialsDiv.className = "user-avatar";
                      initialsDiv.style.cssText = "width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg, #E68C3A, #ff9800);display:flex;align-items:center;justify-content:center;border:3px solid orange;cursor:pointer";
                      initialsDiv.innerHTML = `<span style="font-size:40px;color:white;font-weight:bold">${getUserInitials()}</span>`;
                      parent.appendChild(initialsDiv);
                      e.target.remove();
                    }}
                  />
                ) : (
                  <div 
                    className="user-avatar" 
                    style={{ 
                      width: "100px", 
                      height: "100px",
                      cursor: "pointer",
                      border: "3px solid orange",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #E68C3A, #ff9800)"
                    }}
                    onClick={handleAvatarClick}
                  >
                    <span style={{ fontSize: "40px", color: "white", fontWeight: "bold" }}>{getUserInitials()}</span>
                  </div>
                )}
                <button
                  onClick={handleAvatarClick}
                  style={{
                    position: "absolute",
                    bottom: "5px",
                    right: "5px",
                    backgroundColor: "orange",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    zIndex: 10
                  }}
                  title="Change avatar"
                >
                  📷
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                  disabled={uploadingAvatar}
                />
              </div>
              
              <div>
                <h2 style={{ margin: 0 }}>{user.name}</h2>
                <p style={{ margin: "5px 0 0", color: "#666" }}>
                  {user.role === "admin" ? "👑 Administrator" : "👤 Community Member"}
                </p>
                <p style={{ margin: "5px 0 0", fontSize: "12px", color: "#666" }}>
                  📅 Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "April 2026"}
                </p>
              </div>
            </div>
            
            <button
              onClick={logout}
              style={{
                padding: "8px 16px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              🚪 Logout
            </button>
          </div>
          
          {uploadingAvatar && (
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <div className="spinner" style={{ width: "30px", height: "30px" }}></div>
              <p>Uploading avatar...</p>
            </div>
          )}
          
          {/* Success Message */}
          {success && successMessage && (
            <div style={{
              backgroundColor: "#d4edda",
              color: "#155724",
              padding: "12px",
              borderRadius: "5px",
              marginBottom: "20px",
              textAlign: "center"
            }}>
              ✅ {successMessage}
            </div>
          )}
          
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
          
          {!isEditing ? (
            <div>
              {/* Statistics Cards */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: "15px",
                marginBottom: "30px"
              }}>
                <div style={{ backgroundColor: "rgba(23, 57, 95, 0.1)", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "orange" }}>{stats.totalPosts}</div>
                  <div style={{ fontSize: "12px" }}>📝 Posts</div>
                </div>
                <div style={{ backgroundColor: "rgba(23, 57, 95, 0.1)", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "orange" }}>{stats.totalLikes}</div>
                  <div style={{ fontSize: "12px" }}>❤️ Likes</div>
                </div>
                <div style={{ backgroundColor: "rgba(23, 57, 95, 0.1)", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "orange" }}>{stats.totalComments}</div>
                  <div style={{ fontSize: "12px" }}>💬 Comments</div>
                </div>
                <div style={{ backgroundColor: "rgba(23, 57, 95, 0.1)", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "orange" }}>{stats.totalViews}</div>
                  <div style={{ fontSize: "12px" }}>👁️ Views</div>
                </div>
              </div>
              
              {/* Personal Information Section */}
              <div style={{ marginBottom: "30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3>📋 Personal Information</h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: "6px 16px",
                      backgroundColor: "orange",
                      color: "#17395f",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer"
                    }}
                  >
                    ✏️ Edit Profile
                  </button>
                </div>
                
                <div style={{ 
                  backgroundColor: "rgba(23, 57, 95, 0.05)", 
                  padding: "15px", 
                  borderRadius: "8px"
                }}>
                  <p><strong>📧 Email:</strong> {user.email}</p>
                  <p><strong>📝 Bio:</strong> {user.bio || "No bio added yet"}</p>
                </div>
              </div>
              
              {/* User Posts Section */}
              <div style={{ borderTop: "2px solid orange", paddingTop: "30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3>📝 My Posts</h3>
                  <Link to="/create-post">
                    <button style={{ 
                      padding: "8px 16px", 
                      backgroundColor: "#28a745", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "5px", 
                      cursor: "pointer"
                    }}>
                      + Create New Post
                    </button>
                  </Link>
                </div>
                
                {loading ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <div className="spinner"></div>
                    <p>Loading your posts...</p>
                  </div>
                ) : !Array.isArray(userPosts) || userPosts.length === 0 ? (
                  <div style={{ 
                    textAlign: "center", 
                    padding: "40px", 
                    backgroundColor: "var(--section-bg)", 
                    borderRadius: "8px" 
                  }}>
                    <p>📭 You haven't created any posts yet.</p>
                    <Link to="/create-post">
                      <button style={{ 
                        marginTop: "10px", 
                        padding: "8px 16px", 
                        backgroundColor: "orange", 
                        color: "#17395f", 
                        border: "none", 
                        borderRadius: "5px", 
                        cursor: "pointer" 
                      }}>
                        Create Your First Post
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="posts-grid">
                    {userPosts.map((post) => (
                      <PostCard 
                        key={post?._id || post?.id || Math.random()} 
                        post={post} 
                        onDelete={handleDeletePost}
                        onEdit={(id) => navigate(`/edit-post/${id}`)}
                        isDeleting={deletingPost === post?._id || deletingPost === post?.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Edit Profile Form
            <form onSubmit={handleEditSubmit} style={{ maxWidth: "100%" }}>
              <h3>✏️ Edit Profile</h3>
              
              <label>👤 Full Name:</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                required
              />
              
              <label>📧 Email:</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                required
              />
              
              <label>📝 Bio:</label>
              <textarea
                rows="4"
                value={editForm.bio}
                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                placeholder="Tell us about your basketball journey..."
                style={{ resize: "vertical", minHeight: "100px" }}
              />
              
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="submit">💾 Save Changes</button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      name: user.name || "",
                      email: user.email || "",
                      bio: user.bio || "",
                      avatar: user.avatar || ""
                    });
                  }}
                  style={{ backgroundColor: "#6c757d" }}
                >
                  Cancel
                </button>
              </div>
            </form>
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

export default ProfilePage;