/**
 * Multi-Agent System Type Definitions
 * Base types for ASI-level agent coordination
 */

export type AgentType =
  | 'coordinator'
  | 'code_gen'
  | 'testing'
  | 'optimization'
  | 'debugging'
  | 'documentation'
  | 'security'
  | 'ui_ux'
  | 'deployment';

export type AgentStatus = 'idle' | 'active' | 'busy' | 'error' | 'offline';

export interface AgentCapability {
  name: string;
  description: string;
  parameters?: Record<string, any>;
}

export interface AgentConfig {
  id: string;
  name: string;
  type: AgentType;
  capabilities: AgentCapability[];
  status: AgentStatus;
  model?: string;
}

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: 'task_assignment' | 'task_progress' | 'task_complete' | 'task_error' | 'status_update';
  payload: any;
  timestamp: number;
}

export interface Task {
  id: string;
  description: string;
  type: string;
  parameters?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export interface AgentState {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  currentTask?: Task;
  tasksCompleted: number;
  averageResponseTime: number;
  lastActiveAt?: Date;
}

// Agent configuration for each specialized agent
export const AGENT_CONFIGS: AgentConfig[] = [
  {
    id: 'coordinator',
    name: 'Coordinator Agent',
    type: 'coordinator',
    status: 'active',
    capabilities: [
      {
        name: 'task_decomposition',
        description: 'Break down complex tasks into subtasks',
      },
      {
        name: 'agent_orchestration',
        description: 'Assign tasks to appropriate specialized agents',
      },
      {
        name: 'result_aggregation',
        description: 'Combine results from multiple agents',
      },
    ],
    model: 'gpt-5-turbo',
  },
  {
    id: 'code-gen-agent',
    name: 'Code Generation Agent',
    type: 'code_gen',
    status: 'idle',
    capabilities: [
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
    model: 'gpt-5-turbo',
  },
  {
    id: 'testing-agent',
    name: 'Testing Agent',
    type: 'testing',
    status: 'idle',
    capabilities: [
      {
        name: 'unit_test',
        description: 'Create and run unit tests',
      },
      {
        name: 'integration_test',
        description: 'Create and run integration tests',
      },
      {
        name: 'e2e_test',
        description: 'Create and run end-to-end tests',
      },
    ],
    model: 'gpt-4-turbo',
  },
  {
    id: 'optimization-agent',
    name: 'Optimization Agent',
    type: 'optimization',
    status: 'idle',
    capabilities: [
      {
        name: 'analyze_performance',
        description: 'Analyze code for performance bottlenecks',
      },
      {
        name: 'suggest_optimizations',
        description: 'Suggest performance improvements',
      },
      {
        name: 'bundle_analysis',
        description: 'Analyze bundle size and dependencies',
      },
    ],
    model: 'claude-3-5-sonnet',
  },
  {
    id: 'debugging-agent',
    name: 'Debugging Agent',
    type: 'debugging',
    status: 'idle',
    capabilities: [
      {
        name: 'detect_errors',
        description: 'Monitor and detect runtime errors',
      },
      {
        name: 'analyze_stacktrace',
        description: 'Analyze error stack traces',
      },
      {
        name: 'suggest_fixes',
        description: 'Propose bug fixes',
      },
    ],
    model: 'gpt-5-turbo',
  },
  {
    id: 'documentation-agent',
    name: 'Documentation Agent',
    type: 'documentation',
    status: 'idle',
    capabilities: [
      {
        name: 'generate_jsdoc',
        description: 'Generate JSDoc comments',
      },
      {
        name: 'create_readme',
        description: 'Create README files',
      },
      {
        name: 'api_docs',
        description: 'Generate API documentation',
      },
    ],
    model: 'gpt-4-turbo',
  },
  {
    id: 'security-agent',
    name: 'Security Agent',
    type: 'security',
    status: 'idle',
    capabilities: [
      {
        name: 'vulnerability_scan',
        description: 'Scan for security vulnerabilities',
      },
      {
        name: 'secret_detection',
        description: 'Detect exposed secrets and API keys',
      },
      {
        name: 'security_audit',
        description: 'Perform security audit',
      },
    ],
    model: 'gpt-4-turbo',
  },
  {
    id: 'ui-ux-agent',
    name: 'UI/UX Agent',
    type: 'ui_ux',
    status: 'idle',
    capabilities: [
      {
        name: 'accessibility_check',
        description: 'Check WCAG compliance',
      },
      {
        name: 'responsive_test',
        description: 'Test responsive design',
      },
      {
        name: 'ux_evaluation',
        description: 'Evaluate user experience',
      },
    ],
    model: 'claude-3-5-sonnet',
  },
  {
    id: 'deployment-agent',
    name: 'Deployment Agent',
    type: 'deployment',
    status: 'idle',
    capabilities: [
      {
        name: 'build_production',
        description: 'Build production bundles',
      },
      {
        name: 'deploy_vercel',
        description: 'Deploy to Vercel',
      },
      {
        name: 'manage_env',
        description: 'Manage environment variables',
      },
    ],
    model: 'gpt-4-turbo',
  },
];
