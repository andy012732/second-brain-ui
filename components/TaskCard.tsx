'use client';
// ── Cyberpunk TaskCard v2 ── props interface unchanged ──
import React, { useState } from 'react';
import { Task } from '@/lib/kanban';
import { Paperclip, MessageSquare, Star, Clock, AlertTriangle } from 'lucide-react';

const PRIORITY_STYLE: Record<string, { color: string; label: string }> = {
  critical: { color: '#ff2244', label: 'CRIT' },
  high:     { color: '#ff6600', label: 'HIGH' },
  medium:   { color: '#ffaa00', label: 'MED'  },
  low:      { color: '#4488ff', label: 'LOW'  },
};

const TAG_COLORS: Record<string, string> = {
  urgent:        '#ff2244',
  bug:           '#ff6600',
  feature:       '#00aaff',
  documentation: '#cc44ff',
  design:        '#00ffcc',
};

interface TaskCardProps {
  task: Task;
  onDragStart: (id: string) => void;
  onClick: (task: Task) => void;
}

export default function TaskCard({ task, onDragStart, onClick }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const priority = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.low;

  const now = new Date();
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const daysLeft = due ? Math.ceil((due.getTime() - now.getTime()) / 86400000) : null;
  const isOverdue = daysLeft !== null && daysLeft < 0;
  const isDueSoon = daysLeft !== null && daysLeft >= 0 && daysLeft < 3;

  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('taskId', task.id);
        setIsDragging(true);
        onDragStart(task.id);
      }}
      onDragEnd={() => setIsDragging(false)}
      onClick={() => onClick(task)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered
          ? 'rgba(20,20,28,0.95)'
          : 'rgba(14,14,20,0.8)',
        border: `1px solid ${isHovered ? priority.color + '66' : 'rgba(255,255,255,0.07)'}`,
        borderLeft: `3px solid ${priority.color}`,
        borderRadius: 6,
        padding: '10px 12px',
        cursor: 'grab',
        opacity: isDragging ? 0.35 : 1,
        transform: isHovered && !isDragging ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: isHovered
          ? `0 4px 20px rgba(0,0,0,0.5), 0 0 12px ${priority.color}22`
          : '0 1px 6px rgba(0,0,0,0.3)',
        transition: 'all 0.15s ease',
        userSelect: 'none',
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        position: 'relative',
      }}
    >
      {/* 釘選星 */}
      {task.isPinned && (
        <Star
          size={10}
          fill="#ffaa00"
          color="#ffaa00"
          style={{ position: 'absolute', top: 8, right: 8 }}
        />
      )}

      {/* Priority badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{
          fontSize: 8, fontWeight: 900, letterSpacing: '0.15em',
          color: priority.color,
          background: priority.color + '18',
          border: `1px solid ${priority.color}44`,
          borderRadius: 2,
          padding: '1px 5px',
          lineHeight: 1.6,
        }}>
          {priority.label}
        </span>

        {isOverdue && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 8, color: '#ff2244', fontWeight: 900 }}>
            <AlertTriangle size={9} /> OVERDUE
          </span>
        )}
        {isDueSoon && !isOverdue && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 8, color: '#ffaa00', fontWeight: 700 }}>
            <Clock size={9} /> {daysLeft}d
          </span>
        )}
      </div>

      {/* 標題 */}
      <div style={{
        fontSize: 12, fontWeight: 700,
        color: isHovered ? '#fff' : '#ccc',
        lineHeight: 1.4,
        marginBottom: 8,
        transition: 'color 0.15s',
        paddingRight: task.isPinned ? 16 : 0,
      }}>
        {task.title}
      </div>

      {/* 標籤 */}
      {task.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {task.tags.slice(0, 4).map(tag => (
            <span key={tag} style={{
              fontSize: 8, fontWeight: 700,
              color: TAG_COLORS[tag] ?? '#666',
              background: (TAG_COLORS[tag] ?? '#666') + '18',
              border: `1px solid ${(TAG_COLORS[tag] ?? '#666') + '44'}`,
              borderRadius: 2,
              padding: '1px 5px',
              letterSpacing: '0.1em',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 底部：截止日 + 附件 + 留言 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        {due && !isOverdue && !isDueSoon ? (
          <span style={{ fontSize: 9, color: '#444', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={9} />
            {due.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}
          </span>
        ) : <span />}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {task.attachments.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: '#555' }}>
              <Paperclip size={9} /> {task.attachments.length}
            </span>
          )}
          {task.comments.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: '#555' }}>
              <MessageSquare size={9} /> {task.comments.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
