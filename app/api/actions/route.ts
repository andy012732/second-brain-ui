import { NextRequest, NextResponse } from 'next/server';
import { saveFileContent } from '@/lib/notes';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { action, selection, sourceFile } = await request.json();

    if (!selection) {
      return NextResponse.json({ error: 'No selection provided' }, { status: 400 });
    }

    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
    let resultPath = '';

    if (action === 'idea') {
      // 建立新 Idea 筆記
      const filename = `idea-${timestamp}.md`;
      const content = `# 💡 Idea from ${sourceFile}\n\n> ${selection}\n\n## My Thoughts\n`;
      resultPath = `00-inbox/${filename}`;
      await saveFileContent(resultPath, content);
    } 
    else if (action === 'todo') {
      // 建立新 Todo (這裡簡單做成一個獨立的 Todo 檔案，或是附加到 inbox)
      const filename = `todo-${timestamp}.md`;
      const content = `# ✅ Todo\n\n- [ ] ${selection}\n\nRef: [[${sourceFile}]]`;
      resultPath = `00-inbox/${filename}`;
      await saveFileContent(resultPath, content);
    }

    return NextResponse.json({ success: true, path: resultPath });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
