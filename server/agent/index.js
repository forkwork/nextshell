/**
 * NextShell AI Agent
 * Provides AI-powered assistance for terminal operations
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class AgentAI {
  constructor(options = {}) {
    this.options = {
      model: options.model || 'gpt-3.5-turbo',
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 150,
      apiKey: options.apiKey || process.env.OPENAI_API_KEY,
      history: [],
      context: options.context || {},
    };

    this.initialized = false;
  }

  /**
   * Initialize the AI agent
   */
  async initialize() {
    if (this.initialized) return true;

    // Check if API key is available
    if (!this.options.apiKey) {
      throw new Error(
        'OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it in options.'
      );
    }

    // Load any saved context or history
    this._loadContext();

    this.initialized = true;
    return true;
  }

  /**
   * Process a user query and generate a response
   * @param {string} query - The user's query
   * @param {Object} context - Additional context for the query
   * @returns {Promise<string>} - The AI's response
   */
  async processQuery(query, context = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    // Merge context with default context
    const mergedContext = { ...this.options.context, ...context };

    // Add query to history
    this.options.history.push({ role: 'user', content: query });

    try {
      // In a real implementation, this would call the OpenAI API
      // For now, we'll simulate a response
      const response = await this._simulateAIResponse(query, mergedContext);

      // Add response to history
      this.options.history.push({ role: 'assistant', content: response });

      // Save context after successful query
      this._saveContext();

      return response;
    } catch (error) {
      console.error('Error processing query:', error);
      throw error;
    }
  }

  /**
   * Execute a command based on AI suggestion
   * @param {string} command - The command to execute
   * @returns {Promise<Object>} - Command execution result
   */
  async executeCommand(command) {
    return new Promise((resolve, reject) => {
      const parts = command.split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);

      const process = spawn(cmd, args, { shell: true });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', data => {
        stdout += data.toString();
      });

      process.stderr.on('data', data => {
        stderr += data.toString();
      });

      process.on('close', code => {
        resolve({
          command,
          stdout,
          stderr,
          exitCode: code,
        });
      });

      process.on('error', err => {
        reject(err);
      });
    });
  }

  /**
   * Suggest commands based on user intent
   * @param {string} intent - The user's intent
   * @returns {Promise<Array>} - Array of suggested commands
   */
  async suggestCommands(intent) {
    // In a real implementation, this would use the AI to generate command suggestions
    // For now, we'll return some basic suggestions based on keywords
    const suggestions = [];

    if (intent.includes('list') || intent.includes('show') || intent.includes('ls')) {
      suggestions.push('ls -la');
    }

    if (intent.includes('find') || intent.includes('search')) {
      suggestions.push('find . -name "*" -type f');
    }

    if (intent.includes('grep') || intent.includes('search') || intent.includes('find in files')) {
      suggestions.push('grep -r "pattern" .');
    }

    if (intent.includes('git') || intent.includes('repository')) {
      suggestions.push('git status');
      suggestions.push('git log --oneline');
    }

    if (intent.includes('process') || intent.includes('ps')) {
      suggestions.push('ps aux');
    }

    return suggestions;
  }

  /**
   * Clear the conversation history
   */
  clearHistory() {
    this.options.history = [];
    this._saveContext();
  }

  /**
   * Load context from file
   * @private
   */
  _loadContext() {
    const contextPath = path.join(__dirname, 'context.json');

    if (fs.existsSync(contextPath)) {
      try {
        const contextData = fs.readFileSync(contextPath, 'utf8');
        const context = JSON.parse(contextData);

        this.options.context = context.context || {};
        this.options.history = context.history || [];
      } catch (error) {
        console.error('Error loading context:', error);
      }
    }
  }

  /**
   * Save context to file
   * @private
   */
  _saveContext() {
    const contextPath = path.join(__dirname, 'context.json');

    try {
      const contextData = JSON.stringify(
        {
          context: this.options.context,
          history: this.options.history.slice(-10), // Keep only the last 10 messages
        },
        null,
        2
      );

      fs.writeFileSync(contextPath, contextData, 'utf8');
    } catch (error) {
      console.error('Error saving context:', error);
    }
  }

  /**
   * Simulate AI response (placeholder for actual API call)
   * @private
   */
  async _simulateAIResponse(query, context) {
    // In a real implementation, this would call the OpenAI API
    // For now, we'll return a simulated response

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate a response based on the query
    let response = `I understand you're asking about: "${query}"\n\n`;

    if (query.includes('help') || query.includes('what can you do')) {
      response += 'I can help you with:\n';
      response += '- Executing terminal commands\n';
      response += '- Suggesting commands based on your intent\n';
      response += '- Explaining command usage\n';
      response += '- Providing information about your system\n';
    } else if (query.includes('command') || query.includes('how to')) {
      response += 'Here are some commands you might find useful:\n';
      response += '- `ls -la`: List all files including hidden ones\n';
      response += '- `find . -name "*.js"`: Find all JavaScript files\n';
      response += '- `grep -r "pattern" .`: Search for a pattern in files\n';
    } else {
      response += 'I can help you with terminal operations. What would you like to do?';
    }

    return response;
  }
}

module.exports = AgentAI;
