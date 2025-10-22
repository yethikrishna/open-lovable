import { NextRequest, NextResponse } from 'next/server';
import { blinkClient } from '@/lib/blink-client';

// POST - Revert to specific commit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, commitHash } = body;

    if (!projectId || !commitHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the commit to revert to
    const commits = await blinkClient.db.versions.list({
      where: { projectId, commitHash },
    });

    if (commits.length === 0) {
      return NextResponse.json(
        { error: 'Commit not found' },
        { status: 404 }
      );
    }

    const targetCommit = commits[0];

    // In a real implementation:
    // 1. Load all files from the target commit
    // 2. Restore them to the current sandbox
    // 3. Create a new "revert" commit

    // For now, just create a new commit indicating the revert
    const revertCommit = await blinkClient.db.versions.create({
      projectId,
      commitHash: `revert-${targetCommit.commitHash.substring(0, 8)}-${Date.now()}`,
      commitMessage: `Revert to "${targetCommit.commitMessage}"`,
      commitDescription: `Reverted project to commit ${targetCommit.commitHash}`,
      author: 'Yethi Cedar System',
      authorEmail: 'system@yethicedar.com',
      branch: targetCommit.branch,
      changedFiles: targetCommit.changedFiles,
      additions: 0,
      deletions: 0,
    });

    return NextResponse.json({
      success: true,
      commit: revertCommit,
      restoredFiles: JSON.parse(targetCommit.changedFiles || '[]'),
    });
  } catch (error) {
    console.error('Error reverting commit:', error);
    return NextResponse.json(
      { error: 'Failed to revert commit' },
      { status: 500 }
    );
  }
}
