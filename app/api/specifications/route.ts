import { NextRequest, NextResponse } from 'next/server';
import { blinkClient } from '@/lib/blink-client';

// GET - List all specifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId') || 'default-project';

    const specs = await blinkClient.db.specifications.list({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ specs });
  } catch (error) {
    console.error('Error fetching specifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specifications' },
      { status: 500 }
    );
  }
}

// POST - Create new specification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      title,
      description,
      priority = 'medium',
      status = 'planned',
      assignedTo,
      targetRelease,
      acceptanceCriteria,
      progress = 0,
    } = body;

    if (!projectId || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const spec = await blinkClient.db.specifications.create({
      projectId,
      title,
      description,
      priority,
      status,
      assignedTo,
      targetRelease,
      acceptanceCriteria: acceptanceCriteria ? JSON.stringify(acceptanceCriteria) : undefined,
      progress,
    });

    return NextResponse.json({ spec }, { status: 201 });
  } catch (error) {
    console.error('Error creating specification:', error);
    return NextResponse.json(
      { error: 'Failed to create specification' },
      { status: 500 }
    );
  }
}
