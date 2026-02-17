'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, Calendar, Search, Zap, Loader2, DollarSign, Wallet
} from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MissionControl() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // 動態情資流
  const { data: activities = [], isLoading: actLoading } = useSWR('/api/activity', fetcher, { refreshInterval: 10000 });
  
  // 🚀 新增：佳德營收數據流
  const { data: revenue = [], isLoading: revLoading } = useSWR('/api/notion/revenue', fetcher, { refreshInterval: 300000 }); // 5分鐘更新一次

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full w-full bg-[#030303] text-gray-400 font-sans p-8 flex flex-col overflow-hidden selection:bg-blue-500/30">
      
      <main className="flex-1 grid grid-cols-12 gap-10 overflow-hidden">
        
        {/* 左側：即時情資流 */}
        <section className="col-span-3 flex flex-col overflow-hidden border-r border-white/5 pr-6 text-smooth">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] flex items-center gap-2">
              <Activity size={12} className="text-blue-500" /> 即時情資流
            </h2>
            {actLoading && <Loader2 size={10} className="animate-spin text-blue-500" />}
          </div>
          <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar text-xs">
            {activities.map((act: any) => (
              <div key={act.id} className="relative pl-6 border-l border-blue-500/20 py-1 mb-6">
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                <span className="text-[8px] font-bold text-blue-500/50 block mb-1 uppercase">
                   {act.created_at ? new Date(act.created_at).toLocaleTimeString('zh-TW', { hour12: false }) : 'JUST NOW'}
                </span>
                <h3 className="text-xs font-bold text-gray-200 leading-snug">{act.title}</h3>
                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{act.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 中間：核心搜尋區 */}
        <section className="col-span-6 flex flex-col items-center justify-center relative">
          <div className="text-center w-full max-w-2xl px-4">
            <div className="relative group w-full">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input type="text" placeholder="輸入指令或關鍵字，橫向穿透所有系統..." className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-6 pl-16 pr-8 text-sm text-white font-bold tracking-widest placeholder:text-gray-800 focus:outline-none focus:border-blue-500/30 transition-all shadow-inner" />
              <div className="mt-4 flex justify-center gap-4">
                  <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest underline decoration-blue-900">Tactical Link Established</span>
              </div>
            </div>
          </div>
        </section>

        {/* 右側：排程與財報 (數據聚合區) */}
        <section className="col-span-3 flex flex-col overflow-hidden space-y-10">
          
          {/* 排程部分 */}
          <div className="flex flex-col h-1/2">
            <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <Calendar size={12} className="text-blue-500" /> 系統自動化排程
            </h2>
            <div className="bg-blue-600/5 border border-blue-600/10 p-4 rounded-3xl mb-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] font-black text-blue-500 tracking-widest uppercase">上午 09:00</span>
                    <Zap size={10} className="text-blue-500 animate-pulse" />
                </div>
                <h4 className="text-[10px] font-bold text-gray-200 uppercase">自動情報檢索</h4>
                <p className="text-[9px] text-gray-600 mt-2">掃描美股走勢、騎士社群動態並自動整理。</p>
            </div>
          </div>

          {/* 🚀 佳德即時財報區 (New!) */}
          <div className="flex flex-col h-1/2 border-t border-white/5 pt-10">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Wallet size={12} className="text-green-500" /> 佳德即時財報
                </h2>
                {revLoading && <Loader2 size={10} className="animate-spin text-green-500" />}
            </div>
            
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {revenue.map((rev: any) => (
                    <div key={rev.id} className="bg-green-500/5 border border-green-500/10 p-4 rounded-2xl flex justify-between items-center group hover:bg-green-500/10 transition-all">
                        <div>
                            <span className="text-[8px] font-black text-green-500/50 uppercase block mb-1">{rev.date}</span>
                            <h4 className="text-xs font-bold text-white uppercase">{rev.store}門市</h4>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-black text-green-400 tabular-nums leading-none">${rev.total.toLocaleString()}</div>
                            <span className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter mt-1 block">Revenue Verified</span>
                        </div>
                    </div>
                ))}
                {revenue.length === 0 && !revLoading && <span className="text-[9px] italic opacity-20 px-2">聯網中，正在同步 Notion 金流資料...</span>}
            </div>
          </div>

        </section>

      </main>

      <footer className="h-10 mt-8 flex justify-between items-center border-t border-white/5 text-[8px] font-bold text-gray-700 tracking-[0.2em] uppercase shrink-0">
        <div>DRACULA COMMAND EST. 2026 // FINANCIAL_NODE_CONNECTED</div>
        <div className="text-gray-800 italic">SECURE_NOTION_INTEGRATION_ACTIVE</div>
      </footer>
    </div>
  );
}
