// frontend/src/components/PostCard.js

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ 
  post, 
  showActions = true, 
  onLike, 
  onDelete, 
  onEdit,
  onPublish,
  onUnpublish,
  compact = false,
  isDeleting = false
}) => {
  const { user } = useAuth();
  
  // Get the correct ID (MongoDB uses _id, frontend might use id)
  const postId = post?._id || post?.id;
  
  // Base URL for images
  const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  // Get full image URL
  const getImageUrl = () => {
    const imagePath = post?.imageUrl || post?.image;
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };
  
  const imageUrl = getImageUrl();
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Truncate text with ellipsis - FIXED: Ensure "..." appears
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    // Remove extra whitespace
    const cleanText = text.replace(/\s+/g, ' ').trim();
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength).trim() + ' ...';
  };
  
  // Get category badge color
  const getCategoryColor = (category) => {
    const colors = {
      'Personal Story': '#4CAF50',
      'Training Tips': '#2196F3',
      'Life Lessons': '#FF9800',
      'Game Analysis': '#9C27B0',
      'Equipment Review': '#F44336'
    };
    return colors[category] || '#757575';
  };
  
  // Check if user can edit/delete post
  const canModify = () => {
    if (!user) return false;
    return user.role === 'admin' || user.id === post?.authorId || user._id === post?.authorId;
  };
  
  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike && postId) onLike(postId);
  };
  
  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit && postId) onEdit(postId);
  };
  
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && postId && window.confirm('Are you sure you want to delete this post?')) {
      onDelete(postId);
    }
  };
  
  const handlePublish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPublish && postId) onPublish(postId);
  };
  
  const handleUnpublish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onUnpublish && postId) onUnpublish(postId);
  };
  
  if (compact) {
    return (
      <Link to={`/post/${postId}`} className="post-card compact">
        <div className="post-card-content">
          <h4 className="post-title">{post?.title || 'Untitled'}</h4>
          <div className="post-meta">
            <span className="post-date">{formatDate(post?.createdAt || post?.date)}</span>
            <span className="post-likes">❤️ {post?.likes || 0}</span>
          </div>
        </div>
      </Link>
    );
  }
  
  return (
    <article className="post-card">
      {/* Post Image */}
      {imageUrl && (
        <div className="post-card-image">
          <img 
            src={imageUrl} 
            alt={post?.title} 
            onError={(e) => {
              console.log("Image failed to load:", imageUrl);
              e.target.style.display = 'none';
            }}
          />
          {post?.category && (
            <span 
              className="post-category" 
              style={{ backgroundColor: getCategoryColor(post.category) }}
            >
              {post.category}
            </span>
          )}
        </div>
      )}
      
      <div className="post-card-content">
        {!imageUrl && post?.category && (
          <span 
            className="post-category inline" 
            style={{ backgroundColor: getCategoryColor(post.category) }}
          >
            {post.category}
          </span>
        )}
        
        <Link to={`/post/${postId}`} className="post-title-link">
          <h3 className="post-title">{post?.title || 'Untitled'}</h3>
        </Link>
        
        <div className="post-meta">
          <span className="post-author">By {post?.author || 'Anonymous'}</span>
          <span className="post-date">{formatDate(post?.createdAt || post?.date)}</span>
        </div>
        
        {/* Excerpt with clear truncation */}
        <p className="post-excerpt" style={{ 
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          wordBreak: 'break-word'
        }}>
          {post?.content ? truncateText(post.content) : (post?.excerpt || 'No content available')}
        </p>
        
        <div className="post-stats">
          <button 
            onClick={handleLike} 
            className={`stat-btn ${post?.userLiked ? 'liked' : ''}`}
            disabled={!onLike}
          >
            ❤️ {post?.likes || 0}
          </button>
          <Link to={`/post/${postId}#comments`} className="stat-btn" onClick={(e) => e.stopPropagation()}>
            💬 {post?.comments || 0}
          </Link>
          <span className="stat-btn">
            👁️ {post?.views || 0}
          </span>
        </div>
        
        {post?.status && post.status !== 'published' && (
          <div className="post-status">
            <span style={{
              backgroundColor: post.status === 'draft' ? 'orange' : '#dc3545',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              {post.status === 'draft' ? '📝 Draft' : '🗑️ Removed'}
            </span>
          </div>
        )}
        
        {showActions && canModify() && (
          <div className="post-actions">
            <button onClick={handleEdit} className="edit-btn" disabled={isDeleting}>
              ✏️ Edit
            </button>
            {onPublish && post?.status !== 'published' && (
              <button onClick={handlePublish} className="edit-btn" style={{ backgroundColor: '#28a745' }}>
                ✅ Publish
              </button>
            )}
            {onUnpublish && post?.status === 'published' && (
              <button onClick={handleUnpublish} className="edit-btn" style={{ backgroundColor: '#ff9800' }}>
                📝 Unpublish
              </button>
            )}
            <button onClick={handleDelete} className="delete-btn" disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : '🗑️ Delete'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default PostCard;