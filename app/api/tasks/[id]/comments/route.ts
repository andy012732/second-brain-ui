import { NextResponse } from 'next/server';
import { getTasks, saveTasks, type Comment } from '@/lib/kanban';
import { v4 as uuidv4 } from 'uuid';

// 設定 CORS 標頭
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// POST /api/tasks/[id]/comments - 新增留言
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, parentId } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const tasks = await getTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    const task = tasks[taskIndex];
    
    // 檢查 parentId 是否有效（如果是回覆的話）
    if (parentId) {
      const parentComment = task.comments.find(c => c.id === parentId);
      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404, headers: corsHeaders() }
        );
      }
    }

    const newComment: Comment = {
      id: uuidv4(),
      taskId: id,
      content: content.trim(),
      parentId: parentId || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    task.comments.push(newComment);
    task.updatedAt = new Date().toISOString();
    
    await saveTasks(tasks);

    return NextResponse.json(newComment, { 
      status: 201, 
      headers: corsHeaders() 
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// GET /api/tasks/[id]/comments - 取得任務的所有留言
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tasks = await getTasks();
    
    const task = tasks.find(task => task.id === id);
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    return NextResponse.json(task.comments, { headers: corsHeaders() });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}