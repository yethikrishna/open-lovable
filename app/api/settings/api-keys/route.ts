import { NextRequest, NextResponse } from 'next/server';
import { blinkClient } from '@/lib/blink-client';

// GET - List all API keys
export async function GET(request: NextRequest) {
  try {
    const keys = await blinkClient.db.apiKeys.list({
      where: { isActive: 1 },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ keys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// POST - Add new API key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, keyName, keyValue } = body;

    if (!provider || !keyName || !keyValue) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production, encrypt the key value before storing
    // For now, we'll store it as-is in the mock implementation
    const newKey = await blinkClient.db.apiKeys.create({
      provider,
      keyName,
      keyValue, // In production: encrypt(keyValue, process.env.ENCRYPTION_KEY)
      isActive: 1,
      usageCount: 0,
    });

    return NextResponse.json({ key: newKey }, { status: 201 });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}
