'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  Trash2,
  Edit2,
} from 'lucide-react';

interface Specification {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'planned' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  acceptanceCriteria?: string;
  assignedTo?: string;
  targetRelease?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: string;
  description: string;
  completed: boolean;
  assignee?: string;
}

const statusConfig = {
  planned: { label: 'Planned', color: '#808080', icon: Circle },
  in_progress: { label: 'In Progress', color: '#ffc107', icon: Clock },
  completed: { label: 'Completed', color: '#28a745', icon: CheckCircle },
};

const priorityConfig = {
  low: { label: 'Low', emoji: '🟢', color: '#28a745' },
  medium: { label: 'Medium', emoji: '🟡', color: '#ffc107' },
  high: { label: 'High', emoji: '🟠', color: '#ff6b6b' },
  critical: { label: 'Critical', emoji: '🔴', color: '#dc3545' },
};

export default function SpecificationsPage() {
  const [specs, setSpecs] = useState<Specification[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<Specification | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'planned' | 'in_progress' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    assignedTo: '',
    targetRelease: '',
  });

  useEffect(() => {
    loadSpecs();
  }, []);

  useEffect(() => {
    if (specs.length > 0 && !selectedSpec) {
      setSelectedSpec(specs[0]);
    }
  }, [specs]);

  useEffect(() => {
    if (selectedSpec) {
      loadTasks(selectedSpec.id);
    }
  }, [selectedSpec]);

  const loadSpecs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/specifications');
      if (response.ok) {
        const data = await response.json();
        setSpecs(data.specs || []);
      }
    } catch (error) {
      console.error('Failed to load specifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (specId: string) => {
    try {
      const response = await fetch(`/api/specifications/${specId}/tasks`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const handleCreateSpec = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/specifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: 'default-project',
          status: 'planned',
          progress: 0,
          ...formData,
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          assignedTo: '',
          targetRelease: '',
        });
        loadSpecs();
      }
    } catch (error) {
      console.error('Failed to create specification:', error);
    }
  };

  const handleDeleteSpec = async (specId: string) => {
    if (!confirm('Are you sure you want to delete this specification?')) return;

    try {
      const response = await fetch(`/api/specifications/${specId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadSpecs();
        if (selectedSpec?.id === specId) {
          setSelectedSpec(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete specification:', error);
    }
  };

  const handleUpdateStatus = async (specId: string, newStatus: Specification['status']) => {
    try {
      const response = await fetch(`/api/specifications/${specId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        loadSpecs();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/specifications/${selectedSpec?.id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });

      if (response.ok) {
        loadTasks(selectedSpec!.id);
        // Update progress
        const completedCount = tasks.filter((t) => t.id === taskId ? completed : t.completed).length;
        const progress = Math.round((completedCount / tasks.length) * 100);
        await fetch(`/api/specifications/${selectedSpec?.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ progress }),
        });
        loadSpecs();
      }
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleAddTask = async () => {
    const description = prompt('Enter task description:');
    if (!description || !selectedSpec) return;

    try {
      const response = await fetch(`/api/specifications/${selectedSpec.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, completed: false }),
      });

      if (response.ok) {
        loadTasks(selectedSpec.id);
      }
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const filteredSpecs = specs.filter((spec) => {
    if (activeFilter === 'all') return true;
    return spec.status === activeFilter;
  });

  const getCriteria = (spec: Specification) => {
    try {
      return spec.acceptanceCriteria ? JSON.parse(spec.acceptanceCriteria) : [];
    } catch {
      return [];
    }
  };

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-[#e0e0e0]">
      {/* Left Panel - Feature List */}
      <aside className="w-[320px] bg-[#1e1e1e] border-r border-[#404040] flex flex-col">
        <div className="p-4 border-b border-[#404040]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0078d4]" />
              Specifications
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 bg-[#0078d4] text-white rounded-lg hover:bg-[#005a9e] transition-colors"
              aria-label="Create new specification"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1">
            {(['all', 'planned', 'in_progress', 'completed'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-[#0078d4] text-white'
                    : 'text-[#b0b0b0] hover:bg-[#252525] hover:text-white'
                }`}
              >
                {filter === 'all' ? 'All' : filter === 'in_progress' ? 'Active' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="text-center py-12 text-[#b0b0b0]">Loading...</div>
          ) : filteredSpecs.length === 0 ? (
            <div className="text-center py-12 text-[#b0b0b0]">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No specifications</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSpecs.map((spec) => {
                const StatusIcon = statusConfig[spec.status].icon;
                return (
                  <motion.button
                    key={spec.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedSpec(spec)}
                    className={`w-full text-left p-3 rounded-lg border-l-4 transition-all ${
                      selectedSpec?.id === spec.id
                        ? 'bg-[#0078d4]/10 border-[#0078d4]'
                        : 'bg-[#252525] border-transparent hover:border-[#0078d4]'
                    }`}
                    style={{ borderLeftColor: selectedSpec?.id === spec.id ? priorityConfig[spec.priority].color : undefined }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm flex-1">{spec.title}</h3>
                      <StatusIcon className="w-4 h-4 flex-shrink-0" style={{ color: statusConfig[spec.status].color }} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#b0b0b0]">
                      <span>{priorityConfig[spec.priority].emoji}</span>
                      <span>{spec.progress}%</span>
                      {tasks.length > 0 && (
                        <span>• {tasks.filter((t) => t.completed).length}/{tasks.length} tasks</span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Right Panel - Feature Details */}
      <div className="flex-1 flex flex-col">
        {selectedSpec ? (
          <>
            <header className="bg-[#1e1e1e] border-b border-[#404040] p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{selectedSpec.title}</h1>
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: `${statusConfig[selectedSpec.status].color}20`, color: statusConfig[selectedSpec.status].color }}
                    >
                      {statusConfig[selectedSpec.status].label}
                    </span>
                    <span className="text-sm">
                      {priorityConfig[selectedSpec.priority].emoji} {priorityConfig[selectedSpec.priority].label} Priority
                    </span>
                    {selectedSpec.assignedTo && (
                      <span className="text-sm text-[#b0b0b0]">
                        Assigned to: <strong className="text-white">{selectedSpec.assignedTo}</strong>
                      </span>
                    )}
                    {selectedSpec.targetRelease && (
                      <span className="text-sm text-[#b0b0b0]">
                        Target: <strong className="text-white">{selectedSpec.targetRelease}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteSpec(selectedSpec.id)}
                    className="p-2 text-[#dc3545] hover:bg-[#dc3545]/10 rounded-lg transition-colors"
                    aria-label="Delete specification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[#b0b0b0]">Progress</span>
                  <span className="font-semibold">{selectedSpec.progress}%</span>
                </div>
                <div className="w-full h-2 bg-[#252525] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedSpec.progress}%` }}
                    className="h-full bg-[#0078d4]"
                  />
                </div>
              </div>

              {/* Status Change Buttons */}
              <div className="flex gap-2">
                {(['planned', 'in_progress', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(selectedSpec.id, status)}
                    disabled={selectedSpec.status === status}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedSpec.status === status
                        ? 'bg-[#252525] text-[#808080] cursor-not-allowed'
                        : 'bg-[#252525] text-white hover:bg-[#333333]'
                    }`}
                  >
                    {statusConfig[status].label}
                  </button>
                ))}
              </div>
            </header>

            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Description */}
              <section>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <div className="bg-[#1e1e1e] rounded-lg p-4 border border-[#404040]">
                  <p className="text-[#e0e0e0] leading-relaxed">{selectedSpec.description}</p>
                </div>
              </section>

              {/* Acceptance Criteria */}
              <section>
                <h3 className="text-lg font-semibold mb-3">Acceptance Criteria</h3>
                <div className="space-y-2">
                  {getCriteria(selectedSpec).length === 0 ? (
                    <div className="bg-[#1e1e1e] rounded-lg p-4 border border-[#404040] text-center text-[#b0b0b0]">
                      No acceptance criteria defined
                    </div>
                  ) : (
                    getCriteria(selectedSpec).map((criterion: string, index: number) => (
                      <div
                        key={index}
                        className="bg-[#1e1e1e] rounded-lg p-3 border border-[#404040] flex items-start gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-[#28a745] flex-shrink-0 mt-0.5" />
                        <p className="text-sm flex-1">{criterion}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Implementation Tasks */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">
                    Implementation Tasks ({tasks.filter((t) => t.completed).length}/{tasks.length} completed)
                  </h3>
                  <button
                    onClick={handleAddTask}
                    className="flex items-center gap-2 px-3 py-1 bg-[#0078d4] text-white rounded-lg hover:bg-[#005a9e] transition-colors text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    Add Task
                  </button>
                </div>

                <div className="space-y-2">
                  {tasks.length === 0 ? (
                    <div className="bg-[#1e1e1e] rounded-lg p-4 border border-[#404040] text-center text-[#b0b0b0]">
                      No tasks yet
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-[#1e1e1e] rounded-lg p-3 border border-[#404040] flex items-center gap-3 hover:border-[#0078d4] transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) => handleToggleTask(task.id, e.target.checked)}
                          className="w-4 h-4 rounded border-[#404040] bg-[#252525] checked:bg-[#0078d4] checked:border-[#0078d4] cursor-pointer"
                        />
                        <span
                          className={`flex-1 ${
                            task.completed ? 'line-through text-[#808080]' : 'text-white'
                          }`}
                        >
                          {task.description}
                        </span>
                        {task.assignee && (
                          <span className="text-xs px-2 py-1 bg-[#252525] rounded text-[#b0b0b0]">
                            {task.assignee}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#b0b0b0]">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select a specification to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1e1e1e] rounded-lg p-6 max-w-2xl w-full border border-[#404040] max-h-[90vh] overflow-auto"
          >
            <h3 className="text-xl font-semibold mb-4">Create New Specification</h3>
            <form onSubmit={handleCreateSpec}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#b0b0b0] mb-2">
                    Title <span className="text-[#dc3545]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Feature name..."
                    className="w-full bg-[#252525] border border-[#404040] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0078d4]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#b0b0b0] mb-2">
                    Description <span className="text-[#dc3545]">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed description..."
                    className="w-full h-24 bg-[#252525] border border-[#404040] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0078d4] resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-[#b0b0b0] mb-2">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full bg-[#252525] border border-[#404040] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0078d4]"
                    >
                      {Object.entries(priorityConfig).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.emoji} {config.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-[#b0b0b0] mb-2">Assigned To</label>
                    <input
                      type="text"
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      placeholder="Team member..."
                      className="w-full bg-[#252525] border border-[#404040] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0078d4]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#b0b0b0] mb-2">Target Release</label>
                    <input
                      type="text"
                      value={formData.targetRelease}
                      onChange={(e) => setFormData({ ...formData, targetRelease: e.target.value })}
                      placeholder="v1.0.0"
                      className="w-full bg-[#252525] border border-[#404040] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0078d4]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      title: '',
                      description: '',
                      priority: 'medium',
                      assignedTo: '',
                      targetRelease: '',
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-[#252525] text-white rounded-lg hover:bg-[#333333] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0078d4] text-white rounded-lg hover:bg-[#005a9e] transition-colors font-medium"
                >
                  Create Specification
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
