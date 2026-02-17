'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, MessageSquare, Star } from 'lucide-react';
import { Task } from '@/lib/kanban';
import CreateTaskModal from '@/components/CreateTaskModal';

const COLUMNS = [
  { id: 'todo', title: 'Todo', color: 'border-gray-500' },
  { id: 'ongoing', title: 'Ongoing', color: 'border-blue-500' },
  { id: 'pending', title: 'Pending', color: 'border-yellow-500' },
  { id: 'review', title: 'Review', color: 'border-purple-500' },
  { id: 'done', title: 'Done', color: 'border-green-500' },
  { id: 'archive', title: 'Archive', color: 'border-gray-700' },
] as const;

type ColumnId = typeof COLUMNS[number]['id'];

const priorityColors: Record<string, string> = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Fetch failed');
    }
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

  const handleTaskCreated = () => {
    setIsModalOpen(false);
    fetchTasks();
  };

  const renderCard = (task: Task) => (
    <div
      key={task.id}
      draggable
      onDragStart={() => onDragStart(task.id)}
      className="bg-[#1e1e1e] p-3 rounded-lg border border-gray-800 mb-3 cursor-grab active:cursor-grabbing hover:border-gray-600 transition-all shadow-md group"
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority] || 'bg-gray-500'}`} />
        {task.isPinned && <Star size={12} className="text-yellow-500 fill-current" />}
      </div>
      <h3 className="text-sm font-semibold text-gray-200 mb-2">{task.title}</h3>
      
      <div className="flex flex-wrap gap-1 mb-3">
        {task.tags?.map((tag: string) => (
          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 capitalize">{tag}</span>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-500">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <div className="flex items-center gap-0.5">
              <Calendar size={10} />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          {task.comments?.length > 0 && (
            <div className="flex items-center gap-0.5">
              <MessageSquare size={10} />
              <span>{task.comments.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-black flex flex-col overflow-hidden text-gray-200">
      <div className="h-16 px-6 flex items-center justify-between border-b border-gray-800 bg-[#161616]">
          <div className="flex gap-6">
              <div className="text-xs">
                  <span className="text-gray-500">Total: </span>
                  <span className="text-gray-200 font-bold">{tasks.length}</span>
              </div>
              <div className="text-xs">
                  <span className="text-gray-500">Done: </span>
                  <span className="text-green-500 font-bold">{tasks.filter(t => t.status === 'done').length}</span>
              </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
          >
              <Plus size={14} /> New Task
          </button>
      </div>

      <div className="flex-1 overflow-x-auto p-6 bg-black">
        <div className="flex gap-4 h-full min-w-max">
          {COLUMNS.map(col => (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(col.id)}
              className="w-72 flex flex-col bg-[#111] rounded-xl border border-gray-800/50"
            >
              <div className={`p-3 border-b-2 ${col.color} bg-[#161616] rounded-t-xl flex justify-between items-center`}>
                <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider">{col.title}</h2>
                <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-500">{tasks.filter(t => t.status === col.id).length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {tasks.filter(t => t.status === col.id).map(task => renderCard(task))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <CreateTaskModal 
          onClose={() => setIsModalOpen(false)} 
          onTaskCreated={handleTaskCreated} 
        />
      )}
    </div>
  );
}
