'use client';
import React, { useState } from 'react';

const S = {
  page: { height: '100%', overflowY: 'auto' as const, padding: '20px 24px', background: '#010208', display: 'flex', flexDirection: 'column' as const, gap: 16 } as React.CSSProperties,
  panel: { background: '#0d1c30', border: '1px solid rgba(0,245,255,0.13)', padding: '18px 20px' } as React.CSSProperties,
  label: { fontFamily: 'Share Tech Mono, monospace', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase' as const, color: '#1a3045', display: 'block', marginBottom: 10 } as React.CSSProperties,
};

const PINNED = [
  { sym: 'NVDA', name: 'NVIDIA', price: '$739.42', delta: '+2.1%', color: '#00f5ff', up: true,  path: 'M10,60 L30,45 L50,50 L70,30 L90,20' },
  { sym: 'TSLA', name: 'Tesla, Inc', price: '$188.45', delta: '-1.6%', color: '#ff006e', up: false, path: 'M10,20 L30,35 L50,30 L70,55 L90,60' },
];

const WATCHLIST = [
  { sym: 'AAPL', price: '$182.63', delta: '+0.4%', up: true },
  { sym: 'META', price: '$485.90', delta: '+1.2%', up: true },
  { sym: 'MSFT', price: '$412.11', delta: '-0.3%', up: false },
  { sym: 'AMZN', price: '$178.25', delta: '+0.7%', up: true },
  { sym: 'GOOGL', price: '$141.80', delta: '+0.9%', up: true },
  { sym: 'BTC',  price: '$67,420', delta: '+2.3%', up: true },
];

export default function StocksPage() {
  const [query, setQuery] = useState('');

  return (
    <div style={S.page}>

      {/* Header */}
      <div className="fiu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: 20, letterSpacing: 4, textTransform: 'uppercase', color: '#e4f4ff' }}>美股戰情觀測台</div>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#1a3045', marginTop: 4 }}>MARKET SECTOR // US EQUITIES</div>
        </div>
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="股票代號..."
          style={{ background: '#050e1a', border: '1px solid rgba(0,245,255,0.15)', padding: '6px 14px', fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: '#e4f4ff', caretColor: '#00f5ff', outline: 'none', width: 160 }}/>
      </div>

      {/* Pinned cards */}
      <div className="fiu1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flexShrink: 0 }}>
        {PINNED.map(s => (
          <div key={s.sym} style={{ ...S.panel, borderLeft: `2px solid ${s.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: '#1a3045', marginBottom: 4 }}>主力標的 ★</div>
                <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: 28, color: '#e4f4ff', lineHeight: 1 }}>{s.sym}</div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: '#3a6070', marginTop: 3 }}>{s.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: 22, color: s.color, textShadow: `0 0 16px ${s.color}55` }}>{s.price}</div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: s.up ? '#00ff88' : '#ff006e', marginTop: 2 }}>{s.delta}</div>
              </div>
            </div>
            <svg viewBox="0 0 100 70" width="100%" height={50} style={{ display: 'block' }}>
              <defs><linearGradient id={`g${s.sym}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={s.color} stopOpacity="0.3"/><stop offset="100%" stopColor={s.color} stopOpacity="0"/></linearGradient></defs>
              <path d={s.path + ` L90,70 L10,70 Z`} fill={`url(#g${s.sym})`}/>
              <path d={s.path} fill="none" stroke={s.color} strokeWidth="1.5" style={{filter:`drop-shadow(0 0 4px ${s.color})`}}/>
            </svg>
          </div>
        ))}
      </div>

      {/* Watchlist */}
      <div className="fiu2" style={{ ...S.panel, flex: 1 }}>
        <span style={S.label}>◈ 觀察名單</span>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0,245,255,0.07)' }}>
              {['代號', '最新價格', '今日漲跌', '趨勢'].map(h => (
                <th key={h} style={{ padding: '6px 12px', textAlign: 'left', fontFamily: 'Share Tech Mono, monospace', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: '#1a3045', fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WATCHLIST.map(s => (
              <tr key={s.sym} style={{ borderBottom: '1px solid rgba(0,245,255,0.04)', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,245,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '10px 12px', fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: 14, color: '#e4f4ff' }}>{s.sym}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: 14, color: s.up ? '#00f5ff' : '#ff006e', textShadow: `0 0 10px ${s.up ? 'rgba(0,245,255,0.4)' : 'rgba(255,0,110,0.4)'}` }}>{s.price}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'Share Tech Mono, monospace', fontSize: 11, color: s.up ? '#00ff88' : '#ff006e' }}>{s.delta}</td>
                <td style={{ padding: '10px 12px' }}>
                  <svg viewBox="0 0 40 16" width={40} height={16}>
                    <path d={s.up ? 'M2,14 L12,8 L22,10 L32,4 L38,2' : 'M2,2 L12,6 L22,8 L32,12 L38,14'}
                      fill="none" stroke={s.up ? '#00ff88' : '#ff006e'} strokeWidth="1.5"
                      style={{filter:`drop-shadow(0 0 3px ${s.up ? '#00ff88' : '#ff006e'})`}}/>
                  </svg>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
