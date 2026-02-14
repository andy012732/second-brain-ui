import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { Octokit } from '@octokit/rest';

// 環境變數
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const NOTES_PATH = path.resolve(process.cwd(), process.env.NOTES_PATH || '../notes');

// 初始化 Octokit (如果有 Token)
const octokit = GITHUB_TOKEN ? new Octokit({ auth: GITHUB_TOKEN }) : null;

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

// 判斷是否使用 GitHub 模式
const isGitHubMode = () => !!(octokit && GITHUB_OWNER && GITHUB_REPO);

// --- GitHub 模式實作 ---

async function getGitHubTree(dir: string = ''): Promise<FileNode[]> {
  if (!octokit || !GITHUB_OWNER || !GITHUB_REPO) return [];

  try {
    const { data } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: dir,
      ref: GITHUB_BRANCH,
    });

    if (!Array.isArray(data)) return [];

    const rawNodes = await Promise.all(
      data.map(async (item) => {
        // 忽略隱藏檔案
        if (item.name.startsWith('.')) return null;

        if (item.type === 'dir') {
          return {
            name: item.name,
            path: item.path,
            type: 'directory',
            children: await getGitHubTree(item.path),
          } as FileNode;
        } else if (item.type === 'file' && item.name.endsWith('.md')) {
          return {
            name: item.name,
            path: item.path,
            type: 'file',
          } as FileNode;
        }
        return null;
      })
    );

    // 過濾 null 並排序
    return rawNodes
      .filter((n): n is FileNode => n !== null)
      .sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
      });
  } catch (error) {
    console.error('Error fetching from GitHub:', error);
    return [];
  }
}

async function getGitHubFile(filePath: string) {
  if (!octokit || !GITHUB_OWNER || !GITHUB_REPO) throw new Error('GitHub config missing');

  try {
    const { data } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
      ref: GITHUB_BRANCH,
    });

    if (Array.isArray(data)) throw new Error('Not a file');
    
    // 強制轉型，解決 TypeScript 對於聯合型別的誤判
    const fileData = data as { content?: string; sha: string };

    if (!fileData.content) throw new Error('File content is empty');

    const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
    const { data: frontmatter, content: markdownBody } = matter(content);

    return {
      content: markdownBody,
      frontmatter,
      modifiedAt: new Date().toISOString(), // GitHub API 不容易直接取得最後修改時間，暫用當下
      sha: data.sha // 寫入時需要 SHA
    };
  } catch (error) {
    throw new Error('File not found in GitHub');
  }
}

// --- 本機模式實作 (保留原功能) ---

async function getLocalTree(dir: string = ''): Promise<FileNode[]> {
  const absoluteDir = path.join(NOTES_PATH, dir);
  try {
    const dirents = await fs.readdir(absoluteDir, { withFileTypes: true });
    const nodes: FileNode[] = await Promise.all(
      dirents
        .filter(d => !d.name.startsWith('.'))
        .map(async (dirent) => {
          const relativePath = path.join(dir, dirent.name);
          if (dirent.isDirectory()) {
            return {
              name: dirent.name,
              path: relativePath,
              type: 'directory',
              children: await getLocalTree(relativePath),
            };
          } else {
            return {
              name: dirent.name,
              path: relativePath,
              type: 'file',
            };
          }
        })
    );
    return nodes.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'directory' ? -1 : 1));
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function getLocalFile(filePath: string) {
  const absolutePath = path.join(NOTES_PATH, filePath);
  if (!absolutePath.startsWith(NOTES_PATH)) throw new Error('Invalid path');
  const fileContent = await fs.readFile(absolutePath, 'utf-8');
  const { data, content } = matter(fileContent);
  return { content, frontmatter: data, modifiedAt: new Date().toISOString() };
}

// --- 統一出口 ---

export async function getFileTree() {
  return isGitHubMode() ? getGitHubTree() : getLocalTree();
}

export async function getFileContent(path: string) {
  return isGitHubMode() ? getGitHubFile(path) : getLocalFile(path);
}

export async function saveFileContent(path: string, content: string) {
    // 這裡還沒實作 GitHub 寫入，因為學長目前需求是讀取為主
    // 之後如果要在網頁編輯，我們再加 putGitHubFile
    return { success: false, message: "GitHub Write not implemented yet" };
}
