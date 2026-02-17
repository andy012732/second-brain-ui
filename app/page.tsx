'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, Calendar, Search, Zap, Loader2
} from 'lucide-react';
import useSWR from 'swr';

// 定義抓取器
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MissionControl() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // 🚀 自動更新引擎：每 10,000 毫秒 (10秒) 自動與伺服器同步
  const { data: activities = [], error, isLoading } = useSWR('/api/activity', fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: true
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full w-full bg-[#030303] text-gray-400 font-sans p-8 flex flex-col overflow-hidden selection:bg-blue-500/30">
      
      <main className="flex-1 grid grid-cols-12 gap-10 overflow-hidden">
        
        {/* 🟢 左側：已激活 - 自動刷新情資流 */}
        <section className="col-span-3 flex flex-col overflow-hidden border-r border-white/5 pr-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] flex items-center gap-2">
              <Activity size={12} className="text-blue-500" /> 即時情資流
            </h2>
            <div className="flex items-center gap-2">
                <span className="text-[8px] text-gray-700 font-bold uppercase tracking-widest">Auto Sync On</span>
                {isLoading && <Loader2 size={10} className="animate-spin text-blue-500" />}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
            {activities.length === 0 && !isLoading && (
               <div className="opacity-20 text-[10px] italic py-10 pl-6 border-l border-white/5">
                  目前資料庫為空，歐文正在準備情資中...
               </div>
            )}
            
            {activities.map((act: any) => (
              <div key={act.id} className="relative pl-6 border-l border-blue-500/20 py-1 mb-6 animate-in slide-in-from-left duration-500">
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#3b82f6]" />
                <span className="text-[8px] font-bold text-blue-500/50 block mb-1 uppercase">
                   {act.created_at ? new Date(act.created_at).toLocaleTimeString('zh-TW', { hour12: false }) : 'JUST NOW'}
                </span>
                <h3 className="text-xs font-bold text-gray-200 leading-snug">{act.title}</h3>
                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{act.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 🟢 中間：全域搜尋區 */}
        <section className="col-span-6 flex flex-col items-center justify-center px-4">
          <div className="text-center w-full max-w-2xl">
            <div className="relative group w-full scale-110">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={24} />
              <input 
                type="text" 
                placeholder="輸入指令或關鍵字，橫向穿透所有系統..."
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-8 pl-20 pr-10 text-lg text-white font-bold tracking-widest placeholder:text-gray-800 focus:outline-none focus:border-blue-500/30 transition-all shadow-inner"
              />
              <div className="mt-6 flex justify-center gap-6">
                  <div className="flex items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-crosshair">
                     <div className="w-1 h-1 rounded-full bg-blue-500" />
                     <span className="text-[9px] font-black text-white uppercase tracking-widest">Global Probe v4.0</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-50">
                     <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                     <span className="text-[9px] font-black text-white uppercase tracking-widest">Auto Sync Core: Engaged</span>
                  </div>
              </div>
            </div>
          </div>
        </section>

        {/* 🟢 右側：系統排程 (靜態預留) */}
        <section className="col-span-3 flex flex-col overflow-hidden border-l border-white/5 pl-6">
          <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
            <Calendar size={12} className="text-blue-500" /> 系統自動化排程
          </h2>
          {/* ...靜態樣式不變，稍後對接真正的日曆數據... */}
          <div className="opacity-20 flex flex-col items-center justify-center flex-1">
             <Calendar size={32} className="mb-4" />
             <span className="text-[9px] font-bold uppercase tracking-widest">Waiting for Sync</span>
          </div>
        </section>
      </main>

      <footer className="h-10 mt-8 flex justify-between items-center border-t border-white/5 text-[8px] font-bold text-gray-700 tracking-[0.2em] uppercase shrink-0">
        <div className="flex gap-6">
          <span className="text-blue-600/30 font-black italic">DRACULA COMMAND ENGINE EST. 2026 // LIVE CONSOLE MODE</span>
        </div>
        <div className="text-gray-800 italic">OWEN_AUTO_REFRESH_ENGAGED</div>
      </footer>
    </div>
  );
}
