import { NextRequest, NextResponse } from 'next/server';
import { getFileContent, saveFileContent, deleteFile } from '@/lib/notes';
import { MANUAL_CONTENT } from '@/lib/manual';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 });
  }

  // 攔截說明書請求
  if (path === '__MANUAL__') {
      return NextResponse.json({
          content: MANUAL_CONTENT,
          frontmatter: { title: 'Second Brain 使用手冊' },
          modifiedAt: new Date().toISOString()
      });
  }

  try {
    const data = await getFileContent(path);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}

export async function PUT(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');
    
    if (!path) {
        return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    try {
        const { content } = await request.json();
        const result = await saveFileContent(path, content);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');
    
    if (!path) {
        return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    try {
        const result = await deleteFile(path);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }
}
