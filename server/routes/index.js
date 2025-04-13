/**
 * Application routes
 */
const express = require('express');
const path = require('path');
const router = express.Router();
const agentRoutes = require('../agent/routes');

// Mount AI agent routes
router.use('/api/agent', agentRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// API version endpoint
router.get('/api/version', (req, res) => {
  res.status(200).json({
    name: 'NextShell',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Get available themes
router.get('/api/themes', (req, res) => {
  // This would typically come from a database or filesystem scan
  const themes = [
    { id: 'default', name: 'Default', description: 'The default NextShell theme' },
    { id: 'dark', name: 'Dark Mode', description: 'Dark theme optimized for low light' },
    { id: 'light', name: 'Light Mode', description: 'Light theme for daytime use' },
  ];

  res.status(200).json(themes);
});

// Get available keysets
router.get('/api/keysets', (req, res) => {
  // This would typically come from a database or filesystem scan
  const keysets = [
    { id: 'default', name: 'Default', description: 'Standard key mappings' },
    { id: 'vim', name: 'Vim', description: 'Vim-style key mappings' },
    { id: 'emacs', name: 'Emacs', description: 'Emacs-style key mappings' },
  ];

  res.status(200).json(keysets);
});

// Run a terminal command (placeholder implementation)
router.post('/api/terminal/command', (req, res) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    // In a real implementation, this would execute the command securely
    // For demo purposes, we're just echoing back the command
    res.status(200).json({
      command,
      output: `Executed command: ${command}`,
      exitCode: 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute command', message: error.message });
  }
});

// Main HTML page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

module.exports = router;
