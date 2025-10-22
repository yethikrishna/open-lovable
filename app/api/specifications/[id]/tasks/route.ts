import { NextRequest, NextResponse } from 'next/server';

// In-memory task storage (in production, use database)
const tasksStore = new Map<string, any[]>();

// GET - Get tasks for specification
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tasks = tasksStore.get(id) || [];

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST - Add new task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { description, completed = false, assignee } = body;

    if (!description) {
      return NextResponse.json(
        { error: 'Missing description' },
        { status: 400 }
      );
    }

    const tasks = tasksStore.get(id) || [];
    const newTask = {
      id: crypto.randomUUID(),
      description,
      completed,
      assignee,
    };

    tasks.push(newTask);
    tasksStore.set(id, tasks);

    return NextResponse.json({ task: newTask }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
