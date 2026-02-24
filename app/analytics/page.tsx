'use client';
import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

/* ── 型別 ── */
interface Video {
  id: string; title: string; platform: 'youtube' | 'facebook' | 'instagram' | 'tiktok';
  views: number; likes: number; comments: number; shares: number;
  engagementRate: number; publishedAt: string; thumbnail: string; badge?: string;
}

/* ── Mock 資料（TikTok — 尚無 API）── */
const TT_MOCK: Video[] = [
  { id:'tt1', title:'機車改裝 Before/After', platform:'tiktok', views:156000, likes:12000, comments:890, shares:3200, engagementRate:10.31, publishedAt:'2026-02-21', thumbnail:'', badge:'VIRAL' },
  { id:'tt2', title:'安全帽挑選教學', platform:'tiktok', views:87000, likes:6500, comments:420, shares:1800, engagementRate:10.02, publishedAt:'2026-02-19', thumbnail:'', badge:'HOT' },
  { id:'tt3', title:'深夜台北騎行', platform:'tiktok', views:64000, likes:4800, comments:310, shares:950, engagementRate:9.47, publishedAt:'2026-02-16', thumbnail:'' },
];

const PLATFORMS = ['all','youtube','facebook','instagram','tiktok'] as const;
type Platform = typeof PLATFORMS[number];
const COLORS: Record<string, string> = { youtube:'#ff0050', facebook:'#1877f2', instagram:'#e1306c', tiktok:'#00f2ea' };
const ICONS: Record<string, string> = { youtube:'▶', facebook:'f', instagram:'◎', tiktok:'♪' };

/* ── 格式化 ── */
const fmt = (n: number) => n >= 10000000 ? (n/10000000).toFixed(1)+'千萬' : n >= 10000 ? (n/10000).toFixed(1)+'萬' : n.toLocaleString();

/* ── 粉絲趨勢 mock ── */
const genTrend = (base: number, growth: number) => Array.from({length:30},(_,i)=>({ day:i+1, value: Math.round(base + (growth/30)*i + (Math.random()-0.5)*growth*0.1) }));

export default function AnalyticsPage() {
  const [platform, setPlatform] = useState<Platform>('all');
  const [trendPlatform, setTrendPlatform] = useState<string>('youtube');
  const [titleInput, setTitleInput] = useState('');
  const [aiResult, setAiResult] = useState<{score:number;suggestions:string[]}|null>(null);

  /* ── API 資料 ── */
  const { data: ytData } = useSWR('/api/analytics/youtube', fetcher, { refreshInterval: 300000 });
  const { data: fbData } = useSWR('/api/analytics/facebook', fetcher, { refreshInterval: 300000 });
  const { data: igData } = useSWR('/api/analytics/instagram', fetcher, { refreshInterval: 300000 });

  /* ── 頻道統計 ── */
  const ytSubs = ytData?.channel?.subscribers || 0;
  const ytViews = ytData?.channel?.totalViews || 0;
  const ytCount = ytData?.channel?.videoCount || 0;
  const fbFans = fbData?.page?.fanCount || 0;
  const igFollowers = igData?.account?.followersCount || 0;
  const igMediaCount = igData?.account?.mediaCount || 0;

  const channels = [
    { key:'youtube', label:'YOUTUBE', value:ytSubs, unit:'訂閱', extra:`${fmt(ytViews)} 總觀看`, color:COLORS.youtube, live: !!ytData?.channel },
    { key:'facebook', label:'FACEBOOK', value:fbFans, unit:'粉絲', extra:`${(fbData?.posts||[]).length} 篇近期貼文`, color:COLORS.facebook, live: !!fbData?.page },
    { key:'instagram', label:'INSTAGRAM', value:igFollowers, unit:'粉絲', extra:`${igMediaCount} 篇貼文`, color:COLORS.instagram, live: !!igData?.account },
    { key:'tiktok', label:'TIKTOK', value:6850, unit:'粉絲', extra:'+32%', color:COLORS.tiktok, live:false },
  ];

  /* ── 影片整合 ── */
  const ytVideos: Video[] = (ytData?.videos || []).map((v: any) => ({
    id:v.id, title:v.title, platform:'youtube' as const, views:v.views, likes:v.likes,
    comments:v.comments, shares:0, engagementRate:v.engagementRate,
    publishedAt:v.publishedAt, thumbnail:v.thumbnail,
    badge: v.views >= 50000 ? 'VIRAL' : v.views >= 10000 ? 'HOT' : v.views >= 5000 ? 'TRENDING' : undefined,
  }));

  const fbVideos: Video[] = (fbData?.posts || []).map((p: any) => ({
    id:p.id, title:p.title, platform:'facebook' as const,
    views: p.engagement || 0,
    likes: p.reactions || 0,
    comments: p.comments || 0,
    shares: p.shares || 0,
    engagementRate: fbFans > 0 ? Math.round(((p.engagement || 0) / fbFans) * 10000) / 100 : 0,
    publishedAt: p.createdTime, thumbnail: p.image || '',
    badge: (p.engagement || 0) >= 20 ? 'HOT' : undefined,
  }));

  /* ── IG 真實資料轉換 ── */
  const igVideos: Video[] = (igData?.posts || []).map((p: any) => {
    const engagement = (p.likes || 0) + (p.comments || 0);
    const engRate = igFollowers > 0 ? Math.round((engagement / igFollowers) * 10000) / 100 : 0;
    return {
      id: p.id,
      title: p.title || '(無標題)',
      platform: 'instagram' as const,
      views: engagement, // IG Graph API 不直接提供 views，用互動數代替
      likes: p.likes || 0,
      comments: p.comments || 0,
      shares: 0, // IG Graph API 不提供 shares
      engagementRate: engRate,
      publishedAt: p.createdTime || '',
      thumbnail: p.image || '',
      badge: engagement >= 500 ? 'VIRAL' : engagement >= 100 ? 'HOT' : engagement >= 50 ? 'TRENDING' : undefined,
    };
  });

  const allVideos = [...ytVideos, ...fbVideos, ...igVideos, ...TT_MOCK]
    .sort((a,b) => b.views - a.views);
  const filtered = platform === 'all' ? allVideos : allVideos.filter(v => v.platform === platform);

  /* ── 欄位標題（依平台不同）── */
  const colLabels = platform === 'facebook'
    ? { col1: '互動總數', col2: '心情', col3: '留言/分享', col4: '觸及率' }
    : platform === 'instagram'
    ? { col1: '互動數', col2: '讚', col3: '留言/分享', col4: '互動率' }
    : { col1: '觀看', col2: '讚', col3: '留言/分享', col4: '互動率' };

  /* ── 平台分佈 ── */
  const totalViews = allVideos.reduce((s,v)=>s+v.views, 0) || 1;
  const dist = (['youtube','facebook','instagram','tiktok'] as const).map(p => {
    const pv = allVideos.filter(v=>v.platform===p).reduce((s,v)=>s+v.views,0);
    return { platform:p, views:pv, pct: Math.round(pv/totalViews*100) };
  }).sort((a,b)=>b.views-a.views);

  /* ── 趨勢數據 ── */
  const trends: Record<string,{data:ReturnType<typeof genTrend>;start:number;end:number;color:string}> = {
    youtube: { data:genTrend(ytSubs||27530, 962), start:ytSubs?ytSubs-962:27530, end:ytSubs||28492, color:COLORS.youtube },
    facebook: { data:genTrend(fbFans||18200, 688), start:fbFans?fbFans-688:18200, end:fbFans||18888, color:COLORS.facebook },
    instagram: { data:genTrend(igFollowers||14200, igFollowers ? Math.round(igFollowers*0.06) : 1000), start:igFollowers ? igFollowers - Math.round(igFollowers*0.06) : 14200, end:igFollowers||15200, color:COLORS.instagram },
    tiktok: { data:genTrend(5200, 1650), start:5200, end:6850, color:COLORS.tiktok },
  };
  const trend = trends[trendPlatform];
  const tMax = Math.max(...trend.data.map(d=>d.value));
  const tMin = Math.min(...trend.data.map(d=>d.value));
  const tRange = tMax - tMin || 1;
  const points = trend.data.map((d,i) => `${(i/(trend.data.length-1))*100},${100-((d.value-tMin)/tRange)*80}`).join(' ');
  const areaPoints = points + ` 100,100 0,100`;

  /* ── AI 標題 ── */
  const analyzeTitle = () => {
    if (!titleInput.trim()) return;
    const score = 60 + Math.floor(Math.random()*35);
    setAiResult({ score, suggestions:[
      `加入數字：「${titleInput.slice(0,10)}... 的5個秘密」`,
      `加入疑問：「${titleInput.slice(0,10)}... 真的有效嗎？」`,
      `加入情緒：「超震撼！${titleInput.slice(0,15)}...」`,
    ]});
  };

  return (
    <div style={{ padding:'2rem', maxWidth:1400, margin:'0 auto', fontFamily:'Share Tech Mono, monospace' }}>
      {/* 標題 */}
      <h1 style={{ fontSize:'1.8rem', fontFamily:'Orbitron, monospace', color:'#f8f8f2' }}>內容分析</h1>
      <p style={{ color:'#6272a4', fontSize:'0.75rem', letterSpacing:2, marginBottom:'1.5rem' }}>
        CONTENT INTELLIGENCE // YT · FB · IG · TIKTOK
      </p>

      {/* CHANNEL OVERVIEW */}
      <div style={{ color:'#bd93f9', fontSize:'0.7rem', letterSpacing:3, marginBottom:'0.8rem' }}>
        —— CHANNEL OVERVIEW // 頻道總覽
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.8rem', marginBottom:'2rem' }}>
        {channels.map(ch => (
          <div key={ch.key} style={{ background:'#1a1a2e', border:`1px solid ${ch.color}33`, borderRadius:8, padding:'1rem', position:'relative' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
              <span style={{ color:'#6272a4', fontSize:'0.7rem', letterSpacing:2 }}>{ch.label}</span>
              <span style={{ fontSize:'0.6rem', color: ch.live ? '#50fa7b' : '#ffb86c' }}>
                {ch.live ? '● LIVE' : '◐ MOCK'}
              </span>
            </div>
            <div style={{ fontSize:'2rem', fontWeight:700, fontFamily:'Rajdhani, monospace', color:ch.color }}>
              {ch.value ? ch.value.toLocaleString() : '...'}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', color:'#6272a4', fontSize:'0.7rem', marginTop:'0.3rem' }}>
              <span>{ch.unit}</span>
              <span style={{ color:ch.color }}>{ch.extra}</span>
            </div>
          </div>
        ))}
      </div>

      {/* YOUTUBE HIGHLIGHTS */}
      {ytData?.channel && (
        <>
          <div style={{ color:'#bd93f9', fontSize:'0.7rem', letterSpacing:3, marginBottom:'0.8rem' }}>
            —— YOUTUBE HIGHLIGHTS // 頻道亮點
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.8rem', marginBottom:'2rem' }}>
            {[
              { label:'總觀看數', value:fmt(ytViews), color:'#ff79c6' },
              { label:'影片數', value:String(ytCount), color:'#8be9fd' },
              { label:'訂閱數', value:fmt(ytSubs), color:'#f1fa8c' },
              { label:'平均觀看', value:fmt(Math.round(ytViews/(ytCount||1))), color:'#50fa7b' },
            ].map(h => (
              <div key={h.label} style={{ background:'#1a1a2e', borderTop:`2px solid ${h.color}`, borderRadius:8, padding:'1rem' }}>
                <div style={{ color:'#6272a4', fontSize:'0.7rem', marginBottom:'0.3rem' }}>{h.label}</div>
                <div style={{ fontSize:'1.8rem', fontWeight:700, fontFamily:'Rajdhani, monospace', color:h.color }}>{h.value}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* IG HIGHLIGHTS */}
      {igData?.account && (
        <>
          <div style={{ color:'#bd93f9', fontSize:'0.7rem', letterSpacing:3, marginBottom:'0.8rem' }}>
            —— INSTAGRAM HIGHLIGHTS // @{igData.account.username}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.8rem', marginBottom:'2rem' }}>
            {[
              { label:'粉絲數', value:fmt(igFollowers), color:'#e1306c' },
              { label:'貼文數', value:String(igMediaCount), color:'#8be9fd' },
              { label:'總互動', value:fmt(igData.summary?.totalEngagement || 0), color:'#f1fa8c' },
              { label:'平均互動', value:String(igData.summary?.avgEngagement || 0), color:'#50fa7b' },
            ].map(h => (
              <div key={h.label} style={{ background:'#1a1a2e', borderTop:`2px solid ${h.color}`, borderRadius:8, padding:'1rem' }}>
                <div style={{ color:'#6272a4', fontSize:'0.7rem', marginBottom:'0.3rem' }}>{h.label}</div>
                <div style={{ fontSize:'1.8rem', fontWeight:700, fontFamily:'Rajdhani, monospace', color:h.color }}>{h.value}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* FOLLOWER TREND */}
      <div style={{ color:'#bd93f9', fontSize:'0.7rem', letterSpacing:3, marginBottom:'0.8rem' }}>
        —— FOLLOWER TREND // 粉絲成長趨勢（30天）
      </div>
      <div style={{ background:'#1a1a2e', borderRadius:8, padding:'1.5rem', marginBottom:'2rem' }}>
        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1rem' }}>
          {Object.entries(ICONS).map(([key,icon]) => (
            <button key={key} onClick={()=>setTrendPlatform(key)} style={{
              background: trendPlatform===key ? COLORS[key]+'22' : 'transparent',
              border:`1px solid ${trendPlatform===key ? COLORS[key] : '#44475a'}`,
              color: trendPlatform===key ? COLORS[key] : '#6272a4',
              borderRadius:6, padding:'0.3rem 0.8rem', fontSize:'0.7rem', cursor:'pointer',
            }}>
              {icon} {key.toUpperCase()}
            </button>
          ))}
        </div>
        <svg viewBox="0 0 100 100" style={{ width:'100%', height:200 }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trend.color} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={trend.color} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill="url(#tg)"/>
          <polyline points={points} fill="none" stroke={trend.color} strokeWidth="0.5"/>
        </svg>
        <div style={{ display:'flex', justifyContent:'space-between', color:'#6272a4', fontSize:'0.65rem', marginTop:'0.5rem' }}>
          <span>起始 {trend.start.toLocaleString()}</span>
          <span style={{ color:trend.color }}>現在 {trend.end.toLocaleString()} (+{(trend.end-trend.start).toLocaleString()})</span>
        </div>
      </div>

      {/* CONTENT PERFORMANCE */}
      <div style={{ color:'#bd93f9', fontSize:'0.7rem', letterSpacing:3, marginBottom:'0.8rem' }}>
        —— CONTENT PERFORMANCE // 內容成效排行
      </div>
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1rem' }}>
        {PLATFORMS.map(p => (
          <button key={p} onClick={()=>setPlatform(p)} style={{
            background: platform===p ? '#bd93f922' : 'transparent',
            border:`1px solid ${platform===p ? '#bd93f9' : '#44475a'}`,
            color: platform===p ? '#bd93f9' : '#6272a4',
            borderRadius:6, padding:'0.3rem 0.8rem', fontSize:'0.7rem', cursor:'pointer', textTransform:'uppercase',
          }}>{p === 'all' ? '全部' : p}</button>
        ))}
      </div>
      <div style={{ background:'#1a1a2e', borderRadius:8, overflow:'hidden', marginBottom:'2rem' }}>
        {/* 表頭 */}
        <div style={{ display:'grid', gridTemplateColumns:'32px 48px 1fr 80px 70px 80px 70px', gap:8, padding:'0.6rem 1rem', background:'#16162a', color:'#6272a4', fontSize:'0.65rem' }}>
          <span>#</span><span></span><span>標題</span>
          <span style={{textAlign:'right'}}>{colLabels.col1}</span>
          <span style={{textAlign:'right'}}>{colLabels.col2}</span>
          <span style={{textAlign:'right'}}>{colLabels.col3}</span>
          <span style={{textAlign:'right'}}>{colLabels.col4}</span>
        </div>
        {filtered.slice(0,15).map((v,i) => (
          <div key={v.id} style={{ display:'grid', gridTemplateColumns:'32px 48px 1fr 80px 70px 80px 70px', gap:8, padding:'0.5rem 1rem', borderBottom:'1px solid #282a36', alignItems:'center' }}>
            <span style={{ color: i<3 ? '#f1fa8c' : '#6272a4', fontWeight: i<3?700:400, fontSize:'0.8rem' }}>{i+1}</span>
            <div style={{ width:48, height:36, borderRadius:4, overflow:'hidden', background:'#282a36', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {v.thumbnail ? <img src={v.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> :
                <span style={{ color:COLORS[v.platform], fontSize:'1rem' }}>{ICONS[v.platform]}</span>}
            </div>
            <div>
              <div style={{ color:'#f8f8f2', fontSize:'0.75rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:320 }}>
                {v.title}
                {v.badge && <span style={{ marginLeft:6, fontSize:'0.55rem', padding:'1px 5px', borderRadius:3,
                  background: v.badge==='VIRAL'?'#ff555533':v.badge==='HOT'?'#ffb86c33':'#50fa7b33',
                  color: v.badge==='VIRAL'?'#ff5555':v.badge==='HOT'?'#ffb86c':'#50fa7b',
                }}>{v.badge}</span>}
              </div>
              <div style={{ color:'#6272a4', fontSize:'0.6rem' }}>
                <span style={{ color:COLORS[v.platform] }}>{ICONS[v.platform]}</span> {v.platform} · {v.publishedAt}
              </div>
            </div>
            <span style={{ textAlign:'right', color:'#f8f8f2', fontSize:'0.75rem' }}>{v.views.toLocaleString()}</span>
            <span style={{ textAlign:'right', color:'#ff79c6', fontSize:'0.75rem' }}>{v.likes.toLocaleString()}</span>
            <span style={{ textAlign:'right', color:'#6272a4', fontSize:'0.75rem' }}>{v.comments.toLocaleString()}/{v.shares.toLocaleString()}</span>
            <span style={{ textAlign:'right', fontSize:'0.75rem',
              color: v.engagementRate>=15?'#50fa7b':v.engagementRate>=5?'#f1fa8c':'#8be9fd'
            }}>{v.engagementRate.toFixed(2)}%</span>
          </div>
        ))}
      </div>

      {/* PLATFORM DISTRIBUTION */}
      <div style={{ color:'#bd93f9', fontSize:'0.7rem', letterSpacing:3, marginBottom:'0.8rem' }}>
        —— PLATFORM DISTRIBUTION // 平台流量分佈
      </div>
      <div style={{ background:'#1a1a2e', borderRadius:8, padding:'1.5rem', marginBottom:'2rem' }}>
        {dist.map(d => (
          <div key={d.platform} style={{ marginBottom:'1rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.3rem' }}>
              <span style={{ color:COLORS[d.platform], fontSize:'0.75rem' }}>
                {ICONS[d.platform]} {d.platform.toUpperCase()}
              </span>
              <span style={{ color:'#f8f8f2', fontSize:'0.75rem' }}>{d.pct}% ({d.views.toLocaleString()})</span>
            </div>
            <div style={{ background:'#282a36', borderRadius:4, height:8, overflow:'hidden' }}>
              <div style={{ width:`${d.pct}%`, height:'100%', background:`linear-gradient(90deg, ${COLORS[d.platform]}88, ${COLORS[d.platform]})`, borderRadius:4,
                boxShadow:`0 0 8px ${COLORS[d.platform]}44`, transition:'width 0.5s ease' }}/>
            </div>
          </div>
        ))}
      </div>

      {/* AI TITLE OPTIMIZER */}
      <div style={{ color:'#bd93f9', fontSize:'0.7rem', letterSpacing:3, marginBottom:'0.8rem' }}>
        —— AI TITLE OPTIMIZER // AI 標題優化器
      </div>
      <div style={{ background:'#1a1a2e', borderRadius:8, padding:'1.5rem' }}>
        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1rem' }}>
          <input value={titleInput} onChange={e=>setTitleInput(e.target.value)} placeholder="輸入你的影片標題..."
            onKeyDown={e=>e.key==='Enter'&&analyzeTitle()}
            style={{ flex:1, background:'#282a36', border:'1px solid #44475a', borderRadius:6, padding:'0.5rem 0.8rem', color:'#f8f8f2', fontSize:'0.8rem', fontFamily:'inherit' }}/>
          <button onClick={analyzeTitle} style={{ background:'linear-gradient(135deg,#bd93f9,#ff79c6)', border:'none', borderRadius:6, padding:'0.5rem 1.2rem', color:'#f8f8f2', fontSize:'0.75rem', cursor:'pointer', fontFamily:'inherit' }}>
            分析
          </button>
        </div>
        {aiResult && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' }}>
              <div style={{ fontSize:'2.5rem', fontWeight:700, fontFamily:'Rajdhani, monospace',
                color: aiResult.score>=80?'#50fa7b':aiResult.score>=60?'#f1fa8c':'#ff5555' }}>
                {aiResult.score}
              </div>
              <div>
                <div style={{ color:'#6272a4', fontSize:'0.7rem' }}>SEO 分數</div>
                <div style={{ background:'#282a36', borderRadius:4, height:6, width:120, marginTop:4 }}>
                  <div style={{ width:`${aiResult.score}%`, height:'100%', borderRadius:4,
                    background: aiResult.score>=80?'#50fa7b':aiResult.score>=60?'#f1fa8c':'#ff5555' }}/>
                </div>
              </div>
            </div>
            {aiResult.suggestions.map((s,i) => (
              <div key={i} style={{ padding:'0.5rem 0.8rem', background:'#282a36', borderRadius:6, marginBottom:'0.4rem', color:'#f8f8f2', fontSize:'0.75rem', borderLeft:`2px solid ${['#8be9fd','#50fa7b','#ff79c6'][i]}` }}>
                💡 {s}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
