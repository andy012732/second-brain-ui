'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, TrendingUp, Search, Plus, 
  ArrowUpRight, ArrowDownRight, Zap, Star,
  Activity, DollarSign, BarChart3
} from 'lucide-react';

export default function StocksDashboard() {
  const [watchlist, setWatchlist] = useState([
    { symbol: 'NVDA', name: 'NVIDIA', price: 739.42, change: 15.2, percent: '+2.1%', status: 'up' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', price: 188.45, change: -3.1, percent: '-1.6%', status: 'down' },
    { symbol: 'AAPL', name: 'Apple Inc.', price: 182.31, change: 0.45, percent: '+0.2%', status: 'up' }
  ]);

  return (
    <div className="h-full w-full bg-[#030303] text-gray-400 font-sans p-8 flex flex-col overflow-y-auto selection:bg-green-500/30">
      
      {/* 🟢 頂部搜尋與新增 */}
      <div className="flex justify-between items-center mb-10 shrink-0">
        <div>
            <h2 className="text-xl font-black text-white tracking-widest uppercase">美股戰情觀測台</h2>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">Market Sector / US Equities</p>
        </div>
        <div className="relative group max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-green-500" size={16} />
            <input 
                type="text" 
                placeholder="輸入股票代號 (如: MSFT)..."
                className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs text-white font-bold tracking-widest focus:outline-none focus:border-green-500/30 transition-all shadow-inner"
            />
        </div>
      </div>

      {/* 🟢 主標的看板 (Pinned) */}
      <div className="grid grid-cols-2 gap-8 mb-12 shrink-0">
        {watchlist.filter(s => s.symbol !== 'AAPL').map((stock) => (
          <div key={stock.symbol} className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:border-white/10 transition-all">
            {/* 背景飾紋 */}
            <div className={`absolute top-0 right-0 p-10 opacity-[0.03] transition-transform group-hover:scale-110`}>
                <TrendingUp size={120} className={stock.status === 'up' ? 'text-green-500' : 'text-rose-500'} />
            </div>
            
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">主力標的</span>
                        <Star size={10} className="text-yellow-500 fill-current" />
                    </div>
                    <div className="text-4xl font-black text-white tracking-tighter mb-1">{stock.symbol}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase">{stock.name}</div>
                </div>
                <div className="text-right">
                    <div className={`text-3xl font-black tabular-nums tracking-tighter ${stock.status === 'up' ? 'text-green-400' : 'text-rose-400'}`}>
                        ${stock.price}
                    </div>
                    <div className={`flex items-center justify-end gap-1 text-[10px] font-black mt-2 ${stock.status === 'up' ? 'text-green-500' : 'text-rose-500'}`}>
                        {stock.percent} {stock.status === 'up' ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                    </div>
                </div>
            </div>
            
            <div className="mt-10 h-16 w-full flex items-end gap-1 opacity-30">
                {/* 模擬小走勢圖格 */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-full rounded-t-[1px] ${stock.status === 'up' ? 'bg-green-500' : 'bg-rose-500'}`}
                        style={{ height: `${Math.random() * 100}%` }}
                    />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* 🟢 次標觀察清單 (Watchlist) */}
      <section className="space-y-6">
        <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
          <Activity size={12} className="text-blue-500" /> 次要觀察矩陣
        </h2>
        <div className="bg-white/[0.01] border border-white/5 rounded-[2rem] overflow-hidden shadow-inner">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/5">
                        <th className="p-6 text-[9px] font-black text-gray-700 uppercase tracking-widest">代號</th>
                        <th className="p-6 text-[9px] font-black text-gray-700 uppercase tracking-widest text-right">當前價格</th>
                        <th className="p-6 text-[9px] font-black text-gray-700 uppercase tracking-widest text-right">漲跌幅</th>
                        <th className="p-6 text-[9px] font-black text-gray-700 uppercase tracking-widest text-center">趨勢</th>
                        <th className="p-6 text-[9px] font-black text-gray-700 uppercase tracking-widest text-right">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {watchlist.map((stock) => (
                        <tr key={stock.symbol} className="hover:bg-white/[0.02] transition-colors border-b border-white/[0.02] group">
                            <td className="p-6">
                                <div className="text-sm font-black text-white">{stock.symbol}</div>
                                <div className="text-[9px] text-gray-600 font-bold uppercase">{stock.name}</div>
                            </td>
                            <td className="p-6 text-right tabular-nums text-sm font-bold text-gray-200">${stock.price}</td>
                            <td className={`p-6 text-right tabular-nums text-sm font-black ${stock.status === 'up' ? 'text-green-500' : 'text-rose-500'}`}>
                                {stock.percent}
                            </td>
                            <td className="p-6">
                                <div className="flex justify-center gap-0.5 h-4">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <div key={i} className="w-1 bg-white/10 rounded-full h-full" />
                                    ))}
                                </div>
                            </td>
                            <td className="p-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-all"><Zap size={14} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </section>

      <footer className="h-10 mt-12 flex justify-between items-center border-t border-white/5 text-[8px] font-bold text-gray-700 uppercase tracking-[0.2em] shrink-0">
        <div>Ticker Server v1.0 // Real-time Simulated Link Enabled</div>
        <div className="flex gap-4">
            <span className="text-green-500/30">Exchange Mode: NASDAQ/NYSE</span>
            <span className="text-green-500/30">Alert System: ARMED</span>
        </div>
      </footer>
    </div>
  );
}
