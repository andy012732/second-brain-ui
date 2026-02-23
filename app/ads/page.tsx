'use client';
import React, { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());
const MONO = 'Share Tech Mono, monospace';
const ORB  = 'Inter, system-ui, sans-serif';
const RAJ  = 'Rajdhani, sans-serif';

// Google Ads 假資料（審核通過後移除）
const GADS_MOCK = {
  today: { spend: 1250, impressions: 18400, clicks: 620, ctr: 0.0337, cpc: 2.02, conversions: 14, conversionValue: 8960 },
  week: { spend: 8730, impressions: 124000, clicks: 4180, ctr: 0.0337, cpc: 2.09, conversions: 89, conversionValue: 58200, roas: 6.67 },
  dailyTrend: Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const base = 800 + Math.random() * 600;
    return { date: dateStr, spend: Math.round(base), impressions: Math.round(base * 14), clicks: Math.round(base * 0.5), conversions: Math.round(base * 0.012) };
  }),
  campaigns: [
    { name: '[Search] 品牌字 - 91APP', status: 'ENABLED', type: 'SEARCH', spend: 3200, impressions: 42000, clicks: 1800, ctr: 0.0429, cpc: 1.78, conversions: 42, conversionValue: 27300, roas: 8.53 },
    { name: '[PMax] 全站商品', status: 'ENABLED', type: 'PERFORMANCE_MAX', spend: 2800, impressions: 38000, clicks: 1200, ctr: 0.0316, cpc: 2.33, conversions: 28, conversionValue: 18200, roas: 6.5 },
    { name: '[Search] 競品字', status: 'ENABLED', type: 'SEARCH', spend: 1500, impressions: 22000, clicks: 680, ctr: 0.0309, cpc: 2.21, conversions: 12, conversionValue: 7800, roas: 5.2 },
    { name: '[Display] 再行銷', status: 'ENABLED', type: 'DISPLAY', spend: 1230, impressions: 22000, clicks: 500, ctr: 0.0227, cpc: 2.46, conversions: 7, conversionValue: 4900, roas: 3.98 },
  ],
  _isMock: true,
  updatedAt: new Date().toISOString(),
};

function KPI({ label, value, sub, color = '#00f5ff' }: any) {
  return (
    <div style={{ background: '#091422', border: '1px solid rgba(0,245,255,0.08)', borderTop: `2px solid ${color}`, padding: '12px 14px' }}>
      <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 2, color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: ORB, fontWeight: 800, fontSize: 22, color, letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function MiniBar({ value, max, color }: any) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', marginTop: 6 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, boxShadow: `0 0 4px ${color}` }} />
    </div>
  );
}

function SectionTitle({ children }: any) {
  return (
    <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 4, color: 'rgba(0,245,255,0.8)', marginBottom: 12, marginTop: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ display: 'inline-block', width: 20, height: 1, background: 'rgba(0,245,255,0.4)' }}/>
      {children}
      <span style={{ flex: 1, height: 1, background: 'rgba(0,245,255,0.08)' }}/>
    </div>
  );
}

const tw = (d: Date) => new Date(d.getTime() + 8*3600000).toISOString().split('T')[0];
const daysAgo = (n: number) => tw(new Date(Date.now() - n*86400000));

export default function AdsPage() {
  const todayStr = tw(new Date());
  const [since, setSince] = useState(todayStr);
  const [until, setUntil] = useState(todayStr);

  const presets = [
    { label: '今天', s: todayStr, u: todayStr },
    { label: '昨天', s: daysAgo(1), u: daysAgo(1) },
    { label: '近7天', s: daysAgo(6), u: todayStr },
    { label: '近14天', s: daysAgo(13), u: todayStr },
    { label: '近30天', s: daysAgo(29), u: todayStr },
    { label: '本月', s: todayStr.slice(0,7)+'-01', u: todayStr },
  ];

  const { data: meta, isLoading: mL } = useSWR(`/api/analytics/meta?since=${since}&until=${until}`, fetcher, { refreshInterval: 300000 });
  const { data: ga4,  isLoading: gL } = useSWR(`/api/analytics/ga4?since=${since}&until=${until}`, fetcher, { refreshInterval: 300000 });
  const { data: gadsRaw, isLoading: gaL } = useSWR(`/api/analytics/google-ads?since=${since}&until=${until}`, fetcher, { refreshInterval: 300000 });

  // Google Ads: API 有錯就 fallback 到假資料
  const gadsHasError = gadsRaw?.error;
  const gads = gadsHasError ? GADS_MOCK : (gadsRaw || GADS_MOCK);
  const gadsIsMock = gadsHasError || !gadsRaw || gads._isMock;

  const t  = meta?.today || {};
  const w  = meta?.week  || {};
  const campaigns = meta?.campaigns || [];
  const adsets    = meta?.adsets    || [];
  const daily     = meta?.dailyTrend || [];

  const gt = gads?.today || {};
  const gw = gads?.week  || {};
  const gCampaigns = gads?.campaigns || [];
  const gDaily     = gads?.dailyTrend || [];

  const paidSocial    = ga4?.sources?.find((s: any) => s.channel?.toLowerCase().includes('paid social'))    || {};
  const paidSearch    = ga4?.sources?.find((s: any) => s.channel?.toLowerCase().includes('paid search'))    || {};
  const organicSocial = ga4?.sources?.find((s: any) => s.channel?.toLowerCase().includes('organic social')) || {};

  const maxSpend = Math.max(...daily.map((d: any) => d.spend), 1);
  const svgW = 500, svgH = 70;
  const pts = daily.map((d: any, i: number) => {
    const x = daily.length > 1 ? (i / (daily.length - 1)) * svgW : svgW / 2;
    const y = svgH - (d.spend / maxSpend) * (svgH - 10) - 5;
    return `${x},${y}`;
  }).join(' ');

  // Google Ads 趨勢線
  const gMaxSpend = Math.max(...gDaily.map((d: any) => d.spend), 1);
  const gPts = gDaily.map((d: any, i: number) => {
    const x = gDaily.length > 1 ? (i / (gDaily.length - 1)) * svgW : svgW / 2;
    const y = svgH - (d.spend / gMaxSpend) * (svgH - 10) - 5;
    return `${x},${y}`;
  }).join(' ');

  const isPreset = (p: any) => since === p.s && until === p.u;

  return (
    <div style={{ minHeight: '100vh', background: '#010208', color: '#e4f4ff', fontFamily: RAJ }}>

      {/* NAV */}
      <div style={{ height: 40, background: '#030a12', borderBottom: '1px solid rgba(0,245,255,0.08)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 20 }}>
        <Link href="/" style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 3, textDecoration: 'none' }}>← MISSION CTRL</Link>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 4, color: '#00f5ff' }}>// 廣告投放指揮部</span>
        <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>
          更新 {meta?.updatedAt ? new Date(meta.updatedAt).toLocaleTimeString('zh-TW', { hour12: false }) : '--:--'}
        </span>
      </div>

      {/* 日期選擇列 */}
      <div style={{ background: '#050e1a', borderBottom: '1px solid rgba(0,245,255,0.08)', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 3, color: 'rgba(0,245,255,0.6)', marginRight: 4 }}>DATE</span>
        {presets.map(p => (
          <button key={p.label} onClick={() => { setSince(p.s); setUntil(p.u); }}
            style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1, padding: '5px 12px',
              background: isPreset(p) ? 'rgba(0,245,255,0.12)' : 'transparent',
              border: isPreset(p) ? '1px solid rgba(0,245,255,0.5)' : '1px solid rgba(0,245,255,0.15)',
              color: isPreset(p) ? '#00f5ff' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer', borderRadius: 2 }}>
            {p.label}
          </button>
        ))}
        <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.15)', margin: '0 4px' }}>|</span>
        <input type="date" value={since} onChange={e => setSince(e.target.value)}
          style={{ fontFamily: MONO, fontSize: 9, background: '#091422', border: '1px solid rgba(0,245,255,0.2)', color: '#e4f4ff', padding: '5px 8px', colorScheme: 'dark', borderRadius: 2 }} />
        <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>—</span>
        <input type="date" value={until} onChange={e => setUntil(e.target.value)}
          style={{ fontFamily: MONO, fontSize: 9, background: '#091422', border: '1px solid rgba(0,245,255,0.2)', color: '#e4f4ff', padding: '5px 8px', colorScheme: 'dark', borderRadius: 2 }} />
        {since !== todayStr || until !== todayStr ? (
          <span style={{ fontFamily: MONO, fontSize: 8, color: '#ffd700', marginLeft: 8 }}>
            {since === until ? since : `${since} ~ ${until}`}
          </span>
        ) : null}
      </div>

      <div style={{ padding: '20px 24px', maxWidth: 1400, margin: '0 auto' }}>

        {/* PLATFORM OVERVIEW - 三欄 */}
        <SectionTitle>PLATFORM OVERVIEW // 核心指標對比</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 8 }}>

          {/* META */}
          <div style={{ background: '#0d1c30', border: '1px solid rgba(24,119,242,0.3)', borderTop: '2px solid #1877f2', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: '#fff' }}>f</div>
              <div>
                <div style={{ fontFamily: ORB, fontSize: 12, fontWeight: 700, color: '#1877f2' }}>META ADS</div>
                <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>Facebook / Instagram</div>
              </div>
              <div style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 8, color: mL ? '#ffd700' : '#00ff88' }}>{mL ? 'LOADING...' : '● LIVE'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <KPI label="期間花費" value={mL ? '—' : `$${t.spend?.toLocaleString() || 0}`} sub="TWD" color="#ff006e" />
              <KPI label="ROAS" value={mL ? '—' : w.roas ? `${w.roas.toFixed(2)}x` : 'N/A'} sub={`花費 $${w.spend?.toLocaleString() || 0}`} color="#00ff88" />
              <KPI label="購買轉換" value={mL ? '—' : w.purchases?.toLocaleString() || 0} sub="期間內" color="#ffd700" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 10 }}>
              <KPI label="曝光" value={mL ? '—' : t.impressions > 999 ? `${(t.impressions/1000).toFixed(1)}K` : t.impressions || 0} sub="期間" color="#00f5ff" />
              <KPI label="CTR" value={mL ? '—' : `${t.ctr?.toFixed(2) || 0}%`} sub={`CPC $${t.cpc?.toFixed(2) || 0}`} color="#ffd700" />
              <KPI label="觸及" value={mL ? '—' : t.reach > 999 ? `${(t.reach/1000).toFixed(1)}K` : t.reach || 0} sub={`頻率 ${t.frequency?.toFixed(1) || 0}x`} color="#9b59b6" />
            </div>
          </div>

          {/* GOOGLE ADS */}
          <div style={{ background: '#0d1c30', border: '1px solid rgba(66,133,244,0.3)', borderTop: '2px solid #4285f4', padding: '16px 18px', position: 'relative' }}>
            {gadsIsMock && (
              <div style={{ position: 'absolute', top: 8, right: 12, fontFamily: MONO, fontSize: 7, letterSpacing: 1, color: '#ffd700', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', padding: '2px 8px', borderRadius: 2 }}>
                DEMO DATA
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#4285f4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: '#fff' }}>G</div>
              <div>
                <div style={{ fontFamily: ORB, fontSize: 12, fontWeight: 700, color: '#4285f4' }}>GOOGLE ADS</div>
                <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>Search / PMax / Display</div>
              </div>
              <div style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 8, color: gaL ? '#ffd700' : gadsIsMock ? '#ff8c00' : '#00ff88' }}>
                {gaL ? 'LOADING...' : gadsIsMock ? '◐ PENDING' : '● LIVE'}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <KPI label="期間花費" value={`$${gt.spend?.toLocaleString() || 0}`} sub="TWD" color="#ff006e" />
              <KPI label="ROAS" value={gw.roas ? `${gw.roas.toFixed(2)}x` : 'N/A'} sub={`花費 $${gw.spend?.toLocaleString() || 0}`} color="#00ff88" />
              <KPI label="轉換數" value={gw.conversions?.toLocaleString() || 0} sub={`轉換值 $${gw.conversionValue?.toLocaleString() || 0}`} color="#ffd700" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 10 }}>
              <KPI label="曝光" value={gt.impressions > 999 ? `${(gt.impressions/1000).toFixed(1)}K` : gt.impressions || 0} sub="期間" color="#00f5ff" />
              <KPI label="CTR" value={`${(gt.ctr * 100)?.toFixed(2) || 0}%`} sub={`CPC $${gt.cpc?.toFixed(2) || 0}`} color="#ffd700" />
              <KPI label="點擊" value={gt.clicks?.toLocaleString() || 0} sub="期間" color="#4285f4" />
            </div>
          </div>

          {/* GA4 */}
          <div style={{ background: '#0d1c30', border: '1px solid rgba(234,67,53,0.3)', borderTop: '2px solid #ea4335', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ea4335', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, color: '#fff' }}>G</div>
              <div>
                <div style={{ fontFamily: ORB, fontSize: 12, fontWeight: 700, color: '#ea4335' }}>GOOGLE ANALYTICS</div>
                <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>GA4 // 91商店002362</div>
              </div>
              <div style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 8, color: gL ? '#ffd700' : '#00ff88' }}>{gL ? 'LOADING...' : '● LIVE'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <KPI label="7日使用者" value={gL ? '—' : ga4?.conversions?.users7d?.toLocaleString() || 0} sub="Active Users" color="#ea4335" />
              <KPI label="轉換數" value={gL ? '—' : ga4?.conversions?.thisWeek?.toLocaleString() || 0} sub={`上週 ${ga4?.conversions?.lastWeek || 0}`} color="#00ff88" />
              <KPI label="付費社群" value={gL ? '—' : paidSocial.pct ? `${paidSocial.pct}%` : 'N/A'} sub={paidSocial.sessions ? `${paidSocial.sessions?.toLocaleString()} sessions` : '—'} color="#1877f2" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 10 }}>
              <KPI label="7日工作階段" value={gL ? '—' : ga4?.conversions?.sessions7d?.toLocaleString() || 0} sub="Sessions" color="#00f5ff" />
              <KPI label="自然社群" value={gL ? '—' : organicSocial.pct ? `${organicSocial.pct}%` : 'N/A'} sub={organicSocial.sessions ? `${organicSocial.sessions?.toLocaleString()} sessions` : '—'} color="#ffd700" />
              <KPI label="付費搜尋" value={gL ? '—' : paidSearch.pct ? `${paidSearch.pct}%` : 'N/A'} sub={paidSearch.sessions ? `${paidSearch.sessions?.toLocaleString()} sessions` : '—'} color="#ea4335" />
            </div>
          </div>
        </div>

        {/* META DETAIL */}
        <SectionTitle>META ADS DETAIL // Facebook · Instagram</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, marginBottom: 8 }}>
          <div style={{ background: '#0d1c30', border: '1px solid rgba(0,245,255,0.08)', padding: '14px 16px' }}>
            <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 3, color: 'rgba(255,255,255,0.45)', marginBottom: 12 }}>SUMMARY</div>
            {[
              { label: '總花費', val: `$${w.spend?.toLocaleString() || 0}`, color: '#ff006e' },
              { label: '總曝光', val: w.impressions > 999 ? `${(w.impressions/1000).toFixed(0)}K` : w.impressions || 0, color: '#00f5ff' },
              { label: '總點擊', val: w.clicks?.toLocaleString() || 0, color: '#00ff88' },
              { label: '平均 CTR', val: `${w.ctr?.toFixed(2) || 0}%`, color: '#ffd700' },
              { label: '平均 CPC', val: `$${w.cpc?.toFixed(2) || 0}`, color: '#ff8c00' },
              { label: 'ROAS', val: w.roas ? `${w.roas.toFixed(2)}x` : 'N/A', color: '#00ff88' },
              { label: '購買轉換', val: w.purchases || 0, color: '#ffd700' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(0,245,255,0.05)' }}>
                <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>{item.label}</span>
                <span style={{ fontFamily: ORB, fontSize: 12, fontWeight: 700, color: item.color }}>{mL ? '—' : item.val}</span>
              </div>
            ))}
          </div>
          <div style={{ background: '#0d1c30', border: '1px solid rgba(0,245,255,0.08)', padding: '14px 16px' }}>
            <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 3, color: 'rgba(255,255,255,0.45)', marginBottom: 12 }}>30-DAY SPEND TREND</div>
            {daily.length > 0 ? (
              <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: 70 }}>
                {pts && <polyline points={pts} fill="none" stroke="#ff006e" strokeWidth="1.5" />}
                <text x="2" y={svgH} style={{ fontSize: 8, fill: 'rgba(255,255,255,0.3)', fontFamily: MONO }}>{daily[0]?.date?.slice(5)}</text>
                <text x={svgW-2} y={svgH} textAnchor="end" style={{ fontSize: 8, fill: 'rgba(255,255,255,0.3)', fontFamily: MONO }}>{daily[daily.length-1]?.date?.slice(5)}</text>
              </svg>
            ) : <div style={{ fontFamily: MONO, fontSize: 9, color: '#1a3045', textAlign: 'center', paddingTop: 20 }}>// NO DATA</div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 10 }}>
              {[
                { label: '昨日花費', val: `$${daily[daily.length-2]?.spend?.toLocaleString() || 0}`, color: '#ff006e' },
                { label: '昨日曝光', val: (daily[daily.length-2]?.impressions||0) > 999 ? `${((daily[daily.length-2]?.impressions||0)/1000).toFixed(1)}K` : (daily[daily.length-2]?.impressions||0), color: '#00f5ff' },
                { label: '昨日點擊', val: daily[daily.length-2]?.clicks?.toLocaleString() || 0, color: '#00ff88' },
                { label: '昨日觸及', val: (daily[daily.length-2]?.reach||0) > 999 ? `${((daily[daily.length-2]?.reach||0)/1000).toFixed(1)}K` : (daily[daily.length-2]?.reach||0), color: '#9b59b6' },
              ].map(item => (
                <div key={item.label} style={{ background: '#091422', padding: '8px 10px', borderLeft: `2px solid ${item.color}` }}>
                  <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontFamily: ORB, fontSize: 14, fontWeight: 700, color: item.color }}>{mL ? '—' : item.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Campaign + Adset (Meta) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 8 }}>
          <div style={{ background: '#0d1c30', border: '1px solid rgba(0,245,255,0.08)', padding: '14px 16px' }}>
            <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 3, color: 'rgba(255,255,255,0.45)', marginBottom: 12 }}>CAMPAIGN RANKING // 花費排序</div>
            {campaigns.length === 0 && !mL && <div style={{ fontFamily: MONO, fontSize: 9, color: '#1a3045', textAlign: 'center', padding: '16px 0' }}>// NO DATA</div>}
            {campaigns.map((c: any, i: number) => (
              <div key={i} style={{ padding: '9px 0', borderBottom: '1px solid rgba(0,245,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontFamily: RAJ, fontWeight: 600, fontSize: 12, color: c.status === 'ACTIVE' ? '#e4f4ff' : '#2a4a5a', maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                  <span style={{ fontFamily: ORB, fontSize: 13, fontWeight: 700, color: '#ff006e' }}>${c.spend.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', gap: 10, fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>
                  <span>CTR {c.ctr.toFixed(2)}%</span>
                  <span>CPC ${c.cpc.toFixed(2)}</span>
                  {c.roas > 0 && <span style={{ color: '#00ff88' }}>ROAS {c.roas.toFixed(2)}x</span>}
                  {c.purchases > 0 && <span style={{ color: '#ffd700' }}>購買 {c.purchases}</span>}
                </div>
                <MiniBar value={c.spend} max={campaigns[0]?.spend || 1} color="#ff006e" />
              </div>
            ))}
          </div>
          <div style={{ background: '#0d1c30', border: '1px solid rgba(0,245,255,0.08)', padding: '14px 16px' }}>
            <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 3, color: 'rgba(255,255,255,0.45)', marginBottom: 12 }}>ADSET RANKING // 花費排序</div>
            {adsets.length === 0 && !mL && <div style={{ fontFamily: MONO, fontSize: 9, color: '#1a3045', textAlign: 'center', padding: '16px 0' }}>// NO DATA</div>}
            {adsets.map((a: any, i: number) => (
              <div key={i} style={{ padding: '9px 0', borderBottom: '1px solid rgba(0,245,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontFamily: RAJ, fontWeight: 600, fontSize: 12, color: a.status === 'ACTIVE' ? '#e4f4ff' : '#2a4a5a', maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                  <span style={{ fontFamily: ORB, fontSize: 13, fontWeight: 700, color: '#00f5ff' }}>${a.spend.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', gap: 10, fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>
                  <span>曝光 {(a.impressions||0) > 999 ? `${((a.impressions||0)/1000).toFixed(1)}K` : a.impressions}</span>
                  <span>觸及 {(a.reach||0) > 999 ? `${((a.reach||0)/1000).toFixed(1)}K` : a.reach}</span>
                  <span>CTR {a.ctr.toFixed(2)}%</span>
                </div>
                <MiniBar value={a.spend} max={adsets[0]?.spend || 1} color="#00f5ff" />
              </div>
            ))}
          </div>
        </div>

        {/* GOOGLE ADS DETAIL */}
        <SectionTitle>GOOGLE ADS DETAIL // Search · Performance Max · Display</SectionTitle>
        {gadsIsMock && (
          <div style={{ fontFamily: MONO, fontSize: 8, color: '#ffd700', background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)', padding: '8px 14px', marginBottom: 12, borderRadius: 2 }}>
            ⚠ API 審核中（Developer Token pending）— 目前顯示模擬數據，審核通過後將自動切換為真實數據
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, marginBottom: 8 }}>
          <div style={{ background: '#0d1c30', border: '1px solid rgba(66,133,244,0.15)', padding: '14px 16px' }}>
            <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 3, color: 'rgba(255,255,255,0.45)', marginBottom: 12 }}>SUMMARY</div>
            {[
              { label: '總花費', val: `$${gw.spend?.toLocaleString() || 0}`, color: '#ff006e' },
              { label: '總曝光', val: (gw.impressions||0) > 999 ? `${((gw.impressions||0)/1000).toFixed(0)}K` : gw.impressions || 0, color: '#00f5ff' },
              { label: '總點擊', val: gw.clicks?.toLocaleString() || 0, color: '#00ff88' },
              { label: '平均 CTR', val: `${((gw.ctr||0) * 100).toFixed(2)}%`, color: '#ffd700' },
              { label: '平均 CPC', val: `$${gw.cpc?.toFixed(2) || 0}`, color: '#ff8c00' },
              { label: 'ROAS', val: gw.roas ? `${gw.roas.toFixed(2)}x` : 'N/A', color: '#00ff88' },
              { label: '轉換數', val: gw.conversions?.toLocaleString() || 0, color: '#ffd700' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(66,133,244,0.08)' }}>
                <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>{item.label}</span>
                <span style={{ fontFamily: ORB, fontSize: 12, fontWeight: 700, color: item.color }}>{item.val}</span>
              </div>
            ))}
          </div>
          <div style={{ background: '#0d1c30', border: '1px solid rgba(66,133,244,0.15)', padding: '14px 16px' }}>
            <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 3, color: 'rgba(255,255,255,0.45)', marginBottom: 12 }}>30-DAY SPEND TREND</div>
            {gDaily.length > 0 ? (
              <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: 70 }}>
                {gPts && <polyline points={gPts} fill="none" stroke="#4285f4" strokeWidth="1.5" />}
                <text x="2" y={svgH} style={{ fontSize: 8, fill: 'rgba(255,255,255,0.3)', fontFamily: MONO }}>{gDaily[0]?.date?.slice(5)}</text>
                <text x={svgW-2} y={svgH} textAnchor="end" style={{ fontSize: 8, fill: 'rgba(255,255,255,0.3)', fontFamily: MONO }}>{gDaily[gDaily.length-1]?.date?.slice(5)}</text>
              </svg>
            ) : <div style={{ fontFamily: MONO, fontSize: 9, color: '#1a3045', textAlign: 'center', paddingTop: 20 }}>// NO DATA</div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 10 }}>
              {[
                { label: '昨日花費', val: `$${gDaily[gDaily.length-2]?.spend?.toLocaleString() || 0}`, color: '#ff006e' },
                { label: '昨日曝光', val: (gDaily[gDaily.length-2]?.impressions||0) > 999 ? `${((gDaily[gDaily.length-2]?.impressions||0)/1000).toFixed(1)}K` : (gDaily[gDaily.length-2]?.impressions||0), color: '#00f5ff' },
                { label: '昨日點擊', val: gDaily[gDaily.length-2]?.clicks?.toLocaleString() || 0, color: '#00ff88' },
                { label: '昨日轉換', val: gDaily[gDaily.length-2]?.conversions?.toLocaleString() || 0, color: '#ffd700' },
              ].map(item => (
                <div key={item.label} style={{ background: '#091422', padding: '8px 10px', borderLeft: `2px solid ${item.color}` }}>
                  <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontFamily: ORB, fontSize: 14, fontWeight: 700, color: item.color }}>{item.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Google Ads Campaign Ranking */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 8 }}>
          <div style={{ background: '#0d1c30', border: '1px solid rgba(66,133,244,0.15)', padding: '14px 16px' }}>
            <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 3, color: 'rgba(255,255,255,0.45)', marginBottom: 12 }}>GOOGLE ADS CAMPAIGN RANKING // 花費排序</div>
            {gCampaigns.length === 0 && <div style={{ fontFamily: MONO, fontSize: 9, color: '#1a3045', textAlign: 'center', padding: '16px 0' }}>// NO DATA</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {gCampaigns.map((c: any, i: number) => (
                <div key={i} style={{ padding: '9px 0', borderBottom: '1px solid rgba(66,133,244,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontFamily: RAJ, fontWeight: 600, fontSize: 12, color: c.status === 'ENABLED' ? '#e4f4ff' : '#2a4a5a', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                    <span style={{ fontFamily: ORB, fontSize: 13, fontWeight: 700, color: '#4285f4' }}>${c.spend.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.35)', flexWrap: 'wrap' }}>
                    <span style={{ color: 'rgba(66,133,244,0.6)' }}>{c.type?.replace('_', ' ')}</span>
                    <span>CTR {((c.ctr||0) * 100).toFixed(2)}%</span>
                    <span>CPC ${c.cpc?.toFixed(2)}</span>
                    {c.roas > 0 && <span style={{ color: '#00ff88' }}>ROAS {c.roas.toFixed(2)}x</span>}
                    {c.conversions > 0 && <span style={{ color: '#ffd700' }}>轉換 {c.conversions}</span>}
                  </div>
                  <MiniBar value={c.spend} max={gCampaigns[0]?.spend || 1} color="#4285f4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GA4 流量來源 */}
        <SectionTitle>GOOGLE ANALYTICS DETAIL // 流量來源分析</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, marginBottom: 8 }}>
          {(ga4?.sources || []).map((s: any) => (
            <div key={s.channel} style={{ background: '#0d1c30', border: '1px solid rgba(0,245,255,0.08)', padding: '12px 14px' }}>
              <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.channel.toUpperCase()}</div>
              <div style={{ fontFamily: ORB, fontSize: 20, fontWeight: 700, color: '#00f5ff' }}>{s.pct}%</div>
              <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{s.sessions?.toLocaleString()} sessions</div>
              <MiniBar value={s.pct} max={100} color="#00f5ff" />
            </div>
          ))}
        </div>

        {/* 熱門頁面 */}
        {ga4?.topPages && (
          <>
            <SectionTitle>TOP PAGES // 近7天熱門頁面</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
              {ga4.topPages.map((p: any, i: number) => (
                <div key={i} style={{ background: '#0d1c30', border: '1px solid rgba(0,245,255,0.08)', padding: '12px 14px' }}>
                  <div style={{ fontFamily: MONO, fontSize: 8, color: '#00f5ff', marginBottom: 4 }}>#{i+1}</div>
                  <div style={{ fontFamily: RAJ, fontWeight: 600, fontSize: 12, color: '#e4f4ff', marginBottom: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.title}</div>
                  <div style={{ fontFamily: ORB, fontSize: 16, fontWeight: 700, color: '#ffd700' }}>{p.views?.toLocaleString()}</div>
                  <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>瀏覽 · {p.users?.toLocaleString()} 人</div>
                  <MiniBar value={p.views} max={ga4.topPages[0]?.views || 1} color="#ffd700" />
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
