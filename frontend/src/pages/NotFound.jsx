import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: '5rem' }}>🔭</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>404 – Page Not Found</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: 320 }}>This experiment doesn't exist in our lab library. Let's get you back on track.</p>
      <Link to="/dashboard" className="btn-primary">← Go to Dashboard</Link>
    </div>
  )
}
