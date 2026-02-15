'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { Pencil, Save, X, Loader2, Trash2, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FloatingToolbar from './FloatingToolbar';
import CopilotPanel from './CopilotPanel';

interface MarkdownViewerProps {
  filePath: string;
}

// 簡單的 Wiki Link 處理器
const processWikiLinks = (text: string) => {
    // 將 [[Filename]] 轉換為 [Filename](/?file=Filename.md)
    // 這裡做簡化處理，假設連結到同目錄或根目錄
    return text.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
        // 如果內容有 | (例如 [[Filename|Alias]])
        const parts = p1.split('|');
        const linkText = parts.length > 1 ? parts[1] : parts[0];
        const linkTarget = parts[0];
        return `[${linkText}](/?file=${encodeURIComponent(linkTarget + '.md')})`;
    });
};

// 大綱型別
interface TocItem {
    text: string;
    level: number;
    id: string;
}

export default function MarkdownViewer({ filePath }: MarkdownViewerProps) {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [showToc, setShowToc] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // 讀取檔案
  useEffect(() => {
    if (!filePath) return;

    setLoading(true);
    setIsEditing(false);
    setError('');
    setToc([]);
    
    fetch(`/api/file?path=${encodeURIComponent(filePath)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('File not found');
        const data = await res.json();
        setContent(data.content);
        setOriginalContent(data.content);
        generateToc(data.content);
      })
      .catch((err) => {
        setError(err.message);
        setContent('');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filePath]);

  // 生成大綱
  const generateToc = (md: string) => {
      const lines = md.split('\n');
      const items: TocItem[] = [];
      lines.forEach((line, index) => {
          const match = line.match(/^(#{1,6})\s+(.*)/);
          if (match) {
              items.push({
                  level: match[1].length,
                  text: match[2],
                  id: `heading-${index}`
              });
          }
      });
      setToc(items);
  };

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
        generateToc(content); // 更新大綱
        router.refresh();
    } catch (err) {
        alert('儲存失敗！請檢查網路連線。');
    } finally {
        setIsSaving(false);
    }
  };

  // 刪除檔案
  const handleDelete = async () => {
      if(!confirm('⚠️ 確定要刪除這則筆記嗎？此操作無法復原！')) return;
      
      try {
          const res = await fetch(`/api/file?path=${encodeURIComponent(filePath)}`, {
              method: 'DELETE',
          });
          if (res.ok) {
              router.push('/'); // 回首頁
              router.refresh();
          } else {
              alert('刪除失敗');
          }
      } catch (e) {
          alert('刪除失敗');
      }
  };

  // 鍵盤捷徑
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (isEditing) handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
          e.preventDefault();
          setIsEditing(prev => !prev);
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
    <div className="flex-1 flex flex-col bg-[#1e1e1e] h-full overflow-hidden relative transition-all">
        <FloatingToolbar sourceFile={filePath} />
        <CopilotPanel currentFileContent={content} />
        
        {/* 工具列 */}
        <div className="flex justify-between items-center px-8 py-4 border-b border-gray-800 bg-[#1e1e1e] sticky top-0 z-10">
            <h1 className="text-xl font-bold text-gray-200 truncate flex-1 mr-4">
                {filePath.split('/').pop()?.replace('.md', '')}
            </h1>
            <div className="flex gap-2">
                {/* 大綱開關 */}
                {toc.length > 0 && !isEditing && (
                    <button
                        onClick={() => setShowToc(!showToc)}
                        className={`p-2 rounded transition-colors ${showToc ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        title="大綱"
                    >
                        <List size={20} />
                    </button>
                )}

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
                        <button 
                            onClick={handleDelete}
                            className="p-2 text-gray-400 hover:text-red-400 rounded hover:bg-gray-800 transition-colors"
                            title="刪除"
                        >
                            <Trash2 size={20} />
                        </button>
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded font-medium transition-colors"
                            title="編輯 (Cmd+E)"
                        >
                            <Pencil size={18} />
                            <span>編輯</span>
                        </button>
                    </>
                )}
            </div>
        </div>

        {/* 內容區 + 大綱區 */}
        <div className="flex flex-1 overflow-hidden">
            {/* 編輯器/閱讀器 */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-3xl mx-auto py-8 px-8 min-h-full">
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
                                {processWikiLinks(content)}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>

            {/* 大綱面板 */}
            {showToc && !isEditing && (
                <div className="w-64 border-l border-gray-800 bg-[#1a1a1a] overflow-y-auto p-4 hidden lg:block animate-in slide-in-from-right duration-200">
                    <h3 className="font-bold text-gray-400 text-sm mb-4 uppercase">Table of Contents</h3>
                    <ul className="space-y-2 text-sm">
                        {toc.map((item, i) => (
                            <li key={i} style={{ paddingLeft: `${(item.level - 1) * 12}px` }}>
                                <a href="#" className="text-gray-400 hover:text-blue-400 block truncate transition-colors">
                                    {item.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    </div>
  );
}
