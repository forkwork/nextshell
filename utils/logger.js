/**
 * Advanced logging utility using Winston
 */
const winston = require("winston");
const fs = require("fs");
const path = require("path");
const config = require("../config/default");

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  trace: 5,
};

// Level colors
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
  trace: "cyan",
};

// Add colors to winston
winston.addColors(colors);

// Define log formats
const formats = {
  // Development format: colorized with timestamp and formatted text
  simple: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
      (info) =>
        `${info.timestamp} ${info.level}: ${info.message}${
          info.splat !== undefined ? `${info.splat}` : ""
        }${info.stack !== undefined ? `\n${info.stack}` : ""}`,
    ),
  ),

  // Production format: structured JSON with timestamp
  json: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
};

// Create transport options
const transportOptions = {
  console: {
    level: config.logging.level,
    handleExceptions: true,
    format: formats[config.logging.format],
  },
  file: {
    level: "info",
    filename: path.join(logsDir, "combined-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    format: formats.json,
  },
  errorFile: {
    level: "error",
    filename: path.join(logsDir, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d",
    format: formats.json,
  },
};

// Create transports
const transports = [new winston.transports.Console(transportOptions.console)];

// Only add file transports in production
if (process.env.NODE_ENV === "production") {
  // Daily rotating file transport
  const { createLogger, format, transports: winstonTransports } = winston;
  const DailyRotateFile = require("winston-daily-rotate-file");

  transports.push(
    new DailyRotateFile(transportOptions.file),
    new DailyRotateFile(transportOptions.errorFile),
  );
}

// Create the logger instance
const logger = winston.createLogger({
  level: config.logging.level || "info",
  levels,
  format: formats[config.logging.format] || formats.simple,
  transports,
  exitOnError: false,
});

// Helper methods
logger.startTimer = () => {
  const start = Date.now();
  return () => {
    const elapsed = Date.now() - start;
    return elapsed;
  };
};

// Performance logging
logger.perf = (message, timeInMs) => {
  const level = timeInMs > 1000 ? "warn" : "info";
  logger[level](`${message} (${timeInMs}ms)`);
};

// Development mode helper
logger.debug = config.server.isDev ? logger.debug.bind(logger) : () => {}; // No-op in production

// Stream for Morgan integration
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

module.exports = logger;
