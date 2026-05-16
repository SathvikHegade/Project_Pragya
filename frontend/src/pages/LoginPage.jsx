import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import styles from './AuthPages.module.css'

export function LoginPage() {
  const { login } = useAuth()
  const { t } = useTheme()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid credentials. Try demo@pragya.in / demo123')
    } finally {
      setLoading(false)
    }
  }

  const handleDemo = async (role) => {
    setLoading(true)
    const creds = role === 'teacher'
      ? { email: 'teacher@pragya.in', password: 'demo123' }
      : { email: 'demo@pragya.in', password: 'demo123' }
    try {
      await login(creds.email, creds.password)
      navigate(role === 'teacher' ? '/teacher' : '/dashboard')
    } catch {
      localStorage.setItem('pragya_token', 'demo_token')
      localStorage.setItem('pragya_user', JSON.stringify({
        id: '1', name: role === 'teacher' ? 'Demo Teacher' : 'Demo Student',
        email: creds.email, role, class: 'Class 9', language: 'en'
      }))
      window.location.href = role === 'teacher' ? '/teacher' : '/dashboard'
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg} />
      <Link to="/" className={styles.backLink}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        {t('login.backHome')}
      </Link>

      <div className={styles.card}>
        <div className={styles.logoMark}>
          <svg width="60" height="60" viewBox="0 0 50 50" fill="none">
            <rect width="50" height="50" rx="10" fill="#110A00"/>
            <ellipse cx="25" cy="20" rx="18" ry="8" fill="none" stroke="#FFB347" strokeWidth="2" transform="rotate(-20 25 20)" opacity="0.95"/>
            <circle cx="41" cy="11" r="2.5" fill="#FFB347"/>
            <text x="25" y="32" fontFamily="'Noto Sans Devanagari', Arial, sans-serif" fontSize="26" fontWeight="700" fill="url(#loginGradient)" textAnchor="middle">प</text>
            <path d="M40 6 L41.5 8 L44 9 L41.5 10 L40 12 L38.5 10 L36 9 L38.5 8 Z" fill="#FF6B00"/>
            <circle cx="18" cy="38" r="1.5" fill="#FFB347" opacity="0.6"/>
            <defs>
              <linearGradient id="loginGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B00"/>
                <stop offset="100%" stopColor="#FFB347"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className={styles.title}>{t('login.title')}</h1>
        <p className={styles.subtitle}>{t('login.subtitle')}</p>

        <div className={styles.demoButtons}>
          <button className={styles.demoBtn} onClick={() => handleDemo('student')} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            {t('login.demoStudent')}
          </button>
          <button className={styles.demoBtn} onClick={() => handleDemo('teacher')} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <path d="M8 21h8m-4-4v4"/>
            </svg>
            {t('login.demoTeacher')}
          </button>
        </div>

        <div className={styles.divider}><span>{t('login.orSignIn')}</span></div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.field}>
            <label className={styles.label}>{t('login.email')}</label>
            <input
              type="email"
              className="input-field"
              placeholder={t('login.emailPlaceholder')}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t('login.password')}</label>
            <input
              type="password"
              className="input-field"
              placeholder={t('login.passPlaceholder')}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? t('login.signingIn') : t('login.signIn')}
            {!loading && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            )}
          </button>
        </form>

        <p className={styles.switchLink}>
          {t('login.switchToRegister')} <Link to="/register">{t('login.createFree')}</Link>
        </p>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const { register } = useAuth()
  const { t } = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: searchParams.get('role') || 'student',
    class: 'Class 9', language: 'en', school: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch {
      localStorage.setItem('pragya_token', 'demo_token')
      localStorage.setItem('pragya_user', JSON.stringify({ ...form, id: Date.now().toString() }))
      window.location.href = form.role === 'teacher' ? '/teacher' : '/dashboard'
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg} />
      <Link to="/" className={styles.backLink}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        {t('login.backHome')}
      </Link>

      <div className={styles.card}>
        <div className={styles.logoMark}>
          <svg width="60" height="60" viewBox="0 0 50 50" fill="none">
            <rect width="50" height="50" rx="10" fill="#110A00"/>
            <ellipse cx="25" cy="20" rx="18" ry="8" fill="none" stroke="#FFB347" strokeWidth="2" transform="rotate(-20 25 20)" opacity="0.95"/>
            <circle cx="41" cy="11" r="2.5" fill="#FFB347"/>
            <text x="25" y="32" fontFamily="'Noto Sans Devanagari', Arial, sans-serif" fontSize="26" fontWeight="700" fill="url(#regGradient)" textAnchor="middle">प</text>
            <path d="M40 6 L41.5 8 L44 9 L41.5 10 L40 12 L38.5 10 L36 9 L38.5 8 Z" fill="#FF6B00"/>
            <circle cx="18" cy="38" r="1.5" fill="#FFB347" opacity="0.6"/>
            <defs>
              <linearGradient id="regGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B00"/>
                <stop offset="100%" stopColor="#FFB347"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className={styles.title}>{t('register.title')}</h1>
        <p className={styles.subtitle}>{t('register.subtitle')}</p>

        <div className={styles.roleToggle}>
          <button
            className={`${styles.roleBtn} ${form.role === 'student' ? styles.roleActive : ''}`}
            onClick={() => setForm({ ...form, role: 'student' })}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            {t('register.student')}
          </button>
          <button
            className={`${styles.roleBtn} ${form.role === 'teacher' ? styles.roleActive : ''}`}
            onClick={() => setForm({ ...form, role: 'teacher' })}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <path d="M8 21h8m-4-4v4"/>
            </svg>
            {t('register.teacher')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.field}>
            <label className={styles.label}>{t('register.fullName')}</label>
            <input type="text" className="input-field" placeholder={t('register.namePlaceholder')}
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input type="email" className="input-field" placeholder="you@school.edu"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t('register.schoolName')}</label>
            <input type="text" className="input-field" placeholder={t('register.schoolPlaceholder')}
              value={form.school} onChange={e => setForm({ ...form, school: e.target.value })} />
          </div>
          {form.role === 'student' && (
            <div className={styles.field}>
              <label className={styles.label}>{t('register.class')}</label>
              <select className="input-field" value={form.class} onChange={e => setForm({ ...form, class: e.target.value })}>
                {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
          <div className={styles.field}>
            <label className={styles.label}>{t('register.preferredLang')}</label>
            <select className="input-field" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}>
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t('register.password')}</label>
            <input type="password" className="input-field" placeholder={t('register.passPlaceholder')}
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? t('register.creating') : t('register.createAccount')}
            {!loading && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            )}
          </button>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 4 }}>
            {t('register.freeTag')}
          </p>
        </form>
        <p className={styles.switchLink}>
          {t('register.switchToLogin')} <Link to="/login">{t('register.signIn')}</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
