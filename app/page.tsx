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
  const DAILY_GOAL = 80000; // 有了網站加上去，目標調高到 8萬 喔！😤

  const { data: activities = [] } = useSWR('/api/activity', fetcher, { refreshInterval: 10000 });
  const { data: revenue = [], isLoading: revLoading } = useSWR('/api/notion/revenue', fetcher, { refreshInterval: 300000 });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🚀 計算三方業績
  const todayStr = new Date().toISOString().split('T')[0];
  const revToday = Array.isArray(revenue) ? revenue.filter((r: any) => r.date === todayStr) : [];
  
  const hsinfengTotal = revToday.filter((r: any) => r.store === '新豐').reduce((s, r) => s + r.total, 0);
  const zhubeiTotal = revToday.filter((r: any) => r.store === '竹北').reduce((s, r) => s + r.total, 0);
  const websiteTotal = revToday.filter((r: any) => r.store === '官網').reduce((s, r) => s + r.total, 0);
  const grandTotal = hsinfengTotal + zhubeiTotal + websiteTotal;

  // 各佔比
  const hfPercent = (hsinfengTotal / DAILY_GOAL) * 100;
  const zbPercent = (zhubeiTotal / DAILY_GOAL) * 100;
  const webPercent = (websiteTotal / DAILY_GOAL) * 100;
  const overallPercent = Math.min(Math.round((grandTotal / DAILY_GOAL) * 100), 100);

  return (
    <div className="h-full w-full bg-[#030303] text-gray-400 font-sans p-8 flex flex-col overflow-hidden selection:bg-blue-500/30">
      
      <main className="flex-1 grid grid-cols-12 gap-10 overflow-hidden">
        
        {/* 左側：即時情資流 */}
        <section className="col-span-3 flex flex-col overflow-hidden border-r border-white/5 pr-6">
          <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
            <Activity size={12} className="text-blue-500" /> 即時情資流
          </h2>
          <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
            {Array.isArray(activities) && activities.map((act: any) => (
              <div key={act.id} className="relative pl-6 border-l border-blue-500/20 py-1 mb-6">
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                <span className="text-[8px] font-bold text-blue-500/50 block mb-1 uppercase">
                   {act.created_at ? new Date(act.created_at).toLocaleTimeString('zh-TW', { hour12: false }) : 'RECENT'}
                </span>
                <h3 className="text-xs font-bold text-gray-200 leading-snug">{act.title}</h3>
                <p className="text-[10px] text-gray-500 mt-1">{act.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 中間：核心搜尋與三色能量槽 */}
        <section className="col-span-6 flex flex-col items-center justify-center">
          <div className="text-center w-full max-w-2xl px-4">
            
            {/* 🚀 佳德騎士：三軍整合進度條 */}
            <div className="mb-20 w-full">
                <div className="flex justify-between items-end mb-4 px-2">
                    <div className="text-left">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] block">佳德騎士三方業績總和 (Revenue)</span>
                        <div className="text-2xl font-black text-white mt-1 tabular-nums">
                            ${grandTotal.toLocaleString()} <span className="text-gray-700 text-sm font-bold">/ ${DAILY_GOAL.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <span className="text-4xl font-black text-blue-500 italic tabular-nums">{overallPercent}%</span>
                        <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mt-1">Goal Status: Tactical Strike</span>
                    </div>
                </div>
                {/* 戰術級複合槽 */}
                <div className="h-5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-[2px] flex shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                    {/* 新豐區 */}
                    <div className="h-full bg-blue-600 transition-all duration-1000 shadow-[0_0_15px_#2563eb]" style={{ width: `${hfPercent}%` }} />
                    {/* 竹北區 */}
                    <div className="h-full bg-cyan-400 transition-all duration-1000 shadow-[0_0_15px_#22d3ee]" style={{ width: `${zbPercent}%` }} />
                    {/* 官網區 */}
                    <div className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_15px_#10b981]" style={{ width: `${webPercent}%` }} />
                </div>
                <div className="mt-4 flex justify-between px-2">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-600 rounded-full"/> <span className="text-[9px] font-bold text-gray-500">新豐門市</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-cyan-400 rounded-full"/> <span className="text-[9px] font-bold text-gray-500">竹北門市</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full"/> <span className="text-[9px] font-bold text-gray-500">網站業績</span></div>
                </div>
            </div>

            <div className="relative group w-full opacity-80 hover:opacity-100 transition-opacity">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500" size={20} />
              <input type="text" placeholder="輸入指令穿透全域系統..." className="w-full bg-[#0a0a0a] border border-white/5 rounded-full py-6 pl-16 pr-8 text-sm text-white font-bold tracking-widest focus:outline-none focus:border-blue-500/30 transition-all shadow-inner" />
            </div>
          </div>
        </section>

        {/* 右側：財報列表 */}
        <section className="col-span-3 flex flex-col overflow-hidden">
            <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <Wallet size={12} className="text-green-500" /> 歷史分項動態
            </h2>
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {Array.isArray(revenue) && revenue.map((rev: any) => (
                    <div key={rev.id} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex justify-between items-center group hover:bg-white/[0.05] transition-all">
                        <div>
                            <span className="text-[8px] font-black text-gray-600 uppercase block mb-1">{rev.date}</span>
                            <h4 className="text-xs font-bold text-gray-200 uppercase">{rev.store === '官網' ? <span className="text-emerald-500">GLOBAL WEBSITE</span> : `${rev.store} STORE`}</h4>
                        </div>
                        <div className="text-right font-black text-white tabular-nums">${rev.total.toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </section>

      </main>
    </div>
  );
}
