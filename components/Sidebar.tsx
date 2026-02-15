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

export default function Sidebar() {
  const [tree, setTree] = useState<FileNode[]>([]);
  const searchParams = useSearchParams();
  const currentPath = searchParams.get('file');

  useEffect(() => {
    fetch('/api/tree')
      .then((res) => res.json())
      .then((data) => setTree(data));
  }, []);

  return (
    <div className="w-64 h-full bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="font-bold text-lg text-gray-200">Second Brain</h1>
      </div>
      <QuickCapture />
      <div className="flex-1 overflow-y-auto py-2">
        {tree.map((node) => (
          <FileTreeItem key={node.path} node={node} currentPath={currentPath} />
        ))}
      </div>
    </div>
  );
}
