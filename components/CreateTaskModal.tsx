'use client';

import React, { useState } from 'react';
import { X, Star, Plus } from 'lucide-react';
import { Task } from '@/lib/kanban';

interface CreateTaskModalProps {
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
}

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const TAG_COLORS: Record<string, string> = {
  'feature': '#4488ff',
  'bug': '#ff2244',
  'claude-code': '#00ff88',
  'auto': '#cc44ff',
  'urgent': '#ff6600',
};

function tagColor(tag: string) {
  return TAG_COLORS[tag] ?? '#888';
}

export default function CreateTaskModal({ onClose, onTaskCreated }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addTag = (value: string) => {
    const trimmed = value.trim().toLowerCase().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority, tags, dueDate, isPinned }),
      });
      if (res.ok) {
        const newTask = await res.json();
        onTaskCreated(newTask);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const font = '"JetBrains Mono", monospace';

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 100, padding: 16, fontFamily: font,
    }}>
      <div style={{
        background: '#0a0a0e', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, width: '100%', maxWidth: 520,
        boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '0.15em' }}>NEW MISSION</div>
            <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.2em', marginTop: 3 }}>COMMAND CENTER / DEPLOYMENT</div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 6, padding: 7, color: '#666', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
          }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Title */}
            <div>
              <div style={{ fontSize: 9, color: '#4488ff', letterSpacing: '0.2em', fontWeight: 900, marginBottom: 8 }}>TASK IDENTIFICATION</div>
              <input
                type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="What is the mission?" autoFocus
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                  padding: '12px 14px', color: '#fff', fontSize: 14, fontWeight: 700,
                  outline: 'none', fontFamily: font, boxSizing: 'border-box',
                }}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#4488ff55'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            {/* Priority + Deadline */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.2em', fontWeight: 900, marginBottom: 8 }}>PRIORITY LEVEL</div>
                <select value={priority} onChange={e => setPriority(e.target.value)} style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                  padding: '10px 12px', color: '#ccc', fontSize: 12,
                  outline: 'none', fontFamily: font, cursor: 'pointer',
                }}>
                  {priorityOptions.map(opt => (
                    <option key={opt.value} value={opt.value} style={{ background: '#0a0a0e' }}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.2em', fontWeight: 900, marginBottom: 8 }}>DEADLINE</div>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                  padding: '10px 12px', color: '#ccc', fontSize: 12,
                  outline: 'none', fontFamily: font, boxSizing: 'border-box',
                }} />
              </div>
            </div>

            {/* Description */}
            <div>
              <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.2em', fontWeight: 900, marginBottom: 8 }}>TASK INTELLIGENCE</div>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Drop the tactical details here..." rows={4}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                  padding: '12px 14px', color: '#ccc', fontSize: 13,
                  outline: 'none', resize: 'vertical', fontFamily: font,
                  lineHeight: 1.6, boxSizing: 'border-box',
                }} />
            </div>

            {/* Tags */}
            <div>
              <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.2em', fontWeight: 900, marginBottom: 8 }}>
                TAGS <span style={{ color: '#333', fontWeight: 400 }}>— Enter / 空白鍵確認</span>
              </div>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, padding: '8px 12px', minHeight: 44,
              }}>
                {tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: 10, fontWeight: 700,
                    color: tagColor(tag),
                    background: tagColor(tag) + '18',
                    border: `1px solid ${tagColor(tag)}44`,
                    borderRadius: 4, padding: '2px 8px',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: tagColor(tag), padding: 0, fontSize: 11, lineHeight: 1,
                    }}>×</button>
                  </span>
                ))}
                <input
                  type="text" value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => tagInput.trim() && addTag(tagInput)}
                  placeholder={tags.length === 0 ? 'feature, bug, claude-code...' : ''}
                  style={{
                    background: 'none', border: 'none', outline: 'none',
                    color: '#ccc', fontSize: 12, fontFamily: font,
                    minWidth: 120, flex: 1,
                  }}
                />
              </div>
              {/* 快速 Tag */}
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {['feature', 'bug', 'claude-code', 'urgent'].map(preset => (
                  !tags.includes(preset) && (
                    <button key={preset} type="button" onClick={() => addTag(preset)} style={{
                      fontSize: 9, color: tagColor(preset),
                      background: tagColor(preset) + '12',
                      border: `1px solid ${tagColor(preset)}33`,
                      borderRadius: 3, padding: '2px 8px', cursor: 'pointer',
                      fontFamily: font, fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 3,
                    }}>
                      <Plus size={8} />#{preset}
                    </button>
                  )
                ))}
              </div>
            </div>

            {/* Pin */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Star size={14} style={{ color: isPinned ? '#ffaa00' : '#444' }} />
                <span style={{ fontSize: 12, color: '#666' }}>Pin to Command Center</span>
              </div>
              <button type="button" onClick={() => setIsPinned(!isPinned)} style={{
                width: 44, height: 24, borderRadius: 12,
                background: isPinned ? '#ffaa00' : 'rgba(255,255,255,0.08)',
                border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
              }}>
                <div style={{
                  position: 'absolute', top: 4, width: 16, height: 16,
                  background: '#fff', borderRadius: '50%', transition: 'all 0.2s',
                  left: isPinned ? 24 : 4,
                }} />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0,
          }}>
            <button type="button" onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 10, fontWeight: 900, color: '#444', letterSpacing: '0.2em',
              fontFamily: font, padding: '10px 16px',
            }}>ABORT</button>
            <button type="submit" disabled={isLoading || !title.trim()} style={{
              background: title.trim() ? '#4488ff' : 'rgba(255,255,255,0.06)',
              border: 'none', borderRadius: 8, padding: '10px 24px',
              color: title.trim() ? '#fff' : '#333',
              fontSize: 10, fontWeight: 900, letterSpacing: '0.2em',
              cursor: title.trim() ? 'pointer' : 'default',
              fontFamily: font, transition: 'all 0.15s',
              boxShadow: title.trim() ? '0 0 20px rgba(68,136,255,0.3)' : 'none',
            }}>
              {isLoading ? 'DEPLOYING...' : 'INITIATE TASK'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
