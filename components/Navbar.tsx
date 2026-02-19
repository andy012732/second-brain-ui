'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { name: '總控制台',   href: '/' },
  { name: '業績指揮部', href: '/revenue' },
  { name: '進度看板',   href: '/kanban' },
  { name: '內容分析',   href: '/analytics' },
  { name: '美股觀察',   href: '/stocks' },
  { name: '知識庫',     href: '/second-brain' },
];

const S = {
  nav: {
    height: 44, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 20px',
    background: 'rgba(5,12,24,0.97)',
    borderBottom: '1px solid rgba(0,245,255,0.1)',
    backdropFilter: 'blur(16px)',
    position: 'sticky' as const, top: 0, zIndex: 100,
  } as React.CSSProperties,
  brand: { display: 'flex', alignItems: 'center', gap: 10 } as React.CSSProperties,
  brandName: {
    fontFamily: 'Orbitron, monospace',
    fontSize: 11, fontWeight: 900,
    letterSpacing: 3, textTransform: 'uppercase' as const,
    color: '#00f5ff',
  } as React.CSSProperties,
  links: { display: 'flex', alignItems: 'center', gap: 2 } as React.CSSProperties,
  link: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '5px 12px',
    fontFamily: 'Share Tech Mono, monospace',
    fontSize: 10, fontWeight: 700,
    letterSpacing: 2, textTransform: 'uppercase' as const,
    textDecoration: 'none',
    transition: 'all 0.15s',
    cursor: 'pointer',
  } as React.CSSProperties,
  right: { display: 'flex', alignItems: 'center', gap: 14 } as React.CSSProperties,
  dot: {
    width: 6, height: 6, borderRadius: '50%',
    background: '#00ff88', boxShadow: '0 0 8px #00ff88',
  } as React.CSSProperties,
  clock: {
    fontFamily: 'Share Tech Mono, monospace',
    fontSize: 12, color: '#00f5ff', letterSpacing: 2,
  } as React.CSSProperties,
  onlineLabel: {
    fontFamily: 'Share Tech Mono, monospace',
    fontSize: 8, letterSpacing: 3, textTransform: 'uppercase' as const,
    color: '#1a3045',
  } as React.CSSProperties,
  mobileMenu: {
    position: 'fixed' as const, top: 44, left: 0, right: 0, zIndex: 200,
    background: 'rgba(5,12,24,0.99)',
    borderBottom: '1px solid rgba(0,245,255,0.1)',
    display: 'flex', flexDirection: 'column' as const, gap: 4, padding: 12,
  } as React.CSSProperties,
  mobileLink: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 16px',
    fontFamily: 'Share Tech Mono, monospace',
    fontSize: 11, fontWeight: 700,
    letterSpacing: 2, textTransform: 'uppercase' as const,
    textDecoration: 'none',
    border: '1px solid transparent',
    transition: 'all 0.15s',
  } as React.CSSProperties,
};

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState('--:--:--');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime([d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':'));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <nav style={S.nav}>
        {/* Brand */}
        <div style={S.brand}>
          <svg viewBox="0 0 20 20" width={20} height={20} fill="none">
            <polygon points="10,1 19,5.5 19,14.5 10,19 1,14.5 1,5.5" stroke="#00f5ff" strokeWidth="1.2" opacity="0.8"/>
            <circle cx="10" cy="10" r="2" fill="#00f5ff" style={{filter:'drop-shadow(0 0 5px #00f5ff)'}}/>
          </svg>
          <span className="brand-glitch" style={S.brandName}>DRACULA CMD</span>
        </div>

        {/* Desktop nav */}
        <div style={{...S.links, display: 'none'}} className="nav-desktop">
          {NAV.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={active ? 'nav-link-active' : 'nav-link-idle'}
                style={S.link}>
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right */}
        <div style={S.right}>
          <span className="blink" style={S.dot}/>
          <span style={S.onlineLabel}>ONLINE</span>
          <span style={S.clock}>{time}</span>
          <button onClick={() => setOpen(!open)}
            style={{background:'none', border:'none', cursor:'pointer', color: open ? '#00f5ff' : '#4a7a95', padding: 4}}
            aria-label="menu">
            <svg viewBox="0 0 18 18" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="1.5">
              {open
                ? <><line x1="3" y1="3" x2="15" y2="15"/><line x1="15" y1="3" x2="3" y2="15"/></>
                : <><line x1="3" y1="5" x2="15" y2="5"/><line x1="3" y1="9" x2="15" y2="9"/><line x1="3" y1="13" x2="15" y2="13"/></>
              }
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div style={S.mobileMenu}>
          {NAV.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              style={{
                ...S.mobileLink,
                color: pathname === item.href ? '#00f5ff' : '#4a7a95',
                borderColor: pathname === item.href ? 'rgba(0,245,255,0.25)' : 'transparent',
                background: pathname === item.href ? 'rgba(0,245,255,0.05)' : 'transparent',
              }}>
              {item.name}
            </Link>
          ))}
        </div>
      )}

      {/* Desktop nav injection via style */}
      <style>{`
        @media (min-width: 1024px) {
          .nav-desktop { display: flex !important; }
          button[aria-label="menu"] { display: none !important; }
        }
      `}</style>
    </>
  );
}
