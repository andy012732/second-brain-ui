'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { Pencil, Save, X, Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MarkdownViewerProps {
  filePath: string;
}

export default function MarkdownViewer({ filePath }: MarkdownViewerProps) {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState(''); // 用來比對是否有修改
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // 讀取檔案
  useEffect(() => {
    if (!filePath) return;

    setLoading(true);
    setIsEditing(false); // 切換檔案時退出編輯模式
    setError('');
    
    fetch(`/api/file?path=${encodeURIComponent(filePath)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('File not found');
        const data = await res.json();
        setContent(data.content);
        setOriginalContent(data.content);
      })
      .catch((err) => {
        setError(err.message);
        setContent('');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filePath]);

  // 儲存檔案
  const handleSave = async () => {
    setIsSaving(true);
    try {
        const res = await fetch(`/api/file?path=${encodeURIComponent(filePath)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        });

        if (!res.ok) throw new Error('Failed to save');
        
        setOriginalContent(content);
        setIsEditing(false);
        router.refresh(); // 重新整理確保資料同步
    } catch (err) {
        alert('儲存失敗！請檢查網路連線。');
        console.error(err);
    } finally {
        setIsSaving(false);
    }
  };

  // 刪除檔案 (簡單版：移到 .trash，這裡先做直接刪除或歸檔)
  // 為了安全，V1 先做標記刪除或需二次確認
  const handleDelete = async () => {
      if(!confirm('確定要刪除這則筆記嗎？(此操作會同步到 GitHub)')) return;
      // 這裡暫時還沒實作後端 DELETE API，先保留介面
      alert('刪除功能將在下個版本實裝！保護學長的資料安全先！🛡️');
  };

  // 鍵盤捷徑 (Cmd+S 儲存)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (isEditing) handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, content]);

  if (!filePath) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-[#1e1e1e]">
        <div className="text-6xl mb-4">🧠</div>
        <p className="text-xl">歡迎回到 Second Brain</p>
        <p className="text-sm mt-2">選擇左側筆記開始閱讀，或使用上方輸入框快速捕捉想法。</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1e1e1e] text-gray-500">
        <Loader2 className="animate-spin mr-2" /> 載入中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 text-red-500 bg-[#1e1e1e]">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e1e] h-full overflow-hidden relative">
        {/* 工具列 */}
        <div className="flex justify-between items-center px-8 py-4 border-b border-gray-800 bg-[#1e1e1e] sticky top-0 z-10">
            <h1 className="text-xl font-bold text-gray-200 truncate flex-1 mr-4">
                {filePath.split('/').pop()?.replace('.md', '')}
            </h1>
            <div className="flex gap-2">
                {isEditing ? (
                    <>
                        <button 
                            onClick={() => {
                                setContent(originalContent);
                                setIsEditing(false);
                            }}
                            className="p-2 text-gray-400 hover:text-white rounded hover:bg-gray-800 transition-colors"
                            title="取消 (Esc)"
                        >
                            <X size={20} />
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors disabled:opacity-50"
                            title="儲存 (Cmd+S)"
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            <span>儲存</span>
                        </button>
                    </>
                ) : (
                    <>
                        {/* <button 
                            onClick={handleDelete}
                            className="p-2 text-gray-400 hover:text-red-400 rounded hover:bg-gray-800 transition-colors"
                            title="刪除"
                        >
                            <Trash2 size={20} />
                        </button> */}
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded font-medium transition-colors"
                            title="編輯"
                        >
                            <Pencil size={18} />
                            <span>編輯</span>
                        </button>
                    </>
                )}
            </div>
        </div>

        {/* 編輯區 / 閱讀區 */}
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto py-8 px-8 h-full">
                {isEditing ? (
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-full min-h-[500px] bg-[#1e1e1e] text-gray-300 font-mono text-base focus:outline-none resize-none"
                        placeholder="開始寫作..."
                        autoFocus
                    />
                ) : (
                    <div className="prose prose-invert prose-pre:bg-[#2d2d2d] max-w-none pb-20">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
