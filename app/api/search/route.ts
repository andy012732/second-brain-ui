import { NextRequest, NextResponse } from 'next/server';
import { getFileTree } from '@/lib/notes';

// 簡單的遞迴搜尋函數 (在檔案樹中搜尋)
function searchInTree(nodes: any[], query: string, results: any[] = []) {
    for (const node of nodes) {
        if (node.name.toLowerCase().includes(query.toLowerCase())) {
            results.push({
                name: node.name,
                path: node.path,
                type: node.type
            });
        }
        if (node.children) {
            searchInTree(node.children, query, results);
        }
    }
    return results;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json([]);
    }

    try {
        // 目前版本先做「檔名搜尋」，因為要在 Vercel 上做大量檔案內容搜尋會比較慢
        // 之後可以升級成用 OpenAI Embedding 做語意搜尋
        const tree = await getFileTree();
        const results = searchInTree(tree, query);
        
        return NextResponse.json(results.slice(0, 10)); // 只回傳前 10 筆
    } catch (error) {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
