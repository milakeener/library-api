const express = require('express');
const {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} = require('../controllers/authorController');

const router = express.Router();

router.get('/', authenticate, authorizeRoles('USER', 'LIBRARIAN', 'ADMIN'),getAllAuthors);
router.get('/:id', authenticate, authorizeRoles('USER', 'LIBRARIAN', 'ADMIN'), getAuthorById);
router.post('/', authenticate, authorizeRoles('LIBRARIAN', 'ADMIN'), createAuthor);
router.put('/:id', authenticate, authorizeRoles('LIBRARIAN', 'ADMIN'), updateAuthor);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), deleteAuthor);

module.exports = router;