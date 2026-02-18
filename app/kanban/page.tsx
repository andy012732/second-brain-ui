'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Target, CheckCircle } from 'lucide-react';
import { Task } from '@/lib/kanban';
import CreateTaskModal from '@/components/CreateTaskModal';
import TaskDetailModal from '@/components/TaskDetailModal';
import KanbanColumn from '@/components/KanbanColumn';

const COLUMNS = [
  { id: 'todo', title: '待辦事項', color: 'border-gray-500' },
  { id: 'ongoing', title: '進行中', color: 'border-blue-500' },
  { id: 'pending', title: '等待中', color: 'border-yellow-500' },
  { id: 'review', title: '審核中', color: 'border-purple-500' },
  { id: 'done', title: '已完成', color: 'border-green-500' },
  { id: 'archive', title: '封存', color: 'border-gray-700' },
] as const;

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) { console.error('Fetch failed'); }
  };

  const handleTaskMoved = async (taskId: string, newStatus: string, newOrder: number) => {
    if (newOrder === -1) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as any, updatedAt: new Date().toISOString() } : t));
    await fetch(`/api/tasks/${taskId}/actions`, {
      method: 'POST',
      body: JSON.stringify({ action: 'move', status: newStatus })
    });
  };

  const updateLocalTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (selectedTask?.id === updatedTask.id) setSelectedTask(updatedTask);
  };

  const doneCount = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="h-full w-full bg-[#030303] text-gray-200 flex flex-col overflow-hidden">
      
      {/* 🟢 頂部統計列 (保持電腦版霸氣，手機版緊湊) */}
      <div className="h-auto md:h-20 px-4 md:px-8 py-4 md:py-0 flex flex-col md:flex-row items-center justify-between border-b border-white/5 bg-[#111] gap-4 md:gap-0 shrink-0">
          <div className="flex gap-6 md:gap-10">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20"><Target className="text-blue-500" size={18} /></div>
                  <div>
                    <div className="text-[8px] md:text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none">Total Intelligence</div>
                    <div className="text-lg md:text-xl font-mono font-bold leading-tight tabular-nums">{tasks.length}</div>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-xl border border-green-500/20"><CheckCircle className="text-green-500" size={18} /></div>
                  <div>
                    <div className="text-[8px] md:text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none">Successful Ops</div>
                    <div className="text-lg md:text-xl font-mono font-bold leading-tight text-white tabular-nums">{doneCount}</div>
                  </div>
              </div>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full md:w-auto bg-[#0055ff] hover:bg-blue-500 text-white font-black text-[9px] md:text-[10px] px-6 py-2.5 rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)] active:scale-95 tracking-[0.2em] uppercase"
          >
              <Plus size={14} /> <span>發起新任務</span>
          </button>
      </div>

      {/* 🚀 看板區域：核心響應式更新 */}
      <div className="flex-1 overflow-x-auto md:overflow-x-auto p-4 md:p-8 bg-[#030303] flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6 custom-scrollbar">
          {COLUMNS.map(col => (
            <div key={col.id} className="shrink-0 w-full md:w-80">
                <KanbanColumn
                  column={col}
                  tasks={tasks.filter(t => t.status === col.id)}
                  onTaskMoved={handleTaskMoved}
                  onTaskClick={setSelectedTask}
                  onRefresh={fetchTasks}
                />
            </div>
          ))}
      </div>

      {isCreateModalOpen && <CreateTaskModal onClose={() => setIsCreateModalOpen(false)} onTaskCreated={(newTask: Task) => {
          if (newTask) setTasks(prev => [newTask, ...prev]);
          setIsCreateModalOpen(false);
      }} />}
      
      {selectedTask && <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onTaskUpdated={(updated: Task) => updateLocalTask(updated)} 
      />}
    </div>
  );
}
