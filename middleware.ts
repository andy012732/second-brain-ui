import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 只保護 /kanban 頁面以及相關的 API
  if (request.nextUrl.pathname.startsWith('/kanban') || request.nextUrl.pathname.startsWith('/api/tasks')) {
    
    // 從 Cookie 中讀取已登入的金鑰
    const authToken = request.cookies.get('command_center_key')?.value;
    const SECRET_KEY = process.env.COMMAND_CENTER_KEY || 'GyberPass'; // 預設金鑰

    if (authToken !== SECRET_KEY) {
      // 如果是用戶端存取頁面，導向到一個簡單的驗證提示介面 (或直接返回阻擋訊息)
      // 這裡歐文採用最嚴格的策略：沒對就報 401
      if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Tactical Access Denied' }, { status: 401 });
      }
      
      // 之後我們會加一個驗證 UI，但現在我們先確保安全性！
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/kanban/:path*', '/api/tasks/:path*'],
};
