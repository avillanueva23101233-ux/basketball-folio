// frontend/src/pages/HomePage.js

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postsAPI } from "../api/axios";
import Nav from "../components/Nav";
import PostCard from "../components/PostCard";
import homepic from "../assets/homepic.jpg";

function HomePage({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingPostId, setDeletingPostId] = useState(null);

  // Fetch recent posts from API
  useEffect(() => {
    const fetchRecentPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await postsAPI.getAllPosts({ limit: 6 });
        
        console.log("Posts API response:", response);
        
        let posts = [];
        if (response && response.posts) {
          posts = response.posts;
        } else if (Array.isArray(response)) {
          posts = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          posts = response.data;
        }
        
        console.log("Posts to display:", posts);
        setRecentPosts(posts);
      } catch (err) {
        console.error("Error fetching recent posts:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPosts();
  }, []);

  const handleLike = async (postId) => {
    // Optimistically update UI
    setRecentPosts(recentPosts.map(post => 
      post._id === postId || post.id === postId
        ? { ...post, likes: (post.likes || 0) + (post.userLiked ? -1 : 1), userLiked: !post.userLiked }
        : post
    ));
    
    try {
      const post = recentPosts.find(p => p._id === postId || p.id === postId);
      if (post?.userLiked) {
        await postsAPI.unlikePost(postId);
      } else {
        await postsAPI.likePost(postId);
      }
    } catch (error) {
      console.error("Error liking post:", error);
      // Revert on error
      setRecentPosts(recentPosts.map(post => 
        post._id === postId || post.id === postId
          ? { ...post, likes: (post.likes || 0) + (post.userLiked ? 1 : -1), userLiked: !post.userLiked }
          : post
      ));
    }
  };

  // Handle Edit Post
  const handleEditPost = (postId) => {
    navigate(`/edit-post/${postId}`);
  };

  // Handle Delete Post
  const handleDeletePost = async (postId) => {
    if (window.confirm("⚠️ Are you sure you want to delete this post? This action cannot be undone.")) {
      setDeletingPostId(postId);
      try {
        await postsAPI.deletePost(postId);
        setRecentPosts(recentPosts.filter(post => (post._id !== postId && post.id !== postId)));
        alert("✅ Post deleted successfully!");
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("❌ Failed to delete post. Please try again.");
      } finally {
        setDeletingPostId(null);
      }
    }
  };

  return (
    <>
      <Nav darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* Welcome Banner for Logged-in Users */}
      {isAuthenticated() && user && (
        <div style={{
          backgroundColor: "rgba(255, 165, 0, 0.1)",
          padding: "15px 30px",
          textAlign: "center",
          borderBottom: "2px solid orange"
        }}>
          <p style={{ margin: 0, fontSize: "16px" }}>
            👋 Welcome back, <strong style={{ color: "orange" }}>{user.name}</strong>! 
            Ready to share your basketball journey?
            <Link to="/create-post" style={{ color: "orange", marginLeft: "10px", textDecoration: "none" }}>
              Create a post →
            </Link>
          </p>
        </div>
      )}

      {/* Hero Section */}
      <section className="homeie">
        <img src={homepic} alt="Basketball player on court" />
        <div>
          <h2>🏀 Playing Basketball as a Hobby</h2>
          <p>
            Basketball is more than just a sport, it is a passion that builds
            discipline, teamwork, and confidence. This portfolio showcases
            my love for basketball and how it shaped my character on and off
            the court.
          </p>
          <h3>Why I Love Basketball</h3>
          <ul>
            <li>🏀 Improves physical fitness and endurance</li>
            <li>🤝 Develops teamwork and communication skills</li>
            <li>💪 Builds discipline and self-confidence</li>
            <li>🧠 Encourages focus and mental toughness</li>
            <li>🎯 Teaches goal-setting and perseverance</li>
          </ul>
          
          {/* Call to Action Buttons */}
          <div style={{ display: "flex", gap: "15px", marginTop: "20px", flexWrap: "wrap" }}>
            {!isAuthenticated() ? (
              <>
                <Link to="/login">
                  <button style={{
                    padding: "10px 20px",
                    backgroundColor: "orange",
                    color: "#17395f",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}>
                    🔑 Login to Join
                  </button>
                </Link>
                <Link to="/register">
                  <button style={{
                    padding: "10px 20px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}>
                    📝 Register Now
                  </button>
                </Link>
              </>
            ) : (
              <Link to="/create-post">
                <button style={{
                  padding: "10px 20px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}>
                  ✍️ Write Your Story
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section style={{ padding: "30px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px", color: "var(--primary-color)" }}>
          📝 Recent Stories from the Community
        </h2>
        
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div className="spinner"></div>
            <p>Loading posts...</p>
          </div>
        ) : error ? (
          <div style={{ 
            textAlign: "center", 
            padding: "40px", 
            backgroundColor: "#f8d7da", 
            borderRadius: "10px",
            color: "#721c24"
          }}>
            <p>❌ {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                backgroundColor: "orange",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Try Again
            </button>
          </div>
        ) : recentPosts.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "60px", 
            backgroundColor: "var(--section-bg)", 
            borderRadius: "10px" 
          }}>
            <p style={{ fontSize: "18px", marginBottom: "20px" }}>📭 No posts yet</p>
            <p style={{ marginBottom: "20px", color: "#666" }}>
              Be the first to share your basketball journey with the community!
            </p>
            {isAuthenticated() ? (
              <Link to="/create-post">
                <button style={{
                  padding: "10px 20px",
                  backgroundColor: "orange",
                  color: "#17395f",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}>
                  Create First Post
                </button>
              </Link>
            ) : (
              <Link to="/login">
                <button style={{
                  padding: "10px 20px",
                  backgroundColor: "orange",
                  color: "#17395f",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}>
                  Login to Post
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="posts-grid">
            {recentPosts.map((post) => (
              <PostCard 
                key={post._id || post.id}
                post={post} 
                onLike={handleLike}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
                isDeleting={deletingPostId === (post._id || post.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Quick Links Cards */}
      <section className="preview-grid">
        <div className="card">
          <h4>🏀 My Journey</h4>
          <p>Learn how I started playing basketball and how it became my favorite hobby.</p>
          <Link to="/about">Read more →</Link>
        </div>
        <div className="card">
          <h4>📚 Resources</h4>
          <p>Helpful basketball websites, training materials, and equipment guides.</p>
          <Link to="/contact">View resources →</Link>
        </div>
        <div className="card">
          <h4>✉️ Join Updates</h4>
          <p>Sign up to receive basketball tips, drills, and exclusive content.</p>
          <Link to="/register">Register →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p>📧 Email: aldrinvillanueva@email.com | 📞 Phone: 099-192-31885</p>
        <p>🏀 &copy; 2026 Basketball Portfolio Project | Passion for the Game</p>
      </footer>
    </>
  );
}

export default HomePage;