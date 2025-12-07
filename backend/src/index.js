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
let allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:5000'];

// Auto-add current server URL for Swagger UI (if on Render or similar)
const serverUrl = process.env.RENDER_EXTERNAL_URL || process.env.BASE_URL;
if (serverUrl && !allowedOrigins.includes(serverUrl)) {
  allowedOrigins.push(serverUrl);
  logger.info('Auto-added server URL to CORS origins:', serverUrl);
}

logger.info('CORS allowed origins:', { origins: allowedOrigins });

// CORS configuration with more flexible settings
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.some(allowedOrigin => {
      // Support wildcard subdomain matching
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(origin);
      }
      return allowedOrigin === origin;
    })) {
      callback(null, true);
    } else {
      logger.warn('Blocked by CORS:', { origin, allowedOrigins });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morganMiddleware);
app.use(requestTiming);
app.use(requestBodyLogger);

// Swagger documentation with dynamic server URL
const getSwaggerSpec = () => {
  const spec = { ...swaggerSpec };
  
  // Override servers based on environment
  const baseUrl = process.env.RENDER_EXTERNAL_URL || 
                  process.env.BASE_URL || 
                  `http://localhost:${process.env.PORT || 5000}`;
  
  spec.servers = [
    {
      url: `${baseUrl}/api`,
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
    }
  ];
  
  return spec;
};

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(getSwaggerSpec(), {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'E-Commerce API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
  }
}));

// Swagger JSON endpoint
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(getSwaggerSpec());
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
