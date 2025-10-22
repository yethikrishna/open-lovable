import { NextRequest, NextResponse } from 'next/server';
import { blinkClient } from '@/lib/blink-client';
import crypto from 'crypto';

// GET - List commits
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId') || 'default-project';

    const commits = await blinkClient.db.versions.list({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      limit: 100,
    });

    return NextResponse.json({ commits });
  } catch (error) {
    console.error('Error fetching commits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commits' },
      { status: 500 }
    );
  }
}

// POST - Create new commit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      message,
      description,
      author = 'Yethikrishna R',
      authorEmail = 'developer@yethicedar.com',
      branch = 'main',
      changedFiles = [],
    } = body;

    if (!projectId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate commit hash
    const commitHash = crypto
      .createHash('sha1')
      .update(`${Date.now()}-${message}-${projectId}`)
      .digest('hex');

    // Calculate additions and deletions (mock for now)
    const additions = Math.floor(Math.random() * 100) + 10;
    const deletions = Math.floor(Math.random() * 50);

    const commit = await blinkClient.db.versions.create({
      projectId,
      commitHash,
      commitMessage: message,
      commitDescription: description || undefined,
      author,
      authorEmail,
      branch,
      changedFiles: JSON.stringify(changedFiles),
      additions,
      deletions,
    });

    return NextResponse.json({ commit }, { status: 201 });
  } catch (error) {
    console.error('Error creating commit:', error);
    return NextResponse.json(
      { error: 'Failed to create commit' },
      { status: 500 }
    );
  }
}
