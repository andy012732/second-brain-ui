'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb, CheckSquare, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FloatingToolbar({ sourceFile }: { sourceFile: string }) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selection, setSelection] = useState('');
  const [loading, setLoading] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.toString().trim() === '') {
        setVisible(false);
        return;
      }

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // 計算位置 (在選取範圍上方)
      setPosition({
        top: rect.top - 50 + window.scrollY,
        left: rect.left + (rect.width / 2) - 60, // 置中 (假設寬度 120px)
      });
      setSelection(sel.toString());
      setVisible(true);
    };

    // 監聽滑鼠放開 (選取結束)
    document.addEventListener('mouseup', handleSelection);
    // 監聽鍵盤 (可能用鍵盤選取)
    document.addEventListener('keyup', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
    };
  }, []);

  const handleAction = async (action: 'idea' | 'todo') => {
    setLoading(true);
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            action, 
            selection, 
            sourceFile: sourceFile.split('/').pop() 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // 清除選取
        window.getSelection()?.removeAllRanges();
        setVisible(false);
        // 跳轉到新建立的檔案
        router.push(`/?file=${encodeURIComponent(data.path)}`);
      }
    } catch (e) {
      alert('Action failed');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 flex items-center gap-1 bg-gray-900 border border-gray-700 shadow-xl rounded-lg p-1 animate-in fade-in zoom-in duration-200"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      onMouseDown={(e) => e.preventDefault()} // 防止點擊工具列時失去焦點 (導致選取消失)
    >
      <button
        onClick={() => handleAction('idea')}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-200 hover:bg-blue-600 hover:text-white rounded transition-colors"
        disabled={loading}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Lightbulb size={14} />}
        <span>Idea</span>
      </button>
      <div className="w-[1px] h-4 bg-gray-700 mx-1"></div>
      <button
        onClick={() => handleAction('todo')}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-200 hover:bg-green-600 hover:text-white rounded transition-colors"
        disabled={loading}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckSquare size={14} />}
        <span>Todo</span>
      </button>
    </div>
  );
}
