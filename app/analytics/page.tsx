'use client';
import React, { useState, useEffect } from 'react';

const MONO = 'Share Tech Mono, monospace';
const ORB  = 'Inter, system-ui, sans-serif';
const RAJ  = 'Rajdhani, sans-serif';

// ═══════════════════════════════════════
// MOCK DATA（串 API 後替換）
// ═══════════════════════════════════════

const CHANNEL_STATS = {
  youtube:   { label: 'YouTube',   icon: '▶', color: '#ff006e', subs: 12400, delta: '+12%', up: true },
  facebook:  { label: 'Facebook',  icon: 'f', color: '#1877f2', followers: 8730, delta: '+5.2%', up: true },
  instagram: { label: 'Instagram', icon: '◎', color: '#e1306c', followers: 15200, delta: '+18%', up: true },
  tiktok:    { label: 'TikTok',    icon: '♪', color: '#00f2ea', followers: 6850, delta: '+32%', up: true },
};

const FOLLOWER_TREND = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(Date.now() - (29 - i) * 86400000);
  return {
    date: d.toISOString().split('T')[0],
    youtube: 11200 + Math.round(i * 40 + Math.random() * 80),
    facebook: 8100 + Math.round(i * 21 + Math.random() * 50),
    instagram: 13500 + Math.round(i * 57 + Math.random() * 100),
    tiktok: 5200 + Math.round(i * 55 + Math.random() * 120),
  };
});

type Platform = 'youtube' | 'facebook' | 'instagram' | 'tiktok';

interface Video {
  title: string;
  platform: Platform;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engRate: number;
  publishedAt: string;
  badge: string | null;
  thumbnail: string | null;
  duration: string;
}

const VIDEOS: Video[] = [
  { title: 'GiberPass 十大必用功能完整導覽', platform: 'youtube', views: 24200, likes: 1820, comments: 342, shares: 186, engRate: 9.7, publishedAt: '2026-02-20', badge: 'TRENDING', thumbnail: null, duration: '12:34' },
  { title: '飆鋒衣開箱 — 騎士必備評測 2026', platform: 'youtube', views: 18100, likes: 1340, comments: 218, shares: 95, engRate: 9.1, publishedAt: '2026-02-18', badge: 'HOT', thumbnail: null, duration: '8:45' },
  { title: '德谷拉安全帽性能大比拼', platform: 'youtube', views: 12400, likes: 980, comments: 156, shares: 67, engRate: 9.7, publishedAt: '2026-02-15', badge: null, thumbnail: null, duration: '15:22' },
  { title: '春季騎行裝備清單 🏍️', platform: 'instagram', views: 32100, likes: 4200, comments: 186, shares: 520, engRate: 15.3, publishedAt: '2026-02-21', badge: 'VIRAL', thumbnail: null, duration: '0:58' },
  { title: '安全帽挑選指南｜新手必看', platform: 'instagram', views: 18700, likes: 2800, comments: 94, shares: 310, engRate: 17.1, publishedAt: '2026-02-19', badge: null, thumbnail: null, duration: '1:12' },
  { title: '3秒看懂安全帽等級差異', platform: 'tiktok', views: 89200, likes: 12400, comments: 830, shares: 2100, engRate: 17.2, publishedAt: '2026-02-22', badge: '🔥 VIRAL', thumbnail: null, duration: '0:15' },
  { title: '騎士日常 Vlog #47', platform: 'tiktok', views: 45600, likes: 6800, comments: 420, shares: 890, engRate: 17.8, publishedAt: '2026-02-20', badge: null, thumbnail: null, duration: '0:32' },
  { title: '2026 最值得買的 3 頂安全帽', platform: 'tiktok', views: 38900, likes: 5200, comments: 310, shares: 720, engRate: 16.0, publishedAt: '2026-02-17', badge: null, thumbnail: null, duration: '0:22' },
  { title: '德谷拉安全帽實測 360°', platform: 'facebook', views: 9800, likes: 620, comments: 87, shares: 142, engRate: 8.7, publishedAt: '2026-02-21', badge: null, thumbnail: null, duration: '5:10' },
  { title: '騎士裝備團購開箱直播回放', platform: 'facebook', views: 6200, likes: 380, comments: 156, shares: 45, engRate: 9.4, publishedAt: '2026-02-16', badge: null, thumbnail: null, duration: '42:18' },
];

const PLATFORM_COLORS: Record<Platform, string> = {
  youtube: '#ff006e',
  facebook: '#1877f2',
  instagram: '#e1306c',
  tiktok: '#00f2ea',
};

const PLATFORM_ICONS: Record<Platform, string> = {
  youtube: '▶',
  facebook: 'f',
  instagram: '◎',
  tiktok: '♪',
};

// ═══════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 4, color: 'rgba(0,245,255,0.8)', marginBottom: 12, marginTop: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ display: 'inline-block', width: 20, height: 1, background: 'rgba(0,245,255,0.4)' }}/>
      {children}
      <span style={{ flex: 1, height: 1, background: 'rgba(0,245,255,0.08)' }}/>
    </div>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', marginTop: 6 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, boxShadow: `0 0 4px ${color}`, transition: 'width 0.5s ease' }} />
    </div>
  );
}

function formatNum(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}萬`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function PlatformBadge({ platform }: { platform: Platform }) {
  const color = PLATFORM_COLORS[platform];
  const icon = PLATFORM_ICONS[platform];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: MONO, fontSize: 8, color, background: `${color}15`, border: `1px solid ${color}30`, padding: '2px 8px', borderRadius: 2 }}>
      <span style={{ fontSize: 9 }}>{icon}</span>
      {platform.toUpperCase()}
    </span>
  );
}

// ═══════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════

export default function AnalyticsPage() {
  const [activePlatform, setActivePlatform] = useState<'all' | Platform>('all');
  const [trendPlatform, setTrendPlatform] = useState<Platform>('youtube');
  const [titleInput, setTitleInput] = useState('');
  const [aiResult, setAiResult] = useState<{ score: number; suggestions: string[] } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // 篩選影片
  const filteredVideos = activePlatform === 'all'
    ? VIDEOS
    : VIDEOS.filter(v => v.platform === activePlatform);

  const sortedVideos = [...filteredVideos].sort((a, b) => b.views - a.views);
  const maxViews = sortedVideos[0]?.views || 1;

  // 趨勢線 SVG
  const svgW = 600, svgH = 80;
  const trendData = FOLLOWER_TREND.map(d => d[trendPlatform]);
  const trendMin = Math.min(...trendData) * 0.98;
  const trendMax = Math.max(...trendData) * 1.02;
  const trendPts = trendData.map((v, i) => {
    const x = trendData.length > 1 ? (i / (trendData.length - 1)) * svgW : svgW / 2;
    const y = svgH - ((v - trendMin) / (trendMax - trendMin)) * (svgH - 15) - 5;
    return `${x},${y}`;
  }).join(' ');

  // 總互動量（跨平台）
  const totalEngagement = VIDEOS.reduce((s, v) => s + v.likes + v.comments + v.shares, 0);
  const totalViews = VIDEOS.reduce((s, v) => s + v.views, 0);
  const platformBreakdown = (['youtube', 'facebook', 'instagram', 'tiktok'] as Platform[]).map(p => {
    const vids = VIDEOS.filter(v => v.platform === p);
    const views = vids.reduce((s, v) => s + v.views, 0);
    return { platform: p, views, count: vids.length, pct: totalViews > 0 ? Math.round((views / totalViews) * 100) : 0 };
  }).sort((a, b) => b.views - a.views);

  // AI 標題優化
  const handleAiScore = async () => {
    if (!titleInput.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    // 模擬 AI 回應（之後接真實 API）
    await new Promise(r => setTimeout(r, 1500));
    const score = 60 + Math.round(Math.random() * 35);
    const suggestions = [
      `加入數字讓標題更具體，例如：「${titleInput.replace(/(.{4})/, '$1 Top 5')}」`,
      '建議在前 5 個字放入關鍵字，提升搜尋排名',
      score > 80 ? '標題長度適中，SEO 友好 ✓' : '建議將標題控制在 40-60 字之間',
      '可加入 emoji 提升點擊率（但不宜超過 2 個）',
    ];
    setAiResult({ score, suggestions: suggestions.slice(0, 3) });
    setAiLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#010208', color: '#e4f4ff', fontFamily: RAJ }}>

      {/* Header */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ fontFamily: ORB, fontWeight: 900, fontSize: 20, letterSpacing: 1, color: '#e4f4ff' }}>內容分析</div>
        <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: 'rgba(0,245,255,0.4)', marginTop: 4 }}>CONTENT INTELLIGENCE // YT · FB · IG · TIKTOK</div>
      </div>

      <div style={{ padding: '0 24px 24px', maxWidth: 1400, margin: '0 auto' }}>

        {/* ═══ CHANNEL OVERVIEW ═══ */}
        <SectionTitle>CHANNEL OVERVIEW // 頻道總覽</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {Object.entries(CHANNEL_STATS).map(([key, ch]) => (
            <div key={key} style={{ background: '#0d1c30', border: `1px solid ${ch.color}25`, borderTop: `2px solid ${ch.color}`, padding: '14px 16px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, right: 14, fontSize: 20, opacity: 0.15, color: ch.color }}>{ch.icon}</div>
              <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>{ch.label.toUpperCase()}</div>
              <div style={{ fontFamily: ORB, fontWeight: 800, fontSize: 26, color: ch.color, letterSpacing: -0.5 }}>
                {('subs' in ch ? ch.subs : ch.followers).toLocaleString()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>{'subs' in ch ? '訂閱' : '粉絲'}</span>
                <span style={{ fontFamily: MONO, fontSize: 9, color: ch.up ? '#00ff88' : '#ff6b00', fontWeight: 700 }}>{ch.delta}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ═══ FOLLOWER TREND ═══ */}
        <SectionTitle>FOLLOWER TREND // 粉絲成長趨勢（30天）</SectionTitle>
        <div style={{ background: '#0d1c30', border: '1px solid rgba(0,245,255,0.08)', padding: '16px 18px' }}>
          {/* Platform tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {(['youtube', 'facebook', 'instagram', 'tiktok'] as Platform[]).map(p => (
              <button key={p} onClick={() => setTrendPlatform(p)}
                style={{
                  fontFamily: MONO, fontSize: 9, letterSpacing: 1, padding: '4px 12px', cursor: 'pointer', borderRadius: 2,
                  background: trendPlatform === p ? `${PLATFORM_COLORS[p]}18` : 'transparent',
                  border: trendPlatform === p ? `1px solid ${PLATFORM_COLORS[p]}60` : '1px solid rgba(0,245,255,0.1)',
                  color: trendPlatform === p ? PLATFORM_COLORS[p] : 'rgba(255,255,255,0.35)',
                }}>
                {PLATFORM_ICONS[p]} {p.toUpperCase()}
              </button>
            ))}
          </div>
          {/* Chart */}
          <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: 80 }}>
            <defs>
              <linearGradient id={`grad-${trendPlatform}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PLATFORM_COLORS[trendPlatform]} stopOpacity="0.3" />
                <stop offset="100%" stopColor={PLATFORM_COLORS[trendPlatform]} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={`0,${svgH} ${trendPts} ${svgW},${svgH}`} fill={`url(#grad-${trendPlatform})`} />
            <polyline points={trendPts} fill="none" stroke={PLATFORM_COLORS[trendPlatform]} strokeWidth="1.5" />
            <text x="2" y={svgH} style={{ fontSize: 8, fill: 'rgba(255,255,255,0.25)', fontFamily: MONO }}>{FOLLOWER_TREND[0]?.date.slice(5)}</text>
            <text x={svgW - 2} y={svgH} textAnchor="end" style={{ fontSize: 8, fill: 'rgba(255,255,255,0.25)', fontFamily: MONO }}>{FOLLOWER_TREND[FOLLOWER_TREND.length - 1]?.date.slice(5)}</text>
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>
              起始 {trendData[0]?.toLocaleString()}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: PLATFORM_COLORS[trendPlatform] }}>
              現在 {trendData[trendData.length - 1]?.toLocaleString()} （+{(trendData[trendData.length - 1] - trendData[0]).toLocaleString()}）
            </span>
          </div>
        </div>

        {/* ═══ CONTENT PERFORMANCE ═══ */}
        <SectionTitle>CONTENT PERFORMANCE // 影片成效排行</SectionTitle>

        {/* Platform filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[
            { key: 'all' as const, label: '全部', color: '#00f5ff' },
            ...(['youtube', 'facebook', 'instagram', 'tiktok'] as Platform[]).map(p => ({ key: p, label: CHANNEL_STATS[p].label, color: PLATFORM_COLORS[p] })),
          ].map(f => (
            <button key={f.key} onClick={() => setActivePlatform(f.key)}
              style={{
                fontFamily: MONO, fontSize: 9, letterSpacing: 1, padding: '5px 14px', cursor: 'pointer', borderRadius: 2,
                background: activePlatform === f.key ? `${f.color}18` : 'transparent',
                border: activePlatform === f.key ? `1px solid ${f.color}60` : '1px solid rgba(0,245,255,0.1)',
                color: activePlatform === f.key ? f.color : 'rgba(255,255,255,0.35)',
              }}>
              {f.label} {f.key !== 'all' && <span style={{ opacity: 0.5 }}>({VIDEOS.filter(v => v.platform === f.key).length})</span>}
            </button>
          ))}
        </div>

        {/* Video list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sortedVideos.map((v, i) => {
            const color = PLATFORM_COLORS[v.platform];
            return (
              <div key={`${v.title}-${v.platform}`} style={{
                background: '#0d1c30', border: '1px solid rgba(0,245,255,0.06)', padding: '12px 16px',
                display: 'grid', gridTemplateColumns: '32px 1fr 100px 100px 100px 80px', gap: 14, alignItems: 'center',
              }}>
                {/* Rank */}
                <div style={{ fontFamily: ORB, fontSize: 16, fontWeight: 800, color: i < 3 ? '#ffd700' : 'rgba(255,255,255,0.15)', textAlign: 'center' }}>
                  {i + 1}
                </div>

                {/* Title + meta */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <PlatformBadge platform={v.platform} />
                    {v.badge && (
                      <span style={{ fontFamily: MONO, fontSize: 7, padding: '1px 6px', background: 'rgba(255,215,0,0.1)', color: '#ffd700', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 2 }}>{v.badge}</span>
                    )}
                    <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.2)' }}>{v.duration}</span>
                  </div>
                  <div style={{ fontFamily: RAJ, fontWeight: 600, fontSize: 14, color: '#e4f4ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
                  <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>{v.publishedAt}</div>
                </div>

                {/* Views */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: ORB, fontSize: 15, fontWeight: 700, color }}>{formatNum(v.views)}</div>
                  <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>觀看</div>
                </div>

                {/* Likes */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: ORB, fontSize: 13, fontWeight: 700, color: '#ff006e' }}>{formatNum(v.likes)}</div>
                  <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>讚</div>
                </div>

                {/* Comments + Shares */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>
                    💬 {formatNum(v.comments)} · ↗ {formatNum(v.shares)}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>留言 · 分享</div>
                </div>

                {/* Engagement rate */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: ORB, fontSize: 14, fontWeight: 700, color: v.engRate >= 15 ? '#00ff88' : v.engRate >= 10 ? '#ffd700' : '#00f5ff' }}>{v.engRate}%</div>
                  <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>互動率</div>
                  <MiniBar value={v.views} max={maxViews} color={color} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ BOTTOM ROW: Platform Distribution + AI Optimizer ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>

          {/* Platform distribution */}
          <div>
            <SectionTitle>PLATFORM DISTRIBUTION // 跨平台流量佔比</SectionTitle>
            <div style={{ background: '#0d1c30', border: '1px solid rgba(0,245,255,0.08)', padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>總觀看 {formatNum(totalViews)}</span>
                <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>總互動 {formatNum(totalEngagement)}</span>
              </div>
              {platformBreakdown.map(p => (
                <div key={p.platform} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: MONO, fontSize: 12, color: PLATFORM_COLORS[p.platform] }}>{PLATFORM_ICONS[p.platform]}</span>
                      <span style={{ fontFamily: RAJ, fontSize: 13, fontWeight: 600, color: '#e4f4ff' }}>{CHANNEL_STATS[p.platform].label}</span>
                      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>{p.count} 支影片</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontFamily: ORB, fontSize: 18, fontWeight: 800, color: PLATFORM_COLORS[p.platform] }}>{p.pct}%</span>
                      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>{formatNum(p.views)}</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 1, overflow: 'hidden' }}>
                    <div style={{
                      width: `${p.pct}%`, height: '100%', borderRadius: 1,
                      background: `linear-gradient(90deg, ${PLATFORM_COLORS[p.platform]}40, ${PLATFORM_COLORS[p.platform]})`,
                      boxShadow: `0 0 8px ${PLATFORM_COLORS[p.platform]}40`,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Title Optimizer */}
          <div>
            <SectionTitle>AI TITLE OPTIMIZER // 標題優化器</SectionTitle>
            <div style={{ background: '#0d1c30', border: '1px solid rgba(0,245,255,0.08)', padding: '16px 18px' }}>
              <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
                輸入影片標題，AI 會分析 SEO 分數並給出優化建議
              </div>
              <input
                type="text"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAiScore()}
                placeholder="輸入影片標題..."
                style={{
                  width: '100%', background: '#050e1a', border: '1px solid rgba(0,245,255,0.15)', padding: '10px 14px',
                  fontFamily: RAJ, fontSize: 14, color: '#e4f4ff', caretColor: '#00f5ff', outline: 'none', marginBottom: 10,
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={handleAiScore}
                disabled={aiLoading || !titleInput.trim()}
                style={{
                  width: '100%', padding: '10px',
                  background: aiLoading ? 'rgba(255,215,0,0.08)' : 'rgba(0,245,255,0.08)',
                  border: aiLoading ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(0,245,255,0.3)',
                  color: aiLoading ? '#ffd700' : '#00f5ff',
                  fontFamily: MONO, fontSize: 10, letterSpacing: 2, cursor: aiLoading ? 'wait' : 'pointer',
                  opacity: !titleInput.trim() ? 0.4 : 1,
                }}
              >
                {aiLoading ? '⏳ AI 分析中...' : '▶ AI 評分'}
              </button>

              {/* AI Result */}
              {aiResult && (
                <div style={{ marginTop: 14, padding: '14px', background: '#091422', border: '1px solid rgba(0,245,255,0.1)' }}>
                  {/* Score */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      border: `3px solid ${aiResult.score >= 80 ? '#00ff88' : aiResult.score >= 60 ? '#ffd700' : '#ff006e'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                    }}>
                      <div style={{ fontFamily: ORB, fontSize: 20, fontWeight: 800, color: aiResult.score >= 80 ? '#00ff88' : aiResult.score >= 60 ? '#ffd700' : '#ff006e' }}>
                        {aiResult.score}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: RAJ, fontSize: 14, fontWeight: 700, color: '#e4f4ff' }}>
                        {aiResult.score >= 80 ? '優秀標題 ✓' : aiResult.score >= 60 ? '標題尚可，有優化空間' : '建議大幅調整標題'}
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>SEO SCORE / 100</div>
                    </div>
                  </div>
                  {/* Suggestions */}
                  <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 2, color: 'rgba(0,245,255,0.6)', marginBottom: 8 }}>SUGGESTIONS</div>
                  {aiResult.suggestions.map((s, i) => (
                    <div key={i} style={{
                      padding: '8px 10px', marginBottom: 4,
                      background: 'rgba(0,245,255,0.03)', borderLeft: '2px solid rgba(0,245,255,0.2)',
                      fontFamily: RAJ, fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5,
                    }}>
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
