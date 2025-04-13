/**
 * Custom middleware collection
 */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const expressWinston = require("express-winston");
const path = require("path");

const config = require("../config/default");
const logger = require("../utils/logger");

// Create a combined middleware stack
const setupMiddleware = (app) => {
  // Basic security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: config.security.csp.directives,
      },
    }),
  );

  // CORS middleware
  app.use(cors(config.security.cors));

  // Compression middleware
  app.use(compression());

  // Request parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting
  app.use(rateLimit(config.security.rateLimit));

  // Request logging with Morgan
  app.use(
    morgan(config.logging.httpLogFormat, {
      skip: (req, res) => res.statusCode < 400,
      stream: { write: (message) => logger.info(message.trim()) },
    }),
  );

  // Winston request logging
  app.use(
    expressWinston.logger({
      winstonInstance: logger,
      meta: config.server.env === "production",
      msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
      expressFormat: false,
      colorize: config.server.env !== "production",
    }),
  );

  // Define the project root directory (absolute path)
  const projectRoot = path.resolve(__dirname, "../");

  // Define static file serving configurations
  const serveStatic = (route, dir, options = {}) => {
    // Merge with default options
    const serveOptions = {
      ...config.static,
      ...options,
      setHeaders: (res, filePath, stat) => {
        // Set Cache-Control headers based on file type
        const ext = filePath.split(".").pop().toLowerCase();

        // Apply different cache settings based on file type
        if (["js", "css", "woff", "woff2", "ttf", "eot"].includes(ext)) {
          // Cache longer for static assets that rarely change
          res.setHeader(
            "Cache-Control",
            config.server.env === "production"
              ? "public, max-age=2592000" // 30 days
              : "public, max-age=0",
          );
        } else if (["png", "jpg", "jpeg", "gif", "ico", "svg"].includes(ext)) {
          // Images can be cached longer
          res.setHeader(
            "Cache-Control",
            config.server.env === "production"
              ? "public, max-age=604800" // 7 days
              : "public, max-age=0",
          );
        } else if (["json", "yaml", "yml"].includes(ext)) {
          // Configuration files should be cached for less time
          res.setHeader(
            "Cache-Control",
            config.server.env === "production"
              ? "public, max-age=3600" // 1 hour
              : "public, max-age=0",
          );
        } else {
          // Other files like HTML
          res.setHeader(
            "Cache-Control",
            config.server.env === "production"
              ? "public, max-age=86400" // 1 day
              : "public, max-age=0",
          );
        }

        // Set ETag for caching validation
        if (options.etag !== false) {
          const etag = `W/"${stat.size.toString(16)}-${stat.mtime.getTime().toString(16)}"`;
          res.setHeader("ETag", etag);
        }

        // Add security headers for static content
        res.setHeader("X-Content-Type-Options", "nosniff");
      },
    };

    // Create absolute path to the directory
    let absolutePath;
    if (dir === "") {
      // For root directory
      absolutePath = projectRoot;
    } else if (path.isAbsolute(dir)) {
      // If an absolute path is provided
      absolutePath = dir;
    } else {
      // For subdirectories
      absolutePath = path.resolve(projectRoot, dir);
    }

    // Log the static path configuration
    logger.debug(`Serving static files: ${route} -> ${absolutePath}`);

    // Apply the middleware
    app.use(route, express.static(absolutePath, serveOptions));
  };

  // Serve the project root
  serveStatic("/", "");

  // Serve component-specific directories with custom configuration

  // Workflows (JavaScript files and JSON configurations)
  serveStatic("/workflows", "workflows", {
    index: false, // Don't serve directory indexes
    dotfiles: "ignore", // Don't serve hidden files
  });

  // Themes (CSS, images, etc.)
  serveStatic("/themes", "themes", {
    index: false,
    dotfiles: "ignore",
  });

  // Keysets (JSON configurations)
  serveStatic("/keysets", "keysets", {
    index: false,
    dotfiles: "ignore",
  });

  // Serve specific assets with different caching strategy if needed
  serveStatic("/assets", "assets", {
    immutable: true, // Files never change (add content hash to filenames for this to work)
    maxAge: "1y", // Cache for a year
  });

  // Winston error logging
  app.use(
    expressWinston.errorLogger({
      winstonInstance: logger,
      meta: true,
      msg: "HTTP {{req.method}} {{req.url}} {{err.message}} {{res.statusCode}} {{res.responseTime}}ms",
    }),
  );
};

module.exports = { setupMiddleware };
