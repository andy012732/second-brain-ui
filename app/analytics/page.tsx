'use client';

import React, { useState } from 'react';
import { Youtube, TrendingUp, ArrowUpRight, ArrowDownRight, Zap, Target, MessageSquare, ThumbsUp, Users, MousePointer2 } from 'lucide-react';

const mono = { fontFamily: "'Share Tech Mono', monospace" } as const;
const orb  = { fontFamily: "'Orbitron', monospace" }        as const;

export default function ContentAnalytics() {
  const [titleInput, setTitleInput] = useState('');

  const kpis = [
    { label:'YouTube 訂閱', value:'12,400', grow:'+12%', up:true,  color:'#ff006e', icon:<Youtube size={16}/> },
    { label:'GA4 使用者',   value:'45,230', grow:'+8.5%',up:true,  color:'#00f5ff', icon:<Users size={16}/> },
    { label:'GSC 總點擊',   value:'8,120',  grow:'-2.1%',up:false, color:'#ff6b00', icon:<MousePointer2 size={16}/> },
    { label:'內容健康度',   value:'92/100', grow:'STABLE',up:true, color:'#00ff88', icon:<Zap size={16}/> },
  ];

  const videos = [
    { title:'GyberPass 十大必用功能完整導覽', views:'2.4萬', engagement:'98%', date:'2天前' },
    { title:'為什麼騎士都需要一件好的飆鋒衣？', views:'1.8萬', engagement:'92%', date:'5天前' },
  ];

  const platforms = [
    { name:'INSTAGRAM', pct:62, color:'#00f5ff' },
    { name:'YOUTUBE',   pct:24, color:'#ff006e' },
    { name:'THREADS',   pct:14, color:'#00ff88' },
  ];

  return (
    <div className="h-full w-full overflow-y-auto p-4 md:p-8 flex flex-col gap-6"
      style={{ background:'#020409', color:'#c8e6f5', position:'relative', zIndex:1 }}>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} style={{
            background:'#0d1f3c', border:'1px solid rgba(0,245,255,0.1)',
            borderLeft:`3px solid ${k.color}`, padding:'16px 20px',
          }}>
            <div className="flex justify-between items-start mb-3">
              <div style={{ color:k.color }}>{k.icon}</div>
              <div className="flex items-center gap-1"
                style={{ ...mono, fontSize:9, color: k.up ? '#00ff88':'#ff006e' }}>
                {k.grow} {k.up ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
              </div>
            </div>
            <div style={{ ...mono, fontSize:8, color:'#2a6080', letterSpacing:2,
              textTransform:'uppercase', marginBottom:4 }}>{k.label}</div>
            <div style={{ ...orb, fontSize:22, fontWeight:700, color:k.color,
              textShadow:`0 0 14px ${k.color}60` }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">

        {/* Left: Videos */}
        <section className="md:col-span-8 flex flex-col gap-4">
          <div style={{ ...mono, fontSize:9, color:'#2a6080', letterSpacing:3,
            display:'flex', alignItems:'center', gap:6 }}>
            <TrendingUp size={11} style={{ color:'#ff006e' }}/> 爆款影片分析
          </div>
          {videos.map((v,i) => (
            <div key={i} style={{
              background:'#0a1628', border:'1px solid rgba(0,245,255,0.1)',
              padding:'16px 20px', display:'flex', alignItems:'center', gap:16,
            }}>
              <div style={{
                width:100, height:60, background:'#060d1a', flexShrink:0,
                border:'1px solid rgba(0,245,255,0.1)', display:'flex',
                alignItems:'center', justifyContent:'center',
                color:'rgba(0,245,255,0.15)',
              }}>
                <Youtube size={24}/>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm mb-2" style={{ color:'#e0f4ff' }}>{v.title}</h3>
                <div className="flex gap-6">
                  <span style={{ ...mono, fontSize:9, color:'#2a6080', display:'flex', alignItems:'center', gap:4 }}>
                    <ThumbsUp size={10}/> {v.views}
                  </span>
                  <span style={{ ...mono, fontSize:9, color:'#2a6080', display:'flex', alignItems:'center', gap:4 }}>
                    <MessageSquare size={10}/> {v.engagement} 互動
                  </span>
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ ...mono, fontSize:9, color:'#1a3a50', marginBottom:4 }}>{v.date}</div>
                <span style={{ ...mono, fontSize:8, padding:'2px 8px',
                  background:'rgba(255,0,110,0.08)', color:'#ff006e',
                  border:'1px solid rgba(255,0,110,0.25)' }}>TRENDING</span>
              </div>
            </div>
          ))}
        </section>

        {/* Right: Title Optimizer + Platform */}
        <section className="md:col-span-4 flex flex-col gap-4">

          {/* Platform distribution */}
          <div style={{ background:'#0a1628', border:'1px solid rgba(0,245,255,0.1)', padding:'20px' }}>
            <div style={{ ...mono, fontSize:9, color:'#2a6080', letterSpacing:3, marginBottom:16 }}>
              平台分布
            </div>
            {platforms.map(p => (
              <div key={p.name} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span style={{ ...mono, fontSize:9, color:'#3a6a8a' }}>{p.name}</span>
                  <span style={{ ...orb, fontSize:10, color:p.color }}>{p.pct}%</span>
                </div>
                <div style={{ height:3, background:'rgba(255,255,255,0.04)' }}>
                  <div style={{ width:`${p.pct}%`, height:'100%', background:p.color,
                    boxShadow:`0 0 6px ${p.color}`, transition:'width 1s ease' }}/>
                </div>
              </div>
            ))}
          </div>

          {/* Title optimizer */}
          <div style={{
            background:'#0a1628', border:'1px solid rgba(255,0,110,0.2)',
            padding:'20px', flex:1,
          }}>
            <div style={{ ...mono, fontSize:9, color:'#ff006e', letterSpacing:3, marginBottom:16,
              display:'flex', alignItems:'center', gap:6 }}>
              <Target size={11}/> 標題優化大腦
            </div>
            <textarea
              value={titleInput}
              onChange={e => setTitleInput(e.target.value)}
              placeholder="// 輸入預想標題..."
              style={{
                width:'100%', background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(0,245,255,0.1)', color:'#c8e6f5',
                padding:'12px', resize:'none', minHeight:80, outline:'none',
                ...mono, fontSize:11,
              }}
            />
            <button style={{
              width:'100%', marginTop:12, padding:'10px',
              background:'rgba(255,0,110,0.12)', border:'1px solid rgba(255,0,110,0.3)',
              color:'#ff006e', cursor:'pointer', ...mono, fontSize:9, letterSpacing:3,
              textTransform:'uppercase',
            }}>
              ▶ AI 評分與建議
            </button>
            <div style={{ marginTop:16, padding:12,
              border:'1px dashed rgba(0,245,255,0.1)',
              ...mono, fontSize:9, color:'#1a3a50', textAlign:'center' }}>
              // 尚無優化紀錄
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
