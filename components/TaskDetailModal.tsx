'use client';

import React, { useState } from 'react';
import { Task, Comment } from '@/lib/kanban';
import { 
  X, Calendar, MessageSquare, Paperclip, Flag, Pin, Clock, 
  Edit2, Save, Trash2, Download, Send, User, ChevronDown, ChevronUp,
  AlertCircle
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onTaskUpdated: (updatedTask: Task) => void; // 🟢 修正：現在可以傳回更新後的資料了
}

const priorityColors: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-blue-900/30', text: 'text-blue-300' },
  medium: { bg: 'bg-yellow-900/30', text: 'text-yellow-300' },
  high: { bg: 'bg-orange-900/30', text: 'text-orange-300' },
  critical: { bg: 'bg-red-900/30', text: 'text-red-300' },
};

export default function TaskDetailModal({ task, onClose, onTaskUpdated }: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const priority = priorityColors[task.priority] || priorityColors.medium;

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority: task.priority, tags: task.tags, dueDate: task.dueDate }),
      });
      if (res.ok) {
        const updatedData = await res.json();
        onTaskUpdated(updatedData); // 🟢 成功回報！
        setIsEditing(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (actionType: 'archive' | 'delete') => {
    if (actionType === 'delete' && !confirm('確定刪除？')) return;
    try {
      const url = actionType === 'archive' ? `/api/tasks/${task.id}?archive=true` : `/api/tasks/${task.id}`;
      await fetch(url, { method: 'DELETE' });
      window.location.reload(); // 最徹底的刷新
    } catch (e) { console.error(e); }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
      <div className="bg-[#0f0f0f] border border-white/10 rounded-[2rem] w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-6">
                <div className={`${priority.bg} ${priority.text} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-current opacity-70`}>{task.priority}</div>
                <div className="h-4 w-[1px] bg-white/10"></div>
                <div className="flex items-center gap-2 text-gray-500 font-mono text-[10px] uppercase">
                    <Clock size={12} />
                    <span>Updated {new Date(task.updatedAt).toLocaleTimeString()}</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => setIsEditing(!isEditing)} className="p-3 hover:bg-white/5 rounded-2xl text-gray-400 transition-all hover:text-blue-400">
                    {isEditing ? <X size={20} /> : <Edit2 size={20} />}
                </button>
                <button onClick={() => handleAction('archive')} className="p-3 hover:bg-white/5 rounded-2xl text-gray-400 transition-all hover:text-orange-400">
                    <AlertCircle size={20} />
                </button>
                <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
                <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all">
                    <X size={20} />
                </button>
            </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Left Box: Tactics & Details */}
            <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                {isEditing ? (
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Identify</label>
                            <input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-transparent text-4xl font-black text-white outline-none w-full focus:border-b border-blue-500/50 pb-2" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tactical Description</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white/5 border border-white/5 rounded-3xl p-6 text-gray-300 w-full min-h-[300px] outline-none focus:border-blue-500/30 transition-all" />
                        </div>
                        <button onClick={handleSave} disabled={isLoading} className="bg-blue-600 px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl">
                            {isLoading ? 'Syncing...' : 'Sync Changes'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-10">
                        <h1 className="text-5xl font-black text-white tracking-tighter">{task.title}</h1>
                        <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5">
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">{task.description || 'No detailed tactical data available for this mission.'}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Box: Intel (Comments) */}
            <div className="w-96 bg-black/40 border-l border-white/5 p-8 flex flex-col">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                    <MessageSquare size={16} /> 
                    Intel Log
                </h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 mb-4">
                    {task.comments.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-20 italic text-xs">
                            No field reports yet.
                        </div>
                    ) : (
                        task.comments.map(c => (
                            <div key={c.id} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div className="text-[9px] text-blue-400 font-bold mb-1 uppercase tracking-widest">Field Agent</div>
                                <div className="text-sm text-gray-200">{c.content}</div>
                                <div className="text-[8px] text-gray-600 mt-2 font-mono">{new Date(c.createdAt).toLocaleTimeString()}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
