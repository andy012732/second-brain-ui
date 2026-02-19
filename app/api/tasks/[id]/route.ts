import { NextResponse } from 'next/server';
import { getTaskById, updateTask, deleteTask, archiveTask } from '@/lib/kanban';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await getTaskById(id);
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(task, { headers: corsHeaders() });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateTask(id, {
      title: body.title,
      description: body.description,
      priority: body.priority,
      tags: body.tags,
      dueDate: body.dueDate,
      isPinned: body.isPinned,
      status: body.status,
      order: body.order,
    });
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated, { headers: corsHeaders() });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const archive = url.searchParams.get('archive');

    if (archive === 'true') {
      const updated = await archiveTask(id);
      return NextResponse.json(updated, { headers: corsHeaders() });
    }

    await deleteTask(id);
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}
