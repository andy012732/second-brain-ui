'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, Calendar, Search, Shield, Zap, 
  Terminal, Globe, Cpu, ChevronRight, BarChart3,
  Dna, MoveUpRight, Cpu as CpuIcon
} from 'lucide-react';

const SLOGAN = "Everything within sight. Everything under command.";

export default function MissionControl() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [coreLoad, setCoreLoad] = useState(42);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const loadTimer = setInterval(() => {
      setCoreLoad(prev => Math.min(Math.max(prev + (Math.random() * 20 - 10), 10), 98));
    }, 2000);
    return () => {
      clearInterval(timer);
      clearInterval(loadTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-mono p-6 selection:bg-blue-500/30">
      
      {/* 頂部導航/狀態列 */}
      <header className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-full border border-blue-500/20 animate-pulse">
            <Shield className="text-blue-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-widest">DRACULA MISSION CONTROL</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-1">Strategic AI Orchestrator v3.0</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white tabular-nums tracking-tighter">
            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
          </div>
          <div className="text-[10px] text-blue-500/50 font-bold tracking-widest uppercase">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </header>

      {/* 中央主展區 */}
      <main className="grid grid-cols-12 gap-8">
        
        {/* 左側：Activity Feed (即時情資流) */}
        <section className="col-span-3 space-y-6 lg:block hidden">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <Activity size={14} className="text-blue-500" /> Live Intelligence
            </h2>
            <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">BUFFERING</span>
          </div>
          
          <div className="border-l border-white/5 pl-6 space-y-8 relative">
            <div className="relative">
              <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] border-2 border-[#050505]" />
              <div className="text-[10px] text-blue-500 font-bold mb-1">RUNNING NOW</div>
              <h3 className="text-sm font-bold text-white leading-tight underline decoration-blue-500/30">AI Throttle Core Upgraded</h3>
              <p className="text-xs text-gray-500 mt-1 italic">Owen implemented neural pulse monitoring systems.</p>
            </div>
            {/* ...其餘靜態項目暫省... */}
          </div>
        </section>

        {/* 中間：Core Command & Search (動能偵測條放在這裡) */}
        <section className="col-span-12 lg:col-span-6 flex flex-col items-center justify-center py-10 relative">
          
          <div className="text-center relative z-10 w-full">
            <h2 className="text-xs font-black text-blue-500/50 uppercase tracking-[0.5em] mb-6">Strategic Authority</h2>
            <div className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 leading-none animate-in fade-in slide-in-from-bottom-4 duration-1000">
              {SLOGAN}
            </div>

            {/* 🚀 AI 動能偵測條 (AI Pulse Core) */}
            <div className="w-full max-w-lg mx-auto mb-16 space-y-3">
                <div className="flex justify-between items-end px-1">
                    <div className="flex items-center gap-2">
                        <CpuIcon size={12} className="text-blue-400 animate-spin-slow" />
                        <span className="text-[9px] font-black tracking-[0.2em] text-blue-400 uppercase">Neural Processing Power</span>
                    </div>
                    <span className="text-[10px] font-bold text-white tabular-nums">{Math.round(coreLoad)}% <span className="text-blue-500/50 font-normal">PWR</span></span>
                </div>
                {/* 能量背景槽 */}
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-300 rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        style={{ width: `${coreLoad}%` }}
                    />
                </div>
                {/* 分段顯示器 (小格子) */}
                <div className="flex justify-between gap-[2px]">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-1 flex-1 rounded-[1px] transition-colors duration-500 ${i/40 * 100 < coreLoad ? 'bg-blue-500/40' : 'bg-white/5'}`} 
                        />
                    ))}
                </div>
            </div>
            
            {/* 全域搜尋框 */}
            <div className="relative group max-w-2xl w-full mx-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="PROBE SYSTEM ARTIFACTS..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-10 text-white font-bold tracking-widest focus:outline-none focus:border-white/20 transition-all shadow-[0_0_50px_rgba(0,0,0,0.5)]"
              />
            </div>

            {/* 子系統模組 */}
            <div className="grid grid-cols-3 gap-4 mt-16">
              {[
                { name: 'Kanban', icon: <BarChart3 size={18}/>, color: 'blue' },
                { name: 'Second Brain', icon: <Dna size={18}/>, color: 'purple' },
                { name: 'OpenClaw', icon: <Terminal size={18}/>, color: 'green' }
              ].map(sys => (
                <div key={sys.name} className="bg-white/5 border border-white/5 p-5 rounded-[2rem] hover:bg-white/10 transition-all cursor-pointer group text-center relative overflow-hidden backdrop-blur-md">
                  <div className={`mx-auto p-3 bg-${sys.color}-500/10 rounded-2xl w-fit mb-3 text-${sys.color}-500 transform group-hover:scale-110 transition-transform`}>{sys.icon}</div>
                  <h4 className="text-xs font-black text-white tracking-widest uppercase">{sys.name}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 右側：Calendar & Ops (作戰行事曆) */}
        <section className="col-span-3 space-y-6 border-l border-white/5 pl-8 lg:block hidden">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <Calendar size={14} className="text-blue-500" /> Ops Schedule
          </h2>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-500/5 to-transparent border-l-2 border-blue-500 p-4 rounded-r-xl">
              <span className="text-[9px] font-black text-blue-400 tracking-tighter uppercase">09:00 AM - DAEMON</span>
              <h4 className="text-xs font-bold text-white uppercase mt-1">Intelligence Sweep</h4>
            </div>
          </div>
        </section>

      </main>

      {/* 底部腳註 */}
      <footer className="fixed bottom-6 left-6 right-6 flex justify-between items-center text-[10px] font-bold text-gray-600 tracking-[0.2em] uppercase">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-blue-500/50"><MoveUpRight size={12}/> Link Established</span>
        </div>
        <div>OWEN V3.0 // OPERATIONAL STATUS: NOMINAL</div>
      </footer>
    </div>
  );
}
