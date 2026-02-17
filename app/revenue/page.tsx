'use client';

import React, { useState } from 'react';
import { 
  Wallet, Store, Edit3, PieChart, 
  RefreshCcw, Globe, Zap, BarChart3, Loader2
} from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function RevenueManager() {
  // 🚀 從 Notion API 抓取真實數據
  const { data: revenue = [], isLoading, mutate } = useSWR('/api/notion/revenue', fetcher, {
    refreshInterval: 60000 // 每分鐘自動刷新
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const revToday = Array.isArray(revenue) ? revenue.filter((r: any) => r.date === todayStr) : [];

  // 門市業績即時計算
  const hsinfengTotal = revToday.filter((r: any) => r.store === '新豐').reduce((s, r) => s + r.total, 0);
  const zhubeiTotal = revToday.filter((r: any) => r.store === '竹北').reduce((s, r) => s + r.total, 0);
  const websiteTotal = revToday.filter((r: any) => r.store === '官網').reduce((s, r) => s + r.total, 0);
  const grandTotal = hsinfengTotal + zhubeiTotal + websiteTotal;

  const sectors = [
    { name: '新豐門市', id: 'hf', total: hsinfengTotal, color: 'text-blue-500', bg: 'bg-blue-500/10', icon: <Store /> },
    { name: '竹北門市', id: 'zb', total: zhubeiTotal, color: 'text-cyan-400', bg: 'bg-cyan-400/10', icon: <Store /> },
    { name: '網站業績', id: 'web', total: websiteTotal, color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: <Globe /> }
  ];

  return (
    <div className="h-full w-full bg-[#030303] text-gray-400 font-sans p-8 flex flex-col overflow-y-auto">
      
      <div className="flex justify-between items-end mb-12 shrink-0">
        <div>
            <h2 className="text-2xl font-black text-white tracking-widest uppercase">業績指揮部 (Real-time Live)</h2>
            <div className="flex items-center gap-2 mt-2">
                {isLoading ? (
                    <Loader2 size={10} className="animate-spin text-blue-500" />
                ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                )}
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">Notion 資料流穩定連接中</p>
            </div>
        </div>
        <div className="text-right">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-1">今日全軍營收總合</span>
            <div className="text-4xl font-black text-white tabular-nums tracking-tighter">
                ${grandTotal.toLocaleString()}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 mb-12 shrink-0">
        {sectors.map((sector) => (
          <div key={sector.id} className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative group hover:border-white/10 transition-all overflow-hidden">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 ${sector.bg} ${sector.color} rounded-2xl`}>
                        {sector.icon}
                    </div>
                    {isLoading && <Loader2 size={14} className="animate-spin text-gray-700" />}
                </div>
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{sector.name}</h3>
                <div className="text-3xl font-black text-white tabular-nums tracking-tighter mb-6">${sector.total.toLocaleString()}</div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${sector.color.replace('text', 'bg')} shadow-[0_0_10px_currentColor] transition-all duration-1000`} style={{ width: `${Math.min((sector.total / 30000) * 100, 100)}%` }} />
                </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8 flex-1">
        <section className="col-span-4 bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8">
            <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <PieChart size={14} className="text-blue-500" /> 戰區貢獻度
            </h2>
            <div className="space-y-6">
                {sectors.map(s => (
                    <div key={s.id} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-gray-500">{s.name}</span>
                            <span className="text-white">{grandTotal > 0 ? Math.round((s.total / grandTotal) * 100) : 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className={`${s.color.replace('text', 'bg')} transition-all duration-1000`} style={{ width: `${grandTotal > 0 ? (s.total / grandTotal) * 100 : 0}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </section>

        <section className="col-span-8 space-y-6">
            <div className="flex items-center justify-between px-4">
                <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] flex items-center gap-2">
                    <BarChart3 size={14} className="text-blue-500" /> 真實營收日誌
                </h2>
                <button 
                    onClick={() => mutate()}
                    className="flex items-center gap-2 text-[9px] font-black text-blue-500 hover:text-white transition-colors"
                >
                    <RefreshCcw size={12}/> 立即同步最新數據
                </button>
            </div>
            
            <div className="bg-white/[0.01] border border-white/5 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/[0.02] border-b border-white/5">
                        <tr>
                            <th className="p-5 text-[9px] font-black text-gray-700 uppercase tracking-widest">時間</th>
                            <th className="p-5 text-[9px] font-black text-gray-700 uppercase tracking-widest">戰區</th>
                            <th className="p-5 text-[9px] font-black text-gray-700 uppercase tracking-widest text-right">當日累計</th>
                            <th className="p-5 text-[9px] font-black text-gray-700 uppercase tracking-widest text-center">狀態</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs">
                        {revToday.length > 0 ? revToday.map((row: any, i: number) => (
                            <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                                <td className="p-5 font-mono text-gray-500">{row.date}</td>
                                <td className="p-5 font-black text-white">{row.store}</td>
                                <td className="p-5 text-right font-black text-green-400 tabular-nums">${row.total.toLocaleString()}</td>
                                <td className="p-5 text-center">
                                    <span className="text-[8px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20 uppercase">Live Data</span>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="p-10 text-center text-xs italic opacity-20 tracking-widest">今日暫無門市數據，歐文正在監聽中...</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
      </div>
    </div>
  );
}
