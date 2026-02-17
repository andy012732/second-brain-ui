'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, Calendar, Search, Zap
} from 'lucide-react';

export default function MissionControl() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full w-full bg-[#030303] text-gray-400 font-sans p-8 flex flex-col overflow-hidden selection:bg-blue-500/30">
      
      <main className="flex-1 grid grid-cols-12 gap-10 overflow-hidden">
        
        {/* 🟢 左側：即時情資流 */}
        <section className="col-span-3 flex flex-col overflow-hidden border-r border-white/5 pr-6">
          <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
            <Activity size={12} className="text-blue-500" /> 全球動態監測流
          </h2>
          <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
            <div className="relative pl-6 border-l border-blue-500/20 py-1">
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                <span className="text-[8px] font-bold text-blue-500/50 block mb-1">此刻</span>
                <h3 className="text-xs font-bold text-gray-200 leading-snug">系統架構一體化完成</h3>
                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">歐文成功將導航選單全域化，並精簡了總控制台主視圖。</p>
            </div>
            <div className="relative pl-6 border-l border-white/5 py-1 opacity-40">
                <span className="text-[8px] font-bold text-gray-600 block mb-1">1 小時前</span>
                <h3 className="text-xs font-bold text-gray-400 uppercase leading-snug">繁體中文本地化</h3>
                <p className="text-[10px] text-gray-600 mt-1 leading-relaxed">完成全專案語系切換，包含看板標籤與控制台術語。</p>
            </div>
          </div>
        </section>

        {/* 🟢 中間：核心搜尋區 (極簡極致版) */}
        <section className="col-span-6 flex flex-col items-center justify-center">
          <div className="text-center w-full max-w-2xl px-4">
            
            {/* 搜尋框 (現在是頁面的唯一主角) */}
            <div className="relative group w-full">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="輸入指令或關鍵字，橫向穿透所有系統..."
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-6 pl-16 pr-8 text-sm text-white font-bold tracking-widest placeholder:text-gray-800 focus:outline-none focus:border-blue-500/30 transition-all shadow-inner"
              />
              <div className="mt-4 flex justify-center gap-4">
                  <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Global Probe v3.2</span>
                  <span className="text-[9px] font-black text-gray-800 uppercase tracking-widest">//</span>
                  <span className="text-[9px] font-black text-blue-900 uppercase tracking-widest">Tactical Link Established</span>
              </div>
            </div>

          </div>
        </section>

        {/* 🟢 右側：戰術排程 */}
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

      {/* 🔴 底部連線列 (保持不變) */}
      <footer className="h-10 mt-8 flex justify-between items-center border-t border-white/5 text-[8px] font-bold text-gray-700 tracking-[0.2em] uppercase shrink-0">
        <div className="flex gap-6">
          <span className="text-blue-600/30 font-black italic">DRACULA COMMAND EST. 2026</span>
        </div>
        <div className="text-gray-800 italic">SYSTEM_PURIFIED_V3.2</div>
      </footer>
    </div>
  );
}
