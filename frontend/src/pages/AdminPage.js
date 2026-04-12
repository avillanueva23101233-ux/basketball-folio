// frontend/src/pages/AdminPage.js

import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminAPI, postsAPI } from "../api/axios";
import Nav from "../components/Nav";
import PostCard from "../components/PostCard";

function AdminPage({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const fileInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState("posts");
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    totalLikes: 0
  });
  
  const [newPost, setNewPost] = useState({
    title: "",
    category: "",
    content: "",
    imageUrl: "",
    imageFile: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const categories = ["Personal Story", "Training Tips", "Life Lessons", "Game Analysis", "Equipment Review"];

  // Check if user is admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate("/home");
    }
  }, [isAdmin, navigate]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [usersResponse, postsResponse] = await Promise.all([
          adminAPI.getAllUsers(),
          adminAPI.getAllPosts()
        ]);
        
        const usersData = usersResponse?.data || (Array.isArray(usersResponse) ? usersResponse : []);
        const postsData = postsResponse?.data || (Array.isArray(postsResponse) ? postsResponse : []);
        
        setUsers(usersData);
        setPosts(postsData);
        
        const published = postsData.filter(p => p.status === "published").length;
        const drafts = postsData.filter(p => p.status === "draft").length;
        const totalViews = postsData.reduce((sum, p) => sum + (p.views || 0), 0);
        const totalLikes = postsData.reduce((sum, p) => sum + (p.likes || 0), 0);
        
        setStats({
          totalUsers: usersData.length,
          totalPosts: postsData.length,
          publishedPosts: published,
          draftPosts: drafts,
          totalViews: totalViews,
          totalLikes: totalLikes
        });
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setError(error.response?.data?.message || "Failed to load data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        alert("Please select an image file");
        return;
      }
      
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setNewPost({ ...newPost, imageFile: file, imageUrl: "" });
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("⚠️ Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        await adminAPI.deletePost(postId);
        const deletedPost = posts.find(p => p.id === postId);
        setPosts(posts.filter(post => post.id !== postId));
        setStats(prev => ({
          ...prev,
          totalPosts: prev.totalPosts - 1,
          publishedPosts: deletedPost?.status === "published" ? prev.publishedPosts - 1 : prev.publishedPosts,
          draftPosts: deletedPost?.status === "draft" ? prev.draftPosts - 1 : prev.draftPosts,
          totalViews: prev.totalViews - (deletedPost?.views || 0),
          totalLikes: prev.totalLikes - (deletedPost?.likes || 0)
        }));
        alert("✅ Post deleted successfully!");
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("❌ Failed to delete post. Please try again.");
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("⚠️ Are you sure you want to delete this user? All their posts will also be deleted.")) {
      try {
        await adminAPI.deleteUser(userId);
        const userToDelete = users.find(u => u.id === userId);
        const userPostsCount = userToDelete?.posts || 0;
        setUsers(users.filter(user => user.id !== userId));
        setStats(prev => ({
          ...prev,
          totalUsers: prev.totalUsers - 1,
          totalPosts: prev.totalPosts - userPostsCount
        }));
        alert("✅ User deleted successfully!");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("❌ Failed to delete user. Please try again.");
      }
    }
  };

  const handlePublishPost = async (postId) => {
    try {
      await adminAPI.updatePostStatus(postId, "published");
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, status: "published" } : post
      ));
      setStats(prev => ({
        ...prev,
        publishedPosts: prev.publishedPosts + 1,
        draftPosts: prev.draftPosts - 1
      }));
      alert("✅ Post published successfully!");
    } catch (error) {
      console.error("Error publishing post:", error);
      alert("❌ Failed to publish post. Please try again.");
    }
  };

  const handleUnpublishPost = async (postId) => {
    if (window.confirm("Are you sure you want to unpublish this post?")) {
      try {
        await adminAPI.updatePostStatus(postId, "draft");
        setPosts(posts.map(post => 
          post.id === postId ? { ...post, status: "draft" } : post
        ));
        setStats(prev => ({
          ...prev,
          publishedPosts: prev.publishedPosts - 1,
          draftPosts: prev.draftPosts + 1
        }));
        alert("✅ Post unpublished successfully!");
      } catch (error) {
        console.error("Error unpublishing post:", error);
        alert("❌ Failed to unpublish post. Please try again.");
      }
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    let errors = {};
    if (!newPost.title.trim()) {
      errors.title = "Title is required";
    } else if (newPost.title.length < 5) {
      errors.title = "Title must be at least 5 characters";
    }
    
    if (!newPost.category) {
      errors.category = "Please select a category";
    }
    
    if (!newPost.content.trim()) {
      errors.content = "Content is required";
    } else if (newPost.content.length < 50) {
      errors.content = "Content must be at least 50 characters";
    }
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      setCreating(true);
      
      try {
        let imageUrl = newPost.imageUrl;
        
        if (newPost.imageFile) {
          const formData = new FormData();
          formData.append('image', newPost.imageFile);
          const uploadResponse = await postsAPI.uploadImage(formData);
          imageUrl = uploadResponse.data?.url || uploadResponse.url;
        }
        
        const postData = {
          title: newPost.title,
          category: newPost.category,
          content: newPost.content,
          imageUrl: imageUrl,
          status: "published"
        };
        
        const response = await postsAPI.createPost(postData);
        const newPostData = response.data || response;
        
        setPosts([newPostData, ...posts]);
        setStats(prev => ({
          ...prev,
          totalPosts: prev.totalPosts + 1,
          publishedPosts: prev.publishedPosts + 1
        }));
        
        alert("✅ Post created successfully!");
        setNewPost({ title: "", category: "", content: "", imageUrl: "", imageFile: null });
        setImagePreview("");
        setShowCreateForm(false);
      } catch (error) {
        console.error("Error creating post:", error);
        alert("❌ Failed to create post. Please try again.");
      } finally {
        setCreating(false);
      }
    }
  };

  // Filter posts based on search and status
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || post.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <>
        <Nav darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <div style={{ textAlign: "center", padding: "60px" }}>
          <div className="spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <div className="about-container">
        <section className="registerie" style={{ 
          width: "95%", 
          maxWidth: "1400px", 
          margin: "30px auto",
          padding: "25px",
          overflowX: "auto"
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
            <div>
              <h2 style={{ margin: 0 }}>👑 Admin Dashboard</h2>
              <p style={{ margin: "5px 0 0", color: "#666" }}>Welcome back, {user?.name}!</p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Link to="/profile" style={{ color: "orange", textDecoration: "none", padding: "8px 16px", backgroundColor: "rgba(255, 165, 0, 0.1)", borderRadius: "5px" }}>
                👤 My Profile
              </Link>
              <button 
                onClick={() => setShowCreateForm(!showCreateForm)} 
                style={{ 
                  padding: "8px 16px", 
                  backgroundColor: "#28a745", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "5px", 
                  cursor: "pointer" 
                }}
              >
                {showCreateForm ? "✕ Cancel" : "+ Create New Post"}
              </button>
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
          </div>
          
          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center"
            }}>
              ❌ {error}
            </div>
          )}
          
          {/* Statistics Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "15px",
            marginBottom: "30px"
          }}>
            <div style={{ backgroundColor: "rgba(23, 57, 95, 0.1)", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: "orange" }}>{stats.totalUsers}</div>
              <div style={{ fontSize: "12px" }}>👥 Total Users</div>
            </div>
            <div style={{ backgroundColor: "rgba(23, 57, 95, 0.1)", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: "orange" }}>{stats.totalPosts}</div>
              <div style={{ fontSize: "12px" }}>📝 Total Posts</div>
            </div>
            <div style={{ backgroundColor: "rgba(23, 57, 95, 0.1)", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: "orange" }}>{stats.publishedPosts}</div>
              <div style={{ fontSize: "12px" }}>✅ Published</div>
            </div>
            <div style={{ backgroundColor: "rgba(23, 57, 95, 0.1)", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: "orange" }}>{stats.draftPosts}</div>
              <div style={{ fontSize: "12px" }}>📝 Drafts</div>
            </div>
          </div>
          
          {/* Create Post Form */}
          {showCreateForm && (
            <div style={{
              backgroundColor: "var(--section-bg)",
              padding: "25px",
              borderRadius: "10px",
              marginBottom: "30px",
              border: "2px solid orange"
            }}>
              <h3 style={{ marginBottom: "20px" }}>📝 Create New Post</h3>
              <form onSubmit={handleCreatePost}>
                <label>📌 Title:</label>
                <input
                  type="text"
                  placeholder="Enter post title (min. 5 characters)"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  disabled={creating}
                />
                {formErrors.title && <span className="error">{formErrors.title}</span>}
                
                <label>🏷️ Category:</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                  disabled={creating}
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                    borderRadius: "5px",
                    border: "2px solid orange",
                    backgroundColor: "var(--form-bg)",
                    color: "var(--text-color)"
                  }}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {formErrors.category && <span className="error">{formErrors.category}</span>}
                
                <label>🖼️ Featured Image:</label>
                {imagePreview && (
                  <div style={{ marginBottom: "10px" }}>
                    <img src={imagePreview} alt="Preview" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px" }} />
                  </div>
                )}
                <input
                  type="url"
                  placeholder="Or enter image URL: https://example.com/image.jpg"
                  value={newPost.imageUrl}
                  onChange={(e) => {
                    setNewPost({...newPost, imageUrl: e.target.value, imageFile: null});
                    setImagePreview(e.target.value);
                  }}
                  disabled={creating || uploadingImage}
                  style={{ marginBottom: "10px" }}
                />
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button type="button" onClick={handleImageClick} disabled={creating || uploadingImage} style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", width: "auto" }}>
                    📁 Upload Image
                  </button>
                  <span style={{ fontSize: "12px", color: "#666" }}>(Max 5MB, JPG/PNG)</span>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
                {uploadingImage && <p>Uploading image...</p>}
                
                <label>📝 Content:</label>
                <textarea
                  rows="6"
                  placeholder="Write your post content here... (minimum 50 characters)"
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  disabled={creating}
                />
                {formErrors.content && <span className="error">{formErrors.content}</span>}
                
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" disabled={creating || uploadingImage}>
                    {creating ? "Creating..." : "✅ Publish Post"}
                  </button>
                  <button type="button" onClick={() => { setShowCreateForm(false); setNewPost({ title: "", category: "", content: "", imageUrl: "", imageFile: null }); setImagePreview(""); setFormErrors({}); }} style={{ backgroundColor: "#6c757d" }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Tabs Navigation */}
          <div style={{ display: "flex", gap: "10px", borderBottom: "2px solid orange", marginBottom: "20px", flexWrap: "wrap" }}>
            <button onClick={() => setActiveTab("posts")} style={{ padding: "10px 20px", backgroundColor: activeTab === "posts" ? "orange" : "transparent", color: activeTab === "posts" ? "#17395f" : "inherit", border: "none", cursor: "pointer", fontWeight: "bold", borderRadius: "5px 5px 0 0", transition: "all 0.3s ease" }}>
              📋 Posts ({filteredPosts.length})
            </button>
            <button onClick={() => setActiveTab("users")} style={{ padding: "10px 20px", backgroundColor: activeTab === "users" ? "orange" : "transparent", color: activeTab === "users" ? "#17395f" : "inherit", border: "none", cursor: "pointer", fontWeight: "bold", borderRadius: "5px 5px 0 0", transition: "all 0.3s ease" }}>
              👥 Users ({users.length})
            </button>
          </div>
          
          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div>
              <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="🔍 Search posts by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid orange", backgroundColor: "var(--form-bg)", color: "var(--text-color)" }}
                />
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: "10px", borderRadius: "5px", border: "1px solid orange", backgroundColor: "var(--form-bg)", color: "var(--text-color)" }}>
                  <option value="all">All Status</option>
                  <option value="published">✅ Published</option>
                  <option value="draft">📝 Draft</option>
                </select>
              </div>
              
              {filteredPosts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", backgroundColor: "var(--section-bg)", borderRadius: "10px" }}>
                  <p style={{ fontSize: "18px", marginBottom: "20px" }}>📭 No posts found</p>
                  {posts.length === 0 && (
                    <button onClick={() => setShowCreateForm(true)} style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                      + Create Your First Post
                    </button>
                  )}
                </div>
              ) : (
                <div className="posts-grid">
                  {filteredPosts.map(post => (
                    <PostCard 
                      key={post.id} 
                      post={{ ...post, status: post.status || "published" }}
                      onDelete={handleDeletePost}
                      onEdit={(id) => navigate(`/edit-post/${id}`)}
                      onPublish={post.status !== "published" ? () => handlePublishPost(post.id) : undefined}
                      onUnpublish={post.status === "published" ? () => handleUnpublishPost(post.id) : undefined}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Users Tab - IMPROVED WITH BETTER SCROLLING */}
          {activeTab === "users" && (
            <div>
              {users.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", backgroundColor: "var(--section-bg)", borderRadius: "10px" }}>
                  <p style={{ fontSize: "18px", marginBottom: "20px" }}>👥 No users yet</p>
                  <p>Users will appear here once they register</p>
                </div>
              ) : (
                <div style={{ 
                  overflowX: "auto", 
                  overflowY: "visible",
                  margin: "0 -10px",
                  padding: "0 10px"
                }}>
                  <table style={{ 
                    width: "100%", 
                    minWidth: "900px",
                    borderCollapse: "collapse",
                    backgroundColor: "var(--form-bg)",
                    borderRadius: "8px",
                    overflow: "hidden"
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: "#17395f", color: "white" }}>
                        <th style={{ padding: "14px", textAlign: "left", whiteSpace: "nowrap" }}>ID</th>
                        <th style={{ padding: "14px", textAlign: "left", whiteSpace: "nowrap" }}>👤 Name</th>
                        <th style={{ padding: "14px", textAlign: "left", whiteSpace: "nowrap" }}>📧 Email</th>
                        <th style={{ padding: "14px", textAlign: "left", whiteSpace: "nowrap" }}>👑 Role</th>
                        <th style={{ padding: "14px", textAlign: "center", whiteSpace: "nowrap" }}>📝 Posts</th>
                        <th style={{ padding: "14px", textAlign: "left", whiteSpace: "nowrap" }}>📅 Joined</th>
                        <th style={{ padding: "14px", textAlign: "center", whiteSpace: "nowrap" }}>⚙️ Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(userItem => (
                        <tr key={userItem.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                          <td style={{ padding: "12px", whiteSpace: "nowrap" }}>{userItem.id}</td>
                          <td style={{ padding: "12px", whiteSpace: "nowrap" }}><strong>{userItem.name}</strong></td>
                          <td style={{ padding: "12px", whiteSpace: "nowrap" }}>{userItem.email}</td>
                          <td style={{ padding: "12px", whiteSpace: "nowrap" }}>
                            <span style={{ 
                              backgroundColor: userItem.role === "admin" ? "orange" : "#28a745", 
                              color: "white", 
                              padding: "4px 10px", 
                              borderRadius: "20px", 
                              fontSize: "12px", 
                              fontWeight: "bold", 
                              display: "inline-block" 
                            }}>
                              {userItem.role === "admin" ? "👑 Admin" : "👤 User"}
                            </span>
                          </td>
                          <td style={{ padding: "12px", textAlign: "center", whiteSpace: "nowrap" }}>{userItem.posts || 0}</td>
                          <td style={{ padding: "12px", whiteSpace: "nowrap" }}>{userItem.joined || "N/A"}</td>
                          <td style={{ padding: "12px", textAlign: "center", whiteSpace: "nowrap" }}>
                            {userItem.role !== "admin" && (
                              <button 
                                onClick={() => handleDeleteUser(userItem.id)} 
                                style={{ 
                                  padding: "6px 14px", 
                                  fontSize: "12px", 
                                  backgroundColor: "#dc3545", 
                                  color: "white", 
                                  border: "none", 
                                  borderRadius: "5px", 
                                  cursor: "pointer", 
                                  transition: "all 0.3s ease" 
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#c82333"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "#dc3545"}
                              >
                                🗑️ Delete
                              </button>
                            )}
                            {userItem.role === "admin" && <span style={{ fontSize: "12px", color: "#666" }}>Cannot delete</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
      
      <footer>
        <p>📧 Email: aldrinvillanueva@email.com | 📞 Phone: 099-192-31885</p>
        <p>👑 Admin Dashboard - Manage Basketball Community | &copy; 2026</p>
      </footer>
    </>
  );
}

export default AdminPage;