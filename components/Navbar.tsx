'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Kanban,
  BarChart3, LineChart, DollarSign, Menu, X, ShieldCheck
} from 'lucide-react';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { name: '總控制台', href: '/',             icon: LayoutDashboard, code: 'CTRL' },
  { name: '業績指揮部', href: '/revenue',    icon: DollarSign,      code: 'REV'  },
  { name: '進度看板',   href: '/kanban',     icon: Kanban,          code: 'KAN'  },
  { name: '內容分析',   href: '/analytics',  icon: BarChart3,       code: 'ANL'  },
  { name: '美股觀察',   href: '/stocks',     icon: LineChart,       code: 'STK'  },
  { name: '知識庫',     href: '/second-brain', icon: BookOpen,      code: 'BRN'  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2,'0');
      const m = String(now.getMinutes()).padStart(2,'0');
      const s = String(now.getSeconds()).padStart(2,'0');
      setTime(`${h}:${m}:${s}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <nav
        className="h-14 w-full flex items-center justify-between px-4 md:px-6 sticky top-0 z-[100] shrink-0"
        style={{
          background: 'rgba(6,13,26,0.97)',
          borderBottom: '1px solid rgba(0,245,255,0.12)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* LEFT: Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 shrink-0">
            <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
              <polygon points="16,2 30,10 30,22 16,30 2,22 2,10"
                fill="none" stroke="#00f5ff" strokeWidth="1.5" opacity="0.6"/>
              <circle cx="16" cy="16" r="3" fill="#00f5ff" opacity="0.9"/>
            </svg>
          </div>
          <div>
            <div
              className="flicker text-xs font-black tracking-[3px] uppercase"
              style={{ fontFamily:'Orbitron,monospace', color:'#00f5ff',
                textShadow:'0 0 20px rgba(0,245,255,0.4)' }}
            >
              DRACULA CMD
            </div>
            <div className="text-[9px] tracking-[2px] uppercase"
              style={{ fontFamily:'Share Tech Mono,monospace', color:'#2a6080' }}>
              MISSION CONTROL
            </div>
          </div>
        </div>

        {/* CENTER: Nav items (desktop) */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all relative',
                  'border',
                  isActive
                    ? 'text-[#00f5ff] border-[rgba(0,245,255,0.4)] bg-[rgba(0,245,255,0.06)]'
                    : 'text-[#3a6a8a] border-transparent hover:text-[#00f5ff] hover:border-[rgba(0,245,255,0.2)] hover:bg-[rgba(0,245,255,0.03)]'
                )}
                style={{ fontFamily:'Share Tech Mono,monospace' }}
              >
                <Icon size={12}
                  className={isActive ? 'text-[#00f5ff]' : 'text-[#2a5570]'} />
                {item.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ background:'#00f5ff', boxShadow:'0 0 8px #00f5ff' }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <span className="pulse-dot" />
            <span className="text-[9px] tracking-[2px] uppercase"
              style={{ fontFamily:'Share Tech Mono,monospace', color:'#2a6080' }}>
              ONLINE
            </span>
          </div>
          <div
            className="hidden md:block text-xs tracking-[2px]"
            style={{ fontFamily:'Share Tech Mono,monospace', color:'#00f5ff' }}
          >
            {time}
          </div>
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 transition-colors"
            style={{ color: isMenuOpen ? '#00f5ff' : '#3a6a8a' }}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed top-14 left-0 w-full z-[99] flex flex-col p-4 gap-2"
          style={{
            background:'rgba(6,13,26,0.98)',
            borderBottom:'1px solid rgba(0,245,255,0.12)',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={clsx(
                  'flex items-center gap-4 px-4 py-3 text-xs font-black uppercase tracking-widest border transition-all',
                  isActive
                    ? 'text-[#00f5ff] border-[rgba(0,245,255,0.3)] bg-[rgba(0,245,255,0.06)]'
                    : 'text-[#3a6a8a] border-transparent'
                )}
                style={{ fontFamily:'Share Tech Mono,monospace' }}
              >
                <item.icon size={16} />
                <span>{item.name}</span>
                <span className="ml-auto opacity-30">{item.code}</span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
