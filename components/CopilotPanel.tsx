'use client';

import React, { useState } from 'react';
import { Bot, Send, X, MessageSquare } from 'lucide-react';

export default function CopilotPanel({ currentFileContent }: { currentFileContent: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!input.trim()) return;
    
    const question = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    try {
        const res = await fetch('/api/copilot/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                question, 
                context: currentFileContent.substring(0, 3000) // 限制長度以免爆 Token
            }),
        });
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
    } catch (e) {
        setMessages(prev => [...prev, { role: 'ai', content: "Error connecting to AI." }]);
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) {
      return (
          <button 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all z-50"
          >
              <Bot size={24} />
          </button>
      );
  }

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
            <div className="flex items-center gap-2 font-bold text-purple-400">
                <Bot size={20} />
                <span>Copilot</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-10">
                    <p>你可以問我關於這篇筆記的問題！</p>
                </div>
            )}
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                        msg.role === 'user' 
                        ? 'bg-purple-600 text-white rounded-br-none' 
                        : 'bg-gray-800 text-gray-200 rounded-bl-none'
                    }`}>
                        {msg.content}
                    </div>
                </div>
            ))}
            {loading && (
                <div className="flex justify-start">
                    <div className="bg-gray-800 p-3 rounded-lg rounded-bl-none">
                        <span className="animate-pulse">Thinking...</span>
                    </div>
                </div>
            )}
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-950">
            <div className="relative">
                <input
                    type="text"
                    className="w-full bg-gray-800 text-white text-sm rounded-full py-3 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Ask AI..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                />
                <button 
                    onClick={handleAsk}
                    disabled={loading}
                    className="absolute right-2 top-2 p-1 bg-purple-600 rounded-full text-white hover:bg-purple-500 disabled:opacity-50"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    </div>
  );
}
