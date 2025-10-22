import { NextRequest, NextResponse } from 'next/server';
import { blinkClient } from '@/lib/blink-client';

// GET - List all agents
export async function GET(request: NextRequest) {
  try {
    const agents = await blinkClient.db.agents.list({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// POST - Register new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      type,
      status = 'idle',
      tasksCompleted = 0,
      averageResponseTime = 0,
    } = body;

    if (!id || !name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if agent already exists
    const existing = await blinkClient.db.agents.list({ where: { id } });

    if (existing.length > 0) {
      return NextResponse.json({ agent: existing[0] });
    }

    const agent = await blinkClient.db.agents.create({
      id,
      name,
      type,
      status,
      tasksCompleted,
      averageResponseTime,
    });

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
