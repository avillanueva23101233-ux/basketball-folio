// backend/routes/comment.routes.js

const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth.middleware');

// =========================
// GET COMMENTS FOR A POST (Public)
// URL: /api/comments/post/:postId
// =========================
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, comments });
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ message: err.message });
  }
});

// =========================
// ADD COMMENT TO POST (Authenticated)
// URL: /api/comments/post/:postId
// =========================
router.post('/post/:postId', protect, async (req, res) => {
  try {
    const { content } = req.body;
    
    console.log('Adding comment to post:', req.params.postId);
    console.log('Comment content:', content);
    console.log('User:', req.user);
    
    // Validate required fields
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    
    // Find the post
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Create comment
    const comment = new Comment({
      postId: req.params.postId,
      authorId: req.user.id,
      author: req.user.name || 'User',
      content: content.trim()
    });
    
    await comment.save();
    console.log('Comment saved:', comment);
    
    // Update post comment count
    post.comments = (post.comments || 0) + 1;
    await post.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Comment added successfully',
      comment: {
        _id: comment._id,
        content: comment.content,
        author: comment.author,
        authorId: comment.authorId,
        createdAt: comment.createdAt
      }
    });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ message: err.message });
  }
});

// =========================
// DELETE COMMENT (Author or Admin)
// URL: /api/comments/:id
// =========================
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is author or admin
    if (comment.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    // Update post comment count
    await Post.findByIdAndUpdate(comment.postId, { $inc: { comments: -1 } });
    
    await comment.deleteOne();
    
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ message: err.message });
  }
});

// =========================
// UPDATE COMMENT (Author or Admin)
// URL: /api/comments/:id
// =========================
router.put('/:id', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    if (comment.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }
    
    comment.content = content;
    await comment.save();
    
    res.json({ success: true, comment });
  } catch (err) {
    console.error('Update comment error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;