'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Key,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  RotateCw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface ApiKey {
  id: string;
  provider: string;
  keyName: string;
  keyValue: string;
  isActive: number;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
}

const providers = [
  { value: 'openai', label: 'OpenAI', color: '#10a37f' },
  { value: 'anthropic', label: 'Anthropic', color: '#d97757' },
  { value: 'groq', label: 'Groq', color: '#f55036' },
  { value: 'google', label: 'Google AI', color: '#4285f4' },
  { value: 'blink', label: 'Blink', color: '#0078d4' },
  { value: 'custom', label: 'Custom', color: '#808080' },
];

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [testingKey, setTestingKey] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    provider: 'openai',
    keyName: '',
    keyValue: '',
  });

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.keys || []);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 12) return '••••••••';
    return `${key.substring(0, 8)}••••${key.substring(key.length - 4)}`;
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newRevealed = new Set(revealedKeys);
    if (newRevealed.has(keyId)) {
      newRevealed.delete(keyId);
    } else {
      newRevealed.add(keyId);
    }
    setRevealedKeys(newRevealed);
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({ provider: 'openai', keyName: '', keyValue: '' });
        loadApiKeys();
      }
    } catch (error) {
      console.error('Failed to add API key:', error);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      const response = await fetch(`/api/settings/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadApiKeys();
      }
    } catch (error) {
      console.error('Failed to delete API key:', error);
    }
  };

  const handleTestKey = async (keyId: string, provider: string, keyValue: string) => {
    setTestingKey(keyId);
    try {
      const response = await fetch('/api/settings/api-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, keyValue }),
      });

      const result = await response.json();
      alert(result.success ? 'Connection successful!' : `Connection failed: ${result.error}`);
    } catch (error) {
      alert('Test failed: Network error');
    } finally {
      setTestingKey(null);
    }
  };

  const getProviderColor = (provider: string) => {
    return providers.find((p) => p.value === provider)?.color || '#808080';
  };

  const getProviderLabel = (provider: string) => {
    return providers.find((p) => p.value === provider)?.label || provider;
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e0e0e0] p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-[#b0b0b0]">Manage your API keys and IDE preferences</p>
      </motion.div>

      {/* Blink Project ID Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#1e1e1e] rounded-lg p-6 mb-6 border border-[#404040]"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-[#0078d4]" />
          Blink Project Configuration
        </h2>
        <div className="bg-[#252525] rounded-lg p-4 border border-[#404040]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#b0b0b0] mb-1">Project ID</p>
              <code className="text-[#0078d4] font-mono text-sm">
                yetr-content-creation-models-obbf3aln
              </code>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#28a745]" />
              <span className="text-sm text-[#28a745]">Connected</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* API Keys Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#1e1e1e] rounded-lg p-6 mb-6 border border-[#404040]"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Key className="w-5 h-5 text-[#0078d4]" />
            API Keys
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0078d4] text-white rounded-lg hover:bg-[#005a9e] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Key
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#b0b0b0]">Loading API keys...</div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-12 text-[#b0b0b0]">
            <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No API keys configured yet</p>
            <p className="text-sm mt-2">Add your first API key to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <motion.div
                key={key.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#252525] rounded-lg p-4 border border-[#404040] hover:border-[#0078d4] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Provider Badge */}
                    <div
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: getProviderColor(key.provider) }}
                    >
                      {getProviderLabel(key.provider)}
                    </div>

                    {/* Key Info */}
                    <div className="flex-1">
                      <p className="font-medium mb-1">{key.keyName}</p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-[#b0b0b0] font-mono">
                          {revealedKeys.has(key.id) ? key.keyValue : maskApiKey(key.keyValue)}
                        </code>
                        <button
                          onClick={() => toggleKeyVisibility(key.id)}
                          className="text-[#b0b0b0] hover:text-white transition-colors"
                          aria-label={revealedKeys.has(key.id) ? 'Hide key' : 'Show key'}
                        >
                          {revealedKeys.has(key.id) ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="text-right text-sm">
                      <p className="text-[#b0b0b0]">Usage</p>
                      <p className="font-semibold">{key.usageCount.toLocaleString()} calls</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleTestKey(key.id, key.provider, key.keyValue)}
                      disabled={testingKey === key.id}
                      className="p-2 text-[#b0b0b0] hover:text-[#0078d4] hover:bg-[#333333] rounded-lg transition-colors disabled:opacity-50"
                      aria-label="Test connection"
                      title="Test connection"
                    >
                      <RotateCw
                        className={`w-4 h-4 ${testingKey === key.id ? 'animate-spin' : ''}`}
                      />
                    </button>
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      className="p-2 text-[#b0b0b0] hover:text-[#dc3545] hover:bg-[#333333] rounded-lg transition-colors"
                      aria-label="Delete key"
                      title="Delete key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Usage Statistics Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
      >
        <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#404040]">
          <p className="text-sm text-[#b0b0b0] mb-2">Total API Calls (30d)</p>
          <p className="text-3xl font-bold text-[#0078d4]">
            {apiKeys.reduce((sum, key) => sum + key.usageCount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#404040]">
          <p className="text-sm text-[#b0b0b0] mb-2">Active Keys</p>
          <p className="text-3xl font-bold text-[#28a745]">
            {apiKeys.filter((k) => k.isActive).length}
          </p>
        </div>
        <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#404040]">
          <p className="text-sm text-[#b0b0b0] mb-2">Providers</p>
          <p className="text-3xl font-bold text-[#ffc107]">
            {new Set(apiKeys.map((k) => k.provider)).size}
          </p>
        </div>
      </motion.section>

      {/* Add Key Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1e1e1e] rounded-lg p-6 max-w-md w-full border border-[#404040]"
          >
            <h3 className="text-xl font-semibold mb-4">Add New API Key</h3>
            <form onSubmit={handleAddKey}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#b0b0b0] mb-2">Provider</label>
                  <select
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full bg-[#252525] border border-[#404040] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0078d4]"
                  >
                    {providers.map((provider) => (
                      <option key={provider.value} value={provider.value}>
                        {provider.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#b0b0b0] mb-2">Key Name</label>
                  <input
                    type="text"
                    value={formData.keyName}
                    onChange={(e) => setFormData({ ...formData, keyName: e.target.value })}
                    placeholder="e.g., Production OpenAI Key"
                    className="w-full bg-[#252525] border border-[#404040] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0078d4]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#b0b0b0] mb-2">API Key</label>
                  <input
                    type="password"
                    value={formData.keyValue}
                    onChange={(e) => setFormData({ ...formData, keyValue: e.target.value })}
                    placeholder="sk-..."
                    className="w-full bg-[#252525] border border-[#404040] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0078d4]"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ provider: 'openai', keyName: '', keyValue: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-[#252525] text-white rounded-lg hover:bg-[#333333] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0078d4] text-white rounded-lg hover:bg-[#005a9e] transition-colors"
                >
                  Add Key
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
