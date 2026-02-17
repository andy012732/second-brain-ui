'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Target, CheckCircle, BarChart2 } from 'lucide-react';
import { Task } from '@/lib/kanban';
import CreateTaskModal from '@/components/CreateTaskModal';
import TaskCard from '@/components/TaskCard';

const COLUMNS = [
  { id: 'todo', title: 'Todo', color: 'border-gray-500' },
  { id: 'ongoing', title: 'Ongoing', color: 'border-blue-500' },
  { id: 'pending', title: 'Pending', color: 'border-yellow-500' },
  { id: 'review', title: 'Review', color: 'border-purple-500' },
  { id: 'done', title: 'Done', color: 'border-green-500' },
  { id: 'archive', title: 'Archive', color: 'border-gray-700' },
] as const;

type ColumnId = typeof COLUMNS[number]['id'];

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) { console.error('Fetch failed'); }
  };

  const onDragStart = (id: string) => setDraggedId(id);
  
  const onDrop = async (status: ColumnId) => {
    if (!draggedId) return;
    const task = tasks.find(t => t.id === draggedId);
    if (!task || task.status === status) return;

    setTasks(prev => prev.map(t => t.id === draggedId ? { ...t, status } : t));
    await fetch(`/api/tasks/${draggedId}/actions`, {
      method: 'POST',
      body: JSON.stringify({ action: 'move', status })
    });
    setDraggedId(null);
  };

  const doneCount = tasks.filter(t => t.status === 'done').length;
  const completionRate = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div className="h-screen w-full bg-[#0a0a0a] flex flex-col overflow-hidden text-gray-200">
      {/* 強化版統計列 */}
      <div className="h-20 px-8 flex items-center justify-between border-b border-gray-800 bg-[#111]">
          <div className="flex gap-10">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg"><Target className="text-blue-500" size={18} /></div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Total Tasks</div>
                    <div className="text-lg font-mono font-bold leading-tight">{tasks.length}</div>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg"><CheckCircle className="text-green-500" size={18} /></div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Completed</div>
                    <div className="text-lg font-mono font-bold leading-tight text-green-50">{doneCount}</div>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg"><BarChart2 className="text-purple-500" size={18} /></div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Progress</div>
                    <div className="text-lg font-mono font-bold leading-tight text-purple-400">{completionRate}%</div>
                  </div>
              </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group relative bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95"
          >
              <Plus size={20} /> <span>New Task</span>
          </button>
      </div>

      <div className="flex-1 overflow-x-auto p-8 bg-[#0a0a0a]">
        <div className="flex gap-6 h-full min-w-max">
          {COLUMNS.map(col => (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(col.id)}
              className="w-80 flex flex-col bg-[#111]/50 rounded-2xl border border-gray-800/30 backdrop-blur-sm"
            >
              <div className={`p-4 border-b-2 ${col.color} bg-[#161616]/50 rounded-t-2xl flex justify-between items-center`}>
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{col.title}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-gray-600 px-2 py-0.5 bg-black/40 rounded-full border border-white/5">
                    {tasks.filter(t => t.status === col.id).length}
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {tasks.filter(t => t.status === col.id).map(task => (
                  <TaskCard key={task.id} task={task} onDragStart={onDragStart} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && <CreateTaskModal onClose={() => setIsModalOpen(false)} onTaskCreated={() => { setIsModalOpen(false); fetchTasks(); }} />}
    </div>
  );
}
