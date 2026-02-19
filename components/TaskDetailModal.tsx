'use client';

import React, { useState, useRef } from 'react';
import { Task, Comment, Attachment } from '@/lib/kanban';
import {
  X, MessageSquare, Clock, Edit2, AlertCircle, Send,
  CornerDownRight, Paperclip, Upload, FileText, Image, File
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onTaskUpdated: (updatedTask: Task) => void;
}

const PRIORITY_STYLE: Record<string, { color: string; label: string }> = {
  critical: { color: '#ff2244', label: 'CRITICAL' },
  high:     { color: '#ff6600', label: 'HIGH' },
  medium:   { color: '#ffaa00', label: 'MEDIUM' },
  low:      { color: '#4488ff', label: 'LOW' },
};

function AttachmentIcon({ type }: { type: string }) {
  if (type === 'image') return <Image size={12} />;
  if (type === 'pdf') return <FileText size={12} />;
  return <File size={12} />;
}

function CommentItem({ comment, allComments, onReply, replyingTo }: {
  comment: Comment; allComments: Comment[];
  onReply: (id: string) => void; replyingTo: string | null;
}) {
  const replies = allComments.filter(c => c.parentId === comment.id);
  const isAI = comment.content.startsWith('[AI]');
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        background: isAI ? 'rgba(0,170,255,0.07)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isAI ? 'rgba(0,170,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 8, padding: '10px 12px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', color: isAI ? '#00aaff' : '#888' }}>
            {isAI ? '⚡ AI AGENT' : '👤 FIELD AGENT'}
          </span>
          <span style={{ fontSize: 8, color: '#444', fontFamily: 'monospace' }}>
            {new Date(comment.createdAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div style={{ fontSize: 12, color: '#ccc', lineHeight: 1.6 }}>
          {isAI ? comment.content.replace('[AI] ', '') : comment.content}
        </div>
        <button onClick={() => onReply(comment.id)} style={{
          marginTop: 6, background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 9, color: replyingTo === comment.id ? '#00aaff' : '#555',
          display: 'flex', alignItems: 'center', gap: 4,
          fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.1em', fontWeight: 700, padding: 0,
        }}>
          <CornerDownRight size={10} />
          {replyingTo === comment.id ? 'CANCEL' : 'REPLY'}
        </button>
      </div>
      {replies.length > 0 && (
        <div style={{ marginLeft: 18, marginTop: 6, borderLeft: '1px solid rgba(255,255,255,0.07)', paddingLeft: 12 }}>
          {replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} allComments={allComments} onReply={onReply} replyingTo={replyingTo} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TaskDetailModal({ task, onClose, onTaskUpdated }: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [tags, setTags] = useState<string[]>(task.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(task.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(task.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [comments, setComments] = useState<Comment[]>(task.comments || []);
  const [attachments, setAttachments] = useState<Attachment[]>(task.attachments || []);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'attachments'>('comments');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const p = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.medium;
  const topLevelComments = comments.filter(c => !c.parentId);
  const replyTarget = replyingTo ? comments.find(c => c.id === replyingTo) : null;

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority: task.priority, tags, dueDate: task.dueDate }),
      });
      if (res.ok) { onTaskUpdated(await res.json()); setIsEditing(false); }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handleAction = async (actionType: 'archive' | 'delete') => {
    if (actionType === 'delete' && !confirm('確定刪除？')) return;
    try {
      const url = actionType === 'archive' ? `/api/tasks/${task.id}?archive=true` : `/api/tasks/${task.id}`;
      await fetch(url, { method: 'DELETE' });
      window.location.reload();
    } catch (e) { console.error(e); }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || isSending) return;
    setIsSending(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim(), parentId: replyingTo ?? undefined }),
      });
      if (res.ok) {
        const updated = await res.json();
        setComments(updated.comments ?? []);
        onTaskUpdated(updated);
        setNewComment('');
        setReplyingTo(null);
      }
    } catch (e) { console.error(e); }
    finally { setIsSending(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      // Step 1: 上傳到 Supabase Storage
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) { alert('上傳失敗'); return; }
      const attachment: Attachment = await uploadRes.json();

      // Step 2: 存附件記錄到 DB
      const attachRes = await fetch(`/api/tasks/${task.id}/attachments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attachment),
      });
      if (attachRes.ok) {
        const updated = await attachRes.json();
        setAttachments(updated.attachments ?? []);
        onTaskUpdated(updated);
      }
    } catch (e) { console.error(e); alert('上傳失敗'); }
    finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 16, fontFamily: '"JetBrains Mono", monospace',
    }}>
      <div style={{
        background: '#0a0a0e', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, width: '100%', maxWidth: 900, height: '88vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
      }}>

        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.02)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: p.color,
              background: p.color + '18', border: `1px solid ${p.color}44`, borderRadius: 3, padding: '3px 8px',
            }}>{p.label}</span>
            <span style={{ fontSize: 9, color: '#444', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={10} />{new Date(task.updatedAt).toLocaleString('zh-TW')}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconBtn onClick={() => setIsEditing(!isEditing)} color="#4488ff" title={isEditing ? '取消' : '編輯'}>
              {isEditing ? <X size={16} /> : <Edit2 size={16} />}
            </IconBtn>
            <IconBtn onClick={() => handleAction('archive')} color="#ff6600" title="封存">
              <AlertCircle size={16} />
            </IconBtn>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
            <IconBtn onClick={onClose} color="#888" title="關閉"><X size={16} /></IconBtn>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* 左：任務詳情 */}
          <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 9, color: '#4488ff', letterSpacing: '0.2em', fontWeight: 900, marginBottom: 8 }}>TITLE</div>
                  <input value={title} onChange={e => setTitle(e.target.value)} style={{
                    background: 'transparent', border: 'none', borderBottom: '1px solid #4488ff44',
                    fontSize: 24, fontWeight: 900, color: '#fff', outline: 'none', width: '100%',
                    paddingBottom: 6, fontFamily: 'inherit',
                  }} />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.2em', fontWeight: 900, marginBottom: 8 }}>DESCRIPTION</div>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 8, padding: 16, color: '#ccc', width: '100%', minHeight: 200,
                    outline: 'none', resize: 'vertical', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.7,
                  }} />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.2em', fontWeight: 900, marginBottom: 8 }}>TAGS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '8px 12px', minHeight: 40 }}>
                    {tags.map(tag => (
                      <span key={tag} style={{ fontSize: 10, fontWeight: 700, color: '#4488ff', background: 'rgba(68,136,255,0.1)', border: '1px solid rgba(68,136,255,0.3)', borderRadius: 4, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
                        #{tag}
                        <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4488ff', padding: 0, fontSize: 11 }}>×</button>
                      </span>
                    ))}
                    <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (['Enter',' ',','].includes(e.key)) { e.preventDefault(); const t = tagInput.trim().toLowerCase().replace(/^#/,''); if(t && !tags.includes(t)) setTags([...tags,t]); setTagInput(''); }}}
                      onBlur={() => { const t = tagInput.trim().toLowerCase().replace(/^#/,''); if(t && !tags.includes(t)) setTags([...tags,t]); setTagInput(''); }}
                      placeholder={tags.length===0 ? '輸入 tag，Enter 確認' : ''}
                      style={{ background: 'none', border: 'none', outline: 'none', color: '#ccc', fontSize: 12, fontFamily: 'inherit', minWidth: 100, flex: 1 }} />
                  </div>
                </div>
                <button onClick={handleSave} disabled={isLoading} style={{
                  background: '#4488ff', border: 'none', borderRadius: 6, padding: '10px 24px',
                  color: '#fff', fontSize: 10, fontWeight: 900, letterSpacing: '0.2em',
                  cursor: 'pointer', alignSelf: 'flex-start', opacity: isLoading ? 0.6 : 1, fontFamily: 'inherit',
                }}>
                  {isLoading ? 'SAVING...' : 'SAVE'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1.3, margin: 0 }}>{task.title}</h1>
                {task.tags?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {task.tags.map(tag => (
                      <span key={tag} style={{
                        fontSize: 9, color: '#4488ff', background: 'rgba(68,136,255,0.1)',
                        border: '1px solid rgba(68,136,255,0.3)', borderRadius: 3, padding: '2px 8px', fontWeight: 700,
                      }}>#{tag}</span>
                    ))}
                  </div>
                )}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '20px 24px' }}>
                  <p style={{ color: '#aaa', lineHeight: 1.8, fontSize: 13, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {task.description || '尚未填寫任務描述。'}
                  </p>
                </div>
                {task.dueDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#555' }}>
                    <Clock size={12} />截止：{new Date(task.dueDate).toLocaleDateString('zh-TW')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 右：留言 + 附件 */}
          <div style={{
            width: 320, flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.3)',
          }}>
            {/* Tab */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
              {(['comments', 'attachments'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 9, fontWeight: 900, letterSpacing: '0.15em',
                  color: activeTab === tab ? '#4488ff' : '#444',
                  borderBottom: activeTab === tab ? '2px solid #4488ff' : '2px solid transparent',
                  fontFamily: 'inherit', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  {tab === 'comments'
                    ? <><MessageSquare size={11} /> INTEL <span style={{ color: '#555', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, padding: '0 5px' }}>{comments.length}</span></>
                    : <><Paperclip size={11} /> FILES <span style={{ color: '#555', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, padding: '0 5px' }}>{attachments.length}</span></>
                  }
                </button>
              ))}
            </div>

            {/* 留言 Tab */}
            {activeTab === 'comments' && (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
                  {topLevelComments.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#333' }}>NO REPORTS YET</div>
                  ) : topLevelComments.map(c => (
                    <CommentItem key={c.id} comment={c} allComments={comments}
                      onReply={id => setReplyingTo(prev => prev === id ? null : id)}
                      replyingTo={replyingTo} />
                  ))}
                </div>
                <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                  {replyTarget && (
                    <div style={{
                      fontSize: 9, color: '#00aaff', background: 'rgba(0,170,255,0.08)',
                      border: '1px solid rgba(0,170,255,0.2)', borderRadius: 4, padding: '4px 10px',
                      marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <CornerDownRight size={9} />
                      回覆：{replyTarget.content.slice(0, 25)}...
                      <button onClick={() => setReplyingTo(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#4488ff', cursor: 'pointer', padding: 0, fontSize: 10 }}>✕</button>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
                      placeholder={replyingTo ? '輸入回覆...' : '輸入留言（Enter 送出）'} rows={2}
                      style={{
                        flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 6, padding: '8px 10px', color: '#ccc', fontSize: 12,
                        outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5,
                      }} />
                    <button onClick={handleSendComment} disabled={!newComment.trim() || isSending} style={{
                      background: newComment.trim() ? '#4488ff' : 'rgba(255,255,255,0.05)',
                      border: 'none', borderRadius: 6, padding: '10px 12px',
                      cursor: newComment.trim() ? 'pointer' : 'default',
                      color: newComment.trim() ? '#fff' : '#333',
                      transition: 'all 0.15s', flexShrink: 0, display: 'flex', alignItems: 'center',
                    }}><Send size={14} /></button>
                  </div>
                  <div style={{ fontSize: 9, color: '#333', marginTop: 5 }}>Enter 送出・Shift+Enter 換行</div>
                </div>
              </>
            )}

            {/* 附件 Tab */}
            {activeTab === 'attachments' && (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
                  {attachments.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#333' }}>NO FILES YET</div>
                  ) : attachments.map(att => (
                    <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 8,
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 8, textDecoration: 'none', transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#4488ff44'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'}
                    >
                      <div style={{ color: '#4488ff', flexShrink: 0 }}><AttachmentIcon type={att.type} /></div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: 11, color: '#ccc', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</div>
                        <div style={{ fontSize: 9, color: '#444', marginTop: 2 }}>{att.type.toUpperCase()} · {formatSize(att.size)}</div>
                      </div>
                    </a>
                  ))}
                </div>
                <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                  <input ref={fileInputRef} type="file" onChange={handleFileUpload}
                    accept="image/*,.pdf,text/*,.json" style={{ display: 'none' }} />
                  <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} style={{
                    width: '100%', padding: '10px',
                    background: 'rgba(68,136,255,0.08)', border: '1px dashed rgba(68,136,255,0.3)',
                    borderRadius: 6, cursor: isUploading ? 'default' : 'pointer',
                    color: isUploading ? '#444' : '#4488ff',
                    fontSize: 10, fontWeight: 900, letterSpacing: '0.15em',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontFamily: 'inherit', transition: 'all 0.15s',
                  }}>
                    <Upload size={12} />
                    {isUploading ? 'UPLOADING...' : 'UPLOAD FILE'}
                  </button>
                  <div style={{ fontSize: 9, color: '#333', marginTop: 6, textAlign: 'center' }}>
                    圖片・PDF・文字・JSON・最大 10MB
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ onClick, color, title, children }: {
  onClick: () => void; color: string; title: string; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} title={title} style={{
      background: 'none', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 6, padding: '7px', color: '#666', cursor: 'pointer',
      display: 'flex', alignItems: 'center', transition: 'all 0.15s',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.color = color;
        (e.currentTarget as HTMLElement).style.borderColor = color + '44';
        (e.currentTarget as HTMLElement).style.background = color + '11';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.color = '#666';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
        (e.currentTarget as HTMLElement).style.background = 'none';
      }}
    >
      {children}
    </button>
  );
}
