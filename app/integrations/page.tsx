'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plug, Search, CheckCircle, Settings, Plus, Code, Trash2 } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: string;
  isActive: number;
  configuration: string;
  installed?: boolean;
}

interface PrebuiltIntegration {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  color: string;
  installed: boolean;
}

const prebuiltIntegrations: PrebuiltIntegration[] = [
  { id: 'github', name: 'GitHub', icon: '🐙', description: 'Version control, CI/CD, collaboration', category: 'Development', color: '#333', installed: true },
  { id: 'vercel', name: 'Vercel', icon: '▲', description: 'Instant deployment with previews', category: 'Deployment', color: '#000', installed: true },
  { id: 'stripe', name: 'Stripe', icon: '💳', description: 'Payment processing', category: 'Payments', color: '#635bff', installed: false },
  { id: 'slack', name: 'Slack', icon: '💬', description: 'Team notifications', category: 'Communication', color: '#4A154B', installed: false },
  { id: 'sendgrid', name: 'SendGrid', icon: '📧', description: 'Email delivery', category: 'Email', color: '#1A82E2', installed: true },
  { id: 'google-analytics', name: 'Google Analytics', icon: '📊', description: 'User behavior tracking', category: 'Analytics', color: '#F9AB00', installed: false },
  { id: 'aws-s3', name: 'AWS S3', icon: '☁️', description: 'Cloud file storage', category: 'Storage', color: '#FF9900', installed: false },
  { id: 'openai', name: 'OpenAI', icon: '🤖', description: 'GPT-4, GPT-5 AI models', category: 'AI', color: '#10a37f', installed: true },
  { id: 'postgresql', name: 'PostgreSQL', icon: '🐘', description: 'Relational database', category: 'Database', color: '#336791', installed: false },
  { id: 'mongodb', name: 'MongoDB', icon: '🍃', description: 'NoSQL database', category: 'Database', color: '#47A248', installed: false },
  { id: 'twilio', name: 'Twilio', icon: '📱', description: 'SMS and voice calls', category: 'Communication', color: '#F22F46', installed: false },
  { id: 'auth0', name: 'Auth0', icon: '🔐', description: 'Authentication service', category: 'Authentication', color: '#EB5424', installed: false },
  { id: 'cloudinary', name: 'Cloudinary', icon: '🖼️', description: 'Image/video management', category: 'Media', color: '#3448C5', installed: false },
  { id: 'sentry', name: 'Sentry', icon: '🐛', description: 'Error tracking', category: 'Monitoring', color: '#362D59', installed: false },
  { id: 'datadog', name: 'Datadog', icon: '📈', description: 'Application monitoring', category: 'Monitoring', color: '#632CA6', installed: false },
  { id: 'zapier', name: 'Zapier', icon: '⚡', description: 'Workflow automation', category: 'Automation', color: '#FF4A00', installed: false },
  { id: 'discord', name: 'Discord', icon: '💬', description: 'Community chat', category: 'Communication', color: '#5865F2', installed: false },
  { id: 'notion', name: 'Notion', icon: '📝', description: 'Documentation', category: 'Productivity', color: '#000', installed: false },
  { id: 'linear', name: 'Linear', icon: '📋', description: 'Issue tracking', category: 'Project Management', color: '#5E6AD2', installed: false },
  { id: 'figma', name: 'Figma', icon: '🎨', description: 'Design collaboration', category: 'Design', color: '#F24E1E', installed: false },
];

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<'prebuilt' | 'installed' | 'custom'>('prebuilt');
  const [searchQuery, setSearchQuery] = useState('');
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<PrebuiltIntegration | null>(null);
  const [customForm, setCustomForm] = useState({
    name: '',
    endpoint: '',
    authMethod: 'api-key',
    configuration: '',
  });

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations');
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations || []);
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  };

  const handleInstall = (integration: PrebuiltIntegration) => {
    setSelectedIntegration(integration);
    setShowInstallModal(true);
  };

  const handleInstallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntegration) return;

    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: 'default-project',
          name: selectedIntegration.name,
          type: selectedIntegration.category.toLowerCase(),
          configuration: JSON.stringify({ apiKey: 'demo-key-' + selectedIntegration.id }),
        }),
      });

      if (response.ok) {
        setShowInstallModal(false);
        setSelectedIntegration(null);
        loadIntegrations();
      }
    } catch (error) {
      console.error('Failed to install integration:', error);
    }
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: 'default-project',
          name: customForm.name,
          type: 'custom',
          configuration: JSON.stringify({
            endpoint: customForm.endpoint,
            authMethod: customForm.authMethod,
            ...JSON.parse(customForm.configuration || '{}'),
          }),
        }),
      });

      if (response.ok) {
        setCustomForm({ name: '', endpoint: '', authMethod: 'api-key', configuration: '' });
        loadIntegrations();
        alert('Custom integration created successfully!');
      }
    } catch (error) {
      console.error('Failed to create custom integration:', error);
    }
  };

  const handleUninstall = async (integrationId: string) => {
    if (!confirm('Are you sure you want to uninstall this integration?')) return;

    try {
      const response = await fetch(`/api/integrations/${integrationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadIntegrations();
      }
    } catch (error) {
      console.error('Failed to uninstall integration:', error);
    }
  };

  const filteredPrebuilt = prebuiltIntegrations.filter((integration) =>
    integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    integration.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const installedIntegrations = integrations.filter((i) => i.isActive);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e0e0e0] p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Plug className="w-8 h-8 text-[#0078d4]" />
          Integrations Hub
        </h1>
        <p className="text-[#b0b0b0]">Connect your favorite tools and services</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['prebuilt', 'installed', 'custom'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-[#0078d4] text-white'
                : 'bg-[#1e1e1e] text-[#b0b0b0] hover:bg-[#252525] hover:text-white'
            }`}
          >
            {tab === 'prebuilt' && 'Pre-built Integrations'}
            {tab === 'installed' && `My Integrations (${installedIntegrations.length})`}
            {tab === 'custom' && 'Custom Builder'}
          </button>
        ))}
      </div>

      {/* Pre-built Tab */}
      {activeTab === 'prebuilt' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#808080]" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#0078d4]"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrebuilt.map((integration) => {
              const isInstalled = integrations.some((i) => i.name === integration.name);

              return (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-[#1e1e1e] rounded-lg p-5 border-2 transition-all hover:shadow-lg ${
                    isInstalled
                      ? 'border-[#28a745]'
                      : 'border-[#404040] hover:border-[#0078d4]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{integration.icon}</div>
                      <div>
                        <h3 className="font-semibold text-white">{integration.name}</h3>
                        <span className="text-xs text-[#808080]">{integration.category}</span>
                      </div>
                    </div>
                    {isInstalled && (
                      <div className="flex items-center gap-1 text-xs text-[#28a745] bg-[#28a745]/10 px-2 py-1 rounded">
                        <CheckCircle className="w-3 h-3" />
                        Installed
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-[#b0b0b0] mb-4 line-clamp-2">{integration.description}</p>

                  <button
                    onClick={() => isInstalled ? null : handleInstall(integration)}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isInstalled
                        ? 'bg-[#252525] text-[#808080] cursor-not-allowed'
                        : 'bg-[#0078d4] text-white hover:bg-[#005a9e]'
                    }`}
                    disabled={isInstalled}
                  >
                    {isInstalled ? 'Installed' : 'Install'}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Installed Tab */}
      {activeTab === 'installed' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {installedIntegrations.length === 0 ? (
            <div className="text-center py-20 text-[#b0b0b0]">
              <Plug className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No integrations installed yet</p>
              <p className="text-sm">Install your first integration to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {installedIntegrations.map((integration) => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#1e1e1e] rounded-lg p-5 border border-[#28a745]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white mb-1">{integration.name}</h3>
                      <span className="text-xs text-[#808080] capitalize">{integration.type}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#28a745] bg-[#28a745]/10 px-2 py-1 rounded">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#252525] text-white rounded-lg hover:bg-[#333333] transition-colors text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      Configure
                    </button>
                    <button
                      onClick={() => handleUninstall(integration.id)}
                      className="px-3 py-2 bg-[#dc3545]/10 text-[#dc3545] rounded-lg hover:bg-[#dc3545]/20 transition-colors"
                      aria-label="Uninstall"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Custom Builder Tab */}
      {activeTab === 'custom' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#404040]">
            <div className="flex items-center gap-3 mb-6">
              <Code className="w-6 h-6 text-[#0078d4]" />
              <h2 className="text-xl font-semibold">Custom Integration Builder</h2>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-5">
              <div>
                <label className="block text-sm text-[#b0b0b0] mb-2">
                  Integration Name <span className="text-[#dc3545]">*</span>
                </label>
                <input
                  type="text"
                  value={customForm.name}
                  onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                  placeholder="My Custom API"
                  className="w-full bg-[#252525] border border-[#404040] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0078d4]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-[#b0b0b0] mb-2">
                  API Endpoint URL <span className="text-[#dc3545]">*</span>
                </label>
                <input
                  type="url"
                  value={customForm.endpoint}
                  onChange={(e) => setCustomForm({ ...customForm, endpoint: e.target.value })}
                  placeholder="https://api.example.com/v1"
                  className="w-full bg-[#252525] border border-[#404040] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0078d4]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-[#b0b0b0] mb-2">
                  Authentication Method
                </label>
                <select
                  value={customForm.authMethod}
                  onChange={(e) => setCustomForm({ ...customForm, authMethod: e.target.value })}
                  className="w-full bg-[#252525] border border-[#404040] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0078d4]"
                >
                  <option value="api-key">API Key</option>
                  <option value="oauth2">OAuth 2.0</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="basic">Basic Auth</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#b0b0b0] mb-2">
                  Request Configuration (JSON)
                </label>
                <textarea
                  value={customForm.configuration}
                  onChange={(e) => setCustomForm({ ...customForm, configuration: e.target.value })}
                  placeholder={'{\n  "headers": {\n    "Authorization": "Bearer {{token}}"\n  }\n}'}
                  className="w-full h-32 bg-[#252525] border border-[#404040] rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#0078d4] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  className="flex-1 px-6 py-3 bg-[#252525] text-white rounded-lg hover:bg-[#333333] transition-colors font-medium"
                >
                  Test Connection
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#0078d4] text-white rounded-lg hover:bg-[#005a9e] transition-colors font-medium"
                >
                  Create Integration
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Install Modal */}
      {showInstallModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1e1e1e] rounded-lg p-6 max-w-md w-full border border-[#404040]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">{selectedIntegration.icon}</div>
              <div>
                <h3 className="text-xl font-semibold">{selectedIntegration.name}</h3>
                <p className="text-sm text-[#b0b0b0]">{selectedIntegration.category}</p>
              </div>
            </div>

            <p className="text-sm text-[#b0b0b0] mb-6">{selectedIntegration.description}</p>

            <form onSubmit={handleInstallSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#b0b0b0] mb-2">
                    API Key / Credentials
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your API key..."
                    className="w-full bg-[#252525] border border-[#404040] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0078d4]"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowInstallModal(false);
                    setSelectedIntegration(null);
                  }}
                  className="flex-1 px-4 py-2 bg-[#252525] text-white rounded-lg hover:bg-[#333333] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0078d4] text-white rounded-lg hover:bg-[#005a9e] transition-colors font-medium"
                >
                  Install
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
