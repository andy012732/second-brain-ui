'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Target, CheckCircle, Zap, Clock } from 'lucide-react';
import { Task } from '@/lib/kanban';
import CreateTaskModal from '@/components/CreateTaskModal';
import TaskDetailModal from '@/components/TaskDetailModal';
import KanbanColumn from '@/components/KanbanColumn';

const COLUMNS = [
  { id: 'todo',    title: '待辦事項', label: 'TODO',    neon: '#888',   glow: 'rgba(150,150,150,0.15)' },
  { id: 'ongoing', title: '進行中',  label: 'ACTIVE',  neon: '#00aaff', glow: 'rgba(0,170,255,0.15)' },
  { id: 'pending', title: '等待中',  label: 'PENDING', neon: '#ffaa00', glow: 'rgba(255,170,0,0.15)' },
  { id: 'review',  title: '審核中',  label: 'REVIEW',  neon: '#cc44ff', glow: 'rgba(204,68,255,0.15)' },
  { id: 'done',    title: '已完成',  label: 'DONE',    neon: '#00ff88', glow: 'rgba(0,255,136,0.15)' },
  { id: 'archive', title: '封存',    label: 'ARCHIVE', neon: '#444',   glow: 'rgba(80,80,80,0.1)' },
] as const;

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); fetchTasks(); }, []);

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

  const activeCount = tasks.filter(t => t.status === 'ongoing').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;
  const completionRate = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;
  const overdueCount = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done' && t.status !== 'archive').length;

  return (
    <div style={{
      height: '100%', width: '100%',
      background: '#050507',
      color: '#ccc',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    }}>

      {/* ── 頂部統計列 ── */}
      <div style={{
        padding: '0 32px',
        height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(10,10,14,0.95)',
        backdropFilter: 'blur(10px)',
        flexShrink: 0,
        gap: 16,
      }}>
        {/* 左：統計數字 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <StatPill icon={<Target size={14} />} label="TOTAL" value={tasks.length} color="#00aaff" />
          <StatPill icon={<Zap size={14} />} label="ACTIVE" value={activeCount} color="#ffaa00" />
          <StatPill icon={<CheckCircle size={14} />} label="DONE" value={doneCount} color="#00ff88" />
          {overdueCount > 0 && (
            <StatPill icon={<Clock size={14} />} label="OVERDUE" value={overdueCount} color="#ff4444" pulse />
          )}
          {/* 完成率進度條 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 9, fontWeight: 900, color: '#555', letterSpacing: '0.2em' }}>COMPLETION</span>
            <div style={{ width: 80, height: 4, background: '#1a1a1a', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${completionRate}%`,
                background: 'linear-gradient(90deg, #00aaff, #00ff88)',
                transition: 'width 0.8s ease',
                boxShadow: '0 0 8px rgba(0,255,136,0.5)',
              }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 900, color: '#00ff88', fontVariantNumeric: 'tabular-nums' }}>
              {completionRate}%
            </span>
          </div>
        </div>

        {/* 右：新增按鈕 */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            background: 'transparent',
            border: '1px solid #00aaff',
            color: '#00aaff',
            fontSize: 10, fontWeight: 900,
            letterSpacing: '0.2em',
            padding: '8px 20px',
            borderRadius: 4,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.2s',
            boxShadow: '0 0 12px rgba(0,170,255,0.2), inset 0 0 12px rgba(0,170,255,0.05)',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,170,255,0.1)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(0,170,255,0.4), inset 0 0 16px rgba(0,170,255,0.1)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(0,170,255,0.2), inset 0 0 12px rgba(0,170,255,0.05)';
          }}
        >
          <Plus size={13} /> 發起任務
        </button>
      </div>

      {/* ── 看板主區域 ── */}
      <div style={{
        flex: 1,
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: '24px 32px',
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
      }}>
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

      {isCreateModalOpen && (
        <CreateTaskModal
          onClose={() => setIsCreateModalOpen(false)}
          onTaskCreated={(newTask: Task) => {
            if (newTask) setTasks(prev => [newTask, ...prev]);
            setIsCreateModalOpen(false);
          }}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={(updated: Task) => updateLocalTask(updated)}
        />
      )}
    </div>
  );
}

// ── 小統計元件 ──
function StatPill({ icon, label, value, color, pulse }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  pulse?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        color, display: 'flex', alignItems: 'center',
        animation: pulse ? 'pulse 1.5s ease-in-out infinite' : undefined,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.2em', fontWeight: 900, lineHeight: 1 }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 900, color, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }`}</style>
    </div>
  );
}
