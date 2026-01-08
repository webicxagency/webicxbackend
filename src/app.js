const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.get('/', (req, res) => res.send('Webicx Backend API'));

const authRoutes = require('./routes/auth');
const webhooksRoutes = require('./routes/webhooks');
const publicRoutes = require('./routes/public');
const companyRoutes = require('./routes/companies');
const userRoutes = require('./routes/users');
const primegraphicsRoutes = require('./routes/primegraphics');
app.use('/auth', authRoutes);
app.use('/webhooks', webhooksRoutes);
app.use('/public', publicRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/primegraphics', primegraphicsRoutes);

// TODO: Add more routes

const logger = require('./utils/logger');

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;