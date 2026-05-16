import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { EXPERIMENTS } from '../utils/experiments'
import styles from './Dashboard.module.css'

const MOCK_PROGRESS = [
  { id: 'pendulum', completed: true, score: 92, attempts: 3, lastPlayed: '2 days ago' },
  { id: 'ohms-law', completed: true, score: 78, attempts: 2, lastPlayed: '5 days ago' },
  { id: 'acid-base', completed: false, score: 45, attempts: 1, lastPlayed: '1 week ago' },
  { id: 'photosynthesis', completed: false, score: 0, attempts: 0, lastPlayed: null },
]

const MOCK_QUIZ = [
  { question: 'What happens to the period if you double the pendulum length?', options: ['Doubles', 'Halves', 'Increases by √2', 'No change'], correct: 2, answered: null },
]

const STREAK_DAYS = [true, true, true, false, true, true, false]

export default function Dashboard() {
  const { user } = useAuth()
  const { t } = useTheme()
  const [quizAnswer, setQuizAnswer] = useState(null)
  const [aiMessage, setAiMessage] = useState("Welcome back! Based on your progress, I recommend trying the Acid-Base Indicators experiment next. You're close to mastering this concept!")

  const completedCount = MOCK_PROGRESS.filter(p => p.completed).length
  const totalScore = Math.round(MOCK_PROGRESS.filter(p => p.score > 0).reduce((s, p) => s + p.score, 0) / MOCK_PROGRESS.filter(p => p.score > 0).length)
  const streak = STREAK_DAYS.filter(Boolean).length

  const recentExps = MOCK_PROGRESS
    .filter(p => p.lastPlayed)
    .map(p => ({ ...EXPERIMENTS.find(e => e.id === p.id), ...p }))

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
            <div className={styles.statVal}>{streak}</div>
            <div className={styles.statLab}>{t('dash.dayStreak')}</div>
            <div className={styles.streakDots}>
              {STREAK_DAYS.map((day, i) => (
                <div key={i} className={`${styles.streakDot} ${day ? styles.streakOn : ''}`} />
              ))}
            </div>
          </div>

          <div className={`${styles.statCard} glass-card`}>
            <div className={styles.statIcon}>🏆</div>
            <div className={styles.statVal}>Silver</div>
            <div className={styles.statLab}>{t('dash.currentRank')}</div>
            <div className={styles.rankBadge}>Top 15% in class</div>
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
              <div className={styles.aiMessage}>{aiMessage}</div>
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
                  onClick={() => setAiMessage("Great question! Acid-base chemistry is all about pH. Remember: pH < 7 is acidic, pH = 7 is neutral, pH > 7 is basic. The indicator changes colour based on this!")}
                >
                  {t('dash.askQuestion')}
                </button>
              </div>
            </div>

            <div className={`${styles.quizCard} animate-fade-in stagger-3`}>
              <div className={styles.quizHeader}>
                <span>{t('dash.quickQuiz')}</span>
                <span className="badge badge-physics">Physics · Class 9</span>
              </div>
              <p className={styles.quizQ}>{MOCK_QUIZ[0].question}</p>
              <div className={styles.quizOptions}>
                {MOCK_QUIZ[0].options.map((opt, i) => (
                  <button
                    key={i}
                    className={`${styles.quizOption} ${quizAnswer === i ? (i === MOCK_QUIZ[0].correct ? styles.correct : styles.wrong) : ''} ${quizAnswer !== null && i === MOCK_QUIZ[0].correct ? styles.correct : ''}`}
                    onClick={() => quizAnswer === null && setQuizAnswer(i)}
                    disabled={quizAnswer !== null}
                  >
                    <span className={styles.optLetter}>{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </button>
                ))}
              </div>
              {quizAnswer !== null && (
                <div className={`${styles.quizResult} ${quizAnswer === MOCK_QUIZ[0].correct ? styles.resultCorrect : styles.resultWrong}`}>
                  {quizAnswer === MOCK_QUIZ[0].correct
                    ? 'Correct! When length quadruples, period doubles (T ∝ √L)'
                    : 'The period T ∝ √L, so doubling L increases T by √2 ≈ 1.41x'}
                </div>
              )}
            </div>
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
                {recentExps.map(exp => (
                  <Link key={exp.id} to={`/experiment/${exp.id}`} className={styles.expItem}>
                    <span className={styles.expItemIcon}>{exp.icon}</span>
                    <div className={styles.expItemInfo}>
                      <div className={styles.expItemTitle}>{exp.title}</div>
                      <div className={styles.expItemMeta}>{exp.lastPlayed} · {exp.attempts} attempt{exp.attempts !== 1 ? 's' : ''}</div>
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
                {EXPERIMENTS.filter(e => !MOCK_PROGRESS.find(p => p.id === e.id && p.completed)).slice(0, 4).map(exp => (
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
