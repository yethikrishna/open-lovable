/**
 * Blink SDK Client
 * Centralized Blink SDK configuration and initialization
 * Project ID: yetr-content-creation-models-obbf3aln
 */

// Type definitions for Blink SDK
export interface BlinkClientConfig {
  projectId: string;
  authRequired?: boolean;
}

export interface DatabaseTable<T = any> {
  create(data: Partial<T>): Promise<T>;
  createMany(data: Partial<T>[]): Promise<T[]>;
  upsertMany(data: Partial<T>[]): Promise<T[]>;
  list(options?: ListOptions): Promise<T[]>;
  findOne(options: ListOptions): Promise<T | null>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

export interface ListOptions {
  where?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  limit?: number;
  offset?: number;
}

export interface GenerateTextOptions {
  prompt: string;
  model?: string;
  search?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateTextResponse {
  text: string;
  sources?: Array<{ url: string; title: string }>;
}

export interface GenerateObjectOptions {
  prompt: string;
  schema: any;
  model?: string;
}

export interface GenerateImageOptions {
  prompt: string;
  model?: string;
  size?: string;
  n?: number;
}

export interface ModifyImageOptions {
  images: string[];
  prompt: string;
}

export interface GenerateSpeechOptions {
  text: string;
  voice?: string;
  model?: string;
}

export interface TranscribeAudioOptions {
  audio: string;
  language?: string;
  model?: string;
}

export interface StorageUploadOptions {
  upsert?: boolean;
}

export interface FetchOptions {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{ url: string; filename: string }>;
}

export interface PresenceUser {
  userId: string;
  metadata?: Record<string, any>;
}

export interface RealtimeMessage {
  type: string;
  data: any;
  from?: string;
  timestamp: number;
}

// Database table schemas
export interface Project {
  id: string;
  name: string;
  description?: string;
  userId: string;
  status: 'active' | 'archived' | 'completed';
  sandboxId?: string;
  repositoryUrl?: string;
  deploymentUrl?: string;
  framework?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileRecord {
  id: string;
  projectId: string;
  path: string;
  content: string;
  language?: string;
  size?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Specification {
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

export interface Version {
  id: string;
  projectId: string;
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

export interface Integration {
  id: string;
  projectId: string;
  name: string;
  type: string;
  isActive: number;
  configuration: string;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'active' | 'busy' | 'error';
  currentTask?: string;
  tasksCompleted: number;
  averageResponseTime: number;
  lastActiveAt?: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  provider: string;
  keyName: string;
  keyValue: string;
  isActive: number;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock implementation for development
// NOTE: Replace with actual Blink SDK when available
class MockBlinkClient {
  private projectId: string;
  private authRequired: boolean;
  private mockData: Map<string, any[]> = new Map();

  constructor(config: BlinkClientConfig) {
    this.projectId = config.projectId;
    this.authRequired = config.authRequired ?? false;
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with empty arrays for each table
    this.mockData.set('projects', []);
    this.mockData.set('files', []);
    this.mockData.set('specifications', []);
    this.mockData.set('versions', []);
    this.mockData.set('integrations', []);
    this.mockData.set('agents', []);
    this.mockData.set('api_keys', []);
  }

  private createMockTable<T>(tableName: string): DatabaseTable<T> {
    return {
      create: async (data: Partial<T>) => {
        const record = {
          id: crypto.randomUUID(),
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as T;
        const tableData = this.mockData.get(tableName) || [];
        tableData.push(record);
        this.mockData.set(tableName, tableData);
        return record;
      },
      createMany: async (data: Partial<T>[]) => {
        const records = data.map((item) => ({
          id: crypto.randomUUID(),
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })) as T[];
        const tableData = this.mockData.get(tableName) || [];
        tableData.push(...records);
        this.mockData.set(tableName, tableData);
        return records;
      },
      upsertMany: async (data: Partial<T>[]) => {
        return this.createMockTable<T>(tableName).createMany(data);
      },
      list: async (options?: ListOptions) => {
        let tableData = [...(this.mockData.get(tableName) || [])];

        // Apply where filter
        if (options?.where) {
          tableData = tableData.filter((item) => {
            return Object.entries(options.where!).every(
              ([key, value]) => (item as any)[key] === value
            );
          });
        }

        // Apply orderBy
        if (options?.orderBy) {
          const [field, direction] = Object.entries(options.orderBy)[0];
          tableData.sort((a, b) => {
            const aVal = (a as any)[field];
            const bVal = (b as any)[field];
            if (direction === 'asc') {
              return aVal > bVal ? 1 : -1;
            } else {
              return aVal < bVal ? 1 : -1;
            }
          });
        }

        // Apply limit and offset
        if (options?.offset) {
          tableData = tableData.slice(options.offset);
        }
        if (options?.limit) {
          tableData = tableData.slice(0, options.limit);
        }

        return tableData as T[];
      },
      findOne: async (options: ListOptions) => {
        const results = await this.createMockTable<T>(tableName).list(options);
        return results[0] || null;
      },
      update: async (id: string, data: Partial<T>) => {
        const tableData = this.mockData.get(tableName) || [];
        const index = tableData.findIndex((item) => item.id === id);
        if (index === -1) {
          throw new Error(`Record with id ${id} not found`);
        }
        const updated = {
          ...tableData[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        tableData[index] = updated;
        this.mockData.set(tableName, tableData);
        return updated as T;
      },
      delete: async (id: string) => {
        const tableData = this.mockData.get(tableName) || [];
        const filtered = tableData.filter((item) => item.id !== id);
        this.mockData.set(tableName, filtered);
      },
    };
  }

  // Database operations
  db = {
    projects: this.createMockTable<Project>('projects'),
    files: this.createMockTable<FileRecord>('files'),
    specifications: this.createMockTable<Specification>('specifications'),
    versions: this.createMockTable<Version>('versions'),
    integrations: this.createMockTable<Integration>('integrations'),
    agents: this.createMockTable<Agent>('agents'),
    apiKeys: this.createMockTable<ApiKey>('api_keys'),
  };

  // AI operations
  ai = {
    generateText: async (options: GenerateTextOptions): Promise<GenerateTextResponse> => {
      console.log('[Mock] AI generateText called with:', options);
      // In real implementation, this would call actual AI models
      return {
        text: `Mock AI response for: ${options.prompt}`,
        sources: options.search ? [{ url: 'https://example.com', title: 'Example Source' }] : undefined,
      };
    },
    generateObject: async (options: GenerateObjectOptions) => {
      console.log('[Mock] AI generateObject called with:', options);
      return { object: {} };
    },
    generateImage: async (options: GenerateImageOptions) => {
      console.log('[Mock] AI generateImage called with:', options);
      return { data: [{ url: 'https://via.placeholder.com/512' }] };
    },
    modifyImage: async (options: ModifyImageOptions) => {
      console.log('[Mock] AI modifyImage called with:', options);
      return { data: [{ url: 'https://via.placeholder.com/512' }] };
    },
    generateSpeech: async (options: GenerateSpeechOptions) => {
      console.log('[Mock] AI generateSpeech called with:', options);
      return { url: 'https://example.com/speech.mp3' };
    },
    transcribeAudio: async (options: TranscribeAudioOptions) => {
      console.log('[Mock] AI transcribeAudio called with:', options);
      return { text: 'Mock transcription text' };
    },
    streamText: async (options: GenerateTextOptions, callback: (chunk: string) => void) => {
      console.log('[Mock] AI streamText called with:', options);
      const words = `Mock AI response for: ${options.prompt}`.split(' ');
      for (const word of words) {
        callback(word + ' ');
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    },
  };

  // Storage operations
  storage = {
    upload: async (file: File, path: string, options?: StorageUploadOptions) => {
      console.log('[Mock] Storage upload called:', path);
      return {
        publicUrl: `https://cdn.blink.new/${this.projectId}/${path}`,
      };
    },
    remove: async (...paths: string[]) => {
      console.log('[Mock] Storage remove called:', paths);
    },
  };

  // Data operations
  data = {
    extractFromUrl: async (url: string, options?: any) => {
      console.log('[Mock] Data extractFromUrl called:', url);
      return `Mock extracted text from ${url}`;
    },
    scrape: async (url: string) => {
      console.log('[Mock] Data scrape called:', url);
      return {
        markdown: '# Mock Scraped Content',
        metadata: { title: 'Mock Page Title' },
        links: ['https://example.com/link1'],
      };
    },
    screenshot: async (url: string) => {
      console.log('[Mock] Data screenshot called:', url);
      return 'https://via.placeholder.com/1200x800';
    },
    search: async (query: string, options?: any) => {
      console.log('[Mock] Data search called:', query);
      return {
        organic_results: [{ title: 'Mock Result', url: 'https://example.com' }],
        news_results: options?.type === 'news' ? [{ title: 'Mock News', url: 'https://example.com/news' }] : undefined,
      };
    },
    fetch: async (options: FetchOptions) => {
      console.log('[Mock] Data fetch called:', options.url);
      return {
        status: 200,
        body: { success: true },
      };
    },
  };

  // Notifications
  notifications = {
    email: async (options: EmailOptions) => {
      console.log('[Mock] Email sent to:', options.to);
      return {
        success: true,
        messageId: `mock-${Date.now()}`,
      };
    },
  };

  // Analytics
  analytics = {
    log: (event: string, data?: Record<string, any>) => {
      console.log('[Mock] Analytics event:', event, data);
    },
    disable: () => {
      console.log('[Mock] Analytics disabled');
    },
    enable: () => {
      console.log('[Mock] Analytics enabled');
    },
    isEnabled: () => true,
  };

  // Realtime operations
  realtime = {
    subscribe: async (channel: string, callback: (message: RealtimeMessage) => void) => {
      console.log('[Mock] Subscribed to channel:', channel);
      return () => {
        console.log('[Mock] Unsubscribed from channel:', channel);
      };
    },
    publish: async (channel: string, type: string, data: any) => {
      console.log('[Mock] Published to channel:', channel, type, data);
    },
    presence: async (channel: string) => {
      console.log('[Mock] Getting presence for channel:', channel);
      return [] as PresenceUser[];
    },
    channel: (name: string) => {
      console.log('[Mock] Creating channel:', name);
      return {
        subscribe: async (options?: any) => {
          console.log('[Mock] Channel subscribed:', name);
        },
        unsubscribe: async () => {
          console.log('[Mock] Channel unsubscribed:', name);
        },
        publish: async (type: string, data: any) => {
          console.log('[Mock] Channel publish:', name, type, data);
        },
        onMessage: (callback: (message: RealtimeMessage) => void) => {
          console.log('[Mock] Channel onMessage registered:', name);
        },
        onPresence: (callback: (users: PresenceUser[]) => void) => {
          console.log('[Mock] Channel onPresence registered:', name);
        },
        getMessages: async (options?: any) => {
          console.log('[Mock] Channel getMessages:', name);
          return [];
        },
      };
    },
  };
}

// Create and export singleton instance
export const blinkClient = new MockBlinkClient({
  projectId: process.env.NEXT_PUBLIC_BLINK_PROJECT_ID || 'yetr-content-creation-models-obbf3aln',
  authRequired: false,
});

// Export types
export type BlinkClient = MockBlinkClient;

/**
 * NOTE: This is a mock implementation for development.
 *
 * When the actual @blinkdotnew/sdk package becomes available:
 * 1. Install it: npm install @blinkdotnew/sdk
 * 2. Replace the import and client creation:
 *    import { createClient } from '@blinkdotnew/sdk';
 *    export const blinkClient = createClient({
 *      projectId: 'yetr-content-creation-models-obbf3aln',
 *      authRequired: false
 *    });
 */
