/**
 * Code Generation Agent
 * Specialized agent for generating React/TypeScript code
 */

import { BaseAgent } from './base-agent';
import { blinkClient } from '../blink-client';
import type { Task } from './types';

export class CodeGenerationAgent extends BaseAgent {
  constructor() {
    super(
      'code-gen-agent',
      'Code Generation Agent',
      'code_gen',
      [
        {
          name: 'generate_component',
          description: 'Generate React/TypeScript components',
        },
        {
          name: 'generate_function',
          description: 'Generate utility functions and business logic',
        },
        {
          name: 'refactor_code',
          description: 'Refactor existing code for better quality',
        },
      ],
      'gpt-5-turbo'
    );
  }

  /**
   * Execute code generation task
   */
  async execute(task: Task): Promise<any> {
    console.log(`[Code Gen] Generating code for: ${task.description}`);

    try {
      // Report progress
      await this.reportProgress(10);

      // Prepare prompt
      const prompt = `You are an expert React and TypeScript developer. ${task.description}

Generate clean, production-ready code following best practices:
- Use TypeScript with proper type definitions
- Follow React best practices and hooks patterns
- Include proper error handling
- Add JSDoc comments
- Use modern ES6+ syntax
- Ensure accessibility (ARIA labels, semantic HTML)

Return only the code without explanations.`;

      await this.reportProgress(30);

      // Generate code using AI
      const { text } = await blinkClient.ai.generateText({
        prompt,
        model: this.model,
      });

      await this.reportProgress(80);

      // Validate generated code (basic check)
      if (text.length < 50) {
        throw new Error('Generated code is too short');
      }

      await this.reportProgress(100);

      return {
        code: text,
        language: 'typescript',
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[Code Gen] Code generation failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const codeGenerationAgent = new CodeGenerationAgent();
