'use client';

import React, { useState } from 'react';
import { X, Calendar, Flag, Plus, Tag, ChevronDown, Star } from 'lucide-react';
import { Task } from '@/lib/kanban';

interface CreateTaskModalProps {
  onClose: () => void;
  onTaskCreated: (task: Task) => void; // 🟢 修正：傳回新建立的任務資料
}

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-blue-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' },
];

export default function CreateTaskModal({ onClose, onTaskCreated }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [selectedTags, setSelectedTags] = useState<string[]>(['feature']);
  const [dueDate, setDueDate] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority, tags: selectedTags, dueDate, isPinned }),
      });
      if (res.ok) {
        const newTask = await res.json();
        onTaskCreated(newTask); // 🟢 順利將資料送回
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#161616] rounded-3xl border border-white/10 w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
        
        <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0 bg-[#161616]">
          <div>
            <h2 className="text-xl font-black text-white tracking-widest uppercase">New Mission</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Command Center / Deployment</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest pl-1">Task Identification</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold placeholder:text-gray-700 focus:outline-none focus:border-blue-500/50 transition-all text-lg"
                placeholder="What is the mission?"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Priority Level</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 outline-none cursor-pointer"
                  >
                    {priorityOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-[#111]">{opt.label}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Deadline</label>
                  <input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200"
                  />
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Task Intelligence</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-gray-300 placeholder:text-gray-700 min-h-[120px] focus:outline-none"
                placeholder="Drop the tactical details here..."
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                    <Star size={16} className={isPinned ? 'text-yellow-500 fill-current' : 'text-gray-600'} />
                    <span className="text-sm font-bold text-gray-400">Pin to Command Center</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isPinned ? 'bg-yellow-500' : 'bg-gray-800'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPinned ? 'left-7' : 'left-1'}`} />
                </button>
            </div>
          </div>

          <div className="p-6 border-t border-white/5 bg-[#161616] flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-xs font-black text-gray-500 hover:text-white uppercase tracking-widest transition-all"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="bg-[#0055ff] hover:bg-blue-500 text-white font-black text-xs px-8 py-3 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all"
            >
              {isLoading ? 'DEPLOYING...' : 'INITIATE TASK'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
