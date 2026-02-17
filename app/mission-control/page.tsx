'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, Calendar, Search, Shield, Zap, 
  Terminal, Globe, Cpu, ChevronRight, BarChart3,
  Dna, Cpu as CpuIcon, Layers
} from 'lucide-react';

const SLOGAN = "Everything within sight. Everything under command.";

export default function MissionControl() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [coreLoad, setCoreLoad] = useState(42);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const loadTimer = setInterval(() => {
      setCoreLoad(prev => Math.min(Math.max(prev + (Math.random() * 16 - 8), 15), 95));
    }, 1500);
    return () => { clearInterval(timer); clearInterval(loadTimer); };
  }, []);

  return (
    <div className="h-screen w-full bg-[#030303] text-gray-400 font-sans p-8 flex flex-col overflow-hidden selection:bg-blue-500/30">
      
      {/* 🟢 精簡版 Header */}
      <header className="flex justify-between items-start mb-12 border-b border-white/5 pb-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Shield className="text-blue-500" size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-[0.2em] uppercase">Dracula Mission Control</h1>
            <div className="flex items-center gap-2 mt-1">
                <div className="w-1 h-1 rounded-full bg-green-500 animate-ping" />
                <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Neural Link: ACTIVE</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-black text-white tabular-nums tracking-tighter leading-none mb-1">
            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
          </div>
          <div className="text-[9px] text-blue-500/40 font-bold tracking-[0.2em] uppercase">
            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
          </div>
        </div>
      </header>

      {/* 🟢 戰術佈局分區 */}
      <main className="flex-1 grid grid-cols-12 gap-10 overflow-hidden">
        
        {/* 左側：Activity Feed (極簡窄版) */}
        <section className="col-span-3 flex flex-col overflow-hidden border-r border-white/5 pr-6">
          <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
            <Activity size={12} className="text-blue-500" /> Intelligence Stream
          </h2>
          <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
            <div className="relative pl-6 border-l border-blue-500/20 py-1">
              <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
              <span className="text-[8px] font-bold text-blue-500/50 block mb-1">JUST NOW</span>
              <h3 className="text-xs font-bold text-gray-200 uppercase leading-snug">Visual Core Optimized</h3>
              <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">Owen deployed UI structural overhaul for better command clarity.</p>
            </div>
            <div className="relative pl-6 border-l border-white/5 py-1 opacity-40">
              <span className="text-[8px] font-bold text-gray-600 block mb-1">10 MIN AGO</span>
              <h3 className="text-xs font-bold text-gray-400 uppercase leading-snug">Localization Complete</h3>
              <p className="text-[10px] text-gray-600 mt-1 leading-relaxed">Kanban modules switched to Traditional Chinese.</p>
            </div>
          </div>
        </section>

        {/* 🟢 中間：核心指揮區 (大瘦身) */}
        <section className="col-span-6 flex flex-col items-center justify-start pt-10">
          
          <div className="text-center w-full max-w-2xl px-4">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.6em] block mb-6">Strategic Authority</span>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-10 leading-[1.1] selection:text-blue-500">
              {SLOGAN}
            </h2>

            {/* 🚀 緊湊版 AI 動能偵測條 */}
            <div className="w-[300px] mx-auto mb-16 px-4">
                <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5">
                        <CpuIcon size={10} className="text-blue-500" /> AI Core Load
                    </span>
                    <span className="text-[9px] font-bold text-blue-400 font-mono italic">{Math.round(coreLoad)}%</span>
                </div>
                <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_10px_#3b82f6]" style={{ width: `${coreLoad}%` }} />
                </div>
            </div>
            
            {/* 全域搜尋框 (Cyber Style) */}
            <div className="relative mb-16 group w-full px-10">
              <Search className="absolute left-16 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="PROBE ALL SYSTEMS..."
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl py-4 pl-16 text-xs text-white font-bold tracking-[0.2em] placeholder:text-gray-800 focus:outline-none focus:border-blue-500/30 transition-all shadow-inner"
              />
            </div>

            {/* 子系統模組 (玻璃質感卡片) */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { name: 'Kanban', icon: <BarChart3 size={16}/>, color: 'blue' },
                { name: 'Knowledge', icon: <Dna size={16}/>, color: 'purple' },
                { name: 'Commands', icon: <Terminal size={16}/>, color: 'green' }
              ].map(sys => (
                <div key={sys.name} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex flex-col items-center group cursor-pointer hover:bg-white/[0.05] transition-all hover:-translate-y-1">
                  <div className={`p-3 bg-${sys.color}-500/10 rounded-xl mb-4 text-${sys.color}-500 border border-${sys.color}-500/20 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]`}>
                    {sys.icon}
                  </div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">{sys.name}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 右側：Ops Calendar (極簡版) */}
        <section className="col-span-3 flex flex-col overflow-hidden border-l border-white/5 pl-6">
          <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
            <Calendar size={12} className="text-blue-500" /> Operational Ops
          </h2>
          <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar">
            <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl">
              <span className="text-[8px] font-black text-blue-500 tracking-widest uppercase">09:00 - SYNC</span>
              <h4 className="text-[10px] font-bold text-gray-200 uppercase mt-1">Intelligence Sweep</h4>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl opacity-30">
              <span className="text-[8px] font-black text-gray-600 tracking-widest uppercase">14:00 - REV</span>
              <h4 className="text-[10px] font-bold text-gray-500 uppercase mt-1">Personnel Review</h4>
            </div>
          </div>
        </section>

      </main>

      {/* 🟢 底部收合控制列 */}
      <footer className="h-10 mt-8 flex justify-between items-center border-t border-white/5 text-[8px] font-bold text-gray-700 tracking-[0.2em] uppercase shrink-0">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5"><Globe size={10}/> TAIPEI COMMAND EST.</span>
          <span className="flex items-center gap-1.5"><Layers size={10}/> ENCRYPTION: MIL-STD</span>
        </div>
        <div className="text-gray-500 italic">V3.0 COMMAND_OVERRIDE_ENABLED</div>
      </footer>
    </div>
  );
}
