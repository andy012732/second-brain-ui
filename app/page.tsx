'use client';
import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => { if (!r.ok) throw new Error('err'); return r.json(); });

const TICKER_ITEMS = [
  '▲ NVDA +3.4%', '◆ 新豐 LIVE', '▲ BTC +2.1%', '◆ 竹北 LIVE',
  '▲ META +0.6%', '◆ 官網 LIVE', '◈ 今日目標進度', '▲ TSLA -1.6%', '◆ MISSION CTRL',
];

export default function MissionControl() {
  const GOAL = 80000;
  const { data: acts = [], isLoading: aL } = useSWR('/api/activity', fetcher, { refreshInterval: 10000 });
  const { data: rev = [], isLoading: rL }  = useSWR('/api/notion/revenue', fetcher, { refreshInterval: 300000 });

  const today = new Date().toISOString().split('T')[0];
  const td    = Array.isArray(rev) ? rev.filter((r: any) => r.date === today) : [];
  const hf    = td.filter((r: any) => r.store === '新豐').reduce((s: number, r: any) => s + r.total, 0);
  const zb    = td.filter((r: any) => r.store === '竹北').reduce((s: number, r: any) => s + r.total, 0);
  const web   = td.filter((r: any) => r.store === '官網').reduce((s: number, r: any) => s + r.total, 0);
  const total = hf + zb + web;
  const pct   = Math.min(Math.round((total / GOAL) * 100), 100);

  const stores = [
    { name: '新豐門市', val: hf,  pct: Math.min((hf  / GOAL) * 100, 100), color: '#00f5ff', shadow: 'rgba(0,245,255,0.5)' },
    { name: '竹北門市', val: zb,  pct: Math.min((zb  / GOAL) * 100, 100), color: '#ff006e', shadow: 'rgba(255,0,110,0.5)' },
    { name: '官網業績', val: web, pct: Math.min((web / GOAL) * 100, 100), color: '#00ff88', shadow: 'rgba(0,255,136,0.5)' },
  ];

  const pctColor = pct >= 100 ? '#00ff88' : pct > 60 ? '#00f5ff' : '#1a3045';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#010208', position: 'relative', zIndex: 1 }}>

      {/* ── TICKER ── */}
      <div style={{ height: 22, flexShrink: 0, overflow: 'hidden', background: '#030a12', borderBottom: '1px solid rgba(0,245,255,0.06)', display: 'flex', alignItems: 'center' }}>
        <div className="ticker-scroll" style={{ display: 'flex', gap: 40, whiteSpace: 'nowrap', paddingLeft: '100vw', fontFamily: 'Share Tech Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#1a3045' }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i} style={{ color: t.includes('▲') ? '#00ff88' : t.includes('◆') ? '#00f5ff' : '#1a3045' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── MAIN 3-COL ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr 260px', overflow: 'hidden', minHeight: 0 }}>

        {/* LEFT: Intel feed */}
        <aside style={{ display: 'flex', flexDirection: 'column', padding: '14px 12px', overflow: 'hidden', borderRight: '1px solid rgba(0,245,255,0.07)' }}>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#1a3045', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width={10} height={10} fill="none" stroke="#00f5ff" strokeWidth={2}>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            即時情資流
            {aL && <span style={{ marginLeft: 'auto', color: '#00f5ff', fontSize: 8 }}>...</span>}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
            {(acts as any[]).map((a: any, i: number) => (
              <div key={a.id ?? i} className={`intel-item fiu${Math.min(i+1,3)}`}>
                <span style={{ display: 'block', fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: 'rgba(0,245,255,0.3)', marginBottom: 2 }}>
                  {a.created_at ? new Date(a.created_at).toLocaleTimeString('zh-TW', { hour12: false }) : 'RECENT'}
                </span>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 12, lineHeight: 1.3, color: '#e4f4ff' }}>{a.title}</div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: '#2a4a5a', marginTop: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.description}</div>
              </div>
            ))}
            {!aL && (acts as any[]).length === 0 && (
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: '#1a2a35', textAlign: 'center', marginTop: 40, letterSpacing: 2 }}>// NO ACTIVITY</div>
            )}
          </div>
        </aside>

        {/* CENTER */}
        <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 32px', gap: 16, overflow: 'hidden' }}>

          {/* Revenue panel */}
          <div className="fiu" style={{ width: '100%', background: '#0d1c30', border: '1px solid rgba(0,245,255,0.14)', padding: '22px 26px', position: 'relative' }}>
            {/* Corner brackets */}
            {[
              { top: 0, left: 0, borderWidth: '2px 0 0 2px' },
              { top: 0, right: 0, borderWidth: '2px 2px 0 0' },
              { bottom: 0, left: 0, borderWidth: '0 0 2px 2px' },
              { bottom: 0, right: 0, borderWidth: '0 2px 2px 0' },
            ].map((s, i) => (
              <span key={i} style={{ position: 'absolute', width: 14, height: 14, borderStyle: 'solid', borderColor: 'rgba(0,245,255,0.5)', ...s }}/>
            ))}

            {/* Numbers row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(0,245,255,0.45)', marginBottom: 8 }}>
                  德谷拉騎士 // 今日營收監測
                </div>
                <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: 38, lineHeight: 1, color: '#00f5ff', textShadow: '0 0 28px rgba(0,245,255,0.45)' }}>
                  ${total.toLocaleString()}
                </div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: '#2a4a5a', marginTop: 4 }}>
                  目標 / $80,000
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: 56, lineHeight: 1, color: pctColor, textShadow: pct > 0 ? '0 0 36px rgba(0,245,255,0.35)' : 'none' }}>
                  {pct}
                </div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#1a3045', textAlign: 'right' }}>
                  %  COMPLETE
                </div>
              </div>
            </div>

            {/* 3-color progress bar */}
            <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,245,255,0.08)', display: 'flex', overflow: 'hidden', marginBottom: 6 }}>
              <div className="prog-fill" style={{ width: `${Math.min((hf / GOAL) * 100, 100)}%`, background: '#00f5ff', boxShadow: '0 0 14px rgba(0,245,255,0.7)' }}/>
              <div className="prog-fill" style={{ width: `${Math.min((zb / GOAL) * 100, 100)}%`, background: '#ff006e', boxShadow: '0 0 14px rgba(255,0,110,0.7)' }}/>
              <div className="prog-fill" style={{ width: `${Math.min((web / GOAL) * 100, 100)}%`, background: '#00ff88', boxShadow: '0 0 14px rgba(0,255,136,0.7)' }}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {['$0', '$20K', '$40K', '$60K', '$80K'].map(l => (
                <span key={l} style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: '#1a3045' }}>{l}</span>
              ))}
            </div>
          </div>

          {/* Store KPI cards */}
          <div className="fiu1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, width: '100%' }}>
            {stores.map(s => (
              <div key={s.name} style={{ background: '#091422', border: '1px solid rgba(0,245,255,0.08)', borderLeft: `2px solid ${s.color}`, padding: '12px 14px' }}>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: '#1a3045', marginBottom: 6 }}>{s.name}</div>
                <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: 20, lineHeight: 1, color: s.color, textShadow: `0 0 14px ${s.shadow}` }}>
                  ${s.val.toLocaleString()}
                </div>
                <div style={{ marginTop: 8, height: 2, background: 'rgba(255,255,255,0.05)' }}>
                  <div className="prog-fill" style={{ width: `${s.pct}%`, height: '100%', background: s.color, boxShadow: `0 0 6px ${s.color}` }}/>
                </div>
              </div>
            ))}
          </div>

          {/* Command input */}
          <div className="fiu2" style={{ width: '100%', background: '#050e1a', border: '1px solid rgba(0,245,255,0.11)', display: 'flex', alignItems: 'center', padding: '0 14px' }}>
            <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 12, color: 'rgba(0,245,255,0.35)', marginRight: 8, flexShrink: 0 }}>▶</span>
            <input type="text" placeholder="輸入指令或關鍵字..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'Share Tech Mono, monospace', fontSize: 11, letterSpacing: 2, color: '#e4f4ff', caretColor: '#00f5ff', padding: '11px 0' }}/>
          </div>
        </section>

        {/* RIGHT: Revenue list */}
        <aside style={{ display: 'flex', flexDirection: 'column', padding: '14px 12px', overflow: 'hidden', borderLeft: '1px solid rgba(0,245,255,0.07)' }}>
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#1a3045', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width={10} height={10} fill="none" stroke="#00ff88" strokeWidth={2}>
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
            </svg>
            門市分項業績
            {rL && <span style={{ marginLeft: 'auto', color: '#00ff88', fontSize: 8 }}>...</span>}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}>
            {Array.isArray(rev) && (rev as any[]).slice(0, 15).map((r: any, i: number) => (
              <div key={r.id ?? i} className="rev-row fiu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(9,20,34,0.9)', border: '1px solid rgba(0,245,255,0.06)', transition: 'border-color 0.15s' }}>
                <div>
                  <span style={{ display: 'block', fontFamily: 'Share Tech Mono, monospace', fontSize: 7, color: '#1a3045', marginBottom: 1 }}>{r.date}</span>
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 13, color: '#e4f4ff' }}>{r.store}</span>
                </div>
                <span style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: 12, color: '#00ff88', textShadow: '0 0 10px rgba(0,255,136,0.4)' }}>${r.total.toLocaleString()}</span>
              </div>
            ))}
            {!rL && Array.isArray(rev) && (rev as any[]).length === 0 && (
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: '#1a2a35', textAlign: 'center', marginTop: 40, letterSpacing: 2 }}>// AWAITING NOTION</div>
            )}
          </div>
        </aside>

      </div>

      {/* ── STATUS BAR ── */}
      <div style={{ height: 22, flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', background: '#030a12', borderTop: '1px solid rgba(0,245,255,0.06)' }}>
        <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, letterSpacing: 3, textTransform: 'uppercase', color: '#1a3045' }}>DRACULA COMMAND EST.2026 // ADAPTIVE MODE</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: '#1a3045', letterSpacing: 2 }}>VERCEL EDGE RUNTIME</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Share Tech Mono, monospace', fontSize: 8, color: '#1a3520', letterSpacing: 2 }}>
            <span className="blink" style={{ width: 4, height: 4, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 5px #00ff88', display: 'inline-block' }}/>
            SYSTEMS OK
          </span>
        </div>
      </div>

    </div>
  );
}
