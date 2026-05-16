import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { LANGUAGES } from '../utils/experiments'
import styles from './LandingPage.module.css'

const STATS = [
  { value: '1.5M+', label: 'landing.statsSchools', sub: 'landing.statsSchoolsSub' },
  { value: '10', label: 'landing.statsExps', sub: 'landing.statsExpsSub' },
  { value: '5', label: 'landing.statsLangs', sub: 'landing.statsLangsSub' },
  { value: '0', label: 'landing.statsCost', sub: 'landing.statsCostSub' },
]

const FEATURES = [
  { icon: 'F', title: 'landing.featurePhysics', desc: 'landing.featurePhysicsDesc' },
  { icon: 'AI', title: 'landing.featureAI', desc: 'landing.featureAIDesc' },
  { icon: 'T', title: 'landing.featureTeacher', desc: 'landing.featureTeacherDesc' },
  { icon: 'M', title: 'landing.featureOffline', desc: 'landing.featureOfflineDesc' },
  { icon: 'L', title: 'landing.featureMulti', desc: 'landing.featureMultiDesc' },
  { icon: 'N', title: 'landing.featureNCERT', desc: 'landing.featureNCERTDesc' },
]

export default function LandingPage() {
  const { t, isDark, toggleTheme, language, changeLanguage } = useTheme()
  const canvasRef = useRef(null)
  const [langOpen, setLangOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const currentLang = LANGUAGES.find(l => l.code === language)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.8,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.4 + 0.3,
    }))

    let raf
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(79, 140, 255, ${p.opacity})`
        ctx.fill()
      })
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const d = Math.hypot(p.x - q.x, p.y - q.y)
          if (d < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(79, 140, 255, ${0.08 * (1 - d / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      raf = requestAnimationFrame(animate)
    }
    animate()

    const onResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={styles.page}>
      <canvas ref={canvasRef} className={styles.canvas} />

      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.9"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className={styles.logoText}>PRAGYA</span>
          </Link>

          <nav className={styles.headerNav}>
            <a href="#features" className={styles.headerLink}>{t('nav.features')}</a>
            <a href="#experiments" className={styles.headerLink}>{t('nav.experiments')}</a>
            <a href="#impact" className={styles.headerLink}>{t('nav.impact')}</a>
          </nav>

          <div className={styles.headerActions}>
            <button className={styles.themeBtn} onClick={toggleTheme} title={t('nav.theme')}>
              {isDark ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
            <div className={styles.langSelector}>
              <button className={styles.langBtn} onClick={() => setLangOpen(!langOpen)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8125rem' }}>{t('nav.signIn')}</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8125rem' }}>{t('nav.getStarted')}</Link>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={`${styles.heroBadge} animate-fade-in`}>
            <span className={styles.badgeDot} />
            {t('landing.badge')}
          </div>

          <h1 className={`${styles.heroTitle} animate-fade-in stagger-1`}>
            {t('landing.heroTitle1')}<br />
            <span className="text-gradient">{t('landing.heroTitle2')}</span>
          </h1>

          <p className={`${styles.heroSub} animate-fade-in stagger-2`}>
            {t('landing.heroSub')}
          </p>

          <div className={`${styles.heroCTA} animate-fade-in stagger-3`}>
            <Link to="/register" className="btn-primary" style={{ padding: '12px 24px', fontSize: '0.875rem' }}>
              {t('landing.startLearning')}
            </Link>
            <Link to="/labs" className="btn-secondary" style={{ padding: '12px 24px', fontSize: '0.875rem' }}>
              {t('landing.browseExps')}
            </Link>
          </div>

          <div className={`${styles.heroMeta} animate-fade-in stagger-4`}>
            <span>{t('landing.noHardware')}</span>
            <span>{t('landing.worksOffline')}</span>
            <span>{t('landing.fiveLanguages')}</span>
          </div>
        </div>

        <div className={`${styles.heroCard}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>P</span>
            <div>
              <div className={styles.cardTitle}>{t('landing.cardTitle')}</div>
              <div className={styles.cardSub}>{t('landing.cardSub')}</div>
            </div>
            <span className="badge badge-physics" style={{ marginLeft: 'auto' }}>{t('landing.live')}</span>
          </div>

          <div className={styles.pendulumDemo}>
            <PendulumAnimation />
          </div>

          <div className={styles.cardControls}>
            <div className={styles.controlRow}>
              <span>{t('landing.length')}</span>
              <div className={styles.slider}>
                <div className={styles.sliderFill} style={{ width: '60%' }} />
              </div>
              <span>80cm</span>
            </div>
            <div className={styles.controlRow}>
              <span>{t('landing.mass')}</span>
              <div className={styles.slider}>
                <div className={styles.sliderFill} style={{ width: '40%' }} />
              </div>
              <span>200g</span>
            </div>
          </div>

          <div className={styles.aiHint}>
            <span>{t('landing.aiHint')}</span>
          </div>
        </div>
      </section>

      <section className={styles.stats} id="impact">
        <div className="container">
          <div className={styles.statsGrid}>
            {STATS.map((s, i) => (
              <div key={i} className={`${styles.statCard} animate-fade-in stagger-${i + 1}`}>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{t(s.label)}</div>
                <div className={styles.statSub}>{t(s.sub)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.features} id="features">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>{t('landing.sectionTag')}</span>
            <h2 className={styles.sectionTitle}>
              {t('landing.sectionTitle1')}<br />
              <span className="text-gradient">{t('landing.sectionTitle2')}</span>
            </h2>
          </div>

          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={`${styles.featureCard} animate-fade-in stagger-${i + 1}`}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{t(f.title)}</h3>
                <p className={styles.featureDesc}>{t(f.desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.experimentsPreview} id="experiments">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>{t('landing.expsTag')}</span>
            <h2 className={styles.sectionTitle}>
              {t('landing.expsTitle')}<br />
              <span className="text-gradient">{t('nav.experiments')}</span>
            </h2>
          </div>

          <div className={styles.expGrid}>
            {[
              { icon: 'P', title: 'Simple Pendulum', sub: 'Physics · Class 9', color: 'physics' },
              { icon: 'O', title: "Ohm's Law", sub: 'Physics · Class 10', color: 'physics' },
              { icon: 'A', title: 'Acid-Base Indicators', sub: 'Chemistry · Class 7', color: 'chemistry' },
              { icon: 'S', title: 'Photosynthesis Rate', sub: 'Biology · Class 10', color: 'biology' },
              { icon: 'R', title: 'Projectile Motion', sub: 'Physics · Class 11', color: 'physics' },
              { icon: 'C', title: 'Cell Division', sub: 'Biology · Class 11', color: 'biology' },
            ].map((e, i) => (
              <Link key={i} to="/labs" className={`${styles.expCard} animate-fade-in stagger-${i + 1}`}>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{e.icon}</span>
                <div>
                  <div className={styles.expTitle}>{e.title}</div>
                  <span className={`badge badge-${e.color}`}>{e.sub}</span>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/register" className="btn-primary" style={{ padding: '12px 28px', fontSize: '0.875rem' }}>
              {t('landing.expsCTA')}
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className="container">
          <div className={`${styles.ctaCard} animate-fade-in-scale`}>
            <h2 className={styles.ctaTitle}>
              {t('landing.ctaTitle1')}<br />
              <span className="text-gradient">{t('landing.ctaTitle2')}</span>
            </h2>
            <p className={styles.ctaSub}>
              {t('landing.ctaSub')}
            </p>
            <div className={styles.ctaButtons}>
              <Link to="/register?role=student" className="btn-primary" style={{ padding: '12px 24px', fontSize: '0.875rem' }}>
                {t('landing.ctaStudent')}
              </Link>
              <Link to="/register?role=teacher" className="btn-secondary" style={{ padding: '12px 24px', fontSize: '0.875rem' }}>
                {t('landing.ctaTeacher')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
            </div>

          </div>

          <div className={styles.footerBottom}>
            <div className={styles.footerTopRow}>
              <div className={styles.footerMeta}>
                <span className={styles.footerTitle}>Project PRAGYA</span>
                <span className={styles.footerTagline}>
                  "Every child deserves a science lab. PRAGYA puts one in their pocket."
                </span>
              </div>
              <div className={styles.footerBuiltBy}>Built by Sathvik Hegade</div>
            </div>
            <div className={styles.footerDivider} />
            <div className={styles.footerPolicies}>
              <span>Terms of Service</span>
              <span>Privacy Policy</span>
              <span>User Agreement</span>
              <span>Accessibility</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function PendulumAnimation() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let angle = Math.PI / 6
    let vel = 0
    const L = 80
    const cx = 100
    const cy = 10
    const g = 0.003
    let raf

    function draw() {
      ctx.clearRect(0, 0, 200, 150)

      vel += (-g / L) * Math.sin(angle)
      vel *= 0.999
      angle += vel

      const bx = cx + Math.sin(angle) * L
      const by = cy + Math.cos(angle) * L

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(bx, by)
      ctx.strokeStyle = 'rgba(217, 249, 157, 0.6)'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(cx, cy, 4, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(217, 249, 157, 0.9)'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(bx, by, 11, 0, Math.PI * 2)
      const grad = ctx.createRadialGradient(bx - 3, by - 3, 1, bx, by, 11)
      grad.addColorStop(0, '#d9f99d')
      grad.addColorStop(1, '#a3d977')
      ctx.fillStyle = grad
      ctx.fill()

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={canvasRef} width={200} height={150} style={{ display: 'block', margin: '0 auto' }} />
}