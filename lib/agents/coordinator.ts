/**
 * Coordinator Agent
 * Central orchestrator that manages all other agents
 */

import { BaseAgent } from './base-agent';
import { blinkClient } from '../blink-client';
import type { Task, AgentType } from './types';

export class CoordinatorAgent extends BaseAgent {
  private agents: Map<string, AgentType> = new Map();

  constructor() {
    super(
      'coordinator',
      'Coordinator Agent',
      'coordinator',
      [
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
      'gpt-5-turbo'
    );

    // Register available agents
    this.agents.set('code-gen-agent', 'code_gen');
    this.agents.set('testing-agent', 'testing');
    this.agents.set('optimization-agent', 'optimization');
    this.agents.set('debugging-agent', 'debugging');
    this.agents.set('documentation-agent', 'documentation');
    this.agents.set('security-agent', 'security');
    this.agents.set('ui-ux-agent', 'ui_ux');
    this.agents.set('deployment-agent', 'deployment');
  }

  /**
   * Execute coordinator task
   */
  async execute(task: Task): Promise<any> {
    console.log(`[Coordinator] Processing task: ${task.description}`);

    // Analyze task and decompose if needed
    const subtasks = await this.decomposeTask(task);

    if (subtasks.length === 0) {
      // Simple task, assign directly
      const targetAgent = this.selectAgentForTask(task);
      if (targetAgent) {
        await this.assignTaskToAgent(targetAgent, task);
        return { assigned: true, agent: targetAgent };
      }
      return { error: 'No suitable agent found' };
    }

    // Complex task, assign subtasks to multiple agents
    const assignments: any[] = [];

    for (const subtask of subtasks) {
      const targetAgent = this.selectAgentForTask(subtask);
      if (targetAgent) {
        await this.assignTaskToAgent(targetAgent, subtask);
        assignments.push({ subtask: subtask.id, agent: targetAgent });
      }
    }

    return {
      decomposed: true,
      subtasks: subtasks.length,
      assignments,
    };
  }

  /**
   * Decompose complex task into subtasks
   */
  private async decomposeTask(task: Task): Promise<Task[]> {
    // Use AI to decompose task
    const prompt = `Analyze this software development task and break it down into subtasks if needed:
Task: ${task.description}
Type: ${task.type}

If this is a simple task that can be handled by a single agent, return an empty array.
If this is a complex task, break it down into specific subtasks that can be assigned to specialized agents:
- Code Generation Agent: Writing new code, components, functions
- Testing Agent: Creating and running tests
- Optimization Agent: Performance analysis and improvements
- Debugging Agent: Finding and fixing bugs
- Documentation Agent: Writing documentation
- Security Agent: Security audits and vulnerability scanning
- UI/UX Agent: User interface and accessibility improvements
- Deployment Agent: Building and deploying applications

Return a JSON array of subtasks. Each subtask should have: description, type, and assignedTo (agent type).`;

    try {
      const { object } = await blinkClient.ai.generateObject({
        prompt,
        schema: {
          type: 'object',
          properties: {
            subtasks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                  type: { type: 'string' },
                  assignedTo: { type: 'string' },
                },
              },
            },
          },
        },
      });

      const subtasks = (object as any).subtasks || [];

      return subtasks.map((st: any) => ({
        id: crypto.randomUUID(),
        description: st.description,
        type: st.type,
        priority: task.priority || 'medium',
        status: 'pending',
      }));
    } catch (error) {
      console.error('[Coordinator] Task decomposition failed:', error);
      return [];
    }
  }

  /**
   * Select appropriate agent for a task
   */
  private selectAgentForTask(task: Task): string | null {
    const taskType = task.type.toLowerCase();

    // Map task types to agents
    if (taskType.includes('code') || taskType.includes('component') || taskType.includes('function')) {
      return 'code-gen-agent';
    } else if (taskType.includes('test')) {
      return 'testing-agent';
    } else if (taskType.includes('performance') || taskType.includes('optimize')) {
      return 'optimization-agent';
    } else if (taskType.includes('bug') || taskType.includes('debug') || taskType.includes('error')) {
      return 'debugging-agent';
    } else if (taskType.includes('doc')) {
      return 'documentation-agent';
    } else if (taskType.includes('security') || taskType.includes('vulnerability')) {
      return 'security-agent';
    } else if (taskType.includes('ui') || taskType.includes('ux') || taskType.includes('accessibility')) {
      return 'ui-ux-agent';
    } else if (taskType.includes('deploy') || taskType.includes('build')) {
      return 'deployment-agent';
    }

    // Default to code generation agent
    return 'code-gen-agent';
  }

  /**
   * Assign task to specific agent
   */
  private async assignTaskToAgent(agentId: string, task: Task): Promise<void> {
    console.log(`[Coordinator] Assigning task ${task.id} to ${agentId}`);

    await this.sendMessage(agentId, 'task_assignment', task);

    // Log analytics
    blinkClient.analytics.log('task_assigned', {
      taskId: task.id,
      agentId,
      taskType: task.type,
    });
  }

  /**
   * Handle user request
   */
  async handleUserRequest(description: string, type: string = 'general'): Promise<any> {
    const task: Task = {
      id: crypto.randomUUID(),
      description,
      type,
      priority: 'medium',
      status: 'pending',
    };

    return await this.execute(task);
  }
}

// Export singleton instance
export const coordinator = new CoordinatorAgent();
