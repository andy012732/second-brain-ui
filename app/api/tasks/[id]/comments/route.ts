import { NextResponse } from 'next/server';
import { addComment, getTaskById, type Comment } from '@/lib/kanban';
import { v4 as uuidv4 } from 'uuid';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    const comment: Comment = {
      id: uuidv4(),
      taskId: id,
      content: content.trim(),
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedTask = await addComment(id, comment);
    if (!updatedTask) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(updatedTask, { status: 201, headers: corsHeaders() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = await getTaskById(id);
  return NextResponse.json(task ? task.comments : [], { headers: corsHeaders() });
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}
