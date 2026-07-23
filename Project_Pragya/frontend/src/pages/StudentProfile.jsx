import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { EXPERIMENTS } from '../utils/experiments'
import { studentAPI, teacherAPI } from '../utils/api'
import styles from './StudentProfile.module.css'

export default function StudentProfile() {
  const { user } = useAuth()
  const { t } = useTheme()
  const isTeacher = (user?.role || '').toLowerCase() === 'teacher'
  const [editing, setEditing] = useState(false)
  const [studentForm, setStudentForm] = useState({
    name: user?.name || '',
    school: user?.school || '',
    class: user?.class || '',
    language: user?.language || 'en',
  })
  const [teacherForm, setTeacherForm] = useState({
    name: user?.name || '',
    school: user?.school || '',
    subject: user?.subject || 'Physics',
    classes: user?.classes || '',
    language: user?.language || 'en',
  })

  const [progress, setProgress] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [teacherStats, setTeacherStats] = useState(null)
  const [teacherStudents, setTeacherStudents] = useState([])

  useEffect(() => {
    if (isTeacher) {
      teacherAPI.classOverview()
        .then(data => setTeacherStats(data))
        .catch(() => setTeacherStats({ total_students: 0, active_this_week: 0, class_avg_score: 0 }))
      teacherAPI.students()
        .then(data => setTeacherStudents(data.students || []))
        .catch(() => setTeacherStudents([]))
    } else {
      studentAPI.progress()
        .then(data => setProgress(data.experiments || []))
        .catch(() => setProgress([]))
      studentAPI.quizzes()
        .then(data => setQuizzes(data.quizzes || []))
        .catch(() => setQuizzes([]))
    }
  }, [isTeacher])

  const completedCount = progress.filter(p => p.completed).length
  const scoredExps = progress.filter(p => p.best_score > 0)
  const avgScore = scoredExps.length > 0
    ? Math.round(scoredExps.reduce((s, p) => s + p.best_score, 0) / scoredExps.length)
    : 0

  const subjectScores = {}
  scoredExps.forEach(p => {
    const exp = EXPERIMENTS.find(e => e.id === p.experiment_id)
    if (exp) {
      if (!subjectScores[exp.subject]) subjectScores[exp.subject] = []
      subjectScores[exp.subject].push(p.best_score)
    }
  })
  const subjectAvg = (subj) => {
    const scores = subjectScores[subj]
    if (!scores || scores.length === 0) return 0
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  const achievements = [
    { icon: '🔭', title: 'First Experiment', desc: 'Completed your first virtual lab', earned: completedCount >= 1 },
    { icon: '⚡', title: 'Speed Learner', desc: 'Finished an experiment under 15 minutes', earned: false },
    { icon: '🔥', title: '7-Day Streak', desc: 'Logged in 7 days in a row', earned: false },
    { icon: '🏆', title: 'Top Scorer', desc: 'Scored 90%+ in 3 experiments', earned: scoredExps.filter(p => p.best_score >= 90).length >= 3 },
    { icon: '🧪', title: 'Lab Master', desc: 'Completed all 10 experiments', earned: completedCount >= 10 },
    { icon: '🌟', title: 'All-Rounder', desc: 'Scored 80%+ in Physics, Chemistry & Biology', earned: subjectAvg('Physics') >= 80 && subjectAvg('Chemistry') >= 80 && subjectAvg('Biology') >= 80 },
  ]

  const history = scoredExps.map(p => {
    const exp = EXPERIMENTS.find(e => e.id === p.experiment_id)
    return { experiment_id: p.experiment_id, score: p.best_score, attempts: p.attempts, completed: p.completed, ...exp }
  })

  const learningStats = isTeacher ? [
    { label: 'Total Students', val: String(teacherStats?.total_students || 0), pct: Math.min(100, (teacherStats?.total_students || 0) * 2) },
    { label: 'Active This Week', val: String(teacherStats?.active_this_week || 0), pct: Math.min(100, (teacherStats?.active_this_week || 0) * 5) },
    { label: 'Avg Class Score', val: `${teacherStats?.class_avg_score || 0}%`, pct: teacherStats?.class_avg_score || 0 },
  ] : [
    { label: t('profile.experimentsCompleted'), val: `${completedCount}/10`, pct: completedCount * 10 },
    { label: t('profile.averageScore'), val: `${avgScore}%`, pct: avgScore },
    { label: t('profile.physicsMastery'), val: `${subjectAvg('Physics')}%`, pct: subjectAvg('Physics') },
    { label: t('profile.chemistryMastery'), val: `${subjectAvg('Chemistry')}%`, pct: subjectAvg('Chemistry') },
    { label: t('profile.biologyMastery'), val: `${subjectAvg('Biology')}%`, pct: subjectAvg('Biology') },
  ]

  const teacherClasses = teacherStudents.length > 0
    ? (() => {
        const classMap = {}
        teacherStudents.forEach(s => {
          const cls = s.class || 'Unknown'
          if (!classMap[cls]) classMap[cls] = { count: 0, totalScore: 0 }
          classMap[cls].count++
          classMap[cls].totalScore += Number(s.avg_score) || 0
        })
        return Object.entries(classMap).map(([cls, data]) => ({
          icon: '🏫',
          title: `Class ${cls}`,
          meta: `${data.count} students · Avg ${data.count > 0 ? Math.round(data.totalScore / data.count) : 0}%`,
          score: `${data.count > 0 ? Math.round(data.totalScore / data.count) : 0}%`,
        }))
      })()
    : []

  const teacherAlerts = teacherStudents.filter(s => (Number(s.avg_score) || 0) < 50 || (Number(s.sessions) || 0) === 0)
    .map(s => {
      if ((Number(s.sessions) || 0) === 0) return `${s.name} has not started any experiments yet`
      return `${s.name} has a low average score (${Math.round(Number(s.avg_score) || 0)}%) — may need support`
    })

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>{isTeacher ? 'Teacher Profile' : t('profile.title')}</h1>

        <div className={styles.layout}>
          {/* Left: Profile card */}
          <div className={styles.leftCol}>
            <div className={`${styles.profileCard} glass-card`}>
              <div className={styles.avatarBig}>
                {(isTeacher ? teacherForm.name : studentForm.name)[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || '?'}
              </div>
              {editing ? (
                <div className={styles.editForm}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Full Name</label>
                    <input
                      className="input-field"
                      value={isTeacher ? teacherForm.name : studentForm.name}
                      onChange={e => isTeacher
                        ? setTeacherForm({ ...teacherForm, name: e.target.value })
                        : setStudentForm({ ...studentForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>School</label>
                    <input
                      className="input-field"
                      value={isTeacher ? teacherForm.school : studentForm.school}
                      onChange={e => isTeacher
                        ? setTeacherForm({ ...teacherForm, school: e.target.value })
                        : setStudentForm({ ...studentForm, school: e.target.value })
                      }
                    />
                  </div>
                  {isTeacher ? (
                    <>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Subject</label>
                        <input className="input-field" value={teacherForm.subject} onChange={e => setTeacherForm({ ...teacherForm, subject: e.target.value })} />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Classes</label>
                        <input className="input-field" value={teacherForm.classes} onChange={e => setTeacherForm({ ...teacherForm, classes: e.target.value })} />
                      </div>
                    </>
                  ) : (
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Class</label>
                      <select className="input-field" value={studentForm.class} onChange={e => setStudentForm({ ...studentForm, class: e.target.value })}>
                        {['Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Language</label>
                    <select className="input-field" value={isTeacher ? teacherForm.language : studentForm.language} onChange={e => isTeacher
                      ? setTeacherForm({ ...teacherForm, language: e.target.value })
                      : setStudentForm({ ...studentForm, language: e.target.value })
                    }>
                      <option value="en">English</option>
                      <option value="hi">हिन्दी</option>
                      <option value="kn">ಕನ್ನಡ</option>
                      <option value="te">తెలుగు</option>
                      <option value="ta">தமிழ்</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }} onClick={() => setEditing(false)}>{t('profile.saveChanges')}</button>
                    <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }} onClick={() => setEditing(false)}>{t('profile.cancel')}</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.profileName}>{isTeacher ? teacherForm.name : studentForm.name}</div>
                  <div className={styles.profileRole}>{user?.role || 'Student'}</div>
                  <div className={styles.profileMeta}>
                    <div className={styles.metaRow}><span>🏫</span>{isTeacher ? teacherForm.school : studentForm.school}</div>
                    {isTeacher ? (
                      <>
                        <div className={styles.metaRow}><span>🧪</span>{teacherForm.subject}</div>
                        <div className={styles.metaRow}><span>👥</span>{teacherForm.classes || 'No classes assigned'}</div>
                      </>
                    ) : (
                      <div className={styles.metaRow}><span>📚</span>{studentForm.class || 'No class assigned'}</div>
                    )}
                    <div className={styles.metaRow}><span>🌐</span>{{en:'English',hi:'हिन्दी',kn:'ಕನ್ನಡ',te:'తెలుగు',ta:'தமிழ்'}[isTeacher ? teacherForm.language : studentForm.language]}</div>
                    <div className={styles.metaRow}><span>📧</span>{user?.email || ''}</div>
                  </div>
                  <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }} onClick={() => setEditing(true)}>
                    ✏️ {t('profile.editProfile')}
                  </button>
                </>
              )}
            </div>

            {/* Learning stats */}
            <div className={`${styles.statsCard} glass-card`}>
              <div className={styles.secTitle}>{isTeacher ? 'Teaching Summary' : t('profile.learningStats')}</div>
              {learningStats.map((s, i) => (
                <div key={i} className={styles.statItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.label}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--accent-primary)' }}>{s.val}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Achievements + History */}
          <div className={styles.rightCol}>
            {isTeacher ? (
              <>
                <div className={`${styles.card} glass-card`}>
                  <div className={styles.secTitle}>Active Classes</div>
                  <div className={styles.historyList}>
                    {teacherClasses.length === 0 && (
                      <div style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No class data yet.</div>
                    )}
                    {teacherClasses.map((c, i) => (
                      <div key={i} className={styles.historyItem}>
                        <span style={{ fontSize: '1.8rem' }}>{c.icon}</span>
                        <div className={styles.histInfo}>
                          <div className={styles.histTitle}>{c.title}</div>
                          <div className={styles.histMeta}>{c.meta}</div>
                        </div>
                        <div className={styles.histScore} style={{ color: 'var(--accent-primary)' }}>
                          {c.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`${styles.card} glass-card`}>
                  <div className={styles.secTitle}>Alerts & Focus</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {teacherAlerts.length === 0 && (
                      <div style={{ padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        All students are performing well!
                      </div>
                    )}
                    {teacherAlerts.map((tip, i) => (
                      <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`${styles.card} glass-card`}>
                  <div className={styles.secTitle}>Quick Actions</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="btn-primary" style={{ fontSize: '0.85rem' }}>View Teacher Portal</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Achievements */}
                <div className={`${styles.card} glass-card`}>
                  <div className={styles.secTitle}>{t('profile.achievements')}</div>
                  <div className={styles.achieveGrid}>
                    {achievements.map((a, i) => (
                      <div key={i} className={`${styles.achieve} ${!a.earned ? styles.achieveLocked : ''}`}>
                        <div className={styles.achieveIcon}>{a.icon}</div>
                        <div className={styles.achieveTitle}>{a.title}</div>
                        <div className={styles.achieveDesc}>{a.desc}</div>
                        {a.earned && <span className={styles.earnedBadge}>✓ Earned</span>}
                        {!a.earned && <span className={styles.lockedBadge}>🔒 Locked</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experiment history */}
                <div className={`${styles.card} glass-card`}>
                  <div className={styles.secTitle}>{t('profile.experimentHistory')}</div>
                  <div className={styles.historyList}>
                    {history.length === 0 && (
                      <div style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No experiments completed yet. Start your first experiment!
                      </div>
                    )}
                    {history.map((h, i) => (
                      <div key={i} className={styles.historyItem}>
                        <span style={{ fontSize: '1.8rem' }}>{h.icon || '🧪'}</span>
                        <div className={styles.histInfo}>
                          <div className={styles.histTitle}>{h.title || h.experiment_id}</div>
                          <div className={styles.histMeta}>{h.attempts} attempt{h.attempts !== 1 ? 's' : ''} · {h.subject || ''}</div>
                        </div>
                        <div className={styles.histScore} style={{ color: h.score >= 80 ? 'var(--accent-green)' : h.score >= 60 ? 'var(--accent-amber)' : 'var(--accent-red)' }}>
                          {h.score}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insights */}
                <div className={`${styles.card} glass-card`} style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.05), rgba(124,58,237,0.05))' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '2rem' }}>🤖</span>
                    <div>
                      <div className={styles.secTitle} style={{ marginBottom: 8 }}>{t('profile.aiInsights')}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                          completedCount === 0
                            ? 'Start your first experiment to unlock personalised insights!'
                            : `✓ You've completed ${completedCount} experiment${completedCount !== 1 ? 's' : ''} so far`,
                          avgScore > 0
                            ? `Your average score is ${avgScore}%${avgScore >= 70 ? ' — great work!' : avgScore >= 50 ? ' — keep improving!' : ' — focus on understanding the concepts'}`
                            : 'Complete experiments to see your score analysis',
                          scoredExps.length > 0
                            ? `💡 Recommended next: Try a new subject to broaden your knowledge`
                            : '💡 Tip: Start with simpler experiments and work your way up',
                          completedCount >= 5
                            ? '📈 You\'re making great progress! Consider trying advanced experiments.'
                            : 'Complete more experiments to unlock advanced recommendations',
                        ].map((tip, i) => (
                          <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
