'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, BookOpen, Kanban, Calendar, 
  Search, ShieldCheck, BarChart3, LineChart, 
  DollarSign, Menu, X 
} from 'lucide-react';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { name: '總控制台', href: '/', icon: LayoutDashboard },
  { name: '業績指揮部', href: '/revenue', icon: DollarSign },
  { name: '進度看板', href: '/kanban', icon: Kanban },
  { name: '內容分析', href: '/analytics', icon: BarChart3 },
  { name: '美股觀察', href: '/stocks', icon: LineChart },
  { name: '知識庫', href: '/second-brain', icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 🚀 手機版選單開關

  return (
    <nav className="h-16 w-full bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 md:px-8 sticky top-0 z-[100] shrink-0 font-sans">
      <div className="flex items-center gap-4 md:gap-8">
        {/* LOGO */}
        <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg shrink-0">
                <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">德谷拉指揮中心</span>
        </div>

        {/* 🟢 桌面板選單 (手機版隱藏) */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  isActive 
                    ? "bg-white/5 text-blue-400 border border-blue-500/20" 
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

      {/* 🔴 手機版選單切換按鈕 (只在手機顯示) */}
      <div className="flex lg:hidden items-center gap-4">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-white">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
      </div>

      {/* 右側資訊 (桌面板) */}
      <div className="hidden lg:flex items-center gap-6">
        <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-all" size={14} />
            <input 
                type="text" 
                placeholder="全域掃描..."
                className="bg-white/5 border border-white/5 rounded-full py-2 pl-9 pr-4 text-[10px] text-white font-bold w-32 focus:w-48 transition-all"
            />
        </div>
      </div>

      {/* 🔴 手機版下拉選單 (摺疊區) */}
      {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-[#0a0a0a] border-b border-white/10 p-4 flex flex-col gap-2 lg:hidden animate-in slide-in-from-top duration-300 shadow-2xl">
              {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={clsx(
                        "flex items-center gap-4 p-4 rounded-2xl text-[12px] font-black uppercase tracking-widest",
                        pathname === item.href ? "bg-white/5 text-blue-400" : "text-gray-500"
                    )}
                  >
                    <item.icon size={18} />
                    {item.name}
                  </Link>
              ))}
          </div>
      )}
    </nav>
  );
}
