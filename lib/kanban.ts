import { Octokit } from '@octokit/rest';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'andy012732';
const GITHUB_REPO = 'my-notes'; 
const GITHUB_BRANCH = 'main';

const octokit = GITHUB_TOKEN ? new Octokit({ auth: GITHUB_TOKEN }) : null;

// 🟢 補齊所有導出的型別
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

export async function getTasks(): Promise<Task[]> {
  if (!octokit) return [];
  try {
    const { data }: any = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: 'tasks.json',
      ref: GITHUB_BRANCH,
    });
    const content = Buffer.from(data.content, 'base64').toString();
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  if (!octokit) return;
  try {
    let sha;
    try {
      const { data }: any = await octokit.repos.getContent({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: 'tasks.json',
        ref: GITHUB_BRANCH,
      });
      sha = data.sha;
    } catch (e) {}

    const content = JSON.stringify(tasks, null, 2);
    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: 'tasks.json',
      message: '📊 Update Kanban tasks',
      content: Buffer.from(content).toString('base64'),
      sha,
      branch: GITHUB_BRANCH,
    });
  } catch (error) {
    console.error('Failed to save tasks to GitHub:', error);
  }
}
