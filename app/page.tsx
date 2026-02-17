'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, Calendar, Search, Zap, Loader2
} from 'lucide-react';

export default function MissionControl() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    loadActivities();
    const syncTimer = setInterval(loadActivities, 30000); // 30秒同步一次
    return () => { clearInterval(timer); clearInterval(syncTimer); };
  }, []);

  const loadActivities = async () => {
    try {
      const res = await fetch('/api/activity?limit=10');
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (e) {
      console.error("Link Failure: Intelligence Stream offline.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-[#030303] text-gray-400 font-sans p-8 flex flex-col overflow-hidden selection:bg-blue-500/30">
      
      <main className="flex-1 grid grid-cols-12 gap-10 overflow-hidden">
        
        {/* 🟢 左側：動態情資流 (動態化達成！) */}
        <section className="col-span-3 flex flex-col overflow-hidden border-r border-white/5 pr-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] flex items-center gap-2">
              <Activity size={12} className="text-blue-500" /> 即時情資流
            </h2>
            {isLoading && <Loader2 size={10} className="animate-spin text-blue-500" />}
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
            {activities.length === 0 && !isLoading && (
               <div className="opacity-20 text-[10px] italic py-10 pl-6 border-l border-white/5">
                  目前資料庫為空，歐文正在準備情資中...
               </div>
            )}
            
            {activities.map((act) => (
              <div key={act.id} className="relative pl-6 border-l border-blue-500/20 py-1 mb-6">
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                <span className="text-[8px] font-bold text-blue-500/50 block mb-1 uppercase">
                   {new Date(act.created_at).toLocaleTimeString('zh-TW', { hour12: false })}
                </span>
                <h3 className="text-xs font-bold text-gray-200 leading-snug">{act.title}</h3>
                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{act.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 🟢 中間：全域搜尋區 */}
        <section className="col-span-6 flex flex-col items-center justify-center">
          <div className="text-center w-full max-w-2xl">
            <div className="relative group w-full">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="輸入指令或關鍵字，橫向穿透所有系統..."
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-6 pl-16 pr-8 text-sm text-white font-bold tracking-widest focus:outline-none focus:border-blue-500/30 transition-all shadow-inner"
              />
              <div className="mt-4 flex justify-center gap-4">
                  <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Global Probe v3.3</span>
                  <span className="text-[9px] font-black text-gray-800 uppercase tracking-widest">//</span>
                  <span className="text-[9px] font-black text-blue-900 uppercase tracking-widest">Neural Link Synchronized</span>
              </div>
            </div>
          </div>
        </section>

        {/* 🟢 右側：系統排程 */}
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

      <footer className="h-10 mt-8 flex justify-between items-center border-t border-white/5 text-[8px] font-bold text-gray-700 tracking-[0.2em] uppercase shrink-0">
        <div className="flex gap-6">
          <span className="text-blue-600/30 font-black italic">DRACULA COMMAND EST. 2026 // DYNAMIC DATA MODE</span>
        </div>
        <div className="text-gray-800 italic">SYSTEM_ACTIVE</div>
      </footer>
    </div>
  );
}
