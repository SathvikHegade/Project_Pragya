import React, { useState, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import { teacherAPI } from '../utils/api'
import { EXPERIMENTS } from '../utils/experiments'
import styles from './TeacherDashboard.module.css'

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

  const [students, setStudents] = useState([])
  const [overview, setOverview] = useState(null)
  const [heatmap, setHeatmap] = useState([])
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    teacherAPI.students()
      .then(data => setStudents(data.students || []))
      .catch(() => setStudents([]))
    teacherAPI.classOverview()
      .then(data => setOverview(data))
      .catch(() => setOverview({ total_students: 0, active_this_week: 0, class_avg_score: 0 }))
    teacherAPI.heatmap()
      .then(data => setHeatmap(data.heatmap || []))
      .catch(() => setHeatmap([]))
    teacherAPI.alerts()
      .then(data => setAlerts(data.alerts || []))
      .catch(() => setAlerts([]))
  }, [])

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

  const atRisk = students.filter(s => (Number(s.avg_score) || 0) < 50).length
  const excelling = students.filter(s => (Number(s.avg_score) || 0) >= 80).length
  const avgScore = students.length > 0
    ? Math.round(students.reduce((a, s) => a + (Number(s.avg_score) || 0), 0) / students.length)
    : 0
  const avgCompleted = students.length > 0
    ? Math.round(students.reduce((a, s) => a + (Number(s.sessions) || 0), 0) / students.length)
    : 0

  const getStudentStatus = (s) => {
    const score = Number(s.avg_score) || 0
    const sessions = Number(s.sessions) || 0
    if (score >= 80) return 'excelling'
    if (score >= 60) return 'on-track'
    if (sessions === 0 || score < 40) return 'at-risk'
    return 'needs-help'
  }

  const studentsWithStatus = students.map(s => ({
    ...s,
    id: s.id,
    name: s.name,
    class: s.class || 'Unknown',
    completed: Number(s.sessions) || 0,
    avgScore: Number(s.avg_score) || 0,
    streak: 0,
    lastActive: 'N/A',
    status: getStudentStatus(s),
    gap: (Number(s.avg_score) || 0) < 50 ? 'Low scores detected' : null,
  }))

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

  const heatmapByExperiment = {}
  heatmap.forEach(h => {
    const expId = h.experiment_id
    if (!heatmapByExperiment[expId]) {
      heatmapByExperiment[expId] = { id: expId, title: getExperimentTitle(expId), scores: {} }
    }
    heatmapByExperiment[expId].scores[h.user_id] = Number(h.best_score) || 0
  })
  const heatmapData = Object.values(heatmapByExperiment)

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{t('teacher.title')}</h1>
            <p className={styles.sub}>{t('teacher.subtitle').replace('{count}', students.length)}</p>
          </div>
          <button className="btn-primary" onClick={() => alert('Weekly PDF report generated!')}>
            📄 {t('teacher.exportReport')}
          </button>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          {[
            { icon: '👨‍🎓', val: overview?.total_students || students.length, label: t('teacher.totalStudents'), color: 'var(--accent-primary)' },
            { icon: '⚠️', val: atRisk, label: t('teacher.atRisk'), color: 'var(--accent-red)' },
            { icon: '🏆', val: excelling, label: t('teacher.excelling'), color: 'var(--accent-green)' },
            { icon: '⭐', val: `${overview?.class_avg_score || avgScore}%`, label: t('teacher.classAvgScore'), color: 'var(--accent-amber)' },
            { icon: '🧪', val: `${overview?.active_this_week || 0}`, label: 'Active This Week', color: 'var(--accent-secondary)' },
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
              {tab === 'overview' && '📊'} {tab === 'students' && '👥'} {tab === 'heatmap' && '🔥'} {tab === 'alerts' && `🔔 ${alerts.length}`} {tab === 'observations' && '📝'}
              {' '}{tab === 'overview' ? t('teacher.tabOverview') : tab === 'students' ? t('teacher.tabStudents') : tab === 'heatmap' ? t('teacher.tabHeatmap') : tab === 'alerts' ? t('teacher.tabAlerts') : 'Observations'}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className={styles.overviewGrid}>
            <div className={`${styles.card} glass-card`}>
              <div className={styles.cardTitle}>🔔 {t('teacher.priorityAlerts')}</div>
              <div className={styles.alertList}>
                {alerts.length === 0 && (
                  <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No alerts — all students are active.
                  </div>
                )}
                {alerts.map((a, i) => (
                  <div key={i} className={`${styles.alertItem} ${styles.alert_gap}`}>
                    <span className={styles.alertIcon}>⚠️</span>
                    <div>
                      <div className={styles.alertName}>{a.student}</div>
                      <div className={styles.alertMsg}>{a.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${styles.card} glass-card`}>
              <div className={styles.cardTitle}>🏅 {t('teacher.topPerformers')}</div>
              <div className={styles.studentList}>
                {studentsWithStatus.length === 0 && (
                  <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No students yet.</div>
                )}
                {studentsWithStatus.sort((a, b) => b.avgScore - a.avgScore).slice(0, 4).map((s, i) => (
                  <div key={s.id} className={styles.studentRow}>
                    <div className={styles.rank}>#{i + 1}</div>
                    <div className={styles.avatar}>{s.name[0]}</div>
                    <div className={styles.sInfo}>
                      <div className={styles.sName}>{s.name}</div>
                      <div className={styles.sMeta}>{s.class} · {s.completed} sessions</div>
                    </div>
                    <div className={styles.sScore}>{s.avgScore}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${styles.card} glass-card`}>
              <div className={styles.cardTitle}>⚠️ {t('teacher.needsAttention')}</div>
              <div className={styles.studentList}>
                {studentsWithStatus.filter(s => s.status === 'at-risk').length === 0 && (
                  <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No students at risk.</div>
                )}
                {studentsWithStatus.filter(s => s.status === 'at-risk').map(s => (
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

            <div className={`${styles.card} glass-card`}>
              <div className={styles.cardTitle}>📅 {t('teacher.thisWeek')}</div>
              <div style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                {overview?.active_this_week > 0
                  ? `${overview.active_this_week} active sessions this week`
                  : 'No sessions recorded this week yet'}
              </div>
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
                    <th>{t('teacher.tableStatus')}</th>
                    <th>{t('teacher.tableAction')}</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsWithStatus.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No students enrolled yet.</td></tr>
                  )}
                  {studentsWithStatus.map(s => (
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
                            <div className="progress-fill" style={{ width: `${Math.min(100, s.completed * 10)}%` }} />
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.completed} sessions</span>
                        </div>
                      </td>
                      <td><span style={{ fontFamily: 'var(--font-mono)', color: s.avgScore >= 80 ? 'var(--accent-green)' : s.avgScore >= 60 ? 'var(--accent-amber)' : 'var(--accent-red)' }}>{s.avgScore}%</span></td>
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
            {heatmapData.length === 0 ? (
              <div style={{ padding: '24px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>
                No experiment data yet. Students will appear here once they complete experiments.
              </div>
            ) : (
              <div className={styles.heatmapWrap}>
                <table className={styles.heatmap}>
                  <thead>
                    <tr>
                      <th className={styles.heatHead}>{t('teacher.experiment')}</th>
                      <th className={styles.heatHead}>Avg Score</th>
                      <th className={styles.heatHead}>Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heatmapData.map(exp => {
                      const scores = Object.values(exp.scores)
                      const validScores = scores.filter(s => s > 0)
                      const avg = validScores.length ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0
                      return (
                        <tr key={exp.id}>
                          <td className={styles.heatLabel}>{exp.title}</td>
                          <td className={styles.heatCell} style={{ background: heatColor(avg) }}>
                            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{avg}%</span>
                          </td>
                          <td className={styles.heatCell}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{validScores.length}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
            {alerts.length === 0 && (
              <div className={`${styles.card} glass-card`} style={{ padding: 24, color: 'var(--text-muted)', textAlign: 'center' }}>
                No alerts — all students are performing well.
              </div>
            )}
            {alerts.map((a, i) => (
              <div key={i} className={`${styles.bigAlert} ${styles.alert_gap} glass-card`}>
                <div className={styles.bigAlertIcon}>⚠️</div>
                <div>
                  <div className={styles.alertName}>{a.student}</div>
                  <div className={styles.alertMsg}>{a.message}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                    <button className="btn-primary" style={{ fontSize: '0.82rem', padding: '8px 16px' }} onClick={() => alert('Message sent!')}>{t('teacher.sendMessage')}</button>
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
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{student.class}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Avg Score', val: `${student.avgScore}%`, color: 'var(--accent-primary)' },
            { label: 'Sessions', val: `${student.completed}`, color: 'var(--accent-green)' },
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
            Attention needed: <strong>{student.gap}</strong>
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
