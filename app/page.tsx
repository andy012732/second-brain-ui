'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, Search, Zap, Loader2, Wallet, Target, Globe
} from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
});

export default function MissionControl() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const DAILY_GOAL = 80000;

  const { data: activities = [], isLoading: actLoading } = useSWR('/api/activity', fetcher, { refreshInterval: 10000 });
  const { data: revenue = [], isLoading: revLoading } = useSWR('/api/notion/revenue', fetcher, { refreshInterval: 300000 });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 營收計算邏輯 (保持原有軍事規格)
  const todayStr = new Date().toISOString().split('T')[0];
  const revToday = Array.isArray(revenue) ? revenue.filter((r: any) => r.date === todayStr) : [];
  const hsinfengTotal = revToday.filter((r: any) => r.store === '新豐').reduce((s, r) => s + r.total, 0);
  const zhubeiTotal = revToday.filter((r: any) => r.store === '竹北').reduce((s, r) => s + r.total, 0);
  const websiteTotal = revToday.filter((r: any) => r.store === '官網').reduce((s, r) => s + r.total, 0);
  const grandTotal = hsinfengTotal + zhubeiTotal + websiteTotal;

  const hfPercent = (hsinfengTotal / DAILY_GOAL) * 100;
  const zbPercent = (zhubeiTotal / DAILY_GOAL) * 100;
  const webPercent = (websiteTotal / DAILY_GOAL) * 100;
  const overallPercent = Math.min(Math.round((grandTotal / DAILY_GOAL) * 100), 100);

  return (
    <div className="h-full w-full bg-[#030303] text-gray-400 font-sans p-4 md:p-8 flex flex-col overflow-y-auto md:overflow-hidden selection:bg-blue-500/30">
      
      {/* 🚀 主佈局：手機版改為垂直堆疊 (flex-col)，桌面板保持 grid */}
      <main className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-10 overflow-visible md:overflow-hidden">
        
        {/* 🟢 中間區塊：核心數據 (在手機版我把它移到最上面，因為最重要！) */}
        <section className="order-1 md:order-none md:col-span-6 flex flex-col items-center justify-center py-6 md:py-0">
          <div className="text-center w-full max-w-2xl px-2">
            
            {/* 業績整合進度條 (手機版加大感知) */}
            <div className="mb-10 md:mb-20 w-full animate-in fade-in duration-1000">
                <div className="flex justify-between items-end mb-4 px-2">
                    <div className="text-left">
                        <span className="text-[9px] md:text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] block">德谷拉騎士營收監測</span>
                        <div className="text-xl md:text-2xl font-black text-white mt-1 tabular-nums">
                            ${grandTotal.toLocaleString()} <span className="text-gray-700 text-xs md:text-sm font-bold">/ ${DAILY_GOAL.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <span className="text-3xl md:text-4xl font-black text-blue-500 italic tabular-nums">{overallPercent}%</span>
                    </div>
                </div>
                {/* 三色能量槽 */}
                <div className="h-4 md:h-5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-[2px] flex shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <div className="h-full bg-blue-600 transition-all duration-1000 shadow-[0_0_15px_#2563eb]" style={{ width: `${hfPercent}%` }} />
                    <div className="h-full bg-cyan-400 transition-all duration-1000 shadow-[0_0_15px_#22d3ee]" style={{ width: `${zbPercent}%` }} />
                    <div className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_15px_#10b981]" style={{ width: `${webPercent}%` }} />
                </div>
            </div>

            {/* 搜尋框 (手機版窄化) */}
            <div className="relative group w-full px-2">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input type="text" placeholder="輸入指令或關鍵字..." className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl py-4 md:py-6 pl-14 pr-6 text-sm text-white font-bold tracking-widest focus:outline-none focus:border-blue-500/30 transition-all" />
            </div>
          </div>
        </section>

        {/* 🟢 左側：情資流 (手機版高度受控) */}
        <section className="order-2 md:order-none md:col-span-3 flex flex-col overflow-hidden border-t md:border-t-0 md:border-r border-white/5 pt-6 md:pt-0 md:pr-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] flex items-center gap-2">
              <Activity size={12} className="text-blue-500" /> 即時情資流
            </h2>
            {actLoading && <Loader2 size={10} className="animate-spin text-blue-500" />}
          </div>
          <div className="flex-1 overflow-y-auto max-h-[300px] md:max-h-full space-y-6 pr-2 custom-scrollbar">
            {activities.map((act: any) => (
              <div key={act.id} className="relative pl-6 border-l border-blue-500/20 py-1 mb-4">
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                <span className="text-[8px] font-bold text-blue-500/50 block mb-1">
                   {act.created_at ? new Date(act.created_at).toLocaleTimeString('zh-TW', { hour12: false }) : 'RECENT'}
                </span>
                <h3 className="text-xs font-bold text-gray-200 leading-snug">{act.title}</h3>
                <p className="text-[9px] text-gray-500 mt-1 line-clamp-2">{act.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 🟢 右側：財報動態 (手機版顯示在最底) */}
        <section className="order-3 md:order-none md:col-span-3 flex flex-col overflow-hidden border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-6">
            <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <Wallet size={12} className="text-green-500" /> 門市分項業績
            </h2>
            <div className="space-y-3 overflow-y-auto max-h-[300px] md:max-h-full pr-2 custom-scrollbar">
                {Array.isArray(revenue) && revenue.slice(0, 8).map((rev: any) => (
                    <div key={rev.id} className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex justify-between items-center group hover:bg-white/[0.05] transition-all">
                        <div className="overflow-hidden">
                            <span className="text-[7px] font-black text-gray-600 uppercase block mb-0.5">{rev.date}</span>
                            <h4 className="text-[10px] font-bold text-gray-200 truncate">{rev.store}</h4>
                        </div>
                        <div className="text-right font-black text-white tabular-nums text-xs">${rev.total.toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </section>

      </main>

      <footer className="h-8 md:h-10 mt-6 flex justify-center md:justify-between items-center border-t border-white/5 text-[7px] md:text-[8px] font-bold text-gray-700 tracking-[0.2em] uppercase shrink-0">
        <div className="hidden md:block">DRACULA COMMAND EST. 2026 // ADAPTIVE MODE</div>
        <div className="text-blue-600/30 italic">MOBILE_STATION_ACTIVE</div>
      </footer>
    </div>
  );
}
