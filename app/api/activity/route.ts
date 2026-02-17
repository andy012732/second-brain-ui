import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'andy012732';
const GITHUB_REPO = 'my-notes';
const GITHUB_BRANCH = 'main';

const octokit = GITHUB_TOKEN ? new Octokit({ auth: GITHUB_TOKEN }) : null;

export const dynamic = 'force-dynamic';

// GET: 從 GitHub 取得動態
export async function GET() {
  if (!octokit) return NextResponse.json([]);
  try {
    const { data }: any = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: 'activities.json',
      ref: GITHUB_BRANCH,
    });
    const activities = JSON.parse(Buffer.from(data.content, 'base64').toString());
    return NextResponse.json(activities);
  } catch (e) {
    return NextResponse.json([]);
  }
}

// POST: 寫入新動態到 GitHub
export async function POST(req: Request) {
  if (!octokit) return NextResponse.json({ error: 'Auth Failed' }, { status: 401 });
  try {
    const body = await req.json();
    
    // 1. 取得舊資料與 SHA
    let activities: any[] = [];
    let sha: string | undefined;
    try {
      const { data }: any = await octokit.repos.getContent({
        owner: GITHUB_OWNER, repo: GITHUB_REPO, path: 'activities.json', ref: GITHUB_BRANCH
      });
      sha = data.sha;
      activities = JSON.parse(Buffer.from(data.content, 'base64').toString());
    } catch (e) {}

    // 2. 插入新資料 (保留前 50 條)
    const newActivity = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      ...body
    };
    activities = [newActivity, ...activities].slice(0, 50);

    // 3. 推回 GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: 'activities.json',
      message: `📡 Activity: ${body.title}`,
      content: Buffer.from(JSON.stringify(activities, null, 2)).toString('base64'),
      sha,
      branch: GITHUB_BRANCH,
    });

    return NextResponse.json(newActivity);
  } catch (error) {
    return NextResponse.json({ error: 'Sync Failed' }, { status: 500 });
  }
}
