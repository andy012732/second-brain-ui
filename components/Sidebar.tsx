'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronRight, ChevronDown, FileText, Folder, Search, Calendar, LayoutGrid, Zap } from 'lucide-react';
import QuickCapture from './QuickCapture';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

const FOLDER_COLORS: Record<string, string> = {
  '00-inbox':     '#ffaa00',
  '01-daily':     '#00aaff',
  '01-projects':  '#00aaff',
  '02-areas':     '#00ff88',
  '02-ideas':     '#00ff88',
  '03-resources': '#cc44ff',
  '03-sources':   '#cc44ff',
  '04-archive':   '#555',
  '04-research':  '#ff6600',
  '05-logs':      '#4488ff',
  '05-projects':  '#4488ff',
  '06-tutorials': '#ff44aa',
  '99-templates': '#666',
  'templates':    '#666',
};

function getFolderColor(name: string) {
  return FOLDER_COLORS[name.toLowerCase()] ?? '#4488ff';
}

const FileTreeItem = ({ node, level = 0, currentPath }: {
  node: FileNode; level?: number; currentPath: string | null;
}) => {
  const [isOpen, setIsOpen] = useState(level === 0);
  const isSelected = currentPath === node.path;
  const folderColor = getFolderColor(node.name);

  if (node.type === 'directory') {
    return (
      <div>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: `5px 8px 5px ${level * 12 + 8}px`,
            cursor: 'pointer',
            color: isOpen ? folderColor : '#555',
            fontSize: 11, fontWeight: 700,
            letterSpacing: '0.05em',
            fontFamily: '"JetBrains Mono", monospace',
            transition: 'color 0.15s',
            userSelect: 'none',
            borderLeft: isOpen ? `2px solid ${folderColor}44` : '2px solid transparent',
            marginLeft: level > 0 ? 8 : 0,
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = folderColor}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = isOpen ? folderColor : '#555'}
        >
          <span style={{ color: folderColor, opacity: 0.8, display: 'flex' }}>
            {isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </span>
          <Folder size={11} style={{ color: folderColor }} />
          <span style={{ marginLeft: 2 }}>{node.name}</span>
        </div>
        {isOpen && node.children && (
          <div>
            {node.children.map(child => (
              <FileTreeItem key={child.path} node={child} level={level + 1} currentPath={currentPath} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={`/second-brain?file=${encodeURIComponent(node.path)}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: `4px 8px 4px ${level * 12 + 20}px`,
        fontSize: 11,
        fontFamily: '"JetBrains Mono", monospace',
        color: isSelected ? '#fff' : '#556',
        background: isSelected ? 'rgba(0,170,255,0.1)' : 'transparent',
        borderLeft: isSelected ? '2px solid #00aaff' : '2px solid transparent',
        marginLeft: level > 0 ? 8 : 0,
        transition: 'all 0.12s',
        textDecoration: 'none',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.color = '#aac';
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.color = '#556';
          (e.currentTarget as HTMLElement).style.background = 'transparent';
        }
      }}
    >
      <FileText size={10} style={{ flexShrink: 0, opacity: 0.5 }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {node.name.replace('.md', '')}
      </span>
    </Link>
  );
};

export default function Sidebar() {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchParams = useSearchParams();
  const currentPath = searchParams.get('file');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/tree').then(r => r.json()).then(setTree);
  }, []);

  const handleDailyReview = async () => {
    try {
      const res = await fetch('/api/review');
      if (res.ok) {
        const file = await res.json();
        router.push(`/second-brain?file=${encodeURIComponent(file.path)}`);
      }
    } catch { alert('Failed to load review'); }
  };

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setIsSearching(false); return; }
    setIsSearching(true);
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        .then(r => r.json())
        .then(d => { setSearchResults(d); setIsSearching(false); });
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  return (
    <div style={{
      width: 220, height: '100%', flexShrink: 0,
      background: 'rgba(8,8,12,0.98)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      fontFamily: '"JetBrains Mono", monospace',
    }}>
      {/* 標題 */}
      <div style={{
        padding: '14px 14px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#00ff88',
            boxShadow: '0 0 6px #00ff88, 0 0 12px #00ff88',
          }} />
          <span style={{
            fontSize: 10, fontWeight: 900, letterSpacing: '0.25em',
            color: '#00ff88',
            textShadow: '0 0 10px #00ff8866',
          }}>
            SECOND BRAIN
          </span>
        </div>
      </div>

      {/* 搜尋框 */}
      <div style={{ padding: '10px 10px 6px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={11} style={{
            position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)',
            color: '#444',
          }} />
          <input
            type="text"
            placeholder="搜尋筆記..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 4,
              padding: '6px 8px 6px 26px',
              fontSize: 11, color: '#aaa',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#00aaff66'}
            onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>
      </div>

      {/* Quick Capture */}
      <div style={{ padding: '0 10px 6px' }}>
        <QuickCapture />
      </div>

      {/* 操作按鈕列 */}
      <div style={{ display: 'flex', gap: 6, padding: '0 10px 10px' }}>
        <button
          onClick={handleDailyReview}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            padding: '6px 0',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 4, cursor: 'pointer',
            fontSize: 10, fontWeight: 700, color: '#888',
            fontFamily: 'inherit', letterSpacing: '0.1em',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#ffaa00';
            (e.currentTarget as HTMLElement).style.borderColor = '#ffaa0044';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#888';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
          }}
        >
          <Calendar size={11} /> REVIEW
        </button>

        <Link
          href="/kanban"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '6px 10px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 4,
            color: '#888', textDecoration: 'none',
            transition: 'all 0.15s',
            fontSize: 10,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#00aaff';
            (e.currentTarget as HTMLElement).style.borderColor = '#00aaff44';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#888';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
          }}
        >
          <LayoutGrid size={11} />
        </Link>
      </div>

      {/* 分隔線 */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 10px 8px' }} />

      {/* 檔案樹 / 搜尋結果 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 4px 12px' }}>
        {searchQuery ? (
          <div>
            <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.2em', padding: '4px 12px 6px', fontWeight: 900 }}>
              RESULTS
            </div>
            {searchResults.length === 0 && !isSearching && (
              <div style={{ fontSize: 11, color: '#444', padding: '4px 12px' }}>無結果</div>
            )}
            {searchResults.map(r => (
              <Link
                key={r.path}
                href={`/second-brain?file=${encodeURIComponent(r.path)}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', fontSize: 11,
                  color: '#778', textDecoration: 'none',
                  transition: 'color 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#aac'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#778'}
              >
                <Zap size={10} style={{ color: '#00aaff', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.name.replace('.md', '')}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          tree.map(node => (
            <FileTreeItem key={node.path} node={node} currentPath={currentPath} />
          ))
        )}
      </div>
    </div>
  );
}
