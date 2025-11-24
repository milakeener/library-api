const express = require('express');
const app = express();

app.use(express.json());

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Library API',
    version: '1.0.0',
    endpoints: {
      documentation: '/api-docs',
      health: '/health',
      auth: {
        signup: 'POST /auth/signup',
        login: 'POST /auth/login'
      },
      users: 'GET /users/me (authenticated)',
      books: '/books',
      authors: '/authors'
    }
  });
});

const swaggerRoutes = require('./routes/swaggerRoutes');
app.use('/api-docs', swaggerRoutes);

// mount routes
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const authorRoutes = require('./routes/authorRoutes');

app.use('/', userRoutes);
app.use('/books', bookRoutes);
app.use('/authors', authorRoutes);

// basic health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
