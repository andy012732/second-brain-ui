import { NextResponse } from 'next/server';
import { getTaskById, updateTask, addComment, type Comment } from '@/lib/kanban';
import { v4 as uuidv4 } from 'uuid';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { action, ...data } = await req.json();

    if (action === 'move') {
      const updated = await updateTask(id, { status: data.status });
      return NextResponse.json(updated, { headers: corsHeaders() });
    }

    if (action === 'comment') {
      const comment: Comment = {
        id: uuidv4(),
        taskId: id,
        content: data.content,
        parentId: data.parentId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = await addComment(id, comment);
      return NextResponse.json(updated, { headers: corsHeaders() });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}
