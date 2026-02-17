'use client';

import React, { useState } from 'react';
import { Task } from '@/lib/kanban';
import { Calendar, MessageSquare, Paperclip, Flag, Pin, MoreVertical, Clock } from 'lucide-react';
import TaskDetailModal from './TaskDetailModal';

interface TaskCardProps {
  task: Task;
  onTaskMoved: (taskId: string, newStatus: string, newOrder: number) => void;
  onTaskUpdated: () => void;
  onDrop: (droppedTaskId: string, targetTaskId: string) => void;
  index: number;
  totalTasks: number;
}

const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: 'bg-blue-900/30', text: 'text-blue-300', border: 'border-blue-700' },
  medium: { bg: 'bg-yellow-900/30', text: 'text-yellow-300', border: 'border-yellow-700' },
  high: { bg: 'bg-orange-900/30', text: 'text-orange-300', border: 'border-orange-700' },
  critical: { bg: 'bg-red-900/30', text: 'text-red-300', border: 'border-red-700' },
};

export default function TaskCard({
  task,
  onTaskMoved,
  onTaskUpdated,
  onDrop,
  index,
  totalTasks,
}: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const priority = priorityColors[task.priority] || priorityColors.medium;

  // 檢查是否逾期
  const getDueDateStatus = () => {
    if (!task.dueDate) return null;
    
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-400', bg: 'bg-red-900/30' };
    if (diffDays <= 3) return { text: `Due in ${diffDays}d`, color: 'text-yellow-400', bg: 'bg-yellow-900/30' };
    return null;
  };

  const dueStatus = getDueDateStatus();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('oldStatus', task.status);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedTaskId = e.dataTransfer.getData('taskId');
    if (droppedTaskId && droppedTaskId !== task.id) {
      onDrop(droppedTaskId, task.id);
    }
  };

  const handlePinToggle = async () => {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !task.isPinned }),
      });
      onTaskUpdated();
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  return (
    <>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => setIsDetailModalOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          bg-gray-900 border ${priority.border} rounded-lg p-3 cursor-pointer
          transition-all duration-200
          ${isDragging ? 'opacity-50' : 'opacity-100'}
          ${isHovered ? 'shadow-lg transform -translate-y-1' : 'shadow'}
          hover:border-gray-600
        `}
      >
        {/* 標題與操作 */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-200 text-sm flex-1 pr-2">
            {task.title}
          </h3>
          <div className="flex items-center gap-1">
            {task.isPinned && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePinToggle();
                }}
                className="p-1 text-yellow-400 hover:text-yellow-300"
                title="Unpin"
              >
                <Pin size={12} fill="currentColor" />
              </button>
            )}
            <div className="relative group">
              <Flag
                size={12}
                className={priority.text}
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-xs text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {task.priority} priority
              </div>
            </div>
          </div>
        </div>

        {/* 描述預覽 */}
        {task.description && (
          <p className="text-gray-400 text-xs mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* 標籤 */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="text-gray-500 text-xs px-1">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 元數據 */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center gap-3">
            {/* 截止日期 */}
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span className={dueStatus?.color || 'text-gray-400'}>
                  {new Date(task.dueDate).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                </span>
                {dueStatus && (
                  <span className={`${dueStatus.bg} ${dueStatus.color} px-1.5 py-0.5 rounded text-xs ml-1`}>
                    {dueStatus.text}
                  </span>
                )}
              </div>
            )}

            {/* 留言數量 */}
            {task.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare size={12} />
                <span>{task.comments.length}</span>
              </div>
            )}

            {/* 附件數量 */}
            {task.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip size={12} />
                <span>{task.attachments.length}</span>
              </div>
            )}
          </div>

          {/* 建立時間 */}
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>
              {new Date(task.createdAt).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* 任務詳情 Modal */}
      {isDetailModalOpen && (
        <TaskDetailModal
          task={task}
          onClose={() => setIsDetailModalOpen(false)}
          onTaskUpdated={onTaskUpdated}
        />
      )}
    </>
  );
}