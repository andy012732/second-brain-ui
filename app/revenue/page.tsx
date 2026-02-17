'use client';

import React, { useState } from 'react';
import { 
  Wallet, TrendingUp, ShoppingBag, Store, 
  Plus, Edit3, ArrowRight, PieChart, 
  ArrowUpRight, DollarSign, Globe, Zap,
  BarChart3, RefreshCcw
} from 'lucide-react';

export default function RevenueManager() {
  const [sectors, setSectors] = useState([
    { name: '新豐門市', id: 'hf', total: 28400, color: 'text-blue-500', bg: 'bg-blue-500/10', icon: <Store /> },
    { name: '竹北門市', id: 'zb', total: 31200, color: 'text-cyan-400', bg: 'bg-cyan-400/10', icon: <Store /> },
    { name: '網站業績', id: 'web', total: 12500, color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: <Globe /> }
  ]);

  const grandTotal = sectors.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="h-full w-full bg-[#030303] text-gray-400 font-sans p-8 flex flex-col overflow-y-auto selection:bg-green-500/30">
      
      {/* 🟢 頂部標題列 */}
      <div className="flex justify-between items-end mb-12 shrink-0">
        <div>
            <h2 className="text-2xl font-black text-white tracking-widest uppercase">業績指揮部 (Revenue Command)</h2>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em] mt-2">佳德騎士總營收調度系統 v1.0</p>
        </div>
        <div className="text-right">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-1">今日全軍營收總合</span>
            <div className="text-4xl font-black text-white tabular-nums tracking-tighter">
                ${grandTotal.toLocaleString()}
            </div>
        </div>
      </div>

      {/* 🟢 三軍大面板 (重點卡片) */}
      <div className="grid grid-cols-3 gap-8 mb-12 shrink-0">
        {sectors.map((sector) => (
          <div key={sector.id} className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative group hover:border-white/10 transition-all overflow-hidden">
            {/* 背景動態飾紋 */}
            <div className={`absolute top-0 right-0 p-10 opacity-[0.02] group-hover:scale-110 transition-transform`}>
                <Zap size={120} className={sector.color} />
            </div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 ${sector.bg} ${sector.color} rounded-2xl`}>
                        {sector.icon}
                    </div>
                    <button className="p-2 hover:bg-white/5 rounded-lg text-gray-600 hover:text-white transition-all">
                        <Edit3 size={16} />
                    </button>
                </div>
                
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{sector.name}</h3>
                <div className="text-3xl font-black text-white tabular-nums tracking-tighter mb-6">${sector.total.toLocaleString()}</div>
                
                {/* 簡單進度條 */}
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${sector.color.replace('text', 'bg')} opacity-50 shadow-[0_0_10px_currentColor]`} style={{ width: '65%' }} />
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🟢 戰術分析與歷史紀錄 */}
      <div className="grid grid-cols-12 gap-8 flex-1">
        
        {/* 左側：支付佔比 (模擬數據) */}
        <section className="col-span-4 bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8">
            <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <PieChart size={14} className="text-blue-500" /> 支付渠道佔比分析
            </h2>
            <div className="space-y-6">
                {[
                    { type: '現金支付', percent: 45, color: 'bg-green-500' },
                    { type: 'LINEPAY', percent: 30, color: 'bg-emerald-400' },
                    { type: '刷卡/匯款', percent: 25, color: 'bg-blue-500' }
                ].map(p => (
                    <div key={p.type} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-gray-500">{p.type}</span>
                            <span className="text-white">{p.percent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${p.color}`} style={{ width: `${p.percent}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* 右側：詳細紀錄列表 */}
        <section className="col-span-8 space-y-6">
            <div className="flex items-center justify-between px-4">
                <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] flex items-center gap-2">
                    <BarChart3 size={14} className="text-blue-500" /> 歷史營收日誌
                </h2>
                <button className="flex items-center gap-2 text-[9px] font-black text-blue-500 hover:text-white transition-colors">
                    <RefreshCcw size={12}/> 同步 NOTION 數據
                </button>
            </div>
            
            <div className="bg-white/[0.01] border border-white/5 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/[0.02] border-b border-white/5">
                        <tr>
                            <th className="p-5 text-[9px] font-black text-gray-700 uppercase tracking-widest">日期</th>
                            <th className="p-5 text-[9px] font-black text-gray-700 uppercase tracking-widest">戰區</th>
                            <th className="p-5 text-[9px] font-black text-gray-700 uppercase tracking-widest text-right">金額</th>
                            <th className="p-5 text-[9px] font-black text-gray-700 uppercase tracking-widest text-center">狀態</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs">
                        {[
                            { date: '2026-02-18', sector: '竹北', amount: 31200, status: 'VERIFIED' },
                            { date: '2026-02-18', sector: '新豐', amount: 28400, status: 'VERIFIED' },
                            { date: '2026-02-17', sector: '網站', amount: 15800, status: 'SYNCED' }
                        ].map((row, i) => (
                            <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group text-gray-300">
                                <td className="p-5 font-mono">{row.date}</td>
                                <td className="p-5 font-black text-white">{row.sector}</td>
                                <td className="p-5 text-right font-black text-green-400 tabular-nums">${row.amount.toLocaleString()}</td>
                                <td className="p-5 text-center">
                                    <span className="text-[8px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">{row.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>

      </div>

      <footer className="h-10 mt-12 flex justify-between items-center border-t border-white/5 text-[8px] font-bold text-gray-700 uppercase tracking-[0.2em] shrink-0">
        <div>Revenue Ops Tower // Secure Access Authorized</div>
        <div className="flex gap-4">
            <span className="text-green-500/30">Hsinfeng: Online</span>
            <span className="text-cyan-500/30">Zhubei: Online</span>
            <span className="text-emerald-500/30">Website: Tracking</span>
        </div>
      </footer>
    </div>
  );
}
