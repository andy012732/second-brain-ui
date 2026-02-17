'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, Calendar, Search, Shield, Zap, 
  Terminal, Globe, Cpu, ChevronRight, BarChart3,
  Dna, Cpu as CpuIcon, Layers, Command
} from 'lucide-react';
import Link from 'next/link';

export default function MissionControl() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [coreLoad, setCoreLoad] = useState(42);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const loadTimer = setInterval(() => {
      setCoreLoad(prev => Math.min(Math.max(prev + (Math.random() * 16 - 8), 15), 95));
    }, 1500);
    return () => { clearInterval(timer); clearInterval(loadTimer); };
  }, []);

  return (
    <div className="h-full w-full bg-[#030303] text-gray-400 font-sans p-8 flex flex-col overflow-hidden selection:bg-blue-500/30">
      <main className="flex-1 grid grid-cols-12 gap-10 overflow-hidden">
        
        {/* 🔴 即時情資流 */}
        <section className="col-span-3 flex flex-col overflow-hidden border-r border-white/5 pr-6 text-smooth">
          <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
            <Activity size={12} className="text-blue-500" /> 全球動態監測流
          </h2>
          <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
            <div className="relative pl-6 border-l border-blue-500/20 py-1">
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                <span className="text-[8px] font-bold text-blue-500/50 block mb-1">此刻</span>
                <h3 className="text-xs font-bold text-gray-200 leading-snug">正在準備重新部署</h3>
                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">歐文正在將全系統介面切換為繁體中文，並優化版面比例。</p>
            </div>
            <div className="relative pl-6 border-l border-white/5 py-1 opacity-40">
                <span className="text-[8px] font-bold text-gray-600 block mb-1">10 分鐘前</span>
                <h3 className="text-xs font-bold text-gray-400 leading-snug">看板型別地雷排除</h3>
                <p className="text-[10px] text-gray-600 mt-1 leading-relaxed">順利解決了 Vercel 的 TypeScript 建置報警，讓看板支援同步儲存。</p>
            </div>
          </div>
        </section>

        {/* 🔴 核心操作區 (移除口號、搜尋框放大) */}
        <section className="col-span-6 flex flex-col items-center justify-center">
          <div className="text-center w-full max-w-2xl">
            <div className="mb-20">
                <Command className="mx-auto text-blue-600/30 mb-4 animate-spin-slow" size={40} />
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.8em] block">全域系統調度中心</span>
            </div>

            {/* 🚀 AI 動能狀態 */}
            <div className="w-[350px] mx-auto mb-12">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <CpuIcon size={10} className="text-blue-500" /> AI 思考動能偵測
                    </span>
                    <span className="text-[9px] font-bold text-blue-400 font-mono italic">{Math.round(coreLoad)}%</span>
                </div>
                <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_10px_#3b82f6]" style={{ width: `${coreLoad}%` }} />
                </div>
            </div>
            
            {/* 搜尋框 (置中視覺核心) */}
            <div className="relative mb-20 group">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="輸入指令或關鍵字，橫向穿透所有系統..."
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-6 pl-16 pr-8 text-sm text-white font-bold tracking-widest placeholder:text-gray-800 focus:outline-none focus:border-blue-500/30 transition-all shadow-inner"
              />
            </div>

            {/* 子系統矩陣 */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { name: '進度看板', href: '/kanban', icon: <BarChart3 size={16}/>, color: 'blue' },
                { name: '個人知識庫', href: '/', icon: <Dna size={16}/>, color: 'purple' },
                { name: '戰術日誌', href: '/?file=05-logs%2Fdev-daily.md', icon: <Terminal size={16}/>, color: 'green' }
              ].map(sys => (
                <Link key={sys.name} href={sys.href} className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] flex flex-col items-center group cursor-pointer hover:bg-white/[0.05] transition-all hover:scale-105 active:scale-95 shadow-lg">
                  <div className={`p-3 bg-${sys.color}-500/10 rounded-2xl mb-4 text-${sys.color}-500 border border-${sys.color}-500/20 shadow-inner`}>
                    {sys.icon}
                  </div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white">{sys.name}</h4>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 🔴 戰術行動排程 */}
        <section className="col-span-3 flex flex-col overflow-hidden border-l border-white/5 pl-6">
          <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
            <Calendar size={12} className="text-blue-500" /> 系統自動化排程
          </h2>
          <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar">
            <div className="bg-blue-600/5 border border-blue-600/10 p-4 rounded-3xl">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] font-black text-blue-500 tracking-widest uppercase">上午 09:00</span>
                    <Zap size={10} className="text-blue-500 animate-pulse" />
                </div>
                <h4 className="text-[10px] font-bold text-gray-200 uppercase">自動情報檢索</h4>
                <p className="text-[9px] text-gray-600 mt-2">掃描當日美股走勢、騎士社群動態並自動整理記錄。</p>
            </div>
          </div>
        </section>

      </main>

      {/* 🔴 底部連線列 */}
      <footer className="h-10 mt-8 flex justify-between items-center border-t border-white/5 text-[8px] font-bold text-gray-700 tracking-[0.2em] uppercase shrink-0">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5"><Globe size={10}/> 台北指揮中心連線穩定</span>
          <span className="flex items-center gap-1.5"><Layers size={10}/> 資料加密解密中...</span>
        </div>
        <div className="text-blue-600/30 italic">DESIGNED BY OWEN V3.1 // 2026 TAIPEI.DRACULA</div>
      </footer>
    </div>
  );
}
