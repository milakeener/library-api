const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

// Auth
router.post('/auth/signup', signup);
router.post('/auth/login', login);

// Users
router.get('/users/me', authenticate, getMe);

module.exports = router;
