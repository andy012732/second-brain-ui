import { NextResponse } from 'next/server';
import { getTasks, saveTasks } from '@/lib/kanban';
import { v4 as uuidv4 } from 'uuid';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { action, ...data } = await req.json();
  const tasks = await getTasks();
  const index = tasks.findIndex(t => t.id === params.id);
  
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (action === 'move') {
    tasks[index].status = data.status;
  } else if (action === 'comment') {
    tasks[index].comments.push({
      id: uuidv4(),
      taskId: params.id,
      content: data.content,
      parentId: data.parentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  tasks[index].updatedAt = new Date().toISOString();
  await saveTasks(tasks);
  return NextResponse.json(tasks[index], { headers: corsHeaders() });
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}
