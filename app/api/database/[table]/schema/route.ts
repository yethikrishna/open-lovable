import { NextRequest, NextResponse } from 'next/server';

// Hardcoded schema definitions based on planning.md
const schemas: Record<string, any[]> = {
  projects: [
    { name: 'id', type: 'STRING', nullable: false, key: 'PRIMARY' },
    { name: 'name', type: 'STRING', nullable: false },
    { name: 'description', type: 'TEXT', nullable: true },
    { name: 'userId', type: 'STRING', nullable: false },
    { name: 'status', type: 'STRING', nullable: false, default: 'active' },
    { name: 'sandboxId', type: 'STRING', nullable: true },
    { name: 'repositoryUrl', type: 'STRING', nullable: true },
    { name: 'deploymentUrl', type: 'STRING', nullable: true },
    { name: 'framework', type: 'STRING', nullable: true },
    { name: 'createdAt', type: 'TIMESTAMP', nullable: false },
    { name: 'updatedAt', type: 'TIMESTAMP', nullable: false },
  ],
  files: [
    { name: 'id', type: 'STRING', nullable: false, key: 'PRIMARY' },
    { name: 'projectId', type: 'STRING', nullable: false, key: 'FOREIGN' },
    { name: 'path', type: 'STRING', nullable: false },
    { name: 'content', type: 'TEXT', nullable: false },
    { name: 'language', type: 'STRING', nullable: true },
    { name: 'size', type: 'INTEGER', nullable: true },
    { name: 'createdAt', type: 'TIMESTAMP', nullable: false },
    { name: 'updatedAt', type: 'TIMESTAMP', nullable: false },
  ],
  specifications: [
    { name: 'id', type: 'STRING', nullable: false, key: 'PRIMARY' },
    { name: 'projectId', type: 'STRING', nullable: false, key: 'FOREIGN' },
    { name: 'title', type: 'STRING', nullable: false },
    { name: 'description', type: 'TEXT', nullable: false },
    { name: 'status', type: 'STRING', nullable: false, default: 'planned' },
    { name: 'priority', type: 'STRING', nullable: false, default: 'medium' },
    { name: 'acceptanceCriteria', type: 'TEXT', nullable: true },
    { name: 'assignedTo', type: 'STRING', nullable: true },
    { name: 'targetRelease', type: 'STRING', nullable: true },
    { name: 'progress', type: 'INTEGER', nullable: false, default: '0' },
    { name: 'createdAt', type: 'TIMESTAMP', nullable: false },
    { name: 'updatedAt', type: 'TIMESTAMP', nullable: false },
  ],
  versions: [
    { name: 'id', type: 'STRING', nullable: false, key: 'PRIMARY' },
    { name: 'projectId', type: 'STRING', nullable: false, key: 'FOREIGN' },
    { name: 'commitHash', type: 'STRING', nullable: false },
    { name: 'commitMessage', type: 'STRING', nullable: false },
    { name: 'commitDescription', type: 'TEXT', nullable: true },
    { name: 'author', type: 'STRING', nullable: false },
    { name: 'authorEmail', type: 'STRING', nullable: false },
    { name: 'branch', type: 'STRING', nullable: false, default: 'main' },
    { name: 'changedFiles', type: 'TEXT', nullable: true },
    { name: 'additions', type: 'INTEGER', nullable: false, default: '0' },
    { name: 'deletions', type: 'INTEGER', nullable: false, default: '0' },
    { name: 'createdAt', type: 'TIMESTAMP', nullable: false },
  ],
  integrations: [
    { name: 'id', type: 'STRING', nullable: false, key: 'PRIMARY' },
    { name: 'projectId', type: 'STRING', nullable: false, key: 'FOREIGN' },
    { name: 'name', type: 'STRING', nullable: false },
    { name: 'type', type: 'STRING', nullable: false },
    { name: 'isActive', type: 'INTEGER', nullable: false, default: '1' },
    { name: 'configuration', type: 'TEXT', nullable: false },
    { name: 'createdAt', type: 'TIMESTAMP', nullable: false },
    { name: 'updatedAt', type: 'TIMESTAMP', nullable: false },
  ],
  agents: [
    { name: 'id', type: 'STRING', nullable: false, key: 'PRIMARY' },
    { name: 'name', type: 'STRING', nullable: false },
    { name: 'type', type: 'STRING', nullable: false },
    { name: 'status', type: 'STRING', nullable: false, default: 'idle' },
    { name: 'currentTask', type: 'TEXT', nullable: true },
    { name: 'tasksCompleted', type: 'INTEGER', nullable: false, default: '0' },
    { name: 'averageResponseTime', type: 'INTEGER', nullable: false, default: '0' },
    { name: 'lastActiveAt', type: 'TIMESTAMP', nullable: true },
    { name: 'createdAt', type: 'TIMESTAMP', nullable: false },
  ],
  api_keys: [
    { name: 'id', type: 'STRING', nullable: false, key: 'PRIMARY' },
    { name: 'provider', type: 'STRING', nullable: false },
    { name: 'keyName', type: 'STRING', nullable: false },
    { name: 'keyValue', type: 'TEXT', nullable: false },
    { name: 'isActive', type: 'INTEGER', nullable: false, default: '1' },
    { name: 'usageCount', type: 'INTEGER', nullable: false, default: '0' },
    { name: 'lastUsedAt', type: 'TIMESTAMP', nullable: true },
    { name: 'createdAt', type: 'TIMESTAMP', nullable: false },
    { name: 'updatedAt', type: 'TIMESTAMP', nullable: false },
  ],
};

// GET - Get table schema
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;

    if (!schemas[table]) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    return NextResponse.json({ columns: schemas[table] });
  } catch (error) {
    console.error('Error fetching table schema:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table schema' },
      { status: 500 }
    );
  }
}
