/**
 * Application configuration settings
 */
require("dotenv").config();

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || "development",
    isDev: (process.env.NODE_ENV || "development") === "development",
  },

  // Static file serving
  static: {
    maxAge: process.env.NODE_ENV === "production" ? "1d" : 0, // 1 day cache in production
    immutable: process.env.NODE_ENV === "production",
    etag: true,
  },

  // Security settings
  security: {
    // Rate limiting
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      message: "Too many requests from this IP, please try again later.",
    },

    // CORS settings
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
    },

    // Content Security Policy
    csp: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for the terminal app
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.NODE_ENV === "production" ? "json" : "simple",
    httpLogFormat:
      process.env.NODE_ENV === "production"
        ? "combined"
        : ":method :url :status :response-time ms - :res[content-length]",
  },
};
