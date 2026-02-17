'use client';

import React from 'react';
import { Calendar, MessageSquare, Star, Paperclip, Clock } from 'lucide-react';
import { Task } from '@/lib/kanban';

interface TaskCardProps {
  task: Task;
  onDragStart: (id: string) => void;
}

const priorityColors: Record<string, string> = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

export default function TaskCard({ task, onDragStart }: TaskCardProps) {
  // 到期日邏輯處理
  const getDueStatus = () => {
    if (!task.dueDate) return null;
    const now = new Date();
    const due = new Date(task.dueDate);
    const diffDays = (due.getTime() - now.getTime()) / (1000 * 3600 * 24);
    
    if (diffDays < 0) return { label: 'Overdue', color: 'text-red-500' };
    if (diffDays <= 3) return { label: 'Due soon', color: 'text-yellow-500' };
    return { label: null, color: 'text-gray-500' };
  };

  const dueStatus = getDueStatus();

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      className="bg-[#1e1e1e] p-4 rounded-xl border border-gray-800 mb-3 cursor-grab active:cursor-grabbing hover:border-gray-500 transition-all shadow-lg group relative"
    >
      {/* 釘選星號 */}
      {task.isPinned && (
        <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1 shadow-md">
          <Star size={10} className="text-black fill-current" />
        </div>
      )}

      {/* 標題與優先級 */}
      <div className="flex items-start gap-2 mb-3">
        <div className={`w-1.5 h-6 rounded-full shrink-0 ${priorityColors[task.priority] || 'bg-gray-500'}`} />
        <h3 className="text-sm font-bold text-gray-200 line-clamp-2 leading-tight">{task.title}</h3>
      </div>
      
      {/* 標籤區 */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {task.tags?.map((tag: string) => (
          <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-gray-900 border border-gray-700 text-gray-400 font-medium">#{tag}</span>
        ))}
      </div>

      {/* 底部數據列 */}
      <div className="flex items-center justify-between border-t border-gray-800/50 pt-3 text-[10px]">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div className={`flex items-center gap-1 font-semibold ${dueStatus?.color}`}>
              <Clock size={11} />
              <span>{dueStatus?.label || new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-gray-500">
          {task.attachments?.length > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip size={11} />
              <span>{task.attachments.length}</span>
            </div>
          )}
          {task.comments?.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare size={11} />
              <span>{task.comments.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
