'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, ChevronDown, FileText, Folder } from 'lucide-react';
import clsx from 'clsx';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

const FileTreeItem = ({ node, level = 0, currentPath }: { node: FileNode; level?: number; currentPath: string | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = currentPath === node.path;

  if (node.type === 'directory') {
    return (
      <div>
        <div
          className={clsx(
            "flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-gray-800 text-gray-400 select-none",
            "transition-colors duration-200"
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Folder size={16} className="text-blue-400" />
          <span className="text-sm">{node.name}</span>
        </div>
        {isOpen && node.children && (
          <div>
            {node.children.map((child) => (
              <FileTreeItem key={child.path} node={child} level={level + 1} currentPath={currentPath} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={`/?file=${encodeURIComponent(node.path)}`}
      className={clsx(
        "flex items-center gap-2 py-1 px-2 hover:bg-gray-800 cursor-pointer block text-sm",
        isSelected ? "bg-gray-800 text-white" : "text-gray-400"
      )}
      style={{ paddingLeft: `${level * 12 + 24}px` }}
    >
      <FileText size={14} />
      <span>{node.name.replace('.md', '')}</span>
    </Link>
  );
};

import QuickCapture from './QuickCapture';
import { Search, Calendar, Book } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Sidebar() {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchParams = useSearchParams();
  const currentPath = searchParams.get('file');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/tree')
      .then((res) => res.json())
      .then((data) => setTree(data));
  }, []);

  const handleDailyReview = async () => {
      try {
          const res = await fetch('/api/review');
          if (res.ok) {
              const file = await res.json();
              router.push(`/?file=${encodeURIComponent(file.path)}`);
          }
      } catch (e) {
          alert('Failed to load review');
      }
  };

  // 搜尋處理
  useEffect(() => {
      if (!searchQuery.trim()) {
          setSearchResults([]);
          setIsSearching(false);
          return;
      }

      setIsSearching(true);
      const timer = setTimeout(() => {
          fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
              .then(res => res.json())
              .then(data => {
                  setSearchResults(data);
                  setIsSearching(false);
              });
      }, 300); // Debounce

      return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="w-64 h-full bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="font-bold text-lg text-gray-200">Second Brain</h1>
      </div>
      
      {/* 搜尋框 */}
      <div className="px-4 pt-4 pb-2">
          <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
              <input 
                  type="text"
                  placeholder="搜尋筆記..."
                  className="w-full bg-gray-800 text-gray-200 text-sm rounded-md py-2 pl-9 pr-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
      </div>

      <QuickCapture />
      
      {/* Daily Review Button */}
      <div className="flex gap-2 mx-4 mt-2">
        <button 
            onClick={handleDailyReview}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 rounded transition-colors"
            title="隨機回顧"
        >
            <Calendar size={14} />
            <span>Daily Review</span>
        </button>
        <Link
            href="/?file=__MANUAL__"
            className="flex items-center justify-center p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
            title="使用手冊"
        >
            <Book size={14} />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {/* 搜尋結果模式 */}
        {searchQuery ? (
            <div className="px-2">
                <div className="text-xs font-semibold text-gray-500 px-2 mb-2 uppercase">Search Results</div>
                {searchResults.length === 0 && !isSearching && (
                    <div className="text-sm text-gray-500 px-2">No results found</div>
                )}
                {searchResults.map((result) => (
                    <Link
                        key={result.path}
                        href={`/?file=${encodeURIComponent(result.path)}`}
                        className="flex items-center gap-2 py-1 px-2 hover:bg-gray-800 cursor-pointer block text-sm text-gray-300"
                    >
                        <FileText size={14} />
                        <span className="truncate">{result.name.replace('.md', '')}</span>
                    </Link>
                ))}
            </div>
        ) : (
            /* 正常檔案樹模式 */
            tree.map((node) => (
                <FileTreeItem key={node.path} node={node} currentPath={currentPath} />
            ))
        )}
      </div>
    </div>
  );
}
