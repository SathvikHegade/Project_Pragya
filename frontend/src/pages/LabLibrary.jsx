import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { EXPERIMENTS, SUBJECTS, CLASSES, DIFFICULTIES } from '../utils/experiments'
import { getSubjectIcon, getExperimentIcon } from '../components/Icons'
import styles from './LabLibrary.module.css'

export default function LabLibrary() {
  const { t } = useTheme()
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('All')
  const [classFilter, setClassFilter] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [view, setView] = useState('grid')

  const filtered = useMemo(() => {
    return EXPERIMENTS.filter(e => {
      const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.chapter.toLowerCase().includes(search.toLowerCase())
      const matchSubject = subject === 'All' || e.subject === subject
      const matchClass = classFilter === 'All' || e.class === classFilter
      const matchDiff = difficulty === 'All' || e.difficulty === difficulty
      return matchSearch && matchSubject && matchClass && matchDiff
    })
  }, [search, subject, classFilter, difficulty])

  const reset = () => {
    setSearch('')
    setSubject('All')
    setClassFilter('All')
    setDifficulty('All')
  }

  const hasFilters = subject !== 'All' || classFilter !== 'All' || difficulty !== 'All' || search

  return (
    <div className={`${styles.page} pattern-grid`}>
      <div className={styles.container}>
        <div className={`${styles.header} animate-fade-in`}>
          <h1 className={styles.title}>{t('labs.title')}</h1>
          <p className={styles.sub}>{t('labs.subtitle')}</p>
        </div>

        <div className={`${styles.filterBar} animate-fade-in stagger-1`}>
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className={`input-field ${styles.searchInput}`}
              placeholder={t('labs.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.filterGroups}>
            <FilterGroup label={t('labs.filterSubject')} options={SUBJECTS} value={subject} onChange={setSubject} />
            <FilterGroup label={t('labs.filterClass')} options={CLASSES} value={classFilter} onChange={setClassFilter} />
            <FilterGroup label={t('labs.filterDifficulty')} options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />
          </div>

          <div className={styles.filterMeta}>
            <span className={styles.resultCount}>
              {t(filtered.length === 1 ? 'labs.experimentCount' : 'labs.experimentCountPlural').replace('{count}', filtered.length)}
            </span>
            {hasFilters && (
              <button className={styles.clearBtn} onClick={reset}>
                {t('labs.clearFilters')}
              </button>
            )}
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewBtn} ${view === 'grid' ? styles.viewActive : ''}`}
                onClick={() => setView('grid')}
                title={t('labs.gridView')}
                aria-label={t('labs.gridView')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </button>
              <button
                className={`${styles.viewBtn} ${view === 'list' ? styles.viewActive : ''}`}
                onClick={() => setView('list')}
                title={t('labs.listView')}
                aria-label={t('labs.listView')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className={`${styles.subjectTabs} animate-fade-in stagger-2`}>
          {SUBJECTS.map(s => (
            <button
              key={s}
              className={`${styles.subTab} ${s !== 'All' ? styles[`sub${s}`] : styles.subAll} ${subject === s ? styles.subTabActive : ''}`}
              onClick={() => setSubject(s)}
            >
              {s !== 'All' && (
                <span className={styles.subjectIcon}>
                  {getSubjectIcon(s, 18)}
                </span>
              )}
              {s}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className={`${styles.empty} animate-fade-in-scale`}>
            <div className={styles.emptyIcon}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <p>{t('labs.noResults')}</p>
            <button className="btn-secondary" onClick={reset}>{t('labs.resetFilters')}</button>
          </div>
        ) : (
          <div className={view === 'grid' ? styles.expGrid : styles.expList}>
            {filtered.map((exp, idx) => (
              <div key={exp.id} className={`animate-fade-in stagger-${Math.min(idx + 1, 8)}`}>
                {view === 'grid'
                  ? <ExperimentCard key={exp.id} exp={exp} />
                  : <ExperimentRow key={exp.id} exp={exp} />
                }
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterGroup({ label, options, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 600, flexShrink: 0 }}>
        {label}:
      </span>
      <select
        className="input-field"
        style={{ padding: '10px 16px', minWidth: 140, fontSize: '0.9rem', background: 'var(--bg-card)', border: '1.5px solid var(--border-default)', borderRadius: '10px' }}
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function ExperimentCard({ exp }) {
  const { t } = useTheme()
  const subjectClass = `badge-${exp.subject.toLowerCase()}`
  const subjectCardClass = `card${exp.subject}`

  return (
    <Link to={`/experiment/${exp.id}`} className={`${styles.expCard} ${styles[subjectCardClass]}`}>
      <div className={styles.cardTop} style={{ background: `linear-gradient(135deg, ${exp.color}15, ${exp.color}05)` }}>
        <span className={styles.expCardIcon} style={{ color: exp.color }}>
          {getExperimentIcon(exp.id, 40)}
        </span>
        <span className={`badge ${subjectClass}`}>{exp.subject}</span>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.expCardTitle}>{exp.title}</h3>
        <p className={styles.expCardDesc}>{exp.description}</p>

        <div className={styles.expCardMeta}>
          <span className={styles.metaTag}>{exp.class}</span>
          <span className={styles.metaTag}>{exp.duration}</span>
          <span className={`${styles.metaTag} ${styles[`diff${exp.difficulty}`]}`}>{exp.difficulty}</span>
        </div>

        <div className={styles.expCardChapter}>
          {t('labs.chapter')}: {exp.chapter}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.startBtn}>
          {t('labs.launch')}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </span>
      </div>
    </Link>
  )
}

function ExperimentRow({ exp }) {
  const { t } = useTheme()
  const subjectClass = `badge-${exp.subject.toLowerCase()}`
  const btnClass = exp.subject === 'Physics' ? 'btn-physics' : exp.subject === 'Chemistry' ? 'btn-chemistry' : 'btn-biology'

  return (
    <Link to={`/experiment/${exp.id}`} className={styles.expRow}>
      <span style={{ fontSize: '2.8rem', flexShrink: 0, color: exp.color }}>
        {getExperimentIcon(exp.id, 40)}
      </span>

      <div className={styles.rowInfo}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
          <h3 className={styles.expCardTitle}>{exp.title}</h3>
          <span className={`badge ${subjectClass}`}>{exp.subject}</span>
        </div>
        <p className={styles.expCardDesc}>{exp.description}</p>
      </div>

      <div className={styles.rowMeta}>
        <span className={`badge badge-${exp.difficulty.toLowerCase()}`}>{exp.difficulty}</span>
        <span className={`badge`} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
          {exp.class}
        </span>
      </div>

      <button className={`btn-primary ${btnClass}`} style={{ fontSize: '0.9rem', padding: '10px 22px', flexShrink: 0 }}>
        {t('labs.launchShort')}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </Link>
  )
}
