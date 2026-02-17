import { NextResponse } from 'next/server';
import { getTasks, saveTasks, type Task } from '@/lib/kanban';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function GET() {
  const tasks = await getTasks();
  return NextResponse.json(tasks, { headers: corsHeaders() });
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

    tasks.push(newTask);
    await saveTasks(tasks);
    return NextResponse.json(newTask, { headers: corsHeaders() });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500, headers: corsHeaders() });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}
