'use client';

import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Task } from '@/lib/kanban';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

interface KanbanColumnProps {
  column: {
    id: string;
    title: string;
    color: string;
  };
  tasks: Task[];
  onTaskMoved: (taskId: string, newStatus: string, newOrder: number) => void;
  onTaskUpdated: () => void;
  onRefresh: () => void;
}

export default function KanbanColumn({
  column,
  tasks,
  onTaskMoved,
  onTaskUpdated,
  onRefresh,
}: KanbanColumnProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // 按照 order 排序任務
  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    const taskId = e.dataTransfer.getData('taskId');
    const oldStatus = e.dataTransfer.getData('oldStatus');
    
    if (!taskId || oldStatus === column.id) return;

    try {
      // 將任務移動到此欄位的最後位置
      const newOrder = tasks.length;
      await fetch(`/api/tasks/${taskId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: column.id, order: newOrder }),
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const handleTaskDrop = (droppedTaskId: string, targetTaskId: string) => {
    // 在同欄位內重新排序
    const targetIndex = sortedTasks.findIndex(task => task.id === targetTaskId);
    if (targetIndex !== -1) {
      onTaskMoved(droppedTaskId, column.id, targetIndex);
    }
  };

  const columnTitleColorMap: Record<string, string> = {
    todo: 'text-gray-300',
    ongoing: 'text-blue-300',
    pending: 'text-yellow-300',
    review: 'text-purple-300',
    done: 'text-green-300',
    archive: 'text-gray-400',
  };

  return (
    <div
      className={`flex-shrink-0 w-80 rounded-lg border ${column.color} ${isDraggingOver ? 'border-blue-500 border-2' : 'border-gray-800'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 欄位標題 */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className={`font-bold ${columnTitleColorMap[column.id] || 'text-gray-300'}`}>
              {column.title}
            </h2>
            <span className="bg-gray-800 text-gray-400 text-xs font-medium px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-gray-800 rounded"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* 任務列表 */}
      <div className={`p-2 ${isCollapsed ? 'hidden' : 'block'}`}>
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <p>No tasks yet</p>
            <p className="text-xs mt-1">Drop tasks here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                onTaskMoved={onTaskMoved}
                onTaskUpdated={onTaskUpdated}
                onDrop={handleTaskDrop}
                index={index}
                totalTasks={sortedTasks.length}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}