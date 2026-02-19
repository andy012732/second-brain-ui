'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Kanban, BarChart3, LineChart, DollarSign, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { name: '總控制台',  href: '/',             icon: LayoutDashboard },
  { name: '業績指揮部', href: '/revenue',     icon: DollarSign },
  { name: '進度看板',  href: '/kanban',       icon: Kanban },
  { name: '內容分析',  href: '/analytics',   icon: BarChart3 },
  { name: '美股觀察',  href: '/stocks',      icon: LineChart },
  { name: '知識庫',    href: '/second-brain', icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <nav
        className="h-12 w-full flex items-center justify-between px-4 md:px-6 sticky top-0 z-[100] shrink-0"
        style={{ background: 'rgba(6,13,26,0.98)', borderBottom: '1px solid rgba(0,245,255,0.12)', backdropFilter: 'blur(12px)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none">
            <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" stroke="#00f5ff" strokeWidth="1.5" fill="none" opacity="0.8"/>
            <circle cx="12" cy="12" r="2.5" fill="#00f5ff"/>
          </svg>
          <span className="text-[11px] font-black tracking-[3px] uppercase hidden sm:block"
            style={{ fontFamily: 'Orbitron, monospace', color: '#00f5ff', textShadow: '0 0 12px rgba(0,245,255,0.5)' }}>
            DRACULA CMD
          </span>
        </div>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all border',
                  isActive
                    ? 'border-[rgba(0,245,255,0.35)] bg-[rgba(0,245,255,0.07)] text-[#00f5ff]'
                    : 'border-transparent text-[#3a6a8a] hover:text-[#00f5ff] hover:bg-[rgba(0,245,255,0.04)]'
                )}
                style={{ fontFamily: 'Share Tech Mono, monospace' }}
              >
                <Icon size={11} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88] animate-pulse" />
            <span className="text-[9px] tracking-widest uppercase"
              style={{ fontFamily: 'Share Tech Mono, monospace', color: '#2a6080' }}>ONLINE</span>
          </div>
          <span className="hidden md:block text-[11px] tabular-nums"
            style={{ fontFamily: 'Share Tech Mono, monospace', color: '#00f5ff' }}>{time}</span>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-1.5"
            style={{ color: isMenuOpen ? '#00f5ff' : '#3a6a8a' }}
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed top-12 left-0 w-full z-[99] flex flex-col gap-1 p-3"
          style={{ background: 'rgba(6,13,26,0.98)', borderBottom: '1px solid rgba(0,245,255,0.12)' }}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-wider border transition-all',
                pathname === item.href
                  ? 'border-[rgba(0,245,255,0.3)] bg-[rgba(0,245,255,0.06)] text-[#00f5ff]'
                  : 'border-transparent text-[#3a6a8a]'
              )}
              style={{ fontFamily: 'Share Tech Mono, monospace' }}
            >
              <item.icon size={14} />
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
