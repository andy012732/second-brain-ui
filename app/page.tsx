'use client';

import React, { useEffect } from 'react';
import { Activity, Loader2, Wallet } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
});

export default function MissionControl() {
  const DAILY_GOAL = 80000;

  const { data: activities = [], isLoading: actLoading } =
    useSWR('/api/activity', fetcher, { refreshInterval: 10000 });
  const { data: revenue = [], isLoading: revLoading } =
    useSWR('/api/notion/revenue', fetcher, { refreshInterval: 300000 });

  const todayStr      = new Date().toISOString().split('T')[0];
  const revToday      = Array.isArray(revenue) ? revenue.filter((r: any) => r.date === todayStr) : [];
  const hsinfengTotal = revToday.filter((r:any)=>r.store==='新豐').reduce((s:number,r:any)=>s+r.total,0);
  const zhubeiTotal   = revToday.filter((r:any)=>r.store==='竹北').reduce((s:number,r:any)=>s+r.total,0);
  const websiteTotal  = revToday.filter((r:any)=>r.store==='官網').reduce((s:number,r:any)=>s+r.total,0);
  const grandTotal    = hsinfengTotal + zhubeiTotal + websiteTotal;
  const hfPct         = Math.min((hsinfengTotal / DAILY_GOAL) * 100, 100);
  const zbPct         = Math.min((zhubeiTotal   / DAILY_GOAL) * 100, 100);
  const webPct        = Math.min((websiteTotal  / DAILY_GOAL) * 100, 100);
  const overallPct    = Math.min(Math.round((grandTotal / DAILY_GOAL) * 100), 100);

  const stores = [
    { name:'新豐', total:hsinfengTotal, pct:hfPct,  color:'#00f5ff' },
    { name:'竹北', total:zhubeiTotal,   pct:zbPct,  color:'#ff006e' },
    { name:'官網', total:websiteTotal,  pct:webPct, color:'#00ff88' },
  ];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden" style={{ background:'#020409', position:'relative', zIndex:1 }}>

      {/* Ticker */}
      <div className="shrink-0 overflow-hidden flex items-center" style={{ height:24, background:'#060d1a', borderBottom:'1px solid rgba(0,245,255,0.08)' }}>
        <div className="ticker-animate flex gap-8 whitespace-nowrap" style={{ paddingLeft:'100%' }}>
          {['◆ 新豐 TODAY','◆ 竹北 TODAY','◆ 官網 TODAY','▲ NVDA +3.4%','▲ BTC +2.1%','◈ 目標進度 0%',
            '◆ 新豐 TODAY','◆ 竹北 TODAY','◆ 官網 TODAY','▲ NVDA +3.4%','▲ BTC +2.1%','◈ 目標進度 0%'
          ].map((t,i)=>(
            <span key={i} style={{ fontFamily:'Share Tech Mono,monospace', fontSize:9, letterSpacing:2, color: t.includes('▲')?'#00ff88':'#2a6080' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Main 3-column grid */}
      <div className="flex-1 flex flex-col md:grid md:grid-cols-12 overflow-hidden">

        {/* LEFT: 情資流 */}
        <section className="md:col-span-3 flex flex-col p-4 overflow-hidden" style={{ borderRight:'1px solid rgba(0,245,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <Activity size={10} style={{ color:'#00f5ff' }}/>
            <span style={{ fontFamily:'Share Tech Mono,monospace', fontSize:9, letterSpacing:3, color:'#2a6080', textTransform:'uppercase' }}>即時情資流</span>
            {actLoading && <Loader2 size={9} className="animate-spin ml-auto" style={{ color:'#00f5ff' }}/>}
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
            {(activities as any[]).map((act:any) => (
              <div key={act.id} className="pl-3 py-1" style={{ borderLeft:'1px solid rgba(0,245,255,0.2)' }}>
                <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:8, color:'rgba(0,245,255,0.4)', display:'block', marginBottom:2 }}>
                  {act.created_at ? new Date(act.created_at).toLocaleTimeString('zh-TW',{hour12:false}) : 'RECENT'}
                </div>
                <div className="font-bold text-xs leading-snug" style={{ color:'#e0f4ff' }}>{act.title}</div>
                <div className="mt-0.5 line-clamp-2" style={{ fontFamily:'Share Tech Mono,monospace', fontSize:9, color:'#3a6a8a' }}>{act.description}</div>
              </div>
            ))}
            {!actLoading && (activities as any[]).length===0 && (
              <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:9, color:'#1a3a50', textAlign:'center', marginTop:32 }}>// NO ACTIVITY DATA</div>
            )}
          </div>
        </section>

        {/* CENTER: 核心數據 */}
        <section className="md:col-span-6 flex flex-col items-center justify-center p-6">

          {/* Revenue panel */}
          <div className="w-full max-w-lg mb-6" style={{ background:'#0d1f3c', border:'1px solid rgba(0,245,255,0.15)', padding:'20px 24px', position:'relative' }}>
            {/* Corner deco */}
            {[{top:0,left:0,borderWidth:'2px 0 0 2px'},{top:0,right:0,borderWidth:'2px 2px 0 0'},{bottom:0,left:0,borderWidth:'0 0 2px 2px'},{bottom:0,right:0,borderWidth:'0 2px 2px 0'}].map((s,i)=>(
              <span key={i} style={{ position:'absolute', width:10, height:10, borderColor:'#00f5ff', borderStyle:'solid', opacity:.5, ...s }}/>
            ))}
            <div className="flex justify-between items-end mb-3">
              <div>
                <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:9, color:'rgba(0,245,255,0.55)', letterSpacing:4, textTransform:'uppercase', marginBottom:4 }}>德谷拉騎士 // 營收監測</div>
                <div style={{ fontFamily:'Orbitron,monospace', fontSize:28, fontWeight:900, color:'#00f5ff', textShadow:'0 0 20px rgba(0,245,255,0.4)', lineHeight:1 }}>
                  ${grandTotal.toLocaleString()}
                </div>
                <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:10, color:'#2a6080', marginTop:3 }}>/ ${DAILY_GOAL.toLocaleString()} 日目標</div>
              </div>
              <div style={{ fontFamily:'Orbitron,monospace', fontSize:40, fontWeight:900, color: overallPct>=100?'#00ff88':overallPct>50?'#00f5ff':'#2a6080', lineHeight:1 }}>
                {overallPct}%
              </div>
            </div>
            {/* 三色能量槽 */}
            <div style={{ height:6, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(0,245,255,0.08)', display:'flex', overflow:'hidden', marginBottom:6 }}>
              <div style={{ width:`${hfPct}%`, background:'#00f5ff', boxShadow:'0 0 10px rgba(0,245,255,0.7)', transition:'width 1s ease' }}/>
              <div style={{ width:`${zbPct}%`, background:'#ff006e', boxShadow:'0 0 10px rgba(255,0,110,0.7)', transition:'width 1s ease' }}/>
              <div style={{ width:`${webPct}%`, background:'#00ff88', boxShadow:'0 0 10px rgba(0,255,136,0.7)', transition:'width 1s ease' }}/>
            </div>
            <div className="flex justify-between">
              {['$0','$20K','$40K','$60K','$80K'].map(l=>(
                <span key={l} style={{ fontFamily:'Share Tech Mono,monospace', fontSize:8, color:'#1a3a50' }}>{l}</span>
              ))}
            </div>
          </div>

          {/* Store KPI cards */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
            {stores.map(s=>(
              <div key={s.name} style={{ background:'#0a1628', border:'1px solid rgba(0,245,255,0.08)', borderLeft:`3px solid ${s.color}`, padding:'12px 14px' }}>
                <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:8, color:'#2a6080', letterSpacing:2, textTransform:'uppercase', marginBottom:4 }}>{s.name}門市</div>
                <div style={{ fontFamily:'Orbitron,monospace', fontSize:18, fontWeight:700, color:s.color, textShadow:`0 0 12px ${s.color}80` }}>
                  ${s.total.toLocaleString()}
                </div>
                <div style={{ marginTop:6, height:2, background:'rgba(255,255,255,0.05)' }}>
                  <div style={{ width:`${s.pct}%`, height:'100%', background:s.color, transition:'width 1s ease' }}/>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT: 門市分項業績 */}
        <section className="md:col-span-3 flex flex-col p-4 overflow-hidden" style={{ borderLeft:'1px solid rgba(0,245,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <Wallet size={10} style={{ color:'#00ff88' }}/>
            <span style={{ fontFamily:'Share Tech Mono,monospace', fontSize:9, letterSpacing:3, color:'#2a6080', textTransform:'uppercase' }}>門市分項業績</span>
            {revLoading && <Loader2 size={9} className="animate-spin ml-auto" style={{ color:'#00ff88' }}/>}
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            {Array.isArray(revenue) && (revenue as any[]).slice(0,10).map((rev:any)=>(
              <div key={rev.id} className="flex justify-between items-center" style={{ background:'rgba(13,31,60,0.7)', border:'1px solid rgba(0,245,255,0.07)', padding:'8px 10px' }}>
                <div>
                  <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:7, color:'#1a3a50', display:'block', marginBottom:1 }}>{rev.date}</div>
                  <div className="font-bold text-xs" style={{ color:'#c8e6f5' }}>{rev.store}</div>
                </div>
                <div style={{ fontFamily:'Orbitron,monospace', fontSize:12, fontWeight:700, color:'#00ff88', textShadow:'0 0 8px rgba(0,255,136,0.4)' }}>
                  ${rev.total.toLocaleString()}
                </div>
              </div>
            ))}
            {!revLoading && Array.isArray(revenue) && (revenue as any[]).length===0 && (
              <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:9, color:'#1a3a50', textAlign:'center', marginTop:32 }}>// AWAITING NOTION SYNC</div>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="shrink-0 flex justify-between items-center px-6" style={{ height:24, borderTop:'1px solid rgba(0,245,255,0.07)', background:'#060d1a' }}>
        <span style={{ fontFamily:'Share Tech Mono,monospace', fontSize:8, color:'#1a3a50', letterSpacing:3 }}>DRACULA COMMAND EST. 2026 // ADAPTIVE MODE</span>
        <span style={{ fontFamily:'Share Tech Mono,monospace', fontSize:8, color:'rgba(0,245,255,0.2)', letterSpacing:2 }}>MOBILE_STATION_ACTIVE</span>
      </div>
    </div>
  );
}
