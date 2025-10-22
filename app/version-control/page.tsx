'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch,
  GitCommit,
  RotateCcw,
  Copy,
  File,
  Plus,
  Minus,
  ChevronRight,
  Clock,
} from 'lucide-react';

interface Version {
  id: string;
  commitHash: string;
  commitMessage: string;
  commitDescription?: string;
  author: string;
  authorEmail: string;
  branch: string;
  changedFiles?: string;
  additions: number;
  deletions: number;
  createdAt: string;
}

export default function VersionControlPage() {
  const [commits, setCommits] = useState<Version[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<Version | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [commitForm, setCommitForm] = useState({
    message: '',
    description: '',
  });

  useEffect(() => {
    loadCommits();
  }, []);

  useEffect(() => {
    if (commits.length > 0 && !selectedCommit) {
      setSelectedCommit(commits[0]);
    }
  }, [commits]);

  const loadCommits = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/version-control/commits');
      if (response.ok) {
        const data = await response.json();
        setCommits(data.commits || []);
      }
    } catch (error) {
      console.error('Failed to load commits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/version-control/commits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: 'default-project',
          ...commitForm,
        }),
      });

      if (response.ok) {
        setShowCommitModal(false);
        setCommitForm({ message: '', description: '' });
        loadCommits();
      }
    } catch (error) {
      console.error('Failed to create commit:', error);
    }
  };

  const handleRevert = async (commitHash: string) => {
    if (!confirm('Are you sure you want to revert to this version? Current changes will be lost.')) {
      return;
    }

    try {
      const response = await fetch('/api/version-control/revert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: 'default-project',
          commitHash,
        }),
      });

      if (response.ok) {
        alert('Successfully reverted to selected version');
        loadCommits();
      }
    } catch (error) {
      console.error('Failed to revert:', error);
      alert('Failed to revert to selected version');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getChangedFiles = (commit: Version) => {
    try {
      return commit.changedFiles ? JSON.parse(commit.changedFiles) : [];
    } catch {
      return [];
    }
  };

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-[#e0e0e0]">
      {/* Left Panel - Commit Timeline */}
      <aside className="w-[350px] bg-[#1e1e1e] border-r border-[#404040] flex flex-col">
        <div className="p-4 border-b border-[#404040]">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#0078d4]" />
            Commit History
          </h2>
          <button
            onClick={() => setShowCommitModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#28a745] text-white rounded-lg hover:bg-[#218838] transition-colors"
          >
            <GitCommit className="w-4 h-4" />
            New Commit
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="text-center py-12 text-[#b0b0b0]">Loading commits...</div>
          ) : commits.length === 0 ? (
            <div className="text-center py-12 text-[#b0b0b0]">
              <GitCommit className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No commits yet</p>
              <p className="text-sm mt-2">Create your first commit</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-[#404040]" />

              {/* Commits */}
              <div className="space-y-4">
                {commits.map((commit) => (
                  <motion.div
                    key={commit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative"
                  >
                    {/* Timeline Dot */}
                    <div
                      className={`absolute left-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        selectedCommit?.id === commit.id
                          ? 'bg-[#0078d4] border-[#0078d4]'
                          : 'bg-[#1e1e1e] border-[#404040]'
                      }`}
                    >
                      <GitCommit className="w-4 h-4" />
                    </div>

                    {/* Commit Card */}
                    <button
                      onClick={() => setSelectedCommit(commit)}
                      className={`ml-12 w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedCommit?.id === commit.id
                          ? 'bg-[#0078d4]/10 border-[#0078d4]'
                          : 'bg-[#252525] border-[#404040] hover:border-[#0078d4]'
                      }`}
                    >
                      <p className="font-semibold text-sm mb-1">{commit.commitMessage}</p>
                      {commit.commitDescription && (
                        <p className="text-xs text-[#b0b0b0] mb-2 line-clamp-2">
                          {commit.commitDescription}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-[#808080]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(commit.createdAt).toLocaleDateString()}
                        </span>
                        <span>{commit.author}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-[#28a745]">+{commit.additions}</span>
                        <span className="text-xs text-[#dc3545]">-{commit.deletions}</span>
                        <code className="text-xs text-[#808080] ml-auto font-mono">
                          {commit.commitHash.substring(0, 7)}
                        </code>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Right Panel - Commit Details */}
      <div className="flex-1 flex flex-col">
        {selectedCommit ? (
          <>
            <header className="bg-[#1e1e1e] border-b border-[#404040] p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{selectedCommit.commitMessage}</h1>
                  {selectedCommit.commitDescription && (
                    <p className="text-[#b0b0b0] mb-3">{selectedCommit.commitDescription}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-[#b0b0b0]">
                    <span>
                      <strong className="text-white">{selectedCommit.author}</strong> &lt;
                      {selectedCommit.authorEmail}&gt;
                    </span>
                    <span>{formatDate(selectedCommit.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(selectedCommit.commitHash)}
                    className="flex items-center gap-2 px-3 py-2 bg-[#252525] text-white rounded-lg hover:bg-[#333333] transition-colors text-sm"
                    title="Copy hash"
                  >
                    <Copy className="w-4 h-4" />
                    <code className="font-mono">{selectedCommit.commitHash.substring(0, 10)}</code>
                  </button>
                  <button
                    onClick={() => handleRevert(selectedCommit.commitHash)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#ffc107] text-black rounded-lg hover:bg-[#e0a800] transition-colors font-medium text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Revert to This Version
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center gap-2">
                  <File className="w-4 h-4 text-[#b0b0b0]" />
                  {getChangedFiles(selectedCommit).length} files changed
                </span>
                <span className="flex items-center gap-2 text-[#28a745]">
                  <Plus className="w-4 h-4" />
                  {selectedCommit.additions} additions
                </span>
                <span className="flex items-center gap-2 text-[#dc3545]">
                  <Minus className="w-4 h-4" />
                  {selectedCommit.deletions} deletions
                </span>
              </div>
            </header>

            <div className="flex-1 overflow-auto p-6">
              <h3 className="text-lg font-semibold mb-4">Changed Files</h3>

              {getChangedFiles(selectedCommit).length === 0 ? (
                <div className="text-center py-12 text-[#b0b0b0]">
                  <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No file changes recorded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getChangedFiles(selectedCommit).map((file: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-[#1e1e1e] rounded-lg p-4 border border-[#404040] hover:border-[#0078d4] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <File className="w-5 h-5 text-[#0078d4]" />
                        <code className="flex-1 font-mono text-sm">{file.path || file}</code>
                        <div className="flex items-center gap-2 text-xs">
                          {file.additions !== undefined && (
                            <span className="text-[#28a745]">+{file.additions}</span>
                          )}
                          {file.deletions !== undefined && (
                            <span className="text-[#dc3545]">-{file.deletions}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#b0b0b0]">
            <div className="text-center">
              <GitCommit className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select a commit to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Commit Modal */}
      {showCommitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1e1e1e] rounded-lg p-6 max-w-lg w-full border border-[#404040]"
          >
            <h3 className="text-xl font-semibold mb-4">Create New Commit</h3>
            <form onSubmit={handleCreateCommit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#b0b0b0] mb-2">
                    Commit Message <span className="text-[#dc3545]">*</span>
                  </label>
                  <input
                    type="text"
                    value={commitForm.message}
                    onChange={(e) =>
                      setCommitForm({ ...commitForm, message: e.target.value })
                    }
                    placeholder="Add new feature..."
                    className="w-full bg-[#252525] border border-[#404040] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0078d4]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#b0b0b0] mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={commitForm.description}
                    onChange={(e) =>
                      setCommitForm({ ...commitForm, description: e.target.value })
                    }
                    placeholder="Detailed description of changes..."
                    className="w-full h-24 bg-[#252525] border border-[#404040] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0078d4] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCommitModal(false);
                    setCommitForm({ message: '', description: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-[#252525] text-white rounded-lg hover:bg-[#333333] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#28a745] text-white rounded-lg hover:bg-[#218838] transition-colors font-medium"
                >
                  Create Commit
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
