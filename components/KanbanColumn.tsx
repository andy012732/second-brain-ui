'use client';

import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Task } from '@/lib/kanban';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ColumnDef {
  id: string;
  title: string;
  label: string;
  neon: string;
  glow: string;
}

interface KanbanColumnProps {
  column: ColumnDef;
  tasks: Task[];
  onTaskMoved: (taskId: string, newStatus: string, newOrder: number) => void;
  onTaskClick: (task: Task) => void;
  onRefresh: () => void;
}

export default function KanbanColumn({ column, tasks, onTaskMoved, onTaskClick }: KanbanColumnProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  const handleDragLeave = () => setIsDraggingOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) onTaskMoved(taskId, column.id, tasks.length);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        width: 272,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: isDraggingOver
          ? `linear-gradient(180deg, ${column.glow} 0%, rgba(10,10,14,0.9) 100%)`
          : 'rgba(10,10,14,0.7)',
        border: `1px solid ${isDraggingOver ? column.neon : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 8,
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        boxShadow: isDraggingOver
          ? `0 0 24px ${column.glow}, 0 0 60px ${column.glow}`
          : '0 2px 20px rgba(0,0,0,0.4)',
        maxHeight: 'calc(100vh - 140px)',
      }}
    >
      {/* 欄位標題 */}
      <div style={{
        padding: '12px 14px',
        borderBottom: `1px solid rgba(255,255,255,0.05)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: `linear-gradient(135deg, rgba(10,10,14,0.9) 0%, ${column.glow} 100%)`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* 霓虹點 */}
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: column.neon,
            boxShadow: `0 0 6px ${column.neon}, 0 0 12px ${column.neon}`,
          }} />
          <span style={{
            fontSize: 9, fontWeight: 900,
            color: column.neon,
            letterSpacing: '0.25em',
            textShadow: `0 0 8px ${column.neon}`,
            fontFamily: '"JetBrains Mono", monospace',
          }}>
            {column.label}
          </span>
          <span style={{
            fontSize: 8, color: '#444',
            letterSpacing: '0.1em',
          }}>
            {column.title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* 任務數量 */}
          <span style={{
            fontSize: 10, fontWeight: 900,
            color: tasks.length > 0 ? column.neon : '#333',
            background: tasks.length > 0 ? column.glow : 'transparent',
            border: `1px solid ${tasks.length > 0 ? column.neon + '44' : '#222'}`,
            borderRadius: 3,
            padding: '1px 7px',
            fontFamily: 'monospace',
            transition: 'all 0.3s',
          }}>
            {tasks.length}
          </span>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ color: '#444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 2 }}
          >
            {isCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </button>
        </div>
      </div>

      {/* 卡片列表 */}
      {!isCollapsed && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          minHeight: 120,
        }}>
          {sortedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              
              onDragStart={(id) => onTaskMoved(id, column.id, -1)}
              onClick={onTaskClick}
            />
          ))}

          {sortedTasks.length === 0 && (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 80,
              border: `1px dashed rgba(255,255,255,0.06)`,
              borderRadius: 6,
              margin: '4px 0',
            }}>
              <span style={{ fontSize: 9, color: '#333', letterSpacing: '0.2em', fontWeight: 700 }}>
                EMPTY
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
