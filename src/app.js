const express = require('express');
const app = express();

app.use(express.json());

// mount routes
const userRoutes = require('./routes/userRoutes');

app.use('/', userRoutes);

// basic health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
