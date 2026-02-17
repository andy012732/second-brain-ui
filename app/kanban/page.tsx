'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Target, CheckCircle, BarChart2 } from 'lucide-react';
import { Task } from '@/lib/kanban';
import CreateTaskModal from '@/components/CreateTaskModal';
import TaskDetailModal from '@/components/TaskDetailModal';
import KanbanColumn from '@/components/KanbanColumn';

const COLUMNS = [
  { id: 'todo', title: 'Todo', color: 'border-gray-500' },
  { id: 'ongoing', title: 'Ongoing', color: 'border-blue-500' },
  { id: 'pending', title: 'Pending', color: 'border-yellow-500' },
  { id: 'review', title: 'Review', color: 'border-purple-500' },
  { id: 'done', title: 'Done', color: 'border-green-500' },
  { id: 'archive', title: 'Archive', color: 'border-gray-700' },
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

  // 🚀 優化方案：局部局部狀態更新 (Optimistic Update)
  const handleTaskMoved = async (taskId: string, newStatus: string, newOrder: number) => {
    if (newOrder === -1) return;

    // 1. 立即更新本地 UI (0ms 延遲)
    setTasks(prev => {
      return prev.map(t => t.id === taskId ? { ...t, status: newStatus as any, updatedAt: new Date().toISOString() } : t);
    });

    // 2. 後台靜默同步 GitHub
    try {
      await fetch(`/api/tasks/${taskId}/actions`, {
        method: 'POST',
        body: JSON.stringify({ action: 'move', status: newStatus })
      });
    } catch (e) {
      console.error('Sync failed, rolling back...');
      fetchTasks(); // 失敗才強制刷新
    }
  };

  // 🚀 局部更新任務內容
  const updateLocalTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (selectedTask?.id === updatedTask.id) setSelectedTask(updatedTask);
  };

  const doneCount = tasks.filter(t => t.status === 'done').length;
  const completionRate = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div className="h-screen w-full bg-[#0a0a0a] flex flex-col overflow-hidden text-gray-200 font-sans">
      <div className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#111]">
          <div className="flex gap-10">
              <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20"><Target className="text-blue-500" size={20} /></div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Total Intelligence</div>
                    <div className="text-xl font-mono font-bold leading-tight tabular-nums">{tasks.length}</div>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-500/10 rounded-xl border border-green-500/20"><CheckCircle className="text-green-500" size={20} /></div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Successful Ops</div>
                    <div className="text-xl font-mono font-bold leading-tight text-white tabular-nums">{doneCount}</div>
                  </div>
              </div>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#0055ff] hover:bg-blue-500 text-white font-black text-[10px] px-8 py-3 rounded-full flex items-center gap-2 transition-all shadow-[0_0_40px_rgba(37,99,235,0.2)] hover:scale-105 active:scale-95 tracking-[0.2em] uppercase"
          >
              <Plus size={16} /> <span>Initiate Mission</span>
          </button>
      </div>

      <div className="flex-1 overflow-x-auto p-8 bg-[#0a0a0a] space-x-6 flex">
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={tasks.filter(t => t.status === col.id)}
              onTaskMoved={handleTaskMoved}
              onTaskClick={setSelectedTask}
              onRefresh={fetchTasks}
            />
          ))}
      </div>

      {isCreateModalOpen && <CreateTaskModal onClose={() => setIsCreateModalOpen(false)} onTaskCreated={(newTask) => {
          if (newTask) setTasks(prev => [newTask, ...prev]);
          setIsCreateModalOpen(false);
      }} />}
      
      {selectedTask && <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onTaskUpdated={(updated) => updated ? updateLocalTask(updated) : fetchTasks()} 
      />}
    </div>
  );
}
