'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Activity, Clock, CheckCircle, Play, Square, RotateCcw } from 'lucide-react';
import { AGENT_CONFIGS } from '@/lib/agents/types';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'active' | 'busy' | 'error';
  currentTask?: string;
  tasksCompleted: number;
  averageResponseTime: number;
  lastActiveAt?: string;
}

const agentIcons: Record<string, string> = {
  coordinator: '🎯',
  code_gen: '🤖',
  testing: '🧪',
  optimization: '⚡',
  debugging: '🐛',
  documentation: '📝',
  security: '🔒',
  ui_ux: '🎨',
  deployment: '🚀',
};

const statusConfig = {
  idle: { label: 'Idle', color: '#808080' },
  active: { label: 'Active', color: '#0078d4' },
  busy: { label: 'Busy', color: '#ffc107' },
  error: { label: 'Error', color: '#dc3545' },
  offline: { label: 'Offline', color: '#404040' },
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLog, setActivityLog] = useState<any[]>([]);

  useEffect(() => {
    loadAgents();
    initializeAgents();

    // Real-time updates simulation
    const interval = setInterval(() => {
      loadAgents();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeAgents = async () => {
    // Initialize all agents in the database
    for (const config of AGENT_CONFIGS) {
      try {
        await fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: config.id,
            name: config.name,
            type: config.type,
            status: config.status,
            tasksCompleted: 0,
            averageResponseTime: 0,
          }),
        });
      } catch (error) {
        // Agent might already exist
      }
    }
  };

  const handleUpdateStatus = async (agentId: string, newStatus: 'idle' | 'active') => {
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        loadAgents();
        addActivityLog(`${agentId} status changed to ${newStatus}`);
      }
    } catch (error) {
      console.error('Failed to update agent status:', error);
    }
  };

  const handleResetAgent = async (agentId: string) => {
    if (!confirm('Reset this agent? This will clear its metrics.')) return;

    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'idle',
          currentTask: null,
          tasksCompleted: 0,
          averageResponseTime: 0,
        }),
      });

      if (response.ok) {
        loadAgents();
        addActivityLog(`${agentId} has been reset`);
      }
    } catch (error) {
      console.error('Failed to reset agent:', error);
    }
  };

  const addActivityLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setActivityLog((prev) => [
      { timestamp, message },
      ...prev.slice(0, 49), // Keep last 50 entries
    ]);
  };

  const totalTasksCompleted = agents.reduce((sum, agent) => sum + agent.tasksCompleted, 0);
  const activeAgents = agents.filter((a) => a.status === 'active' || a.status === 'busy').length;
  const avgResponseTime = agents.length > 0
    ? Math.round(agents.reduce((sum, a) => sum + a.averageResponseTime, 0) / agents.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e0e0e0] p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Bot className="w-8 h-8 text-[#0078d4]" />
          Multi-Agent Dashboard
        </h1>
        <p className="text-[#b0b0b0]">Monitor and control AI agents in real-time</p>
      </motion.div>

      {/* Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#404040]">
          <p className="text-sm text-[#b0b0b0] mb-2">Total Agents</p>
          <p className="text-3xl font-bold text-[#0078d4]">{agents.length}</p>
        </div>
        <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#404040]">
          <p className="text-sm text-[#b0b0b0] mb-2">Active Agents</p>
          <p className="text-3xl font-bold text-[#28a745]">{activeAgents}</p>
        </div>
        <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#404040]">
          <p className="text-sm text-[#b0b0b0] mb-2">Tasks Completed</p>
          <p className="text-3xl font-bold text-[#ffc107]">{totalTasksCompleted}</p>
        </div>
        <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#404040]">
          <p className="text-sm text-[#b0b0b0] mb-2">Avg Response Time</p>
          <p className="text-3xl font-bold text-white">{avgResponseTime}ms</p>
        </div>
      </motion.div>

      {/* Agent Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-4 text-center py-12 text-[#b0b0b0]">Loading agents...</div>
          ) : agents.length === 0 ? (
            <div className="col-span-4 text-center py-12 text-[#b0b0b0]">
              <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No agents available</p>
            </div>
          ) : (
            agents.map((agent, index) => {
              const config = statusConfig[agent.status as keyof typeof statusConfig] || statusConfig.idle;

              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-[#1e1e1e] rounded-lg p-5 border border-[#404040] hover:border-[#0078d4] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{agentIcons[agent.type] || '🤖'}</div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">{agent.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: config.color }}
                          />
                          <span className="text-xs" style={{ color: config.color }}>
                            {config.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {agent.currentTask && (
                    <div className="mb-3 p-2 bg-[#252525] rounded text-xs text-[#b0b0b0] line-clamp-2">
                      {agent.currentTask}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div>
                      <p className="text-[#808080] mb-1">Tasks</p>
                      <p className="font-semibold">{agent.tasksCompleted}</p>
                    </div>
                    <div>
                      <p className="text-[#808080] mb-1">Avg Time</p>
                      <p className="font-semibold">{agent.averageResponseTime}ms</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {agent.status === 'idle' ? (
                      <button
                        onClick={() => handleUpdateStatus(agent.id, 'active')}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#28a745] text-white rounded-lg hover:bg-[#218838] transition-colors text-xs font-medium"
                      >
                        <Play className="w-3 h-3" />
                        Start
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(agent.id, 'idle')}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#ffc107] text-black rounded-lg hover:bg-[#e0a800] transition-colors text-xs font-medium"
                      >
                        <Square className="w-3 h-3" />
                        Stop
                      </button>
                    )}
                    <button
                      onClick={() => handleResetAgent(agent.id)}
                      className="px-3 py-2 bg-[#252525] text-white rounded-lg hover:bg-[#333333] transition-colors"
                      aria-label="Reset agent"
                      title="Reset agent"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Activity Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#1e1e1e] rounded-lg border border-[#404040] p-6"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#0078d4]" />
          Activity Log
        </h2>
        <div className="space-y-2 max-h-64 overflow-auto">
          {activityLog.length === 0 ? (
            <p className="text-center text-[#b0b0b0] py-8">No activity yet</p>
          ) : (
            activityLog.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 text-sm p-2 bg-[#252525] rounded"
              >
                <Clock className="w-4 h-4 text-[#808080] flex-shrink-0" />
                <span className="text-[#808080] font-mono text-xs">{log.timestamp}</span>
                <span className="text-[#e0e0e0]">{log.message}</span>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
