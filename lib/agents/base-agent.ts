/**
 * Base Agent Class
 * Abstract class that all specialized agents extend
 */

import { blinkClient } from '../blink-client';
import type {
  AgentType,
  AgentStatus,
  AgentMessage,
  AgentCapability,
  Task,
} from './types';

export abstract class BaseAgent {
  public readonly id: string;
  public readonly name: string;
  public readonly type: AgentType;
  public readonly capabilities: AgentCapability[];
  public readonly model: string;

  protected status: AgentStatus = 'idle';
  protected currentTask: Task | null = null;
  protected tasksCompleted: number = 0;
  protected totalResponseTime: number = 0;
  protected messageQueue: AgentMessage[] = [];

  constructor(
    id: string,
    name: string,
    type: AgentType,
    capabilities: AgentCapability[],
    model: string = 'gpt-5-turbo'
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.capabilities = capabilities;
    this.model = model;
  }

  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    try {
      // Register agent in database
      const existingAgents = await blinkClient.db.agents.list({ where: { id: this.id } });

      if (existingAgents.length === 0) {
        await blinkClient.db.agents.create({
          id: this.id,
          name: this.name,
          type: this.type,
          status: this.status,
          tasksCompleted: 0,
          averageResponseTime: 0,
        });
      }

      // Subscribe to realtime channel
      await this.subscribeToChannel();

      console.log(`[${this.name}] Initialized`);
    } catch (error) {
      console.error(`[${this.name}] Initialization failed:`, error);
    }
  }

  /**
   * Subscribe to the agents realtime channel
   */
  protected async subscribeToChannel(): Promise<void> {
    const channel = blinkClient.realtime.channel('agents');

    await channel.subscribe();

    channel.onMessage((message: any) => {
      if (message.to === this.id || message.to === 'all') {
        this.handleMessage(message);
      }
    });
  }

  /**
   * Handle incoming messages
   */
  protected handleMessage(message: AgentMessage): void {
    console.log(`[${this.name}] Received message:`, message.type);

    switch (message.type) {
      case 'task_assignment':
        this.handleTaskAssignment(message.payload);
        break;
      case 'status_update':
        // Handle status updates from other agents
        break;
      default:
        console.log(`[${this.name}] Unknown message type:`, message.type);
    }
  }

  /**
   * Handle task assignment
   */
  protected async handleTaskAssignment(task: Task): Promise<void> {
    if (this.status === 'busy') {
      this.messageQueue.push({
        id: crypto.randomUUID(),
        from: 'coordinator',
        to: this.id,
        type: 'task_assignment',
        payload: task,
        timestamp: Date.now(),
      });
      return;
    }

    await this.updateStatus('busy');
    this.currentTask = task;

    try {
      const startTime = Date.now();
      const result = await this.execute(task);
      const responseTime = Date.now() - startTime;

      // Update metrics
      this.tasksCompleted++;
      this.totalResponseTime += responseTime;

      // Send completion message
      await this.sendMessage('coordinator', 'task_complete', {
        taskId: task.id,
        result,
        responseTime,
      });

      // Update database
      await this.updateMetrics(responseTime);

      this.currentTask = null;
      await this.updateStatus('idle');

      // Process queued tasks
      if (this.messageQueue.length > 0) {
        const nextMessage = this.messageQueue.shift();
        if (nextMessage) {
          this.handleTaskAssignment(nextMessage.payload);
        }
      }
    } catch (error) {
      console.error(`[${this.name}] Task execution failed:`, error);

      await this.sendMessage('coordinator', 'task_error', {
        taskId: task.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      this.currentTask = null;
      await this.updateStatus('error');
    }
  }

  /**
   * Execute a task (to be implemented by specialized agents)
   */
  abstract execute(task: Task): Promise<any>;

  /**
   * Send message to another agent
   */
  protected async sendMessage(
    to: string,
    type: AgentMessage['type'],
    payload: any
  ): Promise<void> {
    const message: AgentMessage = {
      id: crypto.randomUUID(),
      from: this.id,
      to,
      type,
      payload,
      timestamp: Date.now(),
    };

    const channel = blinkClient.realtime.channel('agents');
    await channel.publish(type, message);

    // Log to analytics
    blinkClient.analytics.log('agent_message', {
      from: this.id,
      to,
      type,
    });
  }

  /**
   * Update agent status
   */
  protected async updateStatus(newStatus: AgentStatus): Promise<void> {
    this.status = newStatus;

    try {
      await blinkClient.db.agents.update(this.id, {
        status: newStatus,
        currentTask: this.currentTask?.description,
        lastActiveAt: new Date().toISOString(),
      });

      // Broadcast status update
      await this.sendMessage('all', 'status_update', {
        agentId: this.id,
        status: newStatus,
      });
    } catch (error) {
      console.error(`[${this.name}] Status update failed:`, error);
    }
  }

  /**
   * Update agent metrics
   */
  protected async updateMetrics(responseTime: number): Promise<void> {
    const avgResponseTime = Math.round(this.totalResponseTime / this.tasksCompleted);

    try {
      await blinkClient.db.agents.update(this.id, {
        tasksCompleted: this.tasksCompleted,
        averageResponseTime: avgResponseTime,
      });
    } catch (error) {
      console.error(`[${this.name}] Metrics update failed:`, error);
    }
  }

  /**
   * Report progress for long-running tasks
   */
  protected async reportProgress(progress: number): Promise<void> {
    if (!this.currentTask) return;

    await this.sendMessage('coordinator', 'task_progress', {
      taskId: this.currentTask.id,
      progress,
    });
  }

  /**
   * Get agent status
   */
  getStatus(): AgentStatus {
    return this.status;
  }

  /**
   * Get current task
   */
  getCurrentTask(): Task | null {
    return this.currentTask;
  }

  /**
   * Check if agent has capability
   */
  hasCapability(capabilityName: string): boolean {
    return this.capabilities.some((cap) => cap.name === capabilityName);
  }
}
