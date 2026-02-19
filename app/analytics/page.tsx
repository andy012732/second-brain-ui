'use client';
import React from 'react';

const S = {
  page: { height: '100%', overflowY: 'auto' as const, padding: '20px 24px', background: '#010208', display: 'flex', flexDirection: 'column' as const, gap: 16 } as React.CSSProperties,
  panel: { background: '#0d1c30', border: '1px solid rgba(0,245,255,0.13)', padding: '18px 20px', position: 'relative' as const } as React.CSSProperties,
  label: { fontFamily: 'Share Tech Mono, monospace', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase' as const, color: '#1a3045', marginBottom: 10, display: 'block' } as React.CSSProperties,
};

const KPI = [
  { label: 'YOUTUBE 訂閱', val: '12,400', delta: '+12%', color: '#ff006e', up: true },
  { label: 'GA4 使用者',   val: '45,230', delta: '+8.5%', color: '#00f5ff', up: true },
  { label: 'GSC 點擊量',   val: '8,120',  delta: '-2.1%', color: '#ff6b00', up: false },
  { label: '內容健康度',   val: '92/100', delta: 'STABLE', color: '#00ff88', up: true },
];

const VIDEOS = [
  { title: 'GiberPass 十大必用功能完整導覽', views: '2.4萬', rate: '98%', badge: 'TRENDING' },
  { title: '飆鋒衣開箱 — 騎士必備評測 2026', views: '1.8萬', rate: '94%', badge: 'HOT' },
  { title: '德谷拉安全帽性能大比拼', views: '1.2萬', rate: '91%', badge: null },
];

const PLATFORMS = [
  { name: 'YouTube',   pct: 52, color: '#ff006e' },
  { name: 'Instagram', pct: 28, color: '#00f5ff' },
  { name: 'Threads',   pct: 20, color: '#00ff88' },
];

export default function AnalyticsPage() {
  return (
    <div style={S.page}>

      {/* Header */}
      <div className="fiu" style={{ flexShrink: 0 }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: 20, letterSpacing: 4, textTransform: 'uppercase', color: '#e4f4ff' }}>內容分析</div>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#1a3045', marginTop: 4 }}>CONTENT INTELLIGENCE // REAL-TIME</div>
      </div>

      {/* KPI row */}
      <div className="fiu1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, flexShrink: 0 }}>
        {KPI.map(k => (
          <div key={k.label} style={{ ...S.panel, borderLeft: `2px solid ${k.color}` }}>
            <span style={{ ...S.label, marginBottom: 6 }}>{k.label}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: 22, color: k.color, textShadow: `0 0 14px ${k.color}55` }}>{k.val}</div>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: k.up ? '#00ff88' : '#ff6b00' }}>{k.delta}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="fiu2" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, flex: 1, minHeight: 0 }}>

        {/* Video list */}
        <div style={{ ...S.panel, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <span style={S.label}>▶ 優秀影片分析</span>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
            {VIDEOS.map(v => (
              <div key={v.title} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px', background: 'rgba(9,20,34,0.7)', border: '1px solid rgba(0,245,255,0.06)' }}>
                <div style={{ width: 40, height: 30, background: '#091422', border: '1px solid rgba(0,245,255,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="#ff006e" strokeWidth={2}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 13, color: '#e4f4ff', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
                  <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: '#2a4a5a' }}>{v.views} 觀看 · {v.rate} 互動</div>
                </div>
                {v.badge && (
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, padding: '2px 6px', background: 'rgba(255,0,110,0.08)', color: '#ff006e', border: '1px solid rgba(255,0,110,0.25)', flexShrink: 0 }}>{v.badge}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Platform + optimizer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          <div style={S.panel}>
            <span style={S.label}>◈ 平台流量分佈</span>
            {PLATFORMS.map(p => (
              <div key={p.name} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: '#3a6070' }}>{p.name}</span>
                  <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, fontWeight: 700, color: p.color }}>{p.pct}%</span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                  <div className="prog-fill" style={{ width: `${p.pct}%`, height: '100%', background: p.color, boxShadow: `0 0 5px ${p.color}` }}/>
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...S.panel, flex: 1 }}>
            <span style={S.label}>⚡ 標題優化器</span>
            <input type="text" placeholder="輸入影片標題..."
              style={{ width: '100%', background: '#050e1a', border: '1px solid rgba(0,245,255,0.1)', padding: '8px 10px', fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: '#e4f4ff', caretColor: '#00f5ff', outline: 'none', marginBottom: 8 }}/>
            <button style={{ width: '100%', background: 'rgba(0,245,255,0.07)', border: '1px solid rgba(0,245,255,0.25)', color: '#00f5ff', fontFamily: 'Share Tech Mono, monospace', fontSize: 9, letterSpacing: 2, padding: '8px', cursor: 'pointer', textTransform: 'uppercase' }}>
              ▶ AI 評分
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
