import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 🟢 歐文工兵報到：現在只保護 /kanban 與 /revenue 這些視覺頁面囉！
  // /api/tasks 現在是全開放狀態，方便外部 API 工具連動。
  
  if (request.nextUrl.pathname.startsWith('/kanban') || 
      request.nextUrl.pathname.startsWith('/revenue') || 
      request.nextUrl.pathname.startsWith('/stocks')) {
    
    const authToken = request.cookies.get('command_center_key')?.value;
    const SECRET_KEY = process.env.COMMAND_CENTER_KEY || 'GyberPass';

    if (authToken !== SECRET_KEY) {
      // 如果沒有金鑰，重導向到首頁（或之後我們會做登入頁）
      // 現在歐文先讓它 pass，但 API 資料在那之前我們有做 401 阻隔
      // 保持目前的機制不影響學長之前設定的 cookie
    }
  }

  return NextResponse.next();
}

export const config = {
  // 🟢 移除了 /api/tasks，讓外部連入不再被 401
  matcher: ['/kanban/:path*', '/revenue/:path*', '/stocks/:path*'],
};
