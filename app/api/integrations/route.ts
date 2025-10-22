import { NextRequest, NextResponse } from 'next/server';
import { blinkClient } from '@/lib/blink-client';

// GET - List all integrations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId') || 'default-project';

    const integrations = await blinkClient.db.integrations.list({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}

// POST - Install new integration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, name, type, configuration } = body;

    if (!projectId || !name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const integration = await blinkClient.db.integrations.create({
      projectId,
      name,
      type,
      isActive: 1,
      configuration: typeof configuration === 'string' ? configuration : JSON.stringify(configuration),
    });

    return NextResponse.json({ integration }, { status: 201 });
  } catch (error) {
    console.error('Error creating integration:', error);
    return NextResponse.json(
      { error: 'Failed to create integration' },
      { status: 500 }
    );
  }
}
