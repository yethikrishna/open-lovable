import { NextRequest, NextResponse } from 'next/server';
import { blinkClient } from '@/lib/blink-client';

// GET - Get specification by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const specs = await blinkClient.db.specifications.list({ where: { id } });

    if (specs.length === 0) {
      return NextResponse.json(
        { error: 'Specification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ spec: specs[0] });
  } catch (error) {
    console.error('Error fetching specification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specification' },
      { status: 500 }
    );
  }
}

// PATCH - Update specification
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedSpec = await blinkClient.db.specifications.update(id, body);

    return NextResponse.json({ spec: updatedSpec });
  } catch (error) {
    console.error('Error updating specification:', error);
    return NextResponse.json(
      { error: 'Failed to update specification' },
      { status: 500 }
    );
  }
}

// DELETE - Delete specification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await blinkClient.db.specifications.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting specification:', error);
    return NextResponse.json(
      { error: 'Failed to delete specification' },
      { status: 500 }
    );
  }
}
