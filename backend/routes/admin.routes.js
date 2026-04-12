// backend/routes/admin.routes.js

const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');

const router = express.Router();

// All routes below require: (1) valid token AND (2) admin role
router.use(protect, adminOnly);

// ── GET /api/admin/users — List all users (including admin)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    // Format users for frontend
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio || '',
      avatar: user.avatar || '',
      joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A',
      status: user.status || 'active',
      posts: 0
    }));

    // Get post counts for each user
    for (let user of formattedUsers) {
      const postCount = await Post.countDocuments({ authorId: user.id });
      user.posts = postCount;
    }

    res.json({ success: true, data: formattedUsers });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/admin/users/:id — Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin users' });
    }

    // Delete all posts by this user
    await Post.deleteMany({ authorId: user._id });
    await user.deleteOne();

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/admin/posts — List ALL posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 });

    const formattedPosts = posts.map(post => ({
      id: post._id,
      title: post.title,
      content: post.content,
      category: post.category,
      imageUrl: post.imageUrl || '',
      author: post.author,
      authorId: post.authorId,
      date: post.createdAt ? new Date(post.createdAt).toISOString().split('T')[0] : 'N/A',
      status: post.status || 'published',
      views: post.views || 0,
      likes: post.likes || 0,
      comments: post.comments || 0
    }));

    res.json({ success: true, data: formattedPosts });
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/admin/posts/:id — Delete post
router.delete('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    await post.deleteOne();

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/admin/posts/:id/status — Update post status
router.put('/posts/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (!['published', 'draft', 'removed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    post.status = status;
    await post.save();

    res.json({ success: true, message: `Post ${status} successfully` });
  } catch (err) {
    console.error('Update post status error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/admin/stats — Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const publishedPosts = await Post.countDocuments({ status: 'published' });
    const draftPosts = await Post.countDocuments({ status: 'draft' });
    
    const posts = await Post.find({});
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews,
        totalLikes
      }
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;