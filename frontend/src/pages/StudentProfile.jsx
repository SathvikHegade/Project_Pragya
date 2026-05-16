import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { EXPERIMENTS } from '../utils/experiments'
import styles from './StudentProfile.module.css'

const ACHIEVEMENTS = [
  { icon: '🔭', title: 'First Experiment', desc: 'Completed your first virtual lab', earned: true },
  { icon: '⚡', title: 'Speed Learner', desc: 'Finished an experiment under 15 minutes', earned: true },
  { icon: '🔥', title: '7-Day Streak', desc: 'Logged in 7 days in a row', earned: false },
  { icon: '🏆', title: 'Top Scorer', desc: 'Scored 90%+ in 3 experiments', earned: false },
  { icon: '🧪', title: 'Lab Master', desc: 'Completed all 10 experiments', earned: false },
  { icon: '🌟', title: 'All-Rounder', desc: 'Scored 80%+ in Physics, Chemistry & Biology', earned: false },
]

const HISTORY = [
  { id: 'pendulum', score: 92, date: '2 days ago', time: '18 min' },
  { id: 'ohms-law', score: 78, date: '5 days ago', time: '24 min' },
  { id: 'acid-base', score: 45, date: '1 week ago', time: '12 min' },
]

export default function StudentProfile() {
  const { user } = useAuth()
  const { t } = useTheme()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || 'Demo Student',
    school: user?.school || 'Government Higher Secondary School',
    class: user?.class || 'Class 9',
    language: user?.language || 'en',
  })

  const expWithHistory = HISTORY.map(h => ({ ...h, ...EXPERIMENTS.find(e => e.id === h.id) }))

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>{t('profile.title')}</h1>

        <div className={styles.layout}>
          {/* Left: Profile card */}
          <div className={styles.leftCol}>
            <div className={`${styles.profileCard} glass-card`}>
              <div className={styles.avatarBig}>
                {form.name[0]?.toUpperCase()}
              </div>
              {editing ? (
                <div className={styles.editForm}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Full Name</label>
                    <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>School</label>
                    <input className="input-field" value={form.school} onChange={e => setForm({ ...form, school: e.target.value })} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Class</label>
                    <select className="input-field" value={form.class} onChange={e => setForm({ ...form, class: e.target.value })}>
                      {['Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Language</label>
                    <select className="input-field" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}>
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
                  <div className={styles.profileName}>{form.name}</div>
                  <div className={styles.profileRole}>{user?.role || 'Student'}</div>
                  <div className={styles.profileMeta}>
                    <div className={styles.metaRow}><span>🏫</span>{form.school}</div>
                    <div className={styles.metaRow}><span>📚</span>{form.class}</div>
                    <div className={styles.metaRow}><span>🌐</span>{{en:'English',hi:'हिन्दी',kn:'ಕನ್ನಡ',te:'తెలుగు',ta:'தமிழ்'}[form.language]}</div>
                    <div className={styles.metaRow}><span>📧</span>{user?.email || 'demo@pragya.in'}</div>
                  </div>
                  <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }} onClick={() => setEditing(true)}>
                    ✏️ {t('profile.editProfile')}
                  </button>
                </>
              )}
            </div>

            {/* Learning stats */}
            <div className={`${styles.statsCard} glass-card`}>
              <div className={styles.secTitle}>{t('profile.learningStats')}</div>
              {[
                { label: t('profile.experimentsCompleted'), val: '2/10', pct: 20 },
                { label: t('profile.averageScore'), val: '72%', pct: 72 },
                { label: t('profile.physicsMastery'), val: '65%', pct: 65 },
                { label: t('profile.chemistryMastery'), val: '45%', pct: 45 },
                { label: t('profile.biologyMastery'), val: '0%', pct: 0 },
              ].map((s, i) => (
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
            {/* Achievements */}
            <div className={`${styles.card} glass-card`}>
              <div className={styles.secTitle}>{t('profile.achievements')}</div>
              <div className={styles.achieveGrid}>
                {ACHIEVEMENTS.map((a, i) => (
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
                {expWithHistory.map((h, i) => (
                  <div key={i} className={styles.historyItem}>
                    <span style={{ fontSize: '1.8rem' }}>{h.icon}</span>
                    <div className={styles.histInfo}>
                      <div className={styles.histTitle}>{h.title}</div>
                      <div className={styles.histMeta}>{h.date} · ⏱ {h.time} · {h.subject}</div>
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
                      '✓ Strong conceptual understanding of pendulum mechanics',
                      '⚠️ Acid-Base chemistry needs reinforcement — try the experiment again',
                      '💡 Recommended next: Photosynthesis Rate (Biology · Class 10)',
                      '📈 Your score trend is improving! +14% over last 3 experiments',
                    ].map((tip, i) => (
                      <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
