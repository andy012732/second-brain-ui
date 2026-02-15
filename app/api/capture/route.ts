import { NextRequest, NextResponse } from 'next/server';
import { saveFileContent } from '@/lib/notes';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // 1. 自動產生檔名 (YYYY-MM-DD-HHmm.md)
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
    let filename = `note-${timestamp}.md`;
    let fileContent = content;

    // 2. 簡單的 URL 偵測 (如果內容只是 URL)
    const urlRegex = /^(http|https):\/\/[^ "]+$/;
    if (urlRegex.test(content.trim())) {
        try {
            const url = content.trim();
            // 嘗試抓取標題 (這裡做個簡單版，如果要完整版需要 jsdom)
            const res = await fetch(url);
            const html = await res.text();
            const titleMatch = html.match(/<title>(.*?)<\/title>/);
            const title = titleMatch ? titleMatch[1] : 'Untitled Link';
            
            filename = `link-${timestamp}.md`;
            fileContent = `# [${title}](${url})\n\nCaptured at: ${new Date().toLocaleString()}`;
        } catch (e) {
            // 抓取失敗就當普通文字
        }
    } else {
        // 如果是普通文字，加上標題
        const firstLine = content.split('\n')[0].substring(0, 20);
        fileContent = `# ${firstLine}...\n\n${content}`;
    }

    // 3. 存到 00-inbox
    const filePath = `00-inbox/${filename}`;
    
    await saveFileContent(filePath, fileContent);

    return NextResponse.json({ success: true, path: filePath });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to capture' }, { status: 500 });
  }
}
