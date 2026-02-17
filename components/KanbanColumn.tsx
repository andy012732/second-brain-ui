'use client';

import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Task } from '@/lib/kanban';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface KanbanColumnProps {
  column: {
    id: string;
    title: string;
    color: string;
  };
  tasks: Task[];
  onTaskMoved: (taskId: string, newStatus: string, newOrder: number) => void;
  onRefresh: () => void;
}

export default function KanbanColumn({
  column,
  tasks,
  onTaskMoved,
  onRefresh,
}: KanbanColumnProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // 排序
  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => setIsDraggingOver(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    onTaskMoved(taskId, column.id, tasks.length);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-80 flex flex-col bg-[#111]/50 rounded-2xl border transition-all ${isDraggingOver ? 'border-blue-500 bg-blue-500/5' : 'border-gray-800/30'} backdrop-blur-sm shadow-xl`}
    >
      <div className={`p-4 border-b-2 ${column.color} bg-[#161616]/50 rounded-t-2xl flex justify-between items-center`}>
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{column.title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-gray-500 px-2 py-0.5 bg-black/40 rounded-full border border-white/5">
            {tasks.length}
          </span>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-600 hover:text-gray-400">
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 min-h-[150px]">
          {sortedTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onDragStart={(id) => onTaskMoved(id, column.id, -1)} // 這裡會傳遞給父層處理
            />
          ))}
          {sortedTasks.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
              <div className="border-2 border-dashed border-gray-600 rounded-xl w-full h-20 flex items-center justify-center">
                <span className="text-[10px] font-bold">DROP HERE</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
