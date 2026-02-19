import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── 型別定義 ──────────────────────────────────────────
export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'text' | 'other';
  url: string;
  size: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  content: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'ongoing' | 'pending' | 'review' | 'done' | 'archive';
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  dueDate?: string | null;
  isPinned: boolean;
  attachments: Attachment[];
  comments: Comment[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ── DB 列 → Task 型別轉換 ──────────────────────────────
function rowToTask(row: any, comments: Comment[] = [], attachments: Attachment[] = []): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    status: row.status,
    priority: row.priority,
    tags: row.tags ?? [],
    dueDate: row.due_date ?? null,
    isPinned: row.is_pinned ?? false,
    order: row.order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    comments,
    attachments,
  };
}

function rowToComment(row: any): Comment {
  return {
    id: row.id,
    taskId: row.task_id,
    content: row.content,
    parentId: row.parent_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToAttachment(row: any): Attachment {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    url: row.url,
    size: row.size ?? 0,
    createdAt: row.created_at,
  };
}

// ── 主要函式 ──────────────────────────────────────────

export async function getTasks(): Promise<Task[]> {
  try {
    const [{ data: taskRows }, { data: commentRows }, { data: attachmentRows }] = await Promise.all([
      supabase.from('tasks').select('*').order('order', { ascending: true }),
      supabase.from('comments').select('*').order('created_at', { ascending: true }),
      supabase.from('attachments').select('*').order('created_at', { ascending: true }),
    ]);

    if (!taskRows) return [];

    return taskRows.map(row => rowToTask(
      row,
      (commentRows ?? []).filter(c => c.task_id === row.id).map(rowToComment),
      (attachmentRows ?? []).filter(a => a.task_id === row.id).map(rowToAttachment),
    ));
  } catch (e) {
    console.error('getTasks error:', e);
    return [];
  }
}

export async function getTaskById(id: string): Promise<Task | null> {
  try {
    const [{ data: row }, { data: commentRows }, { data: attachmentRows }] = await Promise.all([
      supabase.from('tasks').select('*').eq('id', id).single(),
      supabase.from('comments').select('*').eq('task_id', id).order('created_at', { ascending: true }),
      supabase.from('attachments').select('*').eq('task_id', id).order('created_at', { ascending: true }),
    ]);

    if (!row) return null;
    return rowToTask(
      row,
      (commentRows ?? []).map(rowToComment),
      (attachmentRows ?? []).map(rowToAttachment),
    );
  } catch (e) {
    console.error('getTaskById error:', e);
    return null;
  }
}

export async function createTask(task: Task): Promise<Task> {
  const { error } = await supabase.from('tasks').insert({
    id: task.id,
    title: task.title,
    description: task.description ?? null,
    status: task.status,
    priority: task.priority,
    tags: task.tags,
    due_date: task.dueDate ?? null,
    is_pinned: task.isPinned,
    order: task.order,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
  });
  if (error) throw error;
  return task;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  const { error } = await supabase.from('tasks').update({
    ...(updates.title !== undefined && { title: updates.title }),
    ...(updates.description !== undefined && { description: updates.description }),
    ...(updates.status !== undefined && { status: updates.status }),
    ...(updates.priority !== undefined && { priority: updates.priority }),
    ...(updates.tags !== undefined && { tags: updates.tags }),
    ...(updates.dueDate !== undefined && { due_date: updates.dueDate }),
    ...(updates.isPinned !== undefined && { is_pinned: updates.isPinned }),
    ...(updates.order !== undefined && { order: updates.order }),
    updated_at: new Date().toISOString(),
  }).eq('id', id);
  if (error) throw error;
  return getTaskById(id);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function archiveTask(id: string): Promise<Task | null> {
  return updateTask(id, { status: 'archive' });
}

export async function addComment(taskId: string, comment: Comment): Promise<Task | null> {
  const { error } = await supabase.from('comments').insert({
    id: comment.id,
    task_id: comment.taskId,
    content: comment.content,
    parent_id: comment.parentId ?? null,
    created_at: comment.createdAt,
    updated_at: comment.updatedAt,
  });
  if (error) throw error;
  // 更新 task 的 updated_at
  await supabase.from('tasks').update({ updated_at: new Date().toISOString() }).eq('id', taskId);
  return getTaskById(taskId);
}

export async function addAttachment(taskId: string, attachment: Attachment): Promise<Task | null> {
  const { error } = await supabase.from('attachments').insert({
    id: attachment.id,
    task_id: taskId,
    name: attachment.name,
    type: attachment.type,
    url: attachment.url,
    size: attachment.size,
    created_at: attachment.createdAt,
  });
  if (error) throw error;
  await supabase.from('tasks').update({ updated_at: new Date().toISOString() }).eq('id', taskId);
  return getTaskById(taskId);
}

// ── 舊版相容（部分 API route 仍在用）─────────────────
export async function saveTasks(tasks: Task[]): Promise<void> {
  // Supabase 版本不需要 bulk save，但保留介面避免其他地方出錯
  console.warn('saveTasks() is deprecated with Supabase. Use individual operations.');
}
