const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getReviewsForBook,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

const router = express.Router();

router.get('/books/:bookId/reviews', authenticate, authorizeRoles('USER', 'LIBRARIAN', 'ADMIN'), getReviewsForBook);

router.post('/reviews', authenticate, authorizeRoles('USER', 'LIBRARIAN', 'ADMIN'), createReview);

router.put('/reviews/:id', authenticate, authorizeRoles('USER', 'LIBRARIAN', 'ADMIN'), updateReview);

router.delete('/reviews/:id', authenticate, authorizeRoles('USER', 'LIBRARIAN', 'ADMIN'), deleteReview);

module.exports = router;