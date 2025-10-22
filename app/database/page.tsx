'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, RefreshCw, Download, Table as TableIcon, Search } from 'lucide-react';

interface TableData {
  name: string;
  rowCount: number;
  columnCount: number;
}

interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  default?: string;
  key?: string;
}

const tables = [
  'projects',
  'files',
  'specifications',
  'versions',
  'integrations',
  'agents',
  'api_keys',
];

export default function DatabasePage() {
  const [selectedTable, setSelectedTable] = useState('projects');
  const [activeTab, setActiveTab] = useState<'stats' | 'schema' | 'data' | 'query'>('data');
  const [tableData, setTableData] = useState<any[]>([]);
  const [schema, setSchema] = useState<ColumnSchema[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTableData();
    loadTableSchema();
  }, [selectedTable]);

  const loadTableData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/database/${selectedTable}?limit=50`);
      if (response.ok) {
        const data = await response.json();
        setTableData(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load table data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTableSchema = async () => {
    try {
      const response = await fetch(`/api/database/${selectedTable}/schema`);
      if (response.ok) {
        const data = await response.json();
        setSchema(data.columns || []);
      }
    } catch (error) {
      console.error('Failed to load table schema:', error);
    }
  };

  const exportData = () => {
    const csv = convertToCSV(tableData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTable}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((header) => JSON.stringify(row[header] ?? '')).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-[#e0e0e0]">
      {/* Left Sidebar - Table List */}
      <aside className="w-[280px] bg-[#1e1e1e] border-r border-[#404040] p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Database className="w-5 h-5 text-[#0078d4]" />
            Tables ({tables.length})
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808080]" />
            <input
              type="text"
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#252525] border border-[#404040] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#0078d4]"
            />
          </div>
        </div>

        <div className="space-y-1">
          {tables
            .filter((table) => table.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((table) => (
              <button
                key={table}
                onClick={() => setSelectedTable(table)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedTable === table
                    ? 'bg-[#0078d4] text-white'
                    : 'text-[#b0b0b0] hover:bg-[#252525] hover:text-white'
                }`}
              >
                <TableIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{table}</span>
              </button>
            ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#1e1e1e] border-b border-[#404040] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">{selectedTable}</h1>
              <p className="text-sm text-[#b0b0b0]">
                {tableData.length} rows
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadTableData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#252525] text-white rounded-lg hover:bg-[#333333] transition-colors disabled:opacity-50"
                aria-label="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-[#0078d4] text-white rounded-lg hover:bg-[#005a9e] transition-colors"
                aria-label="Export data"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {(['stats', 'schema', 'data', 'query'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-[#0078d4] text-white'
                    : 'text-[#b0b0b0] hover:bg-[#252525] hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'stats' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#404040]">
                <p className="text-sm text-[#b0b0b0] mb-2">Row Count</p>
                <p className="text-3xl font-bold text-[#0078d4]">
                  {tableData.length.toLocaleString()}
                </p>
              </div>
              <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#404040]">
                <p className="text-sm text-[#b0b0b0] mb-2">Column Count</p>
                <p className="text-3xl font-bold text-[#28a745]">
                  {schema.length}
                </p>
              </div>
              <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#404040]">
                <p className="text-sm text-[#b0b0b0] mb-2">Estimated Size</p>
                <p className="text-3xl font-bold text-[#ffc107]">
                  {((JSON.stringify(tableData).length) / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#404040]">
                <p className="text-sm text-[#b0b0b0] mb-2">Last Modified</p>
                <p className="text-sm font-semibold text-white">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'schema' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1e1e1e] rounded-lg border border-[#404040] overflow-hidden"
            >
              <table className="w-full">
                <thead>
                  <tr className="bg-[#252525] border-b border-[#404040]">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[#b0b0b0]">
                      Column Name
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[#b0b0b0]">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[#b0b0b0]">
                      Nullable
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[#b0b0b0]">
                      Default
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[#b0b0b0]">
                      Key
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schema.map((column, index) => (
                    <tr
                      key={index}
                      className="border-b border-[#404040] hover:bg-[#252525] transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-sm">{column.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-[#0078d4]/20 text-[#0078d4] rounded text-xs font-semibold">
                          {column.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {column.nullable ? 'Yes' : 'No'}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#b0b0b0]">
                        {column.default || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {column.key ? (
                          <span className="px-2 py-1 bg-[#28a745]/20 text-[#28a745] rounded text-xs font-semibold">
                            {column.key}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === 'data' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1e1e1e] rounded-lg border border-[#404040] overflow-auto"
            >
              {loading ? (
                <div className="flex items-center justify-center h-64 text-[#b0b0b0]">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              ) : tableData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-[#b0b0b0]">
                  <Database className="w-12 h-12 mb-4 opacity-50" />
                  <p>No data in this table</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="sticky top-0 bg-[#252525] border-b border-[#404040] z-10">
                    <tr>
                      {Object.keys(tableData[0] || {}).map((key) => (
                        <th
                          key={key}
                          className="text-left px-4 py-3 text-sm font-semibold text-[#b0b0b0] whitespace-nowrap"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-b border-[#404040] hover:bg-[#252525] transition-colors"
                      >
                        {Object.values(row).map((value: any, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-4 py-3 text-sm text-[#e0e0e0] max-w-xs truncate"
                            title={String(value)}
                          >
                            {value === null || value === undefined
                              ? <span className="text-[#808080] italic">null</span>
                              : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>
          )}

          {activeTab === 'query' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-[#1e1e1e] rounded-lg p-4 border border-[#404040]">
                <label className="block text-sm text-[#b0b0b0] mb-2">Query Builder</label>
                <textarea
                  placeholder={`Example: SELECT * FROM ${selectedTable} WHERE status = 'active'`}
                  className="w-full h-32 bg-[#252525] border border-[#404040] rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#0078d4] resize-none"
                />
                <div className="flex gap-2 mt-3">
                  <button className="px-4 py-2 bg-[#28a745] text-white rounded-lg hover:bg-[#218838] transition-colors">
                    Run Query
                  </button>
                  <button className="px-4 py-2 bg-[#252525] text-white rounded-lg hover:bg-[#333333] transition-colors">
                    Clear
                  </button>
                </div>
              </div>

              <div className="bg-[#1e1e1e] rounded-lg p-4 border border-[#404040]">
                <h3 className="text-sm font-semibold mb-2">Query Results</h3>
                <p className="text-sm text-[#b0b0b0]">
                  Execute a query to see results here
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
