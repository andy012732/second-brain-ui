'use client';
import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const MONO = 'Share Tech Mono, monospace';
const ORB  = 'Orbitron, monospace';
const RAJ  = 'Rajdhani, sans-serif';

function KPI({ label, value, sub, color = '#00f5ff' }: any) {
  return (
    <div style={{ background: '#0d1c30', border: '1px solid rgba(0,245,255,0.1)', borderTop: `2px solid ${color}`, padding: '14px 16px' }}>
      <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 3, color: '#1a3045', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: ORB, fontWeight: 700, fontSize: 22, color, textShadow: `0 0 12px ${color}80` }}>{value}</div>
      {sub && <div style={{ fontFamily: MONO, fontSize: 9, color: '#2a4a5a', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function MiniBar({ value, max, color }: any) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', marginTop: 4 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, boxShadow: `0 0 4px ${color}` }} />
    </div>
  );
}

export default function AdsPage() {
  const { data: meta, isLoading: mL } = useSWR('/api/analytics/meta', fetcher, { refreshInterval: 300000 });
  const { data: ga4 } = useSWR('/api/analytics/ga4', fetcher, { refreshInterval: 300000 });

  const t = meta?.today || {};
  const w = meta?.week || {};
  const campaigns = meta?.campaigns || [];
  const adsets = meta?.adsets || [];
  const daily = meta?.dailyTrend || [];

  // SVG 趨勢圖
  const maxSpend = Math.max(...daily.map((d: any) => d.spend), 1);
  const svgW = 600, svgH = 80;
  const pts = daily.map((d: any, i: number) => {
    const x = daily.length > 1 ? (i / (daily.length - 1)) * svgW : svgW / 2;
    const y = svgH - (d.spend / maxSpend) * (svgH - 10) - 5;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ minHeight: '100vh', background: '#010208', color: '#e4f4ff', fontFamily: RAJ }}>
      {/* NAV */}
      <div style={{ height: 40, background: '#030a12', borderBottom: '1px solid rgba(0,245,255,0.08)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 20 }}>
        <Link href="/" style={{ fontFamily: MONO, fontSize: 9, color: '#1a3045', letterSpacing: 3, textDecoration: 'none' }}>← MISSION CTRL</Link>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 4, color: '#00f5ff' }}>// 廣告投放指揮部</span>
        <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 8, color: '#1a3045' }}>
          {meta?.updatedAt ? new Date(meta.updatedAt).toLocaleTimeString('zh-TW', { hour12: false }) : '--:--:--'}
        </span>
      </div>

      <div style={{ padding: '20px 24px', maxWidth: 1400, margin: '0 auto' }}>

        {/* 今日 KPI */}
        <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 4, color: 'rgba(0,245,255,0.4)', marginBottom: 12 }}>TODAY SNAPSHOT</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 24 }}>
          <KPI label="TODAY SPEND" value={mL ? '—' : `$${t.spend?.toLocaleString('en', {minimumFractionDigits:0}) || 0}`} sub="今日花費" color="#ff006e" />
          <KPI label="IMPRESSIONS" value={mL ? '—' : (t.impressions > 999 ? `${(t.impressions/1000).toFixed(1)}K` : t.impressions || 0)} sub="曝光次數" color="#00f5ff" />
          <KPI label="CLICKS" value={mL ? '—' : t.clicks?.toLocaleString() || 0} sub="點擊次數" color="#00ff88" />
          <KPI label="CTR" value={mL ? '—' : `${t.ctr?.toFixed(2) || 0}%`} sub="點擊率" color="#ffd700" />
          <KPI label="CPC" value={mL ? '—' : `$${t.cpc?.toFixed(2) || 0}`} sub="每次點擊成本" color="#ff8c00" />
          <KPI label="REACH" value={mL ? '—' : (t.reach > 999 ? `${(t.reach/1000).toFixed(1)}K` : t.reach || 0)} sub={`頻率 ${t.frequency?.toFixed(1) || 0}x`} color="#9b59b6" />
        </div>

        {/* 近7天 + SVG */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 24 }}>
          {/* 7日摘要 */}
          <div style={{ background: '#0d1c30', border: '1px solid rgba(0,245,255,0.1)', padding: '16px 18px' }}>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 4, color: 'rgba(0,245,255,0.4)', marginBottom: 14 }}>7-DAY SUMMARY</div>
            {[
              { label: '總花費', val: `$${w.spend?.toLocaleString('en', {minimumFractionDigits:0}) || 0}`, color: '#ff006e' },
              { label: '總曝光', val: w.impressions > 999 ? `${(w.impressions/1000).toFixed(0)}K` : w.impressions || 0, color: '#00f5ff' },
              { label: '總點擊', val: w.clicks?.toLocaleString() || 0, color: '#00ff88' },
              { label: '平均 CTR', val: `${w.ctr?.toFixed(2) || 0}%`, color: '#ffd700' },
              { label: 'ROAS', val: w.roas ? `${w.roas.toFixed(2)}x` : 'N/A', color: '#00ff88' },
              { label: '轉換數', val: w.purchases || 0, color: '#00f5ff' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(0,245,255,0.05)' }}>
                <span style={{ fontFamily: MONO, fontSize: 9, color: '#2a4a5a' }}>{item.label}</span>
                <span style={{ fontFamily: ORB, fontSize: 13, fontWeight: 700, color: item.color }}>{mL ? '—' : item.val}</span>
              </div>
            ))}
          </div>

          {/* 花費趨勢圖 */}
          <div style={{ background: '#0d1c30', border: '1px solid rgba(0,245,255,0.1)', padding: '16px 18px' }}>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 4, color: 'rgba(0,245,255,0.4)', marginBottom: 14 }}>30-DAY SPEND TREND</div>
            {daily.length > 0 ? (
              <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: 80 }}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff006e" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ff006e" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {pts && <polyline points={pts} fill="none" stroke="#ff006e" strokeWidth="1.5" />}
                <text x="0" y={svgH} style={{ fontSize: 9, fill: '#1a3045', fontFamily: MONO }}>
                  {daily[0]?.date?.slice(5)}
                </text>
                <text x={svgW} y={svgH} textAnchor="end" style={{ fontSize: 9, fill: '#1a3045', fontFamily: MONO }}>
                  {daily[daily.length-1]?.date?.slice(5)}
                </text>
              </svg>
            ) : (
              <div style={{ fontFamily: MONO, fontSize: 9, color: '#1a3045', textAlign: 'center', paddingTop: 30 }}>// NO DATA</div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 12 }}>
              {ga4 && [
                { label: '7日訪客', val: ga4.conversions?.users7d?.toLocaleString() || 0, color: '#00f5ff' },
                { label: '7日工作階段', val: ga4.conversions?.sessions7d?.toLocaleString() || 0, color: '#00ff88' },
                { label: '轉換數', val: ga4.conversions?.thisWeek || 0, color: '#ffd700' },
                { label: 'vs 上週', val: ga4.conversions?.lastWeek > 0 ? `${Math.round(((ga4.conversions.thisWeek - ga4.conversions.lastWeek) / ga4.conversions.lastWeek) * 100)}%` : 'N/A', color: '#00ff88' },
              ].map(item => (
                <div key={item.label} style={{ background: '#091422', padding: '8px 10px', borderLeft: `2px solid ${item.color}` }}>
                  <div style={{ fontFamily: MONO, fontSize: 7, color: '#1a3045', marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontFamily: ORB, fontSize: 14, fontWeight: 700, color: item.color }}>{item.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 廣告活動排名 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {/* Campaigns */}
          <div style={{ background: '#0d1c30', border: '1px solid rgba(0,245,255,0.1)', padding: '16px 18px' }}>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 4, color: 'rgba(0,245,255,0.4)', marginBottom: 14 }}>CAMPAIGN RANKING // 近7天</div>
            {campaigns.length === 0 && !mL && (
              <div style={{ fontFamily: MONO, fontSize: 9, color: '#1a3045', textAlign: 'center', padding: '20px 0' }}>// NO ACTIVE CAMPAIGNS</div>
            )}
            {campaigns.map((c: any, i: number) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid rgba(0,245,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: RAJ, fontWeight: 600, fontSize: 12, color: c.status === 'ACTIVE' ? '#e4f4ff' : '#2a4a5a', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                  <span style={{ fontFamily: ORB, fontSize: 12, fontWeight: 700, color: '#ff006e' }}>${c.spend.toFixed(0)}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontFamily: MONO, fontSize: 8, color: '#2a4a5a' }}>
                  <span>CTR {c.ctr.toFixed(2)}%</span>
                  <span>CPC ${c.cpc.toFixed(2)}</span>
                  {c.roas > 0 && <span style={{ color: '#00ff88' }}>ROAS {c.roas.toFixed(2)}x</span>}
                </div>
                <MiniBar value={c.spend} max={campaigns[0]?.spend || 1} color="#ff006e" />
              </div>
            ))}
          </div>

          {/* Adsets */}
          <div style={{ background: '#0d1c30', border: '1px solid rgba(0,245,255,0.1)', padding: '16px 18px' }}>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 4, color: 'rgba(0,245,255,0.4)', marginBottom: 14 }}>ADSET RANKING // 近7天</div>
            {adsets.length === 0 && !mL && (
              <div style={{ fontFamily: MONO, fontSize: 9, color: '#1a3045', textAlign: 'center', padding: '20px 0' }}>// NO ACTIVE ADSETS</div>
            )}
            {adsets.map((a: any, i: number) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid rgba(0,245,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: RAJ, fontWeight: 600, fontSize: 12, color: a.status === 'ACTIVE' ? '#e4f4ff' : '#2a4a5a', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                  <span style={{ fontFamily: ORB, fontSize: 12, fontWeight: 700, color: '#00f5ff' }}>${a.spend.toFixed(0)}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontFamily: MONO, fontSize: 8, color: '#2a4a5a' }}>
                  <span>曝光 {a.impressions > 999 ? `${(a.impressions/1000).toFixed(1)}K` : a.impressions}</span>
                  <span>觸及 {a.reach > 999 ? `${(a.reach/1000).toFixed(1)}K` : a.reach}</span>
                  <span>CTR {a.ctr.toFixed(2)}%</span>
                </div>
                <MiniBar value={a.spend} max={adsets[0]?.spend || 1} color="#00f5ff" />
              </div>
            ))}
          </div>
        </div>

        {/* 流量來源 */}
        {ga4?.sources && (
          <div style={{ background: '#0d1c30', border: '1px solid rgba(0,245,255,0.1)', padding: '16px 18px', marginBottom: 24 }}>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 4, color: 'rgba(0,245,255,0.4)', marginBottom: 14 }}>GA4 TRAFFIC SOURCES // 近7天</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
              {ga4.sources.map((s: any) => (
                <div key={s.channel} style={{ background: '#091422', padding: '10px 12px', borderLeft: '2px solid #00f5ff' }}>
                  <div style={{ fontFamily: MONO, fontSize: 7, color: '#1a3045', marginBottom: 4 }}>{s.channel.toUpperCase()}</div>
                  <div style={{ fontFamily: ORB, fontSize: 16, fontWeight: 700, color: '#00f5ff' }}>{s.pct}%</div>
                  <div style={{ fontFamily: MONO, fontSize: 8, color: '#2a4a5a' }}>{s.sessions.toLocaleString()} sessions</div>
                  <MiniBar value={s.pct} max={100} color="#00f5ff" />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
