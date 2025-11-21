const express = require('express');
const {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
} = require('../controllers/bookController');

const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticate, authorizeRoles('USER', 'LIBRARIAN', 'ADMIN'),getAllBooks);
router.get('/:id', authenticate, authorizeRoles('USER', 'LIBRARIAN', 'ADMIN'), getBookById);
router.post('/', authenticate, authorizeRoles('LIBRARIAN', 'ADMIN'), createBook);
router.put('/:id', authenticate, authorizeRoles('LIBRARIAN', 'ADMIN'), updateBook);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), deleteBook);

module.exports = router;