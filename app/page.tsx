'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Loader2, Wallet } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
});

// ── Cyber typography helpers ──────────────────────────────────────────────────
const mono = { fontFamily: "'Share Tech Mono', monospace" } as const;
const orb  = { fontFamily: "'Orbitron', monospace" }        as const;

export default function MissionControl() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const DAILY_GOAL = 80000;

  const { data: activities = [], isLoading: actLoading } =
    useSWR('/api/activity', fetcher, { refreshInterval: 10000 });
  const { data: revenue = [], isLoading: revLoading } =
    useSWR('/api/notion/revenue', fetcher, { refreshInterval: 300000 });

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Original revenue logic (unchanged) ────────────────────────────────────
  const todayStr   = new Date().toISOString().split('T')[0];
  const revToday   = Array.isArray(revenue) ? revenue.filter((r: any) => r.date === todayStr) : [];
  const hsinfengTotal  = revToday.filter((r:any) => r.store === '新豐').reduce((s:number,r:any) => s+r.total, 0);
  const zhubeiTotal    = revToday.filter((r:any) => r.store === '竹北').reduce((s:number,r:any) => s+r.total, 0);
  const websiteTotal   = revToday.filter((r:any) => r.store === '官網').reduce((s:number,r:any) => s+r.total, 0);
  const grandTotal     = hsinfengTotal + zhubeiTotal + websiteTotal;
  const hfPercent      = Math.min((hsinfengTotal / DAILY_GOAL) * 100, 100);
  const zbPercent      = Math.min((zhubeiTotal   / DAILY_GOAL) * 100, 100);
  const webPercent     = Math.min((websiteTotal  / DAILY_GOAL) * 100, 100);
  const overallPercent = Math.min(Math.round((grandTotal / DAILY_GOAL) * 100), 100);

  const stores = [
    { name: '新豐門市', total: hsinfengTotal, pct: hfPercent, color: '#00f5ff' },
    { name: '竹北門市', total: zhubeiTotal,   pct: zbPercent, color: '#ff006e' },
    { name: '官網業績', total: websiteTotal,  pct: webPercent,color: '#00ff88' },
  ];

  return (
    <div
      className="h-full w-full flex flex-col overflow-y-auto md:overflow-hidden"
      style={{ background:'#020409', color:'#c8e6f5', position:'relative', zIndex:1 }}
    >
      {/* ── TICKER TAPE ──────────────────────────────────────────────────── */}
      <div style={{
        height:28, overflow:'hidden', flexShrink:0,
        borderBottom:'1px solid rgba(0,245,255,0.1)',
        background:'#060d1a', display:'flex', alignItems:'center',
      }}>
        <div className="ticker-animate flex gap-10 whitespace-nowrap pl-full" style={{ paddingLeft:'100%' }}>
          {['新豐 TODAY','竹北 TODAY','官網 TODAY','NVDA +3.4%','BTC +2.1%','目標進度 0%',
            '新豐 TODAY','竹北 TODAY','官網 TODAY','NVDA +3.4%','BTC +2.1%','目標進度 0%'
          ].map((t,i) => (
            <span key={i} style={{ ...mono, fontSize:10, letterSpacing:2,
              color: t.includes('+') ? '#00ff88' : '#2a6080' }}>
              {t.includes('+') ? '▲' : '◆'} {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── MAIN GRID ────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-0 overflow-visible md:overflow-hidden">

        {/* ── LEFT: 情資流 ─────────────────────────────────────────────── */}
        <section className="order-2 md:order-none md:col-span-3 flex flex-col overflow-hidden p-4 md:p-6"
          style={{ borderRight:'1px solid rgba(0,245,255,0.08)' }}>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={11} style={{ color:'#00f5ff' }} />
              <span style={{ ...mono, fontSize:9, letterSpacing:3, color:'#2a6080', textTransform:'uppercase' }}>
                即時情資流
              </span>
            </div>
            {actLoading && <Loader2 size={9} className="animate-spin" style={{ color:'#00f5ff' }} />}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 max-h-[260px] md:max-h-full">
            {(activities as any[]).map((act: any) => (
              <div key={act.id}
                className="relative pl-4 py-2"
                style={{ borderLeft:'1px solid rgba(0,245,255,0.2)' }}
              >
                <div className="absolute -left-[4px] top-2 w-2 h-2 rounded-full"
                  style={{ background:'#00f5ff', boxShadow:'0 0 8px #00f5ff' }} />
                <span style={{ ...mono, fontSize:8, color:'rgba(0,245,255,0.4)', display:'block', marginBottom:2 }}>
                  {act.created_at
                    ? new Date(act.created_at).toLocaleTimeString('zh-TW',{hour12:false})
                    : 'RECENT'}
                </span>
                <h3 className="font-bold leading-snug text-xs" style={{ color:'#e0f4ff' }}>{act.title}</h3>
                <p className="mt-1 line-clamp-2" style={{ ...mono, fontSize:9, color:'#3a6a8a' }}>
                  {act.description}
                </p>
              </div>
            ))}
            {!actLoading && (activities as any[]).length === 0 && (
              <div style={{ ...mono, fontSize:9, color:'#1a3a50', textAlign:'center', marginTop:40 }}>
                // NO ACTIVITY DATA
              </div>
            )}
          </div>
        </section>

        {/* ── CENTER: 核心數據 ──────────────────────────────────────────── */}
        <section className="order-1 md:order-none md:col-span-6 flex flex-col items-center justify-center p-6 md:p-10">

          {/* Revenue block */}
          <div className="w-full max-w-xl mb-8 md:mb-12 fade-up"
            style={{
              background:'#0d1f3c',
              border:'1px solid rgba(0,245,255,0.15)',
              padding:'24px 28px',
              position:'relative',
            }}
          >
            {/* corner deco */}
            {[
              { top:0, left:0,  borderWidth:'2px 0 0 2px' },
              { top:0, right:0, borderWidth:'2px 2px 0 0' },
              { bottom:0, left:0,  borderWidth:'0 0 2px 2px' },
              { bottom:0, right:0, borderWidth:'0 2px 2px 0' },
            ].map((s,i) => (
              <span key={i} style={{
                position:'absolute', width:12, height:12,
                borderColor:'#00f5ff', borderStyle:'solid', opacity:.5, ...s
              }}/>
            ))}

            <div className="flex justify-between items-end mb-4">
              <div>
                <div style={{ ...mono, fontSize:9, color:'rgba(0,245,255,0.6)', letterSpacing:4, textTransform:'uppercase', marginBottom:6 }}>
                  德谷拉騎士 // 營收監測
                </div>
                <div style={{ ...orb, fontSize:32, fontWeight:900, color:'#00f5ff',
                  textShadow:'0 0 20px rgba(0,245,255,0.4)', lineHeight:1 }}>
                  ${grandTotal.toLocaleString()}
                </div>
                <div style={{ ...mono, fontSize:11, color:'#2a6080', marginTop:4 }}>
                  / ${DAILY_GOAL.toLocaleString()} 日目標
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ ...orb, fontSize:48, fontWeight:900,
                  color: overallPercent >= 100 ? '#00ff88' : overallPercent > 50 ? '#00f5ff' : '#2a6080',
                  lineHeight:1 }}>
                  {overallPercent}%
                </div>
              </div>
            </div>

            {/* 三色能量槽 (original logic) */}
            <div style={{
              height:8, background:'rgba(255,255,255,0.04)',
              border:'1px solid rgba(0,245,255,0.1)', display:'flex', overflow:'hidden',
            }}>
              <div style={{ width:`${hfPercent}%`, background:'#00f5ff',
                boxShadow:'0 0 12px rgba(0,245,255,0.6)', transition:'width 1s ease' }} />
              <div style={{ width:`${zbPercent}%`, background:'#ff006e',
                boxShadow:'0 0 12px rgba(255,0,110,0.6)', transition:'width 1s ease' }} />
              <div style={{ width:`${webPercent}%`, background:'#00ff88',
                boxShadow:'0 0 12px rgba(0,255,136,0.6)', transition:'width 1s ease' }} />
            </div>

            <div className="flex justify-between mt-2">
              {['$0','$20K','$40K','$60K','$80K'].map(l => (
                <span key={l} style={{ ...mono, fontSize:9, color:'#1a3a50' }}>{l}</span>
              ))}
            </div>
          </div>

          {/* Store KPI cards */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-xl mb-8">
            {stores.map((s) => (
              <div key={s.name}
                style={{
                  background:'#0a1628', border:'1px solid rgba(0,245,255,0.1)',
                  padding:'14px 16px', position:'relative', overflow:'hidden',
                  borderLeft:`3px solid ${s.color}`,
                }}
              >
                <div style={{ ...mono, fontSize:8, letterSpacing:2, color:'#2a6080',
                  textTransform:'uppercase', marginBottom:6 }}>{s.name}</div>
                <div style={{ ...orb, fontSize:20, fontWeight:700, color:s.color,
                  textShadow:`0 0 14px ${s.color}80` }}>
                  ${s.total.toLocaleString()}
                </div>
                {/* mini bar */}
                <div style={{ marginTop:8, height:2, background:'rgba(255,255,255,0.05)' }}>
                  <div style={{ width:`${s.pct}%`, height:'100%',
                    background:s.color, transition:'width 1s ease', boxShadow:`0 0 6px ${s.color}` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Footer badge */}
          <div style={{ ...mono, fontSize:9, letterSpacing:3, color:'#1a3a50',
            textTransform:'uppercase', textAlign:'center' }}>
            DRACULA COMMAND EST. 2026 // ADAPTIVE MODE
          </div>
        </section>

        {/* ── RIGHT: 門市分項業績 ───────────────────────────────────────── */}
        <section className="order-3 md:order-none md:col-span-3 flex flex-col overflow-hidden p-4 md:p-6"
          style={{ borderLeft:'1px solid rgba(0,245,255,0.08)' }}>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet size={11} style={{ color:'#00ff88' }} />
              <span style={{ ...mono, fontSize:9, letterSpacing:3, color:'#2a6080', textTransform:'uppercase' }}>
                門市分項業績
              </span>
            </div>
            {revLoading && <Loader2 size={9} className="animate-spin" style={{ color:'#00ff88' }} />}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 max-h-[260px] md:max-h-full">
            {Array.isArray(revenue) && (revenue as any[]).slice(0, 10).map((rev: any) => (
              <div key={rev.id}
                className="flex justify-between items-center group transition-all"
                style={{
                  background:'rgba(13,31,60,0.6)',
                  border:'1px solid rgba(0,245,255,0.07)',
                  padding:'10px 12px',
                }}
              >
                <div>
                  <span style={{ ...mono, fontSize:7, color:'#1a3a50', display:'block', marginBottom:2 }}>
                    {rev.date}
                  </span>
                  <span className="font-bold text-xs" style={{ color:'#c8e6f5' }}>{rev.store}</span>
                </div>
                <div style={{ ...orb, fontSize:13, fontWeight:700, color:'#00ff88',
                  textShadow:'0 0 10px rgba(0,255,136,0.4)' }}>
                  ${rev.total.toLocaleString()}
                </div>
              </div>
            ))}
            {!revLoading && Array.isArray(revenue) && (revenue as any[]).length === 0 && (
              <div style={{ ...mono, fontSize:9, color:'#1a3a50', textAlign:'center', marginTop:40 }}>
                // AWAITING NOTION SYNC
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
