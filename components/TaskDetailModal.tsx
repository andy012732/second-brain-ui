'use client';

import React, { useState } from 'react';
import { Task, Attachment } from '@/lib/kanban';
import { 
  X, Calendar, MessageSquare, Paperclip, Flag, Pin, Clock, 
  Edit2, Save, Trash2, Download, Send, User, ChevronDown, ChevronUp,
  AlertCircle
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onTaskUpdated: () => void;
}

const priorityColors: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-blue-900/30', text: 'text-blue-300' },
  medium: { bg: 'bg-yellow-900/30', text: 'text-yellow-300' },
  high: { bg: 'bg-orange-900/30', text: 'text-orange-300' },
  critical: { bg: 'bg-red-900/30', text: 'text-red-300' },
};

export default function TaskDetailModal({ task, onClose, onTaskUpdated }: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const priority = priorityColors[task.priority] || priorityColors.medium;

  // 檢查是否逾期
  const getDueDateStatus = () => {
    if (!task.dueDate) return null;
    
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-400', bg: 'bg-red-900/30' };
    if (diffDays <= 3) return { text: `Due in ${diffDays} days`, color: 'text-yellow-400', bg: 'bg-yellow-900/30' };
    return { text: 'On track', color: 'text-green-400', bg: 'bg-green-900/30' };
  };

  const dueStatus = getDueDateStatus();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description: description || null,
          priority: task.priority,
          tags: task.tags,
          dueDate: task.dueDate,
          isPinned: task.isPinned,
        }),
      });

      if (res.ok) {
        setIsEditing(false);
        onTaskUpdated();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onTaskUpdated();
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleArchive = async () => {
    try {
      const res = await fetch(`/api/tasks/${task.id}?archive=true`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onTaskUpdated();
        onClose();
      }
    } catch (error) {
      console.error('Failed to archive task:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: newComment,
          parentId: replyTo || undefined,
        }),
      });

      if (res.ok) {
        setNewComment('');
        setReplyTo(null);
        onTaskUpdated();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePin = async () => {
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

  const toggleCommentExpansion = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const renderComments = (comments: typeof task.comments, parentId?: string, depth = 0) => {
    const filteredComments = comments.filter(comment => 
      (parentId && comment.parentId === parentId) || 
      (!parentId && !comment.parentId)
    );

    return filteredComments.map(comment => {
      const childComments = comments.filter(c => c.parentId === comment.id);
      const hasChildren = childComments.length > 0;
      const isExpanded = expandedComments.has(comment.id);

      return (
        <div key={comment.id} style={{ marginLeft: depth * 24 }}>
          <div className="bg-gray-800 rounded-lg p-3 mb-2">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <User size={14} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-300">You</span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleString('zh-TW', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {hasChildren && (
                <button
                  onClick={() => toggleCommentExpansion(comment.id)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              )}
            </div>
            <p className="text-gray-200 text-sm">{comment.content}</p>
            <div className="flex justify-between items-center mt-3">
              <button
                onClick={() => setReplyTo(comment.id)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Reply
              </button>
              {replyTo === comment.id && (
                <span className="text-xs text-gray-400">Replying...</span>
              )}
            </div>
          </div>
          {hasChildren && isExpanded && (
            <div className="mt-2">
              {renderComments(comments, comment.id, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">Task Details</h2>
            <div className={`${priority.bg} ${priority.text} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
              <Flag size={12} />
              {task.priority}
            </div>
            {task.isPinned && (
              <div className="bg-yellow-900/30 text-yellow-300 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Pin size={12} />
                Pinned
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePin}
              className={`p-2 rounded-lg ${task.isPinned ? 'bg-yellow-900/30 text-yellow-300' : 'hover:bg-gray-800 text-gray-400 hover:text-yellow-300'}`}
              title={task.isPinned ? 'Unpin' : 'Pin task'}
            >
              <Pin size={18} fill={task.isPinned ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 hover:bg-gray-800 text-gray-400 hover:text-blue-400 rounded-lg transition-colors"
              title={isEditing ? 'Cancel edit' : 'Edit task'}
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={handleArchive}
              className="p-2 hover:bg-gray-800 text-gray-400 hover:text-orange-400 rounded-lg transition-colors"
              title="Archive task"
            >
              <AlertCircle size={18} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-gray-800 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
              title="Delete task"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* 左側：任務詳情 */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-gray-800">
            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={8}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg border border-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading || !title.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-white">{task.title}</h1>
                
                {task.description && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-200 whitespace-pre-wrap">{task.description}</p>
                  </div>
                )}

                {/* 任務元數據 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar size={18} className="text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-400">Due Date</div>
                        <div className="text-gray-200 font-medium">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString('zh-TW', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }) : 'No due date'}
                        </div>
                        {dueStatus && (
                          <div className={`${dueStatus.bg} ${dueStatus.color} px-3 py-1 rounded-full text-xs mt-2 inline-block`}>
                            {dueStatus.text}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock size={18} className="text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-400">Created</div>
                        <div className="text-gray-200 font-medium">
                          {new Date(task.createdAt).toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 標籤 */}
                {task.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="bg-gray-800 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 附件 */}
                {task.attachments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-3">Attachments ({task.attachments.length})</h3>
                    <div className="space-y-2">
                      {task.attachments.map((attachment: Attachment) => (
                        <div key={attachment.id} className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Paperclip size={16} className="text-gray-400" />
                            <div>
                              <div className="text-gray-200 text-sm">{attachment.name}</div>
                              <div className="text-xs text-gray-500">
                                {(attachment.size / 1024).toFixed(1)} KB • {attachment.type}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => window.open(attachment.url, '_blank')}
                            className="text-blue-400 hover:text-blue-300"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 右側：留言 */}
          <div className="w-96 p-6 overflow-y-auto flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare size={18} />
              Comments ({task.comments.length})
            </h3>

            {/* 留言列表 */}
            <div className="flex-1 overflow-y-auto mb-4">
              {task.comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No comments yet</p>
                  <p className="text-sm mt-1">Be the first to comment!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {renderComments(task.comments)}
                </div>
              )}
            </div>

            {/* 新增留言 */}
            <div className="border-t border-gray-800 pt-4">
              {replyTo && (
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-blue-400">Replying to a comment</span>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="text-xs text-gray-400 hover:text-gray-300"
                  >
                    Cancel reply
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  rows={2}
                />
                <button
                  onClick={handleAddComment}
                  disabled={isLoading || !newComment.trim()}
                  className="self-end bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Send comment"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}