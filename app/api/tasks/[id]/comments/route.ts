import { NextResponse } from 'next/server';
import { getTasks, saveTasks, type Comment } from '@/lib/kanban';
import { v4 as uuidv4 } from 'uuid';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, parentId } = body;

    const tasks = await getTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const newComment: Comment = {
      id: uuidv4(),
      taskId: id,
      content: content.trim(),
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks[taskIndex].comments.push(newComment);
    await saveTasks(tasks);

    return NextResponse.json(newComment, { status: 201, headers: corsHeaders() });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tasks = await getTasks();
  const task = tasks.find(task => task.id === id);
  return NextResponse.json(task ? task.comments : [], { headers: corsHeaders() });
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}
