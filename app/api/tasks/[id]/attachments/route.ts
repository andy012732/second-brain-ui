import { NextResponse } from 'next/server';
import { addAttachment, getTaskById, type Attachment } from '@/lib/kanban';

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
    const attachment: Attachment = await request.json();

    const updatedTask = await addAttachment(id, attachment);
    if (!updatedTask) return NextResponse.json({ error: 'Task not found' }, { status: 404, headers: corsHeaders() });

    return NextResponse.json(updatedTask, { status: 201, headers: corsHeaders() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500, headers: corsHeaders() });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = await getTaskById(id);
  return NextResponse.json(task ? task.attachments : [], { headers: corsHeaders() });
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}
