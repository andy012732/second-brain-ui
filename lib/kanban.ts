import fs from 'fs/promises';
import path from 'path';

const KANBAN_TASKS_PATH = process.env.KANBAN_TASKS_PATH || 'tasks.json';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'ongoing' | 'pending' | 'review' | 'done' | 'archive';
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  dueDate?: string;
  isPinned: boolean;
  attachments: Attachment[];
  comments: Comment[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

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
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getTasks(): Promise<Task[]> {
  try {
    const filePath = path.join(process.cwd(), KANBAN_TASKS_PATH);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Failed to read tasks.json:', error);
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), KANBAN_TASKS_PATH);
    const fileContent = JSON.stringify(tasks, null, 2);
    await fs.writeFile(filePath, fileContent, 'utf-8');
  } catch (error) {
    console.error('Failed to write tasks.json:', error);
  }
}