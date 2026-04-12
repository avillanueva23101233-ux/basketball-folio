// frontend/src/api/axios.js

import axios from 'axios';

// Create axios instance with base configuration
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// =========================
// REQUEST INTERCEPTOR
// =========================
// Adds authentication token to every request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// =========================
// RESPONSE INTERCEPTOR
// =========================
// Handles responses and errors globally
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - Server took too long to respond');
      return Promise.reject({
        status: 408,
        message: 'Request timeout. Please try again.'
      });
    }
    
    // Check if this is a login request
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    
    // Handle unauthorized errors (401)
    if (error.response?.status === 401) {
      // For login requests, don't redirect or clear storage
      if (isLoginRequest) {
        return Promise.reject({
          status: 401,
          message: error.response?.data?.message || 'Invalid email or password'
        });
      }
      
      // For other requests, redirect to login
      console.error('Unauthorized - Redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject({
        status: 401,
        message: 'Session expired. Please login again.'
      });
    }
    
    // Handle forbidden errors (403)
    if (error.response?.status === 403) {
      console.error('Forbidden - You do not have permission');
      return Promise.reject({
        status: 403,
        message: 'You do not have permission to perform this action.'
      });
    }
    
    // Handle not found errors (404)
    if (error.response?.status === 404) {
      console.error('Resource not found');
      return Promise.reject({
        status: 404,
        message: 'The requested resource was not found.'
      });
    }
    
    // Handle validation errors (422)
    if (error.response?.status === 422) {
      console.error('Validation error:', error.response.data);
      return Promise.reject({
        status: 422,
        message: 'Validation failed',
        errors: error.response.data.errors
      });
    }
    
    // Handle server errors (500)
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
      return Promise.reject({
        status: 500,
        message: 'Server error. Please try again later.'
      });
    }
    
    // Handle bad request errors (400) - for login failures
    if (error.response?.status === 400 && isLoginRequest) {
      return Promise.reject({
        status: 400,
        message: error.response?.data?.message || 'Invalid email or password'
      });
    }
    
    // Handle network errors (no response from server)
    if (!error.response) {
      console.error('Network error - Unable to connect to server');
      return Promise.reject({
        status: 0,
        message: 'Network error - Unable to connect to server. Please make sure the backend server is running.'
      });
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

// =========================
// AUTH API ENDPOINTS
// =========================
export const authAPI = {
  // User login
  login: (credentials) => instance.post('/auth/login', credentials),
  
  // User registration
  register: (userData) => instance.post('/auth/register', userData),
  
  // User logout
  logout: () => instance.post('/auth/logout'),
  
  // Refresh authentication token
  refreshToken: () => instance.post('/auth/refresh-token'),
  
  // Forgot password request
  forgotPassword: (email) => instance.post('/auth/forgot-password', { email }),
  
  // Reset password with token
  resetPassword: (token, password) => instance.post('/auth/reset-password', { token, password })
};

// =========================
// USER API ENDPOINTS
// =========================
export const userAPI = {
  // Get current user profile
  getProfile: () => instance.get('/users/profile'),
  
  // Update user profile
  updateProfile: (data) => instance.put('/users/profile', data),
  
  // Update user avatar (with file upload)
  updateAvatar: (formData) => instance.put('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  // Get user by ID
  getUserById: (id) => instance.get(`/users/${id}`),
  
  // Get all users (admin only)
  getAllUsers: () => instance.get('/users'),
  
  // Delete user (admin only)
  deleteUser: (id) => instance.delete(`/users/${id}`),
  
  // Update user role (admin only)
  updateUserRole: (id, role) => instance.put(`/users/${id}/role`, { role })
};

// =========================
// POSTS API ENDPOINTS
// =========================
export const postsAPI = {
  // Get all posts with pagination and filters
  getAllPosts: (params) => instance.get('/posts', { params }),
  
  // Get single post by ID
  getPostById: (id) => instance.get(`/posts/${id}`),
  
  // Create new post
  createPost: (data) => instance.post('/posts', data),
  
  // Update existing post
  updatePost: (id, data) => instance.put(`/posts/${id}`, data),
  
  // Delete post
  deletePost: (id) => instance.delete(`/posts/${id}`),
  
  // Like a post
  likePost: (id) => instance.post(`/posts/${id}/like`),
  
  // Unlike a post
  unlikePost: (id) => instance.delete(`/posts/${id}/like`),
  
  // Get posts by user
  getPostsByUser: (userId) => instance.get(`/posts/user/${userId}`),
  
  // Get posts by category
  getPostsByCategory: (category) => instance.get(`/posts/category/${category}`),
  
  // Search posts by keyword
  searchPosts: (query) => instance.get(`/posts/search?q=${query}`),
  
  // Upload image for post
  uploadImage: (formData) => instance.post('/posts/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
};

// =========================
// COMMENTS API ENDPOINTS
// =========================
export const commentsAPI = {
  // Get comments for a post
  getCommentsByPost: (postId) => instance.get(`/comments/post/${postId}`),
  
  // Add comment to post
  addComment: (postId, content) => instance.post(`/comments/post/${postId}`, content),
  
  // Update comment
  updateComment: (commentId, content) => instance.put(`/comments/${commentId}`, content),
  
  // Delete comment
  deleteComment: (commentId) => instance.delete(`/comments/${commentId}`),
  
  // Like a comment
  likeComment: (commentId) => instance.post(`/comments/${commentId}/like`)
};

// =========================
// ADMIN API ENDPOINTS
// =========================
export const adminAPI = {
  // Get dashboard statistics
  getDashboardStats: () => instance.get('/admin/stats'),
  
  // Get all users with pagination
  getAllUsers: (params) => instance.get('/admin/users', { params }),
  
  // Get all posts with pagination
  getAllPosts: (params) => instance.get('/admin/posts', { params }),
  
  // Delete user (admin only)
  deleteUser: (userId) => instance.delete(`/admin/users/${userId}`),
  
  // Delete post (admin only)
  deletePost: (postId) => instance.delete(`/admin/posts/${postId}`),
  
  // Update post status (publish/draft)
  updatePostStatus: (postId, status) => instance.put(`/admin/posts/${postId}/status`, { status }),
  
  // Get system reports
  getReports: () => instance.get('/admin/reports'),
  
  // Get site analytics
  getAnalytics: () => instance.get('/admin/analytics')
};

// =========================
// BASKETBALL RESOURCES API ENDPOINTS
// =========================
export const resourcesAPI = {
  // Get basketball drills
  getDrills: (params) => instance.get('/resources/drills', { params }),
  
  // Get single drill by ID
  getDrillById: (id) => instance.get(`/resources/drills/${id}`),
  
  // Get training tips
  getTips: () => instance.get('/resources/tips'),
  
  // Get equipment recommendations
  getEquipment: () => instance.get('/resources/equipment'),
  
  // Get training plans
  getTrainingPlans: () => instance.get('/resources/training-plans'),
  
  // Get basketball courts/locations
  getCourts: (params) => instance.get('/resources/courts', { params })
};

// =========================
// NEWSLETTER API ENDPOINTS
// =========================
export const newsletterAPI = {
  // Subscribe to newsletter
  subscribe: (email, name) => instance.post('/newsletter/subscribe', { email, name }),
  
  // Unsubscribe from newsletter
  unsubscribe: (email) => instance.post('/newsletter/unsubscribe', { email }),
  
  // Send newsletter (admin only)
  sendNewsletter: (data) => instance.post('/newsletter/send', data),
  
  // Get subscriber list (admin only)
  getSubscribers: () => instance.get('/newsletter/subscribers')
};

// =========================
// HELPER FUNCTIONS
// =========================

// Handle API errors in components
export const handleApiError = (error, setError) => {
  if (error.message) {
    setError(error.message);
  } else if (error.errors) {
    // Handle validation errors
    if (Array.isArray(error.errors)) {
      const errorMessages = error.errors.join(', ');
      setError(errorMessages);
    } else if (typeof error.errors === 'object') {
      const errorMessages = Object.values(error.errors).flat().join(', ');
      setError(errorMessages);
    } else {
      setError(error.errors);
    }
  } else {
    setError('An unexpected error occurred. Please try again.');
  }
  
  console.error('API Error:', error);
};

// Show success message
export const showSuccessMessage = (message, setSuccess, duration = 3000) => {
  setSuccess(message);
  setTimeout(() => {
    setSuccess(null);
  }, duration);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if current user is admin
export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Export the configured axios instance as default
export default instance;