/**
 * Code Suggestion Module
 * Provides intelligent code suggestions and completions
 */
const { OpenAI } = require('openai');

class CodeSuggestions {
  constructor(options = {}) {
    this.openai = new OpenAI({
      apiKey: options.apiKey || process.env.OPENAI_API_KEY,
    });

    this.options = {
      model: options.model || 'gpt-3.5-turbo',
      temperature: options.temperature || 0.3, // Lower temperature for more focused code suggestions
      maxTokens: options.maxTokens || 200,
      language: options.language || 'javascript',
      context: options.context || {},
    };
  }

  /**
   * Generate code suggestions based on user input
   * @param {string} input - User's code or description
   * @param {Object} context - Additional context (file content, cursor position, etc.)
   * @returns {Promise<Array>} - Array of code suggestions
   */
  async getSuggestions(input, context = {}) {
    const mergedContext = { ...this.options.context, ...context };

    const prompt = this._buildPrompt(input, mergedContext);

    try {
      const response = await this.openai.chat.completions.create({
        model: this.options.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert ${this.options.language} developer. Provide concise, idiomatic code suggestions.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: this.options.temperature,
        max_tokens: this.options.maxTokens,
        n: 3, // Generate 3 suggestions
      });

      return response.choices.map(choice => ({
        suggestion: choice.message.content,
        score: choice.index === 0 ? 1 : 1 - choice.index * 0.2, // Simple scoring based on order
        metadata: {
          model: this.options.model,
          confidence: 1 - choice.index * 0.2,
        },
      }));
    } catch (error) {
      console.error('Error generating code suggestions:', error);
      throw error;
    }
  }

  /**
   * Complete partial code
   * @param {string} partialCode - Incomplete code
   * @param {Object} context - Additional context
   * @returns {Promise<string>} - Completed code
   */
  async completeCode(partialCode, context = {}) {
    const mergedContext = { ...this.options.context, ...context };

    try {
      const response = await this.openai.chat.completions.create({
        model: this.options.model,
        messages: [
          {
            role: 'system',
            content: `Complete the following ${this.options.language} code snippet. Provide only the completed code without explanations.`,
          },
          {
            role: 'user',
            content: this._buildCompletionPrompt(partialCode, mergedContext),
          },
        ],
        temperature: this.options.temperature,
        max_tokens: this.options.maxTokens,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error completing code:', error);
      throw error;
    }
  }

  /**
   * Explain code snippet
   * @param {string} code - Code to explain
   * @returns {Promise<string>} - Explanation of the code
   */
  async explainCode(code) {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.options.model,
        messages: [
          {
            role: 'system',
            content: 'Explain the following code snippet concisely and clearly.',
          },
          {
            role: 'user',
            content: code,
          },
        ],
        temperature: 0.5,
        max_tokens: this.options.maxTokens,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error explaining code:', error);
      throw error;
    }
  }

  /**
   * Build prompt for code suggestions
   * @private
   */
  _buildPrompt(input, context) {
    let prompt = `Generate ${this.options.language} code suggestions for: ${input}\n\n`;

    if (context.fileContent) {
      prompt += `Current file content:\n${context.fileContent}\n\n`;
    }

    if (context.cursorPosition) {
      prompt += `Cursor position: ${context.cursorPosition}\n`;
    }

    if (context.imports) {
      prompt += `Available imports:\n${context.imports.join('\n')}\n`;
    }

    return prompt;
  }

  /**
   * Build prompt for code completion
   * @private
   */
  _buildCompletionPrompt(partialCode, context) {
    let prompt = `Complete this code:\n${partialCode}\n\n`;

    if (context.fileContent) {
      prompt += `File context:\n${context.fileContent}\n\n`;
    }

    if (context.imports) {
      prompt += `Available imports:\n${context.imports.join('\n')}\n`;
    }

    return prompt;
  }
}

module.exports = CodeSuggestions;
