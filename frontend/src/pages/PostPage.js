// frontend/src/pages/PostPage.js

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postsAPI, commentsAPI } from "../api/axios";
import Nav from "../components/Nav";

function PostPage({ darkMode, toggleDarkMode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const response = await postsAPI.getPostById(id);
        const postData = response.post || response;
        setPost(postData);
        setLikesCount(postData.likes || 0);
      } catch (error) {
        console.error("Error fetching post:", error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await commentsAPI.getCommentsByPost(id);
        const commentsData = response.comments || response;
        setComments(Array.isArray(commentsData) ? commentsData : []);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setComments([]);
      }
    };

    if (id) {
      fetchPost();
      fetchComments();
    }
  }, [id]);

  const handleLike = async () => {
    try {
      if (liked) {
        await postsAPI.unlikePost(id);
        setLikesCount(prev => prev - 1);
      } else {
        await postsAPI.likePost(id);
        setLikesCount(prev => prev + 1);
      }
      setLiked(!liked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setCommentError("⚠ Please enter a comment");
      return;
    }
    setCommentError("");
    setLoadingComments(true);

    try {
      const response = await commentsAPI.addComment(id, { content: newComment.trim() });
      console.log("Add comment response:", response);
      
      const newCommentData = response.comment || {
        _id: Date.now(),
        content: newComment.trim(),
        author: user?.name,
        authorId: user?.id,
        createdAt: new Date().toISOString()
      };
      
      setComments([newCommentData, ...comments]);
      setNewComment("");
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 3000);
    } catch (error) {
      console.error("Error adding comment:", error);
      setCommentError(error.response?.data?.message || "Failed to add comment. Please try again.");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await commentsAPI.deleteComment(commentId);
        setComments(comments.filter(comment => comment._id !== commentId && comment.id !== commentId));
        alert("✅ Comment deleted successfully!");
      } catch (error) {
        console.error("Error deleting comment:", error);
        alert("❌ Failed to delete comment. Please try again.");
      }
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        await postsAPI.deletePost(id);
        alert("✅ Post deleted successfully!");
        navigate("/home");
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("❌ Failed to delete post. Please try again.");
      }
    }
  };

  const canEdit = () => user && (user.id === post?.authorId || isAdmin());
  const canDeleteComment = (commentAuthorId) => user && (user.id === commentAuthorId || isAdmin());

  const handleEdit = () => navigate(`/edit-post/${id}`);

  if (loading) return (
    <>
      <Nav darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div style={{textAlign:"center",padding:"60px"}}>
        <div className="spinner"></div>
        <p>Loading post...</p>
      </div>
    </>
  );

  if (!post) return (
    <>
      <Nav darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="contactie">
        <h2>📭 Post Not Found</h2>
        <p>The article you're looking for doesn't exist or has been removed.</p>
        <Link to="/home" style={{ color: "orange", textDecoration: "none" }}>← Back to Home</Link>
      </div>
    </>
  );

  return (
    <>
      <Nav darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="about-container">
        <section className="aboutie" style={{width:"70%",margin:"30px auto"}}>
          
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"20px",flexWrap:"wrap",gap:"10px"}}>
            <Link to="/home" style={{ color: "orange", textDecoration: "none" }}>← Back to Home</Link>
            {canEdit() && (
              <div>
                <button 
                  onClick={handleEdit} 
                  style={{padding:"8px 16px",background:"orange",color:"#17395f",border:"none",borderRadius:"5px",marginRight:"10px",cursor:"pointer"}}
                >
                  ✏️ Edit Post
                </button>
                <button 
                  onClick={handleDeletePost} 
                  style={{padding:"8px 16px",background:"#dc3545",color:"white",border:"none",borderRadius:"5px",cursor:"pointer"}}
                >
                  🗑️ Delete Post
                </button>
              </div>
            )}
          </div>
          
          <span style={{
            display:"inline-block",
            padding:"4px 12px",
            background:"orange",
            color:"#17395f",
            borderRadius:"20px",
            fontSize:"12px",
            fontWeight:"bold",
            marginBottom:"15px"
          }}>
            {post.category}
          </span>
          
          <h2 style={{ fontSize: "32px", marginBottom: "15px", wordBreak: "break-word" }}>{post.title}</h2>
          
          <div style={{display:"flex",gap:"20px",marginBottom:"20px",color:"#666",flexWrap:"wrap"}}>
            <span>👤 By {post.author}</span>
            <span>📅 {new Date(post.createdAt || post.date).toLocaleDateString()}</span>
            <span>👁️ {post.views || 0} views</span>
          </div>
          
          {post.image && (
            <img 
              src={post.image} 
              alt={post.title} 
              style={{width:"100%",height:"400px",objectFit:"cover",marginBottom:"25px",borderRadius:"8px"}} 
            />
          )}
          
          {/* Post Content - FIXED TEXT WRAPPING */}
          <div style={{
            fontSize: "18px",
            lineHeight: "1.8",
            whiteSpace: "normal",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            maxWidth: "100%"
          }}>
            {post.content}
          </div>
          
          <div style={{marginTop:"30px",paddingTop:"20px",borderTop:"2px solid orange"}}>
            <button 
              onClick={handleLike} 
              style={{
                padding:"10px 20px",
                background:liked?"#ff4757":"orange",
                color:"white",
                border:"none",
                borderRadius:"5px",
                cursor:"pointer",
                fontSize:"16px"
              }}
            >
              {liked?"❤️ Liked":"🤍 Like"} ({likesCount})
            </button>
          </div>
          
          {/* Comments Section */}
          <div style={{marginTop:"40px",borderTop:"2px solid orange",paddingTop:"30px"}}>
            <h3>💬 Comments ({comments.length})</h3>
            
            {user ? (
              <form onSubmit={handleCommentSubmit} style={{ marginBottom: "30px" }}>
                <textarea 
                  rows="4" 
                  placeholder="Share your thoughts about this post..." 
                  value={newComment} 
                  onChange={(e)=>setNewComment(e.target.value)} 
                  style={{
                    width:"100%",
                    padding:"10px",
                    borderRadius:"5px",
                    border:"2px solid orange",
                    backgroundColor: "var(--form-bg)",
                    color: "var(--text-color)",
                    fontFamily: "inherit",
                    resize: "vertical"
                  }} 
                />
                {commentError && <span className="error">{commentError}</span>}
                {commentSuccess && <div style={{color:"green", marginTop:"10px"}}>✅ Comment added successfully!</div>}
                <button type="submit" disabled={loadingComments} style={{ marginTop: "10px", width: "auto", padding: "10px 20px" }}>
                  {loadingComments ? "Posting..." : "📝 Post Comment"}
                </button>
              </form>
            ) : (
              <p style={{ marginBottom: "20px", padding: "15px", backgroundColor: "rgba(0,0,0,0.05)", borderRadius: "8px" }}>
                🔑 <Link to="/login" style={{ color: "orange" }}>Login</Link> to leave a comment.
              </p>
            )}
            
            {comments.length === 0 ? (
              <p style={{ textAlign: "center", padding: "40px", backgroundColor: "var(--section-bg)", borderRadius: "8px" }}>
                💭 No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map(comment => (
                <div 
                  key={comment._id || comment.id} 
                  style={{
                    background:"rgba(23,57,95,0.1)",
                    padding:"15px",
                    marginBottom:"15px",
                    borderRadius:"8px",
                    position: "relative",
                    wordBreak: "break-word",
                    overflowWrap: "break-word"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
                    <div>
                      <strong style={{ fontSize: "16px" }}>{comment.author?.name || comment.author}</strong>
                      <span style={{ fontSize: "12px", color: "#666", marginLeft: "10px" }}>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {canDeleteComment(comment.author?._id || comment.authorId) && (
                      <button
                        onClick={() => handleDeleteComment(comment._id || comment.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "16px",
                          color: "#dc3545",
                          padding: "5px"
                        }}
                        title="Delete comment"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <p style={{ margin: "10px 0 0 0", lineHeight: "1.5", wordBreak: "break-word", overflowWrap: "break-word" }}>{comment.content}</p>
                </div>
              ))
            )}
          </div>
          
        </section>
      </div>
      
      <footer>
        <p>📧 Email: aldrinvillanueva@email.com | 📞 Phone: 099-192-31885</p>
        <p>🏀 &copy; 2026 Basketball Portfolio Project | Passion for the Game</p>
      </footer>
    </>
  );
}

export default PostPage;