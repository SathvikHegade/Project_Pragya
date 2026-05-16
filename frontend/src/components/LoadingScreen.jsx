import React from 'react'

export default function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 24, zIndex: 9999
    }}>
      <svg width="64" height="64" viewBox="0 0 50 50" fill="none">
        <rect width="50" height="50" rx="10" fill="#110A00"/>
        <ellipse cx="25" cy="20" rx="18" ry="8" fill="none" stroke="#FFB347" strokeWidth="2" transform="rotate(-20 25 20)" opacity="0.95"/>
        <circle cx="41" cy="11" r="2.5" fill="#FFB347"/>
        <text x="25" y="32" fontFamily="'Noto Sans Devanagari', Arial, sans-serif" fontSize="26" fontWeight="700" fill="url(#loadGradient)" textAnchor="middle">प</text>
        <path d="M40 6 L41.5 8 L44 9 L41.5 10 L40 12 L38.5 10 L36 9 L38.5 8 Z" fill="#FF6B00"/>
        <circle cx="18" cy="38" r="1.5" fill="#FFB347" opacity="0.6"/>
        <defs>
          <linearGradient id="loadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B00"/>
            <stop offset="100%" stopColor="#FFB347"/>
          </linearGradient>
        </defs>
      </svg>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '1.5rem', letterSpacing: '0.1em',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>PRAGYA</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 6 }}>Loading your lab...</p>
      </div>
      <div style={{ width: 200, height: 3, background: 'var(--bg-card)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
          borderRadius: 2,
          animation: 'loading-bar 1.5s ease-in-out infinite'
        }} />
      </div>
      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; margin-left: 0; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  )
}