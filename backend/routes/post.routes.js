// backend/routes/post.routes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth.middleware');

// =========================
// CREATE POSTS UPLOADS DIRECTORY
// =========================
const postsUploadsDir = path.join(__dirname, '../uploads/posts');
if (!fs.existsSync(postsUploadsDir)) {
  fs.mkdirSync(postsUploadsDir, { recursive: true });
}

// =========================
// MULTER CONFIGURATION (for post images)
// =========================
const postStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, postsUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `post-${uniqueSuffix}${ext}`);
  }
});

const postFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
  }
};

const uploadPostImage = multer({
  storage: postStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: postFileFilter
}).single('image');

// =========================
// GET ALL POSTS (Public)
// =========================
router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = { status: 'published' };
    if (category) query.category = category;
    
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Post.countDocuments(query);
    
    res.json({
      success: true,
      posts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =========================
// GET POST BY ID (Public)
// =========================
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Increment view count
    post.views += 1;
    await post.save();
    
    res.json({ success: true, post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =========================
// GET POSTS BY USER (Public)
// =========================
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ authorId: userId })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, posts });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =========================
// GET POSTS BY CATEGORY (Public)
// =========================
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const posts = await Post.find({ category, status: 'published' })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, posts });
  } catch (error) {
    console.error('Get category posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =========================
// UPLOAD POST IMAGE (Authenticated)
// =========================
router.post('/upload', protect, (req, res) => {
  uploadPostImage(req, res, async (err) => {
    if (err) {
      console.error('Image upload error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const imageUrl = `/uploads/posts/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      url: imageUrl,
      imageUrl: imageUrl
    });
  });
});

// =========================
// CREATE POST (Authenticated)
// =========================
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, category, imageUrl } = req.body;
    
    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (title.length < 5) {
      return res.status(400).json({ message: 'Title must be at least 5 characters' });
    }
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }
    if (content.length < 50) {
      return res.status(400).json({ message: 'Content must be at least 50 characters' });
    }
    
    const post = new Post({
      title: title.trim(),
      content: content.trim(),
      category,
      imageUrl: imageUrl || '',
      authorId: req.user.id,
      author: req.user.name,
      likes: 0,
      comments: 0,
      views: 0,
      status: 'published'
    });
    
    await post.save();
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// =========================
// UPDATE POST (Author or Admin)
// =========================
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is author or admin
    if (post.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to edit this post' });
    }
    
    const { title, content, category, imageUrl, status } = req.body;
    
    if (title) post.title = title.trim();
    if (content) post.content = content.trim();
    if (category) post.category = category;
    if (imageUrl !== undefined) post.imageUrl = imageUrl;
    if (status && req.user.role === 'admin') post.status = status;
    
    await post.save();
    
    res.json({
      success: true,
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =========================
// DELETE POST (Author or Admin)
// =========================
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is author or admin
    if (post.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to delete this post' });
    }
    
    // Delete associated image file if exists
    if (post.imageUrl) {
      const imagePath = path.join(__dirname, '..', post.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await post.deleteOne();
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =========================
// LIKE POST (Authenticated)
// =========================
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    post.likes += 1;
    await post.save();
    
    res.json({ success: true, likes: post.likes });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =========================
// UNLIKE POST (Authenticated)
// =========================
router.delete('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    post.likes = Math.max(0, post.likes - 1);
    await post.save();
    
    res.json({ success: true, likes: post.likes });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =========================
// SEARCH POSTS (Public)
// =========================
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json({ success: true, posts: [] });
    }
    
    const posts = await Post.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } }
      ],
      status: 'published'
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, posts });
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;