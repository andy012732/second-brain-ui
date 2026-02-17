'use client';

import React, { useState } from 'react';
import { 
  BarChart3, Youtube, TrendingUp, Search, 
  ArrowUpRight, ArrowDownRight, Zap, Target,
  MessageSquare, ThumbsUp, Users, MousePointer2
} from 'lucide-react';

export default function ContentAnalytics() {
  const [titleInput, setTitleInput] = useState('');

  return (
    <div className="h-full w-full bg-[#030303] text-gray-400 font-sans p-8 flex flex-col overflow-y-auto selection:bg-purple-500/30">
      
      {/* 🟢 頂部數據卡片 (跨平台總覽) */}
      <div className="grid grid-cols-4 gap-6 mb-10 shrink-0">
        {[
          { label: 'YouTube 訂閱', value: '12,400', grow: '+12%', color: 'rose', icon: <Youtube /> },
          { label: 'GA4 使用者', value: '45,230', grow: '+8.5%', color: 'blue', icon: <Users /> },
          { label: 'GSC 總點擊', value: '8,120', grow: '-2.1%', color: 'orange', icon: <MousePointer2 /> },
          { label: '內容健康度', value: '92/100', grow: 'Stable', color: 'green', icon: <Zap /> },
        ].map((item) => (
          <div key={item.label} className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] shadow-xl group hover:border-white/10 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 bg-${item.color}-500/10 rounded-2xl text-${item.color}-500`}>{item.icon}</div>
                <div className={`flex items-center gap-1 text-[10px] font-black ${item.grow.includes('+') ? 'text-green-500' : 'text-rose-500'}`}>
                    {item.grow} {item.grow.includes('+') ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                </div>
            </div>
            <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-1">{item.label}</div>
            <div className="text-3xl font-black text-white tracking-tighter">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8 flex-1">
        
        {/* 🟢 左側：熱門影片戰情室 */}
        <section className="col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <TrendingUp size={14} className="text-purple-500" /> 爆款影片分析 (Pattern Mining)
            </h2>
            <button className="text-[10px] font-bold text-blue-500 hover:text-white transition-colors">查看完整清冊</button>
          </div>
          
          <div className="space-y-4">
            {[
              { title: 'GyberPass 十大必用功能完整導覽', views: '2.4萬', engagement: '98%', date: '2天前' },
              { title: '為什麼騎士都需要一件好的飆鋒衣？', views: '1.8萬', engagement: '92%', date: '5天前' },
            ].map((vid, idx) => (
              <div key={idx} className="bg-white/[0.02] border border-white/5 p-5 rounded-3xl flex items-center gap-6 group hover:bg-white/[0.04] transition-all">
                <div className="w-32 h-20 bg-gray-900 rounded-xl overflow-hidden shrink-0 border border-white/5 relative group-hover:border-purple-500/30 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-all" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-white mb-2 leading-tight group-hover:text-purple-400 transition-colors">{vid.title}</h3>
                    <div className="flex gap-6">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600"><ThumbsUp size={12}/> {vid.views}</div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600"><MessageSquare size={12}/> {vid.engagement} 互動</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-gray-700 font-bold mb-1 uppercase tracking-tighter">{vid.date}</div>
                    <div className="text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">TRENDING</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 🟢 右側：標題優化器 (Title Optimizer) */}
        <section className="col-span-4 space-y-6">
          <div className="bg-[#0a0a0a] border border-purple-500/20 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Zap size={80} className="text-purple-500" /></div>
            
            <h2 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Target size={16} className="text-purple-500" /> 標題優化大腦
            </h2>
            
            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">輸入預想標題</label>
                    <textarea 
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        placeholder="例如：GyberPass 開箱測試..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all min-h-[100px] resize-none"
                    />
                </div>
                <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-xs py-4 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all uppercase tracking-widest active:scale-95">
                    開始 AI 評分與建議
                </button>
                
                <div className="pt-6 border-t border-white/5">
                    <div className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-4">優化建議紀錄</div>
                    <div className="p-4 bg-white/[0.02] border border-dashed border-white/5 rounded-2xl text-[10px] text-gray-600 italic text-center">
                        尚無優化紀錄，請輸入標題啟動分析儀。
                    </div>
                </div>
            </div>
          </div>
        </section>

      </div>

      <footer className="h-10 mt-10 flex justify-between items-center border-t border-white/5 text-[8px] font-bold text-gray-700 uppercase tracking-[0.2em] shrink-0">
        <div>Analytics Engine v1.0 // Cluster Node Activated</div>
        <div className="flex gap-4">
            <span className="text-purple-500/30">Google APIs Linked</span>
            <span className="text-purple-500/30">YouTube Data Stream: Syncing</span>
        </div>
      </footer>
    </div>
  );
}
