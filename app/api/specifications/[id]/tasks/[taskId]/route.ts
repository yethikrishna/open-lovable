import { NextRequest, NextResponse } from 'next/server';

// In-memory task storage (same as parent)
const tasksStore = new Map<string, any[]>();

// PATCH - Update task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id, taskId } = await params;
    const body = await request.json();

    const tasks = tasksStore.get(id) || [];
    const taskIndex = tasks.findIndex((t) => t.id === taskId);

    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...body };
    tasksStore.set(id, tasks);

    return NextResponse.json({ task: tasks[taskIndex] });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}
