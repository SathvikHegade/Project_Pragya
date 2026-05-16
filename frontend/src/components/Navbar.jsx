import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { LANGUAGES } from '../utils/experiments'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { language, changeLanguage, t, isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) setMenuOpen(false)
  }, [location.pathname])

  const navItems = [
    { label: t('nav.dashboard'), path: '/dashboard' },
    { label: t('nav.labLibrary'), path: '/labs' },
    { label: t('nav.notesViva'), path: '/notes-viva' },
    ...(user?.role === 'teacher' ? [{ label: t('nav.teacherPortal'), path: '/teacher' }] : []),
    { label: t('nav.profile'), path: '/profile' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const currentLang = LANGUAGES.find(l => l.code === language)

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link to="/dashboard" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="32" height="32" viewBox="0 0 50 50" fill="none">
              <rect width="50" height="50" rx="10" fill="#110A00"/>
              <ellipse cx="25" cy="20" rx="18" ry="8" fill="none" stroke="#FFB347" strokeWidth="2" transform="rotate(-20 25 20)" opacity="0.95"/>
              <circle cx="41" cy="11" r="2.5" fill="#FFB347"/>
              <text x="25" y="32" fontFamily="'Noto Sans Devanagari', Arial, sans-serif" fontSize="26" fontWeight="700" fill="url(#navGradient)" textAnchor="middle">प</text>
              <path d="M40 6 L41.5 8 L44 9 L41.5 10 L40 12 L38.5 10 L36 9 L38.5 8 Z" fill="#FF6B00"/>
              <circle cx="18" cy="38" r="1.5" fill="#FFB347" opacity="0.6"/>
              <defs>
                <linearGradient id="navGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B00"/>
                  <stop offset="100%" stopColor="#FFB347"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className={styles.logoText}>PRAGYA</span>
        </Link>

        <div className={styles.navLinks}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navLink} ${location.pathname === item.path ? styles.active : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

          <div className={styles.actions}>
          <button className={styles.themeBtn} onClick={toggleTheme} title={t('nav.theme')}>
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          <div className={styles.langSelector}>
            <button className={styles.langBtn} onClick={() => setLangOpen(!langOpen)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span className={styles.langCode}>{currentLang?.code || 'EN'}</span>
            </button>
            {langOpen && (
              <div className={styles.langDropdown}>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    className={`${styles.langItem} ${language === lang.code ? styles.activeLang : ''}`}
                    onClick={() => { changeLanguage(lang.code); setLangOpen(false) }}
                  >
                    <span className={styles.langNative}>{lang.native}</span>
                    <span className={styles.langName}>{lang.name}</span>
                    {language === lang.code && <span className={styles.checkmark}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {langOpen && <div className={styles.overlay} onClick={() => setLangOpen(false)} />}

          <div className={styles.userMenu}>
            <div className={styles.avatar}>
              {user?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name || t('nav.student')}</span>
              <span className={styles.userRole}>{user?.role || t('nav.student')}</span>
            </div>
          </div>

          <button className={styles.logoutBtn} onClick={handleLogout} title={t('nav.logout')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>

          <button className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)} aria-label={t('nav.menu')}>
            <span className={`${styles.menuIcon} ${menuOpen ? styles.menuOpen : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.mobileHeader}>
          <div className={styles.mobileAvatar}>
            {user?.name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div>
              <div className={styles.mobileName}>{user?.name || t('nav.student')}</div>
            <div className={styles.mobileRole}>{user?.role || t('nav.student')}</div>
          </div>
        </div>
        <div className={styles.mobileNav}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.mobileLink} ${location.pathname === item.path ? styles.mobileActive : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className={styles.mobileFooter}>
          <button className={styles.mobileThemeBtn} onClick={() => { toggleTheme(); setMenuOpen(false) }}>
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className={styles.mobileLogout} onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {t('nav.signOut')}
          </button>
        </div>
      </div>

      {menuOpen && <div className={styles.mobileOverlay} onClick={() => setMenuOpen(false)} />}
    </nav>
  )
}
