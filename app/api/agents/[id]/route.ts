import { NextRequest, NextResponse } from 'next/server';
import { blinkClient } from '@/lib/blink-client';

// GET - Get agent by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agents = await blinkClient.db.agents.list({ where: { id } });

    if (agents.length === 0) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ agent: agents[0] });
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

// PATCH - Update agent
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedAgent = await blinkClient.db.agents.update(id, body);

    return NextResponse.json({ agent: updatedAgent });
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

// DELETE - Remove agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await blinkClient.db.agents.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}
