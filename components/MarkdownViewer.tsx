'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface MarkdownViewerProps {
  filePath: string;
}

export default function MarkdownViewer({ filePath }: MarkdownViewerProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!filePath) return;

    setLoading(true);
    setError('');
    
    fetch(`/api/file?path=${encodeURIComponent(filePath)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('File not found');
        const data = await res.json();
        setContent(data.content);
      })
      .catch((err) => {
        setError(err.message);
        setContent('');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filePath]);

  if (!filePath) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a note to view
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 text-gray-500">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#1e1e1e]">
        <div className="max-w-3xl mx-auto py-12 px-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-100 pb-4 border-b border-gray-800">
                {filePath.split('/').pop()?.replace('.md', '')}
            </h1>
            <div className="prose prose-invert prose-pre:bg-[#2d2d2d] max-w-none">
                <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                >
                {content}
                </ReactMarkdown>
            </div>
        </div>
    </div>
  );
}
