/**
 * AI Agent Routes
 * Handles API endpoints for the AI agent
 */
const express = require('express');
const router = express.Router();
const AgentAI = require('./index');
const CodeSuggestions = require('./code-suggestions');

// Initialize the AI agent and code suggestions
const agent = new AgentAI();
const codeSuggestions = new CodeSuggestions();

// Middleware to ensure agent is initialized
const ensureInitialized = async (req, res, next) => {
  try {
    if (!agent.initialized) {
      await agent.initialize();
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize AI agent', message: error.message });
  }
};

// Process a query
router.post('/query', ensureInitialized, async (req, res) => {
  try {
    const { query, context } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const response = await agent.processQuery(query, context);

    res.status(200).json({ response });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process query', message: error.message });
  }
});

// Execute a command
router.post('/execute', ensureInitialized, async (req, res) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    const result = await agent.executeCommand(command);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute command', message: error.message });
  }
});

// Suggest commands based on intent
router.post('/suggest', ensureInitialized, async (req, res) => {
  try {
    const { intent } = req.body;

    if (!intent) {
      return res.status(400).json({ error: 'Intent is required' });
    }

    const suggestions = await agent.suggestCommands(intent);

    res.status(200).json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to suggest commands', message: error.message });
  }
});

// Get code suggestions
router.post('/code/suggest', ensureInitialized, async (req, res) => {
  try {
    const { input, context } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input is required' });
    }

    const suggestions = await codeSuggestions.getSuggestions(input, context);

    res.status(200).json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate code suggestions', message: error.message });
  }
});

// Complete code
router.post('/code/complete', ensureInitialized, async (req, res) => {
  try {
    const { code, context } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const completion = await codeSuggestions.completeCode(code, context);

    res.status(200).json({ completion });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete code', message: error.message });
  }
});

// Explain code
router.post('/code/explain', ensureInitialized, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const explanation = await codeSuggestions.explainCode(code);

    res.status(200).json({ explanation });
  } catch (error) {
    res.status(500).json({ error: 'Failed to explain code', message: error.message });
  }
});

// Clear conversation history
router.post('/clear-history', ensureInitialized, (req, res) => {
  try {
    agent.clearHistory();

    res.status(200).json({ message: 'Conversation history cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear history', message: error.message });
  }
});

// Get agent status
router.get('/status', ensureInitialized, (req, res) => {
  res.status(200).json({
    status: 'active',
    model: agent.options.model,
    historyLength: agent.options.history.length,
    initialized: agent.initialized,
    codeSuggestions: {
      model: codeSuggestions.options.model,
      language: codeSuggestions.options.language,
    },
  });
});

module.exports = router;
