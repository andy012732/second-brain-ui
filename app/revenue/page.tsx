'use client';
import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const S = {
  page: { height: '100%', overflowY: 'auto' as const, padding: '20px 24px', background: '#010208', display: 'flex', flexDirection: 'column' as const, gap: 16 } as React.CSSProperties,
  label: { fontFamily: 'Share Tech Mono, monospace', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase' as const, color: '#1a3045', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 } as React.CSSProperties,
  panel: { background: '#0d1c30', border: '1px solid rgba(0,245,255,0.13)', padding: '18px 20px', position: 'relative' as const } as React.CSSProperties,
};

export default function RevenuePage() {
  const { data: revenue = [], isLoading, mutate } = useSWR('/api/notion/revenue', fetcher, { refreshInterval: 60000 });
  const today = new Date().toISOString().split('T')[0];
  const td = Array.isArray(revenue) ? revenue.filter((r: any) => r.date === today) : [];
  const hf  = td.filter((r: any) => r.store === '新豐').reduce((s: number, r: any) => s + r.total, 0);
  const zb  = td.filter((r: any) => r.store === '竹北').reduce((s: number, r: any) => s + r.total, 0);
  const web = td.filter((r: any) => r.store === '官網').reduce((s: number, r: any) => s + r.total, 0);
  const grand = hf + zb + web;

  const sectors = [
    { name: '新豐門市', val: hf,  color: '#00f5ff', barPct: grand > 0 ? (hf  / grand) * 100 : 0 },
    { name: '竹北門市', val: zb,  color: '#ff006e', barPct: grand > 0 ? (zb  / grand) * 100 : 0 },
    { name: '官網業績', val: web, color: '#00ff88', barPct: grand > 0 ? (web / grand) * 100 : 0 },
  ];

  return (
    <div style={S.page}>

      {/* Header */}
      <div className="fiu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: 20, letterSpacing: 4, textTransform: 'uppercase', color: '#e4f4ff' }}>業績指揮部</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            {isLoading
              ? <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: '#00f5ff' }}>SYNCING...</span>
              : <><span className="blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88', display: 'inline-block' }}/><span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#1a3045' }}>NOTION 資料流連接中</span></>
            }
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, letterSpacing: 3, color: 'rgba(0,245,255,0.4)', marginBottom: 4 }}>今日全軍營收</div>
          <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: 32, lineHeight: 1, color: '#00f5ff', textShadow: '0 0 24px rgba(0,245,255,0.45)' }}>${grand.toLocaleString()}</div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="fiu1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, flexShrink: 0 }}>
        {sectors.map(s => (
          <div key={s.name} style={{ ...S.panel, borderLeft: `2px solid ${s.color}` }}>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: '#1a3045', marginBottom: 10 }}>{s.name}</div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: 26, lineHeight: 1, color: s.color, textShadow: `0 0 16px ${s.color}55` }}>${s.val.toLocaleString()}</div>
            <div style={{ marginTop: 12, height: 3, background: 'rgba(255,255,255,0.05)' }}>
              <div className="prog-fill" style={{ width: `${s.barPct}%`, height: '100%', background: s.color, boxShadow: `0 0 6px ${s.color}` }}/>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="fiu2" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, flex: 1, minHeight: 0 }}>

        {/* Contribution */}
        <div style={S.panel}>
          <div style={S.label}>戰區貢獻度</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sectors.map(s => (
              <div key={s.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: '#3a6070' }}>{s.name}</span>
                  <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, fontWeight: 700, color: s.color }}>{grand > 0 ? Math.round((s.val / grand) * 100) : 0}%</span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                  <div className="prog-fill" style={{ width: `${s.barPct}%`, height: '100%', background: s.color, boxShadow: `0 0 5px ${s.color}` }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ ...S.panel, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexShrink: 0 }}>
            <div style={S.label}>真實營收日誌</div>
            <button onClick={() => mutate()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: '#00f5ff', display: 'flex', alignItems: 'center', gap: 4, letterSpacing: 1 }}>
              ↻ 立即同步
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,245,255,0.07)' }}>
                  {['時間', '戰區', '當日累計', '狀態'].map(h => (
                    <th key={h} style={{ padding: '6px 12px', textAlign: 'left', fontFamily: 'Share Tech Mono, monospace', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: '#1a3045', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {td.length > 0 ? td.map((row: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(0,245,255,0.04)' }}>
                    <td style={{ padding: '8px 12px', fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: '#2a5060' }}>{row.date}</td>
                    <td style={{ padding: '8px 12px', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 13, color: '#e4f4ff' }}>{row.store}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: 13, color: '#00ff88', textShadow: '0 0 8px rgba(0,255,136,0.35)' }}>${row.total.toLocaleString()}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, padding: '2px 8px', background: 'rgba(0,255,136,0.07)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}>LIVE</span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} style={{ padding: '48px 12px', textAlign: 'center', fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: '#1a2a35', letterSpacing: 3 }}>// 今日暫無數據</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
