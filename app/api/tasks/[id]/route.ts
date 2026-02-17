import { NextResponse } from 'next/server';
import { getTasks, saveTasks } from '@/lib/kanban';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const tasks = await getTasks();
    const index = tasks.findIndex(t => t.id === id);
    
    if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    tasks[index] = { ...tasks[index], ...body, updatedAt: new Date().toISOString() };
    await saveTasks(tasks);
    return NextResponse.json(tasks[index], { headers: corsHeaders() });
  } catch (e) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tasks = await getTasks();
  const filtered = tasks.filter(t => t.id !== id);
  await saveTasks(filtered);
  return NextResponse.json({ success: true }, { headers: corsHeaders() });
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}
