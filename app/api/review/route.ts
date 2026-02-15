import { NextResponse } from 'next/server';
import { getFileTree } from '@/lib/notes';

export const dynamic = 'force-dynamic';

function getAllFiles(nodes: any[], files: any[] = []) {
    for (const node of nodes) {
        if (node.type === 'file') {
            files.push(node);
        } else if (node.children) {
            getAllFiles(node.children, files);
        }
    }
    return files;
}

export async function GET() {
    try {
        const tree = await getFileTree();
        const allFiles = getAllFiles(tree);
        
        if (allFiles.length === 0) {
            return NextResponse.json({ error: 'No files found' }, { status: 404 });
        }

        // 隨機選一個
        const randomFile = allFiles[Math.floor(Math.random() * allFiles.length)];
        return NextResponse.json(randomFile);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 });
    }
}
