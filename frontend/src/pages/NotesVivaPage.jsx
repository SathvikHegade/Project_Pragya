import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { EXPERIMENTS } from '../utils/experiments'
import { useTheme } from '../hooks/useTheme'
import styles from './NotesVivaPage.module.css'

export default function NotesVivaPage() {
  const { t } = useTheme()
  const [openExp, setOpenExp] = useState(null)
  const [openViva, setOpenViva] = useState(null)

  const subjects = ['All', 'Physics', 'Chemistry', 'Biology']
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? EXPERIMENTS : EXPERIMENTS.filter(e => e.subject === filter)

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{t('nav.notesViva')}</h1>
            <p className={styles.subtitle}>Detailed notes and viva questions for all experiments</p>
          </div>
        </div>

        <div className={styles.filters}>
          {subjects.map(s => (
            <button key={s} className={`${styles.filterBtn} ${filter === s ? styles.filterActive : ''}`}
              onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>

        <div className={styles.list}>
          {filtered.map(exp => {
            const isOpen = openExp === exp.id
            return (
              <div key={exp.id} className={styles.card}>
                <button className={styles.cardHeader} onClick={() => setOpenExp(isOpen ? null : exp.id)}>
                  <div className={styles.cardInfo}>
                    <span className={styles.cardIcon}>{exp.icon}</span>
                    <div>
                      <div className={styles.cardTitle}>{exp.title}</div>
                      <div className={styles.cardMeta}>
                        <span className={`badge badge-${exp.subject.toLowerCase()}`}>{exp.subject}</span>
                        <span className={styles.metaItem}>{exp.class}</span>
                        <span className={styles.metaItem}>{exp.chapter}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <Link to={`/experiment/${exp.id}`} className={styles.launchBtn} onClick={e => e.stopPropagation()}>
                      Launch
                    </Link>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s', color: 'var(--text-muted)' }}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className={styles.cardBody}>
                    {exp.detailedNotes && (
                      <div className={styles.notesSection}>
                        <div className={styles.sectionTitle}>Detailed Notes</div>
                        <div className={styles.notesText}>{exp.detailedNotes}</div>
                      </div>
                    )}

                    {exp.vivaQuestions && (
                      <div className={styles.vivaSection}>
                        <div className={styles.sectionTitle}>Viva Questions (20)</div>
                        {exp.vivaQuestions.map((item, i) => (
                          <div key={i} className={styles.vivaItem}>
                            <button className={styles.vivaQ} onClick={() => setOpenViva(openViva === `${exp.id}-${i}` ? null : `${exp.id}-${i}`)}>
                              <span className={styles.vivaNum}>{i + 1}.</span>
                              <span className={styles.vivaText}>{item.q}</span>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                style={{ transform: openViva === `${exp.id}-${i}` ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0, marginLeft: 'auto' }}>
                                <path d="M6 9l6 6 6-6"/>
                              </svg>
                            </button>
                            {openViva === `${exp.id}-${i}` && (
                              <div className={styles.vivaA}>{item.a}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
