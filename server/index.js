const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const winston = require('winston');
require('winston-daily-rotate-file');
require('dotenv').config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configure logging
const logger = winston.createLogger({
  level: NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/server-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

// Apply middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"], // Removed unsafe-inline and unsafe-eval
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Other middleware
app.use(cors());
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// Set up project root path
const projectRoot = path.join(__dirname, '..');

// Handle theme requests BEFORE other static middleware
const themesPath = path.join(projectRoot, 'themes');

app.use('/themes', (req, res, next) => {
  // Skip if not a GET request
  if (req.method !== 'GET') {
    return next();
  }

  // Get the relative path (everything after /themes)
  const relativePath = req.path;
  const cleanPath = relativePath.replace(/^\/+|\/+$/g, ''); // Remove leading and trailing slashes
  const fullPath = path.join(themesPath, cleanPath);

  try {
    const stats = require('fs').statSync(fullPath);
    if (stats.isDirectory()) {
      // For directories, serve a JSON listing
      const files = require('fs').readdirSync(fullPath);
      res.json({
        path: cleanPath,
        files: files.map(file => {
          const filePath = path.join(fullPath, file);
          const fileStats = require('fs').statSync(filePath);
          return {
            name: file,
            type: fileStats.isDirectory() ? 'directory' : 'file',
            size: fileStats.size,
            modified: fileStats.mtime,
          };
        }),
      });
    } else {
      // If it's a file, serve it directly
      return res.sendFile(fullPath);
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      logger.warn(`File not found: ${fullPath}`);
      return res
        .status(404)
        .json({ error: 'Not Found', message: 'The requested resource was not found' });
    }
    next(err);
  }
});

// Other static file serving middleware
app.use(express.static(projectRoot));
app.use('/workflows', express.static(path.join(projectRoot, 'workflows')));
app.use('/keysets', express.static(path.join(projectRoot, 'keysets')));

// Create a simple index page if one doesn't exist
app.get('/', (req, res) => {
  res.sendFile(path.join(projectRoot, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error:', { error: err.message, stack: err.stack });
  res.status(500).json({
    error: 'Server error',
    message: NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: 'The requested resource was not found' });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT} in ${NODE_ENV} mode`);
});
