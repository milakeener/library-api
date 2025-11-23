const express = require('express');
const app = express();

app.use(express.json());

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
