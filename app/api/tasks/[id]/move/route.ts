import { NextResponse } from 'next/server';
import { getTasks, saveTasks, type Task } from '@/lib/kanban';

// 設定 CORS 標頭
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// POST /api/tasks/[id]/move - 移動任務到其他欄位
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, order } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Missing status parameter' },
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
    const oldStatus = task.status;
    const newStatus = status;

    // 從原狀態移除
    const oldStatusTasks = tasks.filter(t => t.status === oldStatus && t.id !== id);
    oldStatusTasks.forEach((t, idx) => {
      const taskInArray = tasks.find(task => task.id === t.id);
      if (taskInArray) taskInArray.order = idx;
    });

    // 更新任務狀態和順序
    if (oldStatus !== newStatus) {
      // 狀態改變時，將任務放到新狀態的指定位置或最後
      const newStatusTasks = tasks.filter(t => t.status === newStatus && t.id !== id);
      
      let newOrder;
      if (typeof order === 'number' && order >= 0 && order <= newStatusTasks.length) {
        newOrder = order;
        // 更新其他任務的順序
        newStatusTasks.forEach((t, idx) => {
          const taskInArray = tasks.find(task => task.id === t.id);
          if (taskInArray) {
            taskInArray.order = idx < order ? idx : idx + 1;
          }
        });
      } else {
        newOrder = newStatusTasks.length;
      }

      task.status = newStatus;
      task.order = newOrder;
    } else {
      // 同欄位內移動
      if (typeof order === 'number' && order >= 0 && order < oldStatusTasks.length) {
        task.order = order;
        // 重新排序同欄位的其他任務
        const sameStatusTasks = tasks.filter(t => t.status === oldStatus && t.id !== id);
        sameStatusTasks.sort((a, b) => a.order - b.order);
        
        sameStatusTasks.forEach((t, idx) => {
          const taskInArray = tasks.find(task => task.id === t.id);
          if (taskInArray) {
            taskInArray.order = idx < order ? idx : idx + 1;
          }
        });
      }
    }

    task.updatedAt = new Date().toISOString();
    await saveTasks(tasks);

    return NextResponse.json(task, { headers: corsHeaders() });
  } catch (error) {
    console.error('Error moving task:', error);
    return NextResponse.json(
      { error: 'Failed to move task' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}