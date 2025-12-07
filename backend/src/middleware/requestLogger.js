const morgan = require('morgan');
const logger = require('../utils/logger');

// Create custom Morgan token for response time
morgan.token('response-time-ms', (req, res) => {
  if (!req._startTime) return '';
  const diff = process.hrtime(req._startTime);
  return (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
});

// Custom Morgan format
const morganFormat = ':method :url :status :response-time-ms ms - :res[content-length]';

// Morgan stream to Winston
const stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Request timing middleware
const requestTiming = (req, res, next) => {
  req._startTime = process.hrtime();
  
  // Capture response finish
  res.on('finish', () => {
    const diff = process.hrtime(req._startTime);
    const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    logger.logRequest(req, res, responseTime);
  });
  
  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.logError(err, req);
  next(err);
};

// Morgan middleware configuration
const morganMiddleware = morgan(morganFormat, {
  stream,
  skip: (req, res) => {
    // Skip logging for health checks in production
    if (process.env.NODE_ENV === 'production' && req.url === '/health') {
      return true;
    }
    return false;
  },
});

// Request body logging (for debugging)
const requestBodyLogger = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production' && req.body && Object.keys(req.body).length > 0) {
    // Don't log sensitive fields
    const sanitizedBody = { ...req.body };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'cardNumber', 'cvv'];
    sensitiveFields.forEach((field) => {
      if (sanitizedBody[field]) {
        sanitizedBody[field] = '[REDACTED]';
      }
    });
    
    logger.debug('Request body', {
      method: req.method,
      url: req.originalUrl,
      body: sanitizedBody,
    });
  }
  next();
};

module.exports = {
  morganMiddleware,
  requestTiming,
  errorLogger,
  requestBodyLogger,
};
