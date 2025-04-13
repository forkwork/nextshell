/**
 * NextShell Web Server
 * A production-ready Express server for the NextShell terminal application
 */
const express = require("express");
const path = require("path");
const fs = require("fs");

// Import configuration and utilities
const config = require("./config/default");
const logger = require("./utils/logger");
const { setupMiddleware } = require("./middleware");
const routes = require("./routes");

// Initialize express app
const app = express();
const PORT = config.server.port;

// Create logs directory if it doesn't exist
if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
}

// Set trust proxy if behind a reverse proxy
if (config.server.env === "production") {
  app.set("trust proxy", 1);
}

// Setup all middleware
setupMiddleware(app);

// Apply routes
app.use("/", routes);

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  logger.error(err.stack);

  res.status(err.status || 500).json({
    error: "Server error",
    message: config.server.isDev ? err.message : "An unexpected error occurred",
    ...(config.server.isDev && { stack: err.stack }),
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  logger.warn(`Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Not Found",
    message: "The requested resource was not found",
    path: req.originalUrl,
  });
});

// Start the server
const server = app.listen(PORT, () => {
  logger.info(
    `NextShell server is running on port ${PORT} in ${config.server.env} mode`,
  );
  logger.info(`Access the application at http://localhost:${PORT}`);
});

// Handle server shutdown gracefully
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

function gracefulShutdown() {
  logger.info("Received shutdown signal, closing HTTP server...");
  server.close(() => {
    logger.info("Server closed, exiting process...");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error("Server shutdown timed out after 10s, forcing exit");
    process.exit(1);
  }, 10000);
}
