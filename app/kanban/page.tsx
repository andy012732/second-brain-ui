'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Target, CheckCircle, BarChart2 } from 'lucide-react';
import { Task } from '@/lib/kanban';
import CreateTaskModal from '@/components/CreateTaskModal';
import KanbanColumn from '@/components/KanbanColumn';

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

  const handleTaskMoved = async (taskId: string, newStatus: string, newOrder: number) => {
    // 如果是開始拖動，先記錄 ID
    if (newOrder === -1) {
      setDraggedId(taskId);
      return;
    }

    // 如果是放下
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // 樂觀更新
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));

    await fetch(`/api/tasks/${taskId}/actions`, {
      method: 'POST',
      body: JSON.stringify({ action: 'move', status: newStatus })
    });
    setDraggedId(null);
  };

  const doneCount = tasks.filter(t => t.status === 'done').length;
  const completionRate = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div className="h-screen w-full bg-[#0a0a0a] flex flex-col overflow-hidden text-gray-200">
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
            className="group relative bg-[#0055ff] hover:bg-blue-500 text-white font-black text-[10px] px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:scale-105 active:scale-95 tracking-[0.1em] uppercase"
          >
              <Plus size={16} /> <span>New Task</span>
          </button>
      </div>

      <div className="flex-1 overflow-x-auto p-8 bg-[#0a0a0a]">
        <div className="flex gap-6 h-full min-w-max">
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={tasks.filter(t => t.status === col.id)}
              onTaskMoved={handleTaskMoved}
              onRefresh={fetchTasks}
            />
          ))}
        </div>
      </div>

      {isModalOpen && <CreateTaskModal onClose={() => setIsModalOpen(false)} onTaskCreated={() => { setIsModalOpen(false); fetchTasks(); }} />}
    </div>
  );
}
