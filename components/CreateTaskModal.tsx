'use client';

import React, { useState } from 'react';
import { X, Calendar, Tag, Flag, Plus } from 'lucide-react';

interface CreateTaskModalProps {
  onClose: () => void;
  onTaskCreated: () => void;
}

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-blue-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' },
];

const defaultTags = [
  'urgent', 'bug', 'feature', 'documentation', 'research', 'design', 'development', 'testing'
];

export default function CreateTaskModal({ onClose, onTaskCreated }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [selectedTags, setSelectedTags] = useState<string[]>(['feature']);
  const [dueDate, setDueDate] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priority,
          tags: selectedTags,
          dueDate: dueDate || undefined,
          isPinned,
          status: 'todo', // 新任務預設放在 todo
        }),
      });

      if (res.ok) {
        onTaskCreated();
      } else {
        const error = await res.json();
        alert(`Failed to create task: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const addNewTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Create New Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Task Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What needs to be done?"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Additional details..."
              />
            </div>

            {/* Priority & Due Date */}
            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority
                </label>
                <div className="space-y-2">
                  {priorityOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPriority(option.value)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border ${priority === option.value ? 'border-blue-500 bg-gray-800' : 'border-gray-700 hover:bg-gray-800'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${option.color}`} />
                        <span className="text-gray-200">{option.label}</span>
                      </div>
                      {priority === option.value && (
                        <Flag size={16} className="text-blue-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date & Pin */}
              <div className="space-y-4">
                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Due Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Pin Task */}
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border ${isPinned ? 'border-yellow-500 bg-yellow-500/20' : 'border-gray-600'}`} />
                    <span className="text-gray-200">Pin this task</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPinned(!isPinned)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${isPinned ? 'bg-yellow-600' : 'bg-gray-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isPinned ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              
              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="bg-blue-600 text-blue-100 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-blue-700 transition-colors"
                  >
                    {tag}
                    <X size={12} />
                  </button>
                ))}
              </div>

              {/* Available Tags */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 block">
                  Available Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {defaultTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${selectedTags.includes(tag) ? 'bg-blue-600 text-blue-100' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add New Tag */}
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  Add Custom Tag
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewTag())}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Enter new tag name"
                  />
                  <button
                    type="button"
                    onClick={addNewTag}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 rounded-lg border border-gray-700 flex items-center gap-2 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg border border-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}