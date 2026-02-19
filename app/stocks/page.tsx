'use client';

import React, { useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Star, Activity, Search } from 'lucide-react';

const mono = { fontFamily: "'Share Tech Mono', monospace" } as const;
const orb  = { fontFamily: "'Orbitron', monospace" }        as const;

export default function StocksDashboard() {
  const [watchlist] = useState([
    { symbol:'NVDA', name:'NVIDIA',          price:739.42,  change:+15.2, percent:'+2.1%', up:true,  pinned:true  },
    { symbol:'TSLA', name:'Tesla, Inc.',      price:188.45,  change:-3.1,  percent:'-1.6%', up:false, pinned:true  },
    { symbol:'AAPL', name:'Apple Inc.',       price:182.31,  change:+0.45, percent:'+0.2%', up:true,  pinned:false },
    { symbol:'META', name:'Meta Platforms',   price:502.80,  change:+3.1,  percent:'+0.6%', up:true,  pinned:false },
    { symbol:'MSFT', name:'Microsoft',        price:415.60,  change:+3.7,  percent:'+0.9%', up:true,  pinned:false },
    { symbol:'BTC',  name:'Bitcoin / USD',    price:67400,   change:1400,  percent:'+2.1%', up:true,  pinned:false },
  ]);

  const miniPath = (up: boolean) => up
    ? "M0,35 C20,30 40,25 60,22 C80,18 100,12 120,8"
    : "M0,10 C20,14 40,18 60,20 C80,24 100,28 120,32";

  return (
    <div className="h-full w-full overflow-y-auto p-4 md:p-8 flex flex-col gap-6"
      style={{ background:'#020409', color:'#c8e6f5', position:'relative', zIndex:1 }}>

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <div style={{ ...orb, fontSize:20, fontWeight:900, color:'#e0f4ff', letterSpacing:2 }}>
            美股戰情觀測台
          </div>
          <div style={{ ...mono, fontSize:9, color:'#2a6080', letterSpacing:3, marginTop:4 }}>
            MARKET SECTOR // US EQUITIES
          </div>
        </div>
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          background:'#0a1628', border:'1px solid rgba(0,245,255,0.1)',
          padding:'8px 14px',
        }}>
          <Search size={12} style={{ color:'#2a6080' }}/>
          <input
            type="text" placeholder="股票代號..."
            style={{ background:'transparent', border:'none', outline:'none',
              color:'#c8e6f5', ...mono, fontSize:11, width:120 }}
          />
        </div>
      </div>

      {/* Pinned cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {watchlist.filter(s => s.pinned).map(stock => (
          <div key={stock.symbol}
            style={{
              background:'#0d1f3c',
              border:`1px solid ${stock.up ? 'rgba(0,255,136,0.15)' : 'rgba(255,0,110,0.15)'}`,
              borderLeft:`3px solid ${stock.up ? '#00ff88' : '#ff006e'}`,
              padding:'24px 28px', position:'relative', overflow:'hidden',
            }}
          >
            {/* bg icon */}
            <div style={{ position:'absolute', top:16, right:16, opacity:0.04 }}>
              <TrendingUp size={80} style={{ color: stock.up ? '#00ff88':'#ff006e' }}/>
            </div>

            <div className="flex justify-between items-start relative z-10 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ ...mono, fontSize:9, color:'#2a6080', letterSpacing:2 }}>主力標的</span>
                  <Star size={10} style={{ color:'#ffe600', fill:'#ffe600' }}/>
                </div>
                <div style={{ ...orb, fontSize:32, fontWeight:900, color:'#e0f4ff', lineHeight:1 }}>
                  {stock.symbol}
                </div>
                <div style={{ ...mono, fontSize:9, color:'#2a6080', marginTop:2 }}>{stock.name}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ ...orb, fontSize:26, fontWeight:700,
                  color: stock.up ? '#00ff88':'#ff006e',
                  textShadow:`0 0 14px ${stock.up?'rgba(0,255,136,0.5)':'rgba(255,0,110,0.5)'}` }}>
                  ${stock.price.toLocaleString()}
                </div>
                <div className="flex items-center justify-end gap-1 mt-1"
                  style={{ ...mono, fontSize:10, color: stock.up?'#00ff88':'#ff006e' }}>
                  {stock.percent}
                  {stock.up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                </div>
              </div>
            </div>

            {/* Mini chart */}
            <svg viewBox="0 0 120 40" style={{ width:'100%', height:40, opacity:0.4 }}>
              <path d={miniPath(stock.up)}
                stroke={stock.up ? '#00ff88':'#ff006e'}
                strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
        ))}
      </div>

      {/* Watchlist table */}
      <div style={{ background:'#0a1628', border:'1px solid rgba(0,245,255,0.1)' }}>
        <div style={{ padding:'12px 20px', borderBottom:'1px solid rgba(0,245,255,0.08)',
          ...mono, fontSize:9, color:'#2a6080', letterSpacing:3,
          display:'flex', alignItems:'center', gap:6 }}>
          <Activity size={11} style={{ color:'#00f5ff' }}/> 觀察矩陣
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(0,245,255,0.06)' }}>
              {['代號','名稱','價格','漲跌幅','走勢'].map(h => (
                <th key={h} className="px-4 py-3"
                  style={{ ...mono, fontSize:8, letterSpacing:2, color:'#1a3a50', textTransform:'uppercase' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {watchlist.map(s => (
              <tr key={s.symbol}
                className="group transition-all"
                style={{ borderBottom:'1px solid rgba(0,245,255,0.04)' }}
              >
                <td className="px-4 py-3">
                  <div style={{ ...orb, fontSize:13, fontWeight:700, color:'#e0f4ff' }}>{s.symbol}</div>
                </td>
                <td className="px-4 py-3">
                  <div style={{ ...mono, fontSize:9, color:'#3a6a8a' }}>{s.name}</div>
                </td>
                <td className="px-4 py-3 tabular-nums">
                  <div style={{ ...orb, fontSize:13, color:'#c8e6f5' }}>${s.price.toLocaleString()}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1"
                    style={{ ...mono, fontSize:10, fontWeight:700,
                      color: s.up ? '#00ff88':'#ff006e' }}>
                    {s.percent}
                    {s.up ? <ArrowUpRight size={11}/> : <ArrowDownRight size={11}/>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <svg viewBox="0 0 60 20" style={{ width:60, height:20 }}>
                    <path d={s.up
                      ? "M0,18 C10,15 20,12 30,10 C40,8 50,5 60,3"
                      : "M0,3 C10,6 20,10 30,12 C40,14 50,16 60,18"}
                      stroke={s.up?'#00ff88':'#ff006e'}
                      strokeWidth="1.5" fill="none" opacity="0.7"/>
                  </svg>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ ...mono, fontSize:8, color:'#1a3a50', textAlign:'center', letterSpacing:3 }}>
        TICKER SERVER v1.0 // NASDAQ/NYSE // ALERT SYSTEM: ARMED
      </div>
    </div>
  );
}
