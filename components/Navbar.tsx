'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Kanban, Calendar, Search, ShieldCheck, BarChart3, LineChart } from 'lucide-react';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { name: '總控制台', href: '/', icon: LayoutDashboard },
  { name: '業績指揮部', href: '/revenue', icon: DollarSign }, // 🚀 新增！
  { name: '進度看板', href: '/kanban', icon: Kanban },
  { name: '內容分析', href: '/analytics', icon: BarChart3 },
  { name: '美股觀察', href: '/stocks', icon: LineChart },
  { name: '知識庫', href: '/second-brain', icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="h-16 w-full bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-[100] shrink-0 font-sans">
      <div className="flex items-center gap-8">
        {/* LOGO */}
        <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg">
                <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="text-xs font-black text-white uppercase tracking-[0.2em] lg:block hidden">德谷拉指揮中心</span>
        </div>

        {/* 主選單 */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  isActive 
                    ? "bg-white/5 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"
                )}
              >
                <Icon size={14} className={isActive ? "text-blue-500" : "text-gray-600"} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 右側快速搜尋與系統狀態 */}
      <div className="flex items-center gap-6">
        <div className="relative group lg:block hidden">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-all" size={14} />
            <input 
                type="text" 
                placeholder="全域系統掃描..."
                className="bg-white/5 border border-white/5 rounded-full py-2 pl-9 pr-4 text-[10px] text-white font-bold placeholder:text-gray-600 focus:outline-none focus:border-blue-500/30 transition-all w-48"
            />
        </div>
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-black text-gray-600 uppercase">Secure Link: Up</span>
        </div>
      </div>
    </nav>
  );
}
