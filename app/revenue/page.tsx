'use client';

import React from 'react';
import { Store, Globe, RefreshCcw, BarChart3, Loader2, PieChart } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());
const mono = { fontFamily: "'Share Tech Mono', monospace" } as const;
const orb  = { fontFamily: "'Orbitron', monospace" }        as const;

export default function RevenueManager() {
  const { data: revenue = [], isLoading, mutate } =
    useSWR('/api/notion/revenue', fetcher, { refreshInterval: 60000 });

  const todayStr     = new Date().toISOString().split('T')[0];
  const revToday     = Array.isArray(revenue) ? revenue.filter((r: any) => r.date === todayStr) : [];
  const hsinfengTotal = revToday.filter((r:any)=>r.store==='新豐').reduce((s:number,r:any)=>s+r.total,0);
  const zhubeiTotal   = revToday.filter((r:any)=>r.store==='竹北').reduce((s:number,r:any)=>s+r.total,0);
  const websiteTotal  = revToday.filter((r:any)=>r.store==='官網').reduce((s:number,r:any)=>s+r.total,0);
  const grandTotal    = hsinfengTotal + zhubeiTotal + websiteTotal;

  const sectors = [
    { name:'新豐門市', id:'hf',  total:hsinfengTotal, color:'#00f5ff', icon:<Store size={18}/> },
    { name:'竹北門市', id:'zb',  total:zhubeiTotal,   color:'#ff006e', icon:<Store size={18}/> },
    { name:'官網業績', id:'web', total:websiteTotal,  color:'#00ff88', icon:<Globe size={18}/> },
  ];

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div style={{ ...mono, fontSize:9, letterSpacing:3, color:'#2a6080',
      textTransform:'uppercase', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
      {children}
    </div>
  );

  return (
    <div className="h-full w-full overflow-y-auto p-4 md:p-8 flex flex-col gap-6"
      style={{ background:'#020409', color:'#c8e6f5', position:'relative', zIndex:1 }}>

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-end">
        <div>
          <div style={{ ...orb, fontSize:20, fontWeight:900, color:'#e0f4ff', letterSpacing:2 }}>
            業績指揮部
          </div>
          <div className="flex items-center gap-2 mt-1">
            {isLoading
              ? <Loader2 size={9} className="animate-spin" style={{ color:'#00f5ff' }}/>
              : <span className="pulse-dot"/>}
            <span style={{ ...mono, fontSize:9, color:'#2a6080', letterSpacing:2 }}>
              NOTION 資料流連接中
            </span>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ ...mono, fontSize:9, color:'rgba(0,245,255,0.5)', letterSpacing:3, marginBottom:4 }}>
            今日全軍營收
          </div>
          <div style={{ ...orb, fontSize:36, fontWeight:900, color:'#00f5ff',
            textShadow:'0 0 20px rgba(0,245,255,0.4)', lineHeight:1 }}>
            ${grandTotal.toLocaleString()}
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sectors.map(s => (
          <div key={s.id} style={{
            background:'#0d1f3c', border:'1px solid rgba(0,245,255,0.1)',
            borderLeft:`3px solid ${s.color}`, padding:'20px 24px', position:'relative',
          }}>
            <div className="flex justify-between items-start mb-4">
              <div style={{ color:s.color, opacity:0.8 }}>{s.icon}</div>
              {isLoading && <Loader2 size={12} className="animate-spin" style={{ color:'#1a3a50' }}/>}
            </div>
            <div style={{ ...mono, fontSize:9, color:'#2a6080', letterSpacing:2,
              textTransform:'uppercase', marginBottom:4 }}>{s.name}</div>
            <div style={{ ...orb, fontSize:28, fontWeight:700, color:s.color,
              textShadow:`0 0 16px ${s.color}60`, lineHeight:1 }}>
              ${s.total.toLocaleString()}
            </div>
            <div style={{ marginTop:12, height:3, background:'rgba(255,255,255,0.04)' }}>
              <div style={{
                width:`${grandTotal>0 ? Math.min((s.total/grandTotal)*100,100) : 0}%`,
                height:'100%', background:s.color,
                boxShadow:`0 0 8px ${s.color}`, transition:'width 1s ease',
              }}/>
            </div>
          </div>
        ))}
      </div>

      {/* ── BOTTOM GRID ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">

        {/* Pie chart side */}
        <section className="md:col-span-4"
          style={{ background:'#0a1628', border:'1px solid rgba(0,245,255,0.1)', padding:'20px 24px' }}>
          <SectionLabel><PieChart size={11} style={{ color:'#00f5ff' }}/> 戰區貢獻度</SectionLabel>
          <div className="space-y-4">
            {sectors.map(s => (
              <div key={s.id}>
                <div className="flex justify-between mb-1">
                  <span style={{ ...mono, fontSize:10, color:'#3a6a8a' }}>{s.name}</span>
                  <span style={{ ...mono, fontSize:10, color:'#e0f4ff', fontWeight:700 }}>
                    {grandTotal>0 ? Math.round((s.total/grandTotal)*100) : 0}%
                  </span>
                </div>
                <div style={{ height:4, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(0,245,255,0.06)' }}>
                  <div style={{
                    width:`${grandTotal>0?(s.total/grandTotal)*100:0}%`,
                    height:'100%', background:s.color,
                    boxShadow:`0 0 6px ${s.color}`, transition:'width 1s ease',
                  }}/>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Revenue log table */}
        <section className="md:col-span-8"
          style={{ background:'#0a1628', border:'1px solid rgba(0,245,255,0.1)', display:'flex', flexDirection:'column' }}>
          <div className="flex items-center justify-between p-4"
            style={{ borderBottom:'1px solid rgba(0,245,255,0.08)' }}>
            <SectionLabel><BarChart3 size={11} style={{ color:'#00f5ff' }}/> 真實營收日誌</SectionLabel>
            <button
              onClick={() => mutate()}
              className="flex items-center gap-2 transition-colors hover:opacity-80"
              style={{ ...mono, fontSize:9, color:'#00f5ff', letterSpacing:1 }}
            >
              <RefreshCcw size={11}/> 立即同步
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(0,245,255,0.08)' }}>
                  {['時間','戰區','當日累計','狀態'].map(h => (
                    <th key={h} className="px-4 py-3"
                      style={{ ...mono, fontSize:8, letterSpacing:2, color:'#1a3a50', textTransform:'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {revToday.length > 0 ? revToday.map((row: any, i: number) => (
                  <tr key={i}
                    className="group transition-all"
                    style={{ borderBottom:'1px solid rgba(0,245,255,0.04)' }}
                  >
                    <td className="px-4 py-3" style={{ ...mono, fontSize:10, color:'#2a6080' }}>{row.date}</td>
                    <td className="px-4 py-3 font-bold text-xs" style={{ color:'#e0f4ff' }}>{row.store}</td>
                    <td className="px-4 py-3 text-right font-bold text-xs tabular-nums"
                      style={{ ...orb, color:'#00ff88', textShadow:'0 0 8px rgba(0,255,136,0.4)' }}>
                      ${row.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span style={{ ...mono, fontSize:8, padding:'2px 8px',
                        background:'rgba(0,255,136,0.08)', color:'#00ff88',
                        border:'1px solid rgba(0,255,136,0.25)', letterSpacing:1 }}>
                        LIVE
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center"
                      style={{ ...mono, fontSize:9, color:'#1a3a50', letterSpacing:3 }}>
                      // 今日暫無門市數據，監控中...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
