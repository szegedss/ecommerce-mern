const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import logger and middleware
const logger = require('./utils/logger');
const {
  morganMiddleware,
  requestTiming,
  errorLogger,
  requestBodyLogger,
} = require('./middleware/requestLogger');

// Load swagger spec (auto-generated or fallback to manual)
let swaggerSpec;
const swaggerOutputPath = path.join(__dirname, 'config/swagger-output.json');
if (fs.existsSync(swaggerOutputPath)) {
  swaggerSpec = require('./config/swagger-output.json');
  logger.info('Using auto-generated Swagger documentation');
} else {
  swaggerSpec = require('./config/swagger');
  logger.info('Using manual Swagger documentation (run npm run swagger to generate)');
}

// Import API routes
const apiRoutes = require('./routes');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => logger.info('MongoDB connected successfully'))
.catch(err => {
  logger.error('MongoDB connection error:', { error: err.message });
  process.exit(1);
});

// Middleware
app.use(helmet());

// Parse CORS origins from environment variable
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:5000'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morganMiddleware);
app.use(requestTiming);
app.use(requestBodyLogger);

// Swagger documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'E-Commerce API Documentation',
}));

// Swagger JSON endpoint
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ============================================
// API ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running',
    version: '1.0.0',
    timestamp: new Date(),
  });
});

// API routes (organized by category)
app.use('/api', apiRoutes);

// Error logging middleware
app.use(errorLogger);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api/docs`);
});
