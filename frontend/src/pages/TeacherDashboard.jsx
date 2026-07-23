import React, { useState, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import { teacherAPI } from '../utils/api'
import { EXPERIMENTS } from '../utils/experiments'
import styles from './TeacherDashboard.module.css'

const STUDENTS = [
  { id: 1, name: 'Arjun Sharma', class: 'Class 9', completed: 7, avgScore: 88, streak: 5, lastActive: '2h ago', status: 'on-track', gap: null },
  { id: 2, name: 'Priya Patel', class: 'Class 9', completed: 4, avgScore: 62, streak: 2, lastActive: '1d ago', status: 'needs-help', gap: 'Acid-Base Concepts' },
  { id: 3, name: 'Rohan Kumar', class: 'Class 10', completed: 9, avgScore: 94, streak: 12, lastActive: '1h ago', status: 'excelling', gap: null },
  { id: 4, name: 'Sneha Reddy', class: 'Class 9', completed: 3, avgScore: 45, streak: 0, lastActive: '5d ago', status: 'at-risk', gap: 'Pendulum & SHM' },
  { id: 5, name: 'Vikram Singh', class: 'Class 10', completed: 6, avgScore: 74, streak: 3, lastActive: '3h ago', status: 'on-track', gap: null },
  { id: 6, name: 'Ananya Das', class: 'Class 9', completed: 8, avgScore: 91, streak: 8, lastActive: '30m ago', status: 'excelling', gap: null },
  { id: 7, name: 'Rahul Verma', class: 'Class 10', completed: 2, avgScore: 38, streak: 0, lastActive: '1w ago', status: 'at-risk', gap: "Ohm's Law basics" },
  { id: 8, name: 'Kavya Nair', class: 'Class 9', completed: 5, avgScore: 70, streak: 4, lastActive: '6h ago', status: 'on-track', gap: null },
]

const EXPERIMENTS_HEAT = [
  { id: 'pendulum', title: 'Simple Pendulum', scores: [88, 92, 45, 78, 95, 60, 40, 82] },
  { id: 'ohms-law', title: "Ohm's Law", scores: [75, 88, 92, 50, 82, 95, 35, 70] },
  { id: 'acid-base', title: 'Acid-Base', scores: [62, 70, 88, 44, 80, 92, 55, 65] },
  { id: 'photosynthesis', title: 'Photosynthesis', scores: [90, 85, 95, 0, 78, 88, 0, 72] },
  { id: 'projectile', title: 'Projectile', scores: [80, 0, 90, 0, 70, 85, 0, 68] },
]

const ALERTS = [
  { type: 'risk', icon: '⚠️', name: 'Sneha Reddy & Rahul Verma', msg: 'Inactive for 5+ days. Low scores in core experiments.' },
  { type: 'gap', icon: '📚', name: 'Priya Patel', msg: 'Struggling with Acid-Base indicators — repeated wrong answers detected.' },
  { type: 'win', icon: '🏆', name: 'Rohan Kumar', msg: 'Completed 9/10 experiments with 94% average. Recommend advanced content.' },
]

function heatColor(score) {
  if (score === 0) return 'rgba(255,255,255,0.04)'
  if (score < 50) return 'rgba(239,68,68,0.35)'
  if (score < 70) return 'rgba(245,158,11,0.35)'
  if (score < 85) return 'rgba(0,212,255,0.25)'
  return 'rgba(16,185,129,0.45)'
}

export default function TeacherDashboard() {
  const { t } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [observations, setObservations] = useState([])
  const [observationsLoading, setObservationsLoading] = useState(false)
  const [observationsError, setObservationsError] = useState('')

  const atRisk = STUDENTS.filter(s => s.status === 'at-risk').length
  const excelling = STUDENTS.filter(s => s.status === 'excelling').length
  const avgScore = Math.round(STUDENTS.reduce((a, s) => a + s.avgScore, 0) / STUDENTS.length)
  const avgCompleted = Math.round(STUDENTS.reduce((a, s) => a + s.completed, 0) / STUDENTS.length)

  const getExperimentTitle = (id) => {
    const exp = EXPERIMENTS.find(e => e.id === id)
    return exp ? exp.title : id
  }

  const formatObservationTime = (timestamp) => {
    try {
      const date = new Date(timestamp)
      if (Number.isNaN(date.getTime())) return ''
      return date.toLocaleString()
    } catch {
      return ''
    }
  }

  useEffect(() => {
    let cancelled = false
    if (activeTab !== 'observations') return () => {}
    setObservationsLoading(true)
    setObservationsError('')
    teacherAPI.observations({ limit: 200 })
      .then((data) => {
        if (cancelled) return
        setObservations(data.observations || [])
      })
      .catch((err) => {
        if (cancelled) return
        setObservations([])
        setObservationsError(err.message || 'Failed to load observations')
      })
      .finally(() => {
        if (!cancelled) setObservationsLoading(false)
      })
    return () => { cancelled = true }
  }, [activeTab])

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{t('teacher.title')}</h1>
            <p className={styles.sub}>{t('teacher.subtitle').replace('{count}', STUDENTS.length)}</p>
          </div>
          <button className="btn-primary" onClick={() => alert('Weekly PDF report generated!')}>
            📄 {t('teacher.exportReport')}
          </button>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          {[
            { icon: '👨‍🎓', val: STUDENTS.length, label: t('teacher.totalStudents'), color: 'var(--accent-primary)' },
            { icon: '⚠️', val: atRisk, label: t('teacher.atRisk'), color: 'var(--accent-red)' },
            { icon: '🏆', val: excelling, label: t('teacher.excelling'), color: 'var(--accent-green)' },
            { icon: '⭐', val: `${avgScore}%`, label: t('teacher.classAvgScore'), color: 'var(--accent-amber)' },
            { icon: '🧪', val: `${avgCompleted}/10`, label: t('teacher.avgExperiments'), color: 'var(--accent-secondary)' },
          ].map((s, i) => (
            <div key={i} className={`${styles.statCard} glass-card`}>
              <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{s.icon}</div>
              <div className={styles.statVal} style={{ color: s.color }}>{s.val}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {['overview', 'students', 'heatmap', 'alerts', 'observations'].map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && '📊'} {tab === 'students' && '👥'} {tab === 'heatmap' && '🔥'} {tab === 'alerts' && `🔔 ${ALERTS.length}`} {tab === 'observations' && '📝'}
              {' '}{tab === 'overview' ? t('teacher.tabOverview') : tab === 'students' ? t('teacher.tabStudents') : tab === 'heatmap' ? t('teacher.tabHeatmap') : tab === 'alerts' ? t('teacher.tabAlerts') : 'Observations'}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className={styles.overviewGrid}>
            {/* Quick Alerts */}
            <div className={`${styles.card} glass-card`}>
              <div className={styles.cardTitle}>🔔 {t('teacher.priorityAlerts')}</div>
              <div className={styles.alertList}>
                {ALERTS.map((a, i) => (
                  <div key={i} className={`${styles.alertItem} ${styles[`alert_${a.type}`]}`}>
                    <span className={styles.alertIcon}>{a.icon}</span>
                    <div>
                      <div className={styles.alertName}>{a.name}</div>
                      <div className={styles.alertMsg}>{a.msg}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top performers */}
            <div className={`${styles.card} glass-card`}>
              <div className={styles.cardTitle}>🏅 {t('teacher.topPerformers')}</div>
              <div className={styles.studentList}>
                {STUDENTS.sort((a, b) => b.avgScore - a.avgScore).slice(0, 4).map((s, i) => (
                  <div key={s.id} className={styles.studentRow}>
                    <div className={styles.rank}>#{i + 1}</div>
                    <div className={styles.avatar}>{s.name[0]}</div>
                    <div className={styles.sInfo}>
                      <div className={styles.sName}>{s.name}</div>
                      <div className={styles.sMeta}>{s.class} · {s.completed}/10 done</div>
                    </div>
                    <div className={styles.sScore}>{s.avgScore}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* At-risk students */}
            <div className={`${styles.card} glass-card`}>
              <div className={styles.cardTitle}>⚠️ {t('teacher.needsAttention')}</div>
              <div className={styles.studentList}>
                {STUDENTS.filter(s => ['at-risk', 'needs-help'].includes(s.status)).map(s => (
                  <div key={s.id} className={styles.studentRow}>
                    <div className={styles.avatar} style={{ background: 'rgba(239,68,68,0.2)', color: 'var(--accent-red)' }}>{s.name[0]}</div>
                    <div className={styles.sInfo}>
                      <div className={styles.sName}>{s.name}</div>
                      <div className={styles.sMeta}>{s.gap || 'Low engagement'} · Last: {s.lastActive}</div>
                    </div>
                    <button className={styles.nudgeBtn} onClick={() => alert(`Nudge sent to ${s.name}!`)}>{t('teacher.nudge')}</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Class activity */}
            <div className={`${styles.card} glass-card`}>
              <div className={styles.cardTitle}>📅 {t('teacher.thisWeek')}</div>
              <div className={styles.weekBars}>
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => {
                  const h = [60, 85, 45, 90, 70, 30, 20][i]
                  return (
                    <div key={day} className={styles.weekBar}>
                      <div className={styles.barWrap}>
                        <div className={styles.barFill} style={{ height: `${h}%`, background: h > 70 ? 'var(--accent-primary)' : 'rgba(0,212,255,0.4)' }} />
                      </div>
                      <span className={styles.barLabel}>{day}</span>
                    </div>
                  )
                })}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>{t('teacher.dailyActiveSessions')}</div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className={`${styles.card} glass-card`}>
            <div className={styles.cardTitle} style={{ marginBottom: 16 }}>{t('teacher.allStudents')}</div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('teacher.tableStudent')}</th>
                    <th>{t('teacher.tableClass')}</th>
                    <th>{t('teacher.tableProgress')}</th>
                    <th>{t('teacher.tableAvgScore')}</th>
                    <th>{t('teacher.tableStreak')}</th>
                    <th>{t('teacher.tableLastActive')}</th>
                    <th>{t('teacher.tableStatus')}</th>
                    <th>{t('teacher.tableAction')}</th>
                  </tr>
                </thead>
                <tbody>
                  {STUDENTS.map(s => (
                    <tr key={s.id} onClick={() => setSelectedStudent(s)} className={styles.tableRow}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className={styles.avatar}>{s.name[0]}</div>
                          <span className={styles.sName}>{s.name}</span>
                        </div>
                      </td>
                      <td>{s.class}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 80 }}>
                            <div className="progress-fill" style={{ width: `${s.completed * 10}%` }} />
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.completed}/10</span>
                        </div>
                      </td>
                      <td><span style={{ fontFamily: 'var(--font-mono)', color: s.avgScore >= 80 ? 'var(--accent-green)' : s.avgScore >= 60 ? 'var(--accent-amber)' : 'var(--accent-red)' }}>{s.avgScore}%</span></td>
                      <td><span style={{ color: 'var(--accent-amber)' }}>🔥 {s.streak}d</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{s.lastActive}</td>
                      <td><StatusBadge status={s.status} /></td>
                      <td>
                        <button className={styles.nudgeBtn} onClick={e => { e.stopPropagation(); alert(`Intervention sent to ${s.name}!`) }}>
                          {s.status === 'at-risk' ? `🚨 ${t('teacher.alert')}` : t('teacher.view')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedStudent && (
              <StudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
            )}
          </div>
        )}

        {/* Heatmap Tab */}
        {activeTab === 'heatmap' && (
          <div className={`${styles.card} glass-card`}>
            <div className={styles.cardTitle}>🔥 {t('teacher.classMasteryHeatmap')}</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              {t('teacher.heatmapLegend')}
            </p>
            <div className={styles.heatmapWrap}>
              <table className={styles.heatmap}>
                <thead>
                  <tr>
                    <th className={styles.heatHead}>{t('teacher.experiment')}</th>
                    {STUDENTS.map(s => <th key={s.id} className={styles.heatHead}>{s.name.split(' ')[0]}</th>)}
                    <th className={styles.heatHead}>Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {EXPERIMENTS_HEAT.map(exp => {
                    const validScores = exp.scores.filter(s => s > 0)
                    const avg = validScores.length ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0
                    return (
                      <tr key={exp.id}>
                        <td className={styles.heatLabel}>{exp.title}</td>
                        {exp.scores.map((score, i) => (
                          <td key={i} className={styles.heatCell} style={{ background: heatColor(score) }}>
                            <span style={{ color: score === 0 ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: '0.78rem' }}>
                              {score === 0 ? '–' : `${score}%`}
                            </span>
                          </td>
                        ))}
                        <td className={styles.heatCell} style={{ background: heatColor(avg) }}>
                          <span style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-primary)' }}>{avg}%</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'observations' && (
          <div className={`${styles.card} glass-card`}>
            <div className={styles.cardTitle}>📝 Observations</div>
            {observationsLoading ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading observations...</div>
            ) : observationsError ? (
              <div style={{ color: 'var(--accent-red)', fontSize: '0.9rem' }}>{observationsError}</div>
            ) : observations.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No observations submitted yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {observations.map((obs) => (
                  <div
                    key={obs.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid rgba(0,0,0,0.08)',
                      background: 'rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                      <div style={{ fontWeight: 700 }}>{obs.student_name} · {obs.student_class || 'Class'} </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatObservationTime(obs.created_at)}</div>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 6 }}>{getExperimentTitle(obs.experiment_id)}</div>
                    <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{obs.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className={styles.alertsGrid}>
            {ALERTS.map((a, i) => (
              <div key={i} className={`${styles.bigAlert} ${styles[`alert_${a.type}`]} glass-card`}>
                <div className={styles.bigAlertIcon}>{a.icon}</div>
                <div>
                  <div className={styles.alertName}>{a.name}</div>
                  <div className={styles.alertMsg}>{a.msg}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                    <button className="btn-primary" style={{ fontSize: '0.82rem', padding: '8px 16px' }} onClick={() => alert('Message sent!')}>{t('teacher.sendMessage')}</button>
                    <button className="btn-secondary" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>{t('teacher.viewProfile')}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    'on-track': { label: 'On Track', color: 'var(--accent-primary)', bg: 'rgba(0,212,255,0.1)' },
    'excelling': { label: 'Excelling', color: 'var(--accent-green)', bg: 'rgba(16,185,129,0.1)' },
    'needs-help': { label: 'Needs Help', color: 'var(--accent-amber)', bg: 'rgba(245,158,11,0.1)' },
    'at-risk': { label: 'At Risk', color: 'var(--accent-red)', bg: 'rgba(239,68,68,0.1)' },
  }
  const s = map[status] || map['on-track']
  return (
    <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: '0.72rem', fontFamily: 'var(--font-sans)', fontWeight: 600, color: s.color, background: s.bg, border: `1px solid ${s.color}30` }}>
      {s.label}
    </span>
  )
}

function StudentModal({ student, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div className="glass-card" style={{ maxWidth: 480, width: '100%', padding: 32 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.3rem', color: '#141414' }}>{student.name[0]}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{student.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{student.class} · Last active: {student.lastActive}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Avg Score', val: `${student.avgScore}%`, color: 'var(--accent-primary)' },
            { label: 'Experiments', val: `${student.completed}/10`, color: 'var(--accent-green)' },
            { label: 'Streak', val: `${student.streak} days`, color: 'var(--accent-amber)' },
            { label: 'Status', val: student.status.replace('-', ' '), color: student.status === 'at-risk' ? 'var(--accent-red)' : 'var(--accent-green)' },
          ].map((m, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: m.color }}>{m.val}</div>
            </div>
          ))}
        </div>
        {student.gap && (
          <div style={{ padding: 14, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--accent-amber)', marginBottom: 20 }}>
            Knowledge gap detected: <strong>{student.gap}</strong>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }} onClick={() => alert('Intervention plan created!')}>Create Intervention Plan</button>
          <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }} onClick={() => alert(`Message sent to ${student.name}!`)}>Send Message</button>
        </div>
      </div>
    </div>
  )
}
