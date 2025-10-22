import { NextRequest, NextResponse } from 'next/server';
import { blinkClient } from '@/lib/blink-client';

const tableMap: Record<string, any> = {
  projects: blinkClient.db.projects,
  files: blinkClient.db.files,
  specifications: blinkClient.db.specifications,
  versions: blinkClient.db.versions,
  integrations: blinkClient.db.integrations,
  agents: blinkClient.db.agents,
  api_keys: blinkClient.db.apiKeys,
};

// GET - Get table data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const whereParam = searchParams.get('where');

    if (!tableMap[table]) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const where = whereParam ? JSON.parse(whereParam) : undefined;

    const data = await tableMap[table].list({
      where,
      limit,
      offset,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error('Error fetching table data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table data' },
      { status: 500 }
    );
  }
}

// POST - Create record
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const body = await request.json();

    if (!tableMap[table]) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const record = await tableMap[table].create(body);

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error('Error creating record:', error);
    return NextResponse.json(
      { error: 'Failed to create record' },
      { status: 500 }
    );
  }
}
