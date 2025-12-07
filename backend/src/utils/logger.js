const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

// Console format with colors
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0 && Object.keys(meta)[0] !== 'stack') {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // API request logs
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/requests.log'),
      level: 'http',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/rejections.log'),
    }),
  ],
});

// Add console transport for non-production
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug',
    })
  );
}

// Helper methods
logger.logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.userId || 'anonymous',
  };

  if (res.statusCode >= 400) {
    logger.warn('Request completed with error', logData);
  } else {
    logger.http('Request completed', logData);
  }
};

logger.logError = (error, req = null) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
  };

  if (req) {
    errorData.method = req.method;
    errorData.url = req.originalUrl;
    errorData.userId = req.userId || 'anonymous';
    errorData.body = req.body;
  }

  logger.error('Error occurred', errorData);
};

logger.logDB = (operation, collection, duration, success = true) => {
  const logData = {
    operation,
    collection,
    duration: `${duration}ms`,
    success,
  };

  if (success) {
    logger.debug('Database operation', logData);
  } else {
    logger.warn('Database operation failed', logData);
  }
};

logger.logAuth = (action, userId, success = true, details = {}) => {
  const logData = {
    action,
    userId,
    success,
    ...details,
  };

  if (success) {
    logger.info('Auth event', logData);
  } else {
    logger.warn('Auth event failed', logData);
  }
};

module.exports = logger;
