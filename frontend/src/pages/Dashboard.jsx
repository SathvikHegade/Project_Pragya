import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { EXPERIMENTS } from '../utils/experiments'
import { studentAPI, teacherAPI, aiAPI } from '../utils/api'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { user } = useAuth()
  const { t } = useTheme()
  const [quizAnswer, setQuizAnswer] = useState(null)
  const [aiMessage, setAiMessage] = useState('')
  const [teacherMessage, setTeacherMessage] = useState('')

  const isTeacher = (user?.role || '').toLowerCase() === 'teacher'

  const [studentProgress, setStudentProgress] = useState([])
  const [quiz, setQuiz] = useState(null)
  const [teacherStats, setTeacherStats] = useState(null)

  useEffect(() => {
    if (isTeacher) {
      teacherAPI.classOverview()
        .then(data => setTeacherStats(data))
        .catch(() => setTeacherStats({ total_students: 0, active_this_week: 0, class_avg_score: 0 }))
    } else {
      studentAPI.progress()
        .then(data => setStudentProgress(data.experiments || []))
        .catch(() => setStudentProgress([]))
      aiAPI.generateQuiz('pendulum')
        .then(data => {
          const q = data.questions?.[0]
          if (q) setQuiz({ ...q, answered: null })
        })
        .catch(() => {})
    }
  }, [isTeacher])

  const completedCount = studentProgress.filter(p => p.completed).length
  const scoredExps = studentProgress.filter(p => p.best_score > 0)
  const totalScore = scoredExps.length > 0
    ? Math.round(scoredExps.reduce((s, p) => s + p.best_score, 0) / scoredExps.length)
    : 0

  const streakDays = (() => {
    const days = new Set()
    studentProgress.forEach(p => {
      // best_score > 0 implies at least one session existed
      // We approximate streak from attempt count; real dates would need session API
    })
    // Without session timestamps we can only show 0 for new users
    return 0
  })()

  const recentExps = studentProgress
    .filter(p => p.best_score > 0)
    .map(p => {
      const exp = EXPERIMENTS.find(e => e.id === p.experiment_id)
      return { ...exp, ...p, score: p.best_score }
    })

  const rank = totalScore >= 90 ? 'Gold' : totalScore >= 70 ? 'Silver' : totalScore >= 40 ? 'Bronze' : 'Beginner'
  const rankPct = totalScore >= 90 ? 'Top 5%' : totalScore >= 70 ? 'Top 15%' : totalScore >= 40 ? 'Top 40%' : 'Just started'

  if (isTeacher) {
    const ts = teacherStats || { total_students: 0, active_this_week: 0, class_avg_score: 0 }

    return (
      <div className={styles.page}>
        <div className={styles.mesh} />
        <div className={styles.container}>
          <div className={`${styles.header} animate-fade-in`}>
            <div>
              <h1 className={styles.greeting}>{t(`dash.greeting${getGreeting()}`)}, {user?.name?.split(' ')[0] || 'Teacher'}!</h1>
              <p className={styles.subtitle}>{user?.subject || 'Physics'} · {user?.school || 'Government School'}</p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/teacher" className="btn-primary" style={{ padding: '12px 28px' }}>
                📊 Open Teacher Portal
              </Link>
              <Link to="/labs" className="btn-secondary" style={{ padding: '12px 24px' }}>
                🔬 Preview Labs
              </Link>
            </div>
          </div>

          <div className={`${styles.statsRow} animate-fade-in stagger-1`}>
            {[
              { icon: '👥', val: String(ts.total_students), label: 'Total Students', pct: Math.min(100, ts.total_students * 2) },
              { icon: '🏫', val: String(Math.max(1, Math.ceil(ts.total_students / 16))), label: 'Active Classes', pct: 60 },
              { icon: '⭐', val: `${ts.class_avg_score}%`, label: 'Avg Class Score', pct: ts.class_avg_score },
              { icon: '🔥', val: String(ts.active_this_week), label: 'Active This Week', pct: Math.min(100, ts.active_this_week * 5) },
            ].map((s, i) => (
              <div key={i} className={`${styles.statCard} glass-card`}>
                <div className={styles.statIcon}>{s.icon}</div>
                <div className={styles.statVal}>{s.val}</div>
                <div className={styles.statLab}>{s.label}</div>
                <div className="progress-bar" style={{ marginTop: 16 }}>
                  <div className="progress-fill" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.mainGrid}>
            <div className={styles.leftCol}>
              <div className={`${styles.aiCard} animate-fade-in stagger-2`}>
                <div className={styles.aiHeader}>
                  <div className={styles.aiAvatar}>🤖</div>
                  <div>
                    <div className={styles.aiName}>Teaching Assistant</div>
                    <div className={styles.aiStatus}>
                      <span className={styles.statusDot} />
                      Online · Class insights ready
                    </div>
                  </div>
                </div>
                <div className={styles.aiMessage}>{teacherMessage || 'Checking class performance...'}</div>
                <div className={styles.aiActions}>
                  <Link to="/teacher" className="btn-primary" style={{ fontSize: '0.9rem', padding: '10px 20px' }}>
                    Open Analytics
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.9rem', padding: '10px 20px' }}
                    onClick={() => setTeacherMessage('Tip: Use the heatmap to spot weak experiments, then assign a quick recap lab.')}
                  >
                    Get a Tip
                  </button>
                </div>
              </div>

              <div className={`${styles.quizCard} animate-fade-in stagger-3`}>
                <div className={styles.quizHeader}>
                  <span>Today's Focus</span>
                  <span className="badge badge-physics">Classes</span>
                </div>
                <div style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {ts.active_this_week > 0
                    ? `${ts.active_this_week} students active this week. Average score: ${ts.class_avg_score}%`
                    : 'No student activity recorded yet.'}
                </div>
              </div>
            </div>

            <div className={styles.rightCol}>
              <div className={`${styles.section} animate-fade-in stagger-2`}>
                <div className={styles.sectionHead}>
                  <h3>My Classes</h3>
                  <Link to="/teacher" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}>
                    View all
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 4 }}>
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
                <div style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {ts.total_students > 0
                    ? `${ts.total_students} students enrolled across your classes`
                    : 'No students enrolled yet.'}
                </div>
              </div>

              <div className={`${styles.section} animate-fade-in stagger-3`}>
                <div className={styles.sectionHead}>
                  <h3>Alerts & Insights</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 500 }}>Updated today</span>
                </div>
                <div style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {ts.active_this_week === 0
                    ? 'No student activity yet — students will appear here once they start experiments.'
                    : `${ts.active_this_week} students active this week. Keep encouraging participation!`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.mesh} />
      <div className={styles.container}>
        <div className={`${styles.header} animate-fade-in`}>
          <div>
            <h1 className={styles.greeting}>{t(`dash.greeting${getGreeting()}`)}, {user?.name?.split(' ')[0] || 'Student'}!</h1>
            <p className={styles.subtitle}>{user?.class || 'Class 9'} · {user?.school || 'Government School'}</p>
          </div>
          <Link to="/labs" className="btn-primary" style={{ padding: '12px 28px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            {t('dash.startExperiment')}
          </Link>
        </div>

        <div className={`${styles.statsRow} animate-fade-in stagger-1`}>
          <div className={`${styles.statCard} glass-card`}>
            <div className={styles.statIcon}>⚗</div>
            <div className={styles.statVal}>{completedCount}/10</div>
            <div className={styles.statLab}>{t('dash.experimentsCompleted')}</div>
            <div className="progress-bar" style={{ marginTop: 16 }}>
              <div className="progress-fill" style={{ width: `${completedCount * 10}%` }} />
            </div>
          </div>

          <div className={`${styles.statCard} glass-card`}>
            <div className={styles.statIcon}>⭐</div>
            <div className={styles.statVal}>{totalScore}%</div>
            <div className={styles.statLab}>{t('dash.averageScore')}</div>
            <div className="progress-bar" style={{ marginTop: 16 }}>
              <div className="progress-fill" style={{ width: `${totalScore}%` }} />
            </div>
          </div>

          <div className={`${styles.statCard} glass-card`}>
            <div className={styles.statIcon}>🔥</div>
            <div className={styles.statVal}>{streakDays}</div>
            <div className={styles.statLab}>{t('dash.dayStreak')}</div>
            <div className={styles.streakDots}>
              {[false, false, false, false, false, false, false].map((day, i) => (
                <div key={i} className={`${styles.streakDot} ${day ? styles.streakOn : ''}`} />
              ))}
            </div>
          </div>

          <div className={`${styles.statCard} glass-card`}>
            <div className={styles.statIcon}>🏆</div>
            <div className={styles.statVal}>{rank}</div>
            <div className={styles.statLab}>{t('dash.currentRank')}</div>
            <div className={styles.rankBadge}>{rankPct} in class</div>
          </div>
        </div>

        <div className={styles.mainGrid}>
          <div className={styles.leftCol}>
            <div className={`${styles.aiCard} animate-fade-in stagger-2`}>
              <div className={styles.aiHeader}>
                <div className={styles.aiAvatar}>🤖</div>
                <div>
                  <div className={styles.aiName}>{t('dash.aiTutor')}</div>
                  <div className={styles.aiStatus}>
                    <span className={styles.statusDot} />
                    {t('dash.aiOnline')}
                  </div>
                </div>
              </div>
              <div className={styles.aiMessage}>
                {aiMessage || (completedCount === 0
                  ? 'Welcome! Start your first experiment to begin your learning journey.'
                  : `Great progress! You've completed ${completedCount} experiment${completedCount !== 1 ? 's' : ''}. Keep going!`)}
              </div>
              <div className={styles.aiActions}>
                <Link to="/labs" className="btn-primary" style={{ fontSize: '0.9rem', padding: '10px 20px' }}>
                  {t('dash.startRecommended')}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '0.9rem', padding: '10px 20px' }}
                  onClick={() => setAiMessage('Try the Acid-Base Indicators experiment next — it\'s a great introduction to chemistry!')}
                >
                  {t('dash.askQuestion')}
                </button>
              </div>
            </div>

            {quiz && (
              <div className={`${styles.quizCard} animate-fade-in stagger-3`}>
                <div className={styles.quizHeader}>
                  <span>{t('dash.quickQuiz')}</span>
                  <span className="badge badge-physics">Physics</span>
                </div>
                <p className={styles.quizQ}>{quiz.question}</p>
                <div className={styles.quizOptions}>
                  {quiz.options.map((opt, i) => (
                    <button
                      key={i}
                      className={`${styles.quizOption} ${quizAnswer === i ? (i === quiz.correct ? styles.correct : styles.wrong) : ''} ${quizAnswer !== null && i === quiz.correct ? styles.correct : ''}`}
                      onClick={() => quizAnswer === null && setQuizAnswer(i)}
                      disabled={quizAnswer !== null}
                    >
                      <span className={styles.optLetter}>{String.fromCharCode(65 + i)}</span>
                      {opt}
                    </button>
                  ))}
                </div>
                {quizAnswer !== null && (
                  <div className={`${styles.quizResult} ${quizAnswer === quiz.correct ? styles.resultCorrect : styles.resultWrong}`}>
                    {quiz.explanation}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.rightCol}>
            <div className={`${styles.section} animate-fade-in stagger-2`}>
              <div className={styles.sectionHead}>
                <h3>{t('dash.recentExperiments')}</h3>
                <Link to="/labs" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}>
                  {t('dash.viewAll')}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 4 }}>
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
              <div className={styles.expList}>
                {recentExps.length === 0 && (
                  <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                    No experiments started yet. Begin your first experiment!
                  </div>
                )}
                {recentExps.map(exp => (
                  <Link key={exp.experiment_id} to={`/experiment/${exp.experiment_id}`} className={styles.expItem}>
                    <span className={styles.expItemIcon}>{exp.icon}</span>
                    <div className={styles.expItemInfo}>
                      <div className={styles.expItemTitle}>{exp.title}</div>
                      <div className={styles.expItemMeta}>{exp.attempts} attempt{exp.attempts !== 1 ? 's' : ''}</div>
                    </div>
                    <div className={styles.expItemRight}>
                      <div className={`${styles.expScore} ${exp.score >= 70 ? styles.scoreHigh : exp.score >= 40 ? styles.scoreMed : styles.scoreLow}`}>
                        {exp.score}%
                      </div>
                      {exp.completed && <span className={styles.doneTag}>Done</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className={`${styles.section} animate-fade-in stagger-3`}>
              <div className={styles.sectionHead}>
                <h3>{t('dash.recommendedNext')}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 500 }}>{t('dash.aiSuggested')}</span>
              </div>
              <div className={styles.recGrid}>
                {EXPERIMENTS.filter(e => !studentProgress.find(p => p.experiment_id === e.id && p.completed)).slice(0, 4).map(exp => (
                  <Link key={exp.id} to={`/experiment/${exp.id}`} className={styles.recCard}>
                    <span style={{ fontSize: '2rem' }}>{exp.icon}</span>
                    <div className={styles.recTitle}>{exp.title}</div>
                    <span className={`badge badge-${exp.subject.toLowerCase()}`}>{exp.subject}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}
