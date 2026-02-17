'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, Calendar, Search, Zap, Loader2, Wallet, Target
} from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
});

export default function MissionControl() {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // 🎯 設定今日營收目標 (學長之後可以改)
  const DAILY_GOAL = 50000;

  const { data: activities = [], isLoading: actLoading } = useSWR('/api/activity', fetcher, { 
      refreshInterval: 10000,
      fallbackData: [] 
  });
  
  const { data: revenue = [], isLoading: revLoading } = useSWR('/api/notion/revenue', fetcher, { 
      refreshInterval: 300000,
      fallbackData: []
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🚀 計算當日總營收與目標進度
  const todayStr = new Date().toISOString().split('T')[0];
  const totalRevenue = Array.isArray(revenue) 
    ? revenue.filter((r: any) => r.date === todayStr).reduce((sum: number, r: any) => sum + r.total, 0)
    : 0;
  
  const progressPercent = Math.min(Math.round((totalRevenue / DAILY_GOAL) * 100), 100);

  return (
    <div className="h-full w-full bg-[#030303] text-gray-400 font-sans p-8 flex flex-col overflow-hidden selection:bg-blue-500/30">
      
      <main className="flex-1 grid grid-cols-12 gap-10 overflow-hidden">
        
        {/* 左側：即時情資流 */}
        <section className="col-span-3 flex flex-col overflow-hidden border-r border-white/5 pr-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] flex items-center gap-2">
              <Activity size={12} className="text-blue-500" /> 即時情資流
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
            {Array.isArray(activities) && activities.map((act: any) => (
              <div key={act.id} className="relative pl-6 border-l border-blue-500/20 py-1 mb-6">
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                <span className="text-[8px] font-bold text-blue-500/50 block mb-1">
                   {act.created_at ? new Date(act.created_at).toLocaleTimeString('zh-TW', { hour12: false }) : 'RECENT'}
                </span>
                <h3 className="text-xs font-bold text-gray-200 leading-snug">{act.title}</h3>
                <p className="text-[10px] text-gray-500 mt-1">{act.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 中間：核心搜尋與超強進度條 */}
        <section className="col-span-6 flex flex-col items-center justify-center relative">
          <div className="text-center w-full max-w-2xl px-4">
            
            {/* 🚀 總營收目標大幅進度條 */}
            <div className="mb-20 w-full animate-in fade-in zoom-in duration-1000">
                <div className="flex justify-between items-end mb-4 px-2">
                    <div className="text-left">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] block">Revenue Mission Progress</span>
                        <div className="text-2xl font-black text-white mt-1 tabular-nums">${totalRevenue.toLocaleString()} <span className="text-gray-700 text-sm font-bold">/ ${DAILY_GOAL.toLocaleString()}</span></div>
                    </div>
                    <div className="text-right">
                        <span className="text-4xl font-black text-blue-500 italic tabular-nums">{progressPercent}%</span>
                    </div>
                </div>
                {/* 戰術級能量槽 */}
                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-1 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-300 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.4)] relative"
                        style={{ width: `${progressPercent}%` }}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[pulse_2s_linear_infinite]" />
                    </div>
                </div>
            </div>

            <div className="relative group w-full">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500" size={20} />
              <input type="text" placeholder="輸入指令穿透全域..." className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-6 pl-16 text-sm text-white font-bold tracking-widest focus:outline-none focus:border-blue-500/30 transition-all shadow-inner" />
            </div>
          </div>
        </section>

        {/* 右側：財報列表 */}
        <section className="col-span-3 flex flex-col overflow-hidden">
            <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <Wallet size={12} className="text-green-500" /> 門市即時財報
            </h2>
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {Array.isArray(revenue) && revenue.map((rev: any) => (
                    <div key={rev.id} className="bg-green-500/5 border border-green-500/10 p-4 rounded-2xl flex justify-between items-center">
                        <div>
                            <span className="text-[8px] text-green-500/50 uppercase block mb-1">{rev.date}</span>
                            <h4 className="text-xs font-bold text-white uppercase">{rev.store}</h4>
                        </div>
                        <div className="text-right font-black text-green-400 tabular-nums">${rev.total.toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </section>

      </main>
    </div>
  );
}
