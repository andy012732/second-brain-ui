import { NextResponse } from 'next/server';
import { getTasks, createTask, type Task } from '@/lib/kanban';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
}

export async function GET() {
  const tasks = await getTasks();
  return new NextResponse(JSON.stringify(tasks), { status: 200, headers: getCorsHeaders() });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const tasks = await getTasks();
    const newTask: Task = {
      id: uuidv4(),
      title: body.title,
      description: body.description || '',
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      tags: body.tags || [],
      dueDate: body.dueDate || null,
      isPinned: false,
      attachments: [],
      comments: [],
      order: tasks.filter(t => t.status === (body.status || 'todo')).length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await createTask(newTask);
    return new NextResponse(JSON.stringify(newTask), { status: 201, headers: getCorsHeaders() });
  } catch (e) {
    console.error(e);
    return new NextResponse(JSON.stringify({ error: 'Failed' }), { status: 500, headers: getCorsHeaders() });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders() });
}
