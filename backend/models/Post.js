// backend/models/Post.js

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [100, 'Title must be less than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [50, 'Content must be at least 50 characters'],
    maxlength: [5000, 'Content must be less than 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Personal Story', 'Training Tips', 'Life Lessons', 'Game Analysis', 'Equipment Review']
  },
  imageUrl: {
    type: String,
    default: ''
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  author: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'removed'],
    default: 'published'
  }
}, {
  timestamps: true
});

// Index for better search performance
postSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Post', postSchema);