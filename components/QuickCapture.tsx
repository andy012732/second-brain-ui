'use client';

import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuickCapture() {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  const handleCapture = async () => {
    if (!input.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input }),
      });

      if (res.ok) {
        setInput('');
        const data = await res.json();
        // 重新整理頁面以顯示新檔案
        router.refresh();
        // 可選：直接跳轉到新筆記
        router.push(`/?file=${encodeURIComponent(data.path)}`);
      }
    } catch (error) {
      console.error('Capture failed', error);
      alert('Capture failed!');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 border-b border-gray-800 bg-gray-900">
      <div className="relative">
        <textarea
          className="w-full bg-gray-800 text-gray-200 text-sm rounded-lg p-3 pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none scrollbar-hide"
          placeholder="Capture an idea..."
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleCapture();
            }
          }}
        />
        <button
          className="absolute right-2 bottom-2 text-gray-400 hover:text-blue-400 transition-colors"
          onClick={handleCapture}
          disabled={isSending}
        >
          {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
