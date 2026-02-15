import { NextRequest, NextResponse } from 'next/server';
import { getFileTree, getFileContent } from '@/lib/notes';
import { Octokit } from '@octokit/rest';

// 環境變數
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

const octokit = GITHUB_TOKEN ? new Octokit({ auth: GITHUB_TOKEN }) : null;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json([]);
    }

    try {
        const results: any[] = [];

        // GitHub 模式：使用 Search API (支援內容搜尋)
        if (octokit && GITHUB_OWNER && GITHUB_REPO) {
            const { data } = await octokit.search.code({
                q: `${query} repo:${GITHUB_OWNER}/${GITHUB_REPO} extension:md`,
                per_page: 10
            });
            
            data.items.forEach((item) => {
                results.push({
                    name: item.name,
                    path: item.path,
                    type: 'file',
                    preview: 'Matched via GitHub Search' // 預覽比較難抓，先簡化
                });
            });
        } 
        // 本機模式：簡單遍歷 (只搜檔名，為了效能)
        else {
            const tree = await getFileTree();
            const searchInTree = (nodes: any[]) => {
                for (const node of nodes) {
                    if (node.name.toLowerCase().includes(query.toLowerCase())) {
                        results.push({
                            name: node.name,
                            path: node.path,
                            type: node.type
                        });
                    }
                    if (node.children) {
                        searchInTree(node.children);
                    }
                }
            };
            searchInTree(tree);
        }
        
        return NextResponse.json(results.slice(0, 10));
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
