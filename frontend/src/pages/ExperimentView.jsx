import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { EXPERIMENTS } from '../utils/experiments'
import { useTheme } from '../hooks/useTheme'
import ControlsBar from '../components/ControlsBar'
import AITutorChat from '../components/AITutorChat'
import LiveGraph from '../components/LiveGraph'
import { experimentsAPI } from '../utils/api'
import '../styles/experiment.css'

// Lazy-load simulations
const PendulumSim = lazy(() => import('../simulations/PendulumSim'))
const OhmsLawSim = lazy(() => import('../simulations/OhmsLawSim'))
const PhotosynthesisSim = lazy(() => import('../simulations/PhotosynthesisSim'))
const ProjectileSim = lazy(() => import('../simulations/ProjectileSim'))
const AcidBaseSim = lazy(() => import('../simulations/AcidBaseSim'))

const SIM_MAP = {
  pendulum: PendulumSim,
  'ohms-law': OhmsLawSim,
  photosynthesis: PhotosynthesisSim,
  projectile: ProjectileSim,
  'acid-base': AcidBaseSim,
}

const GRAPH_CONFIG = {
  pendulum: { label: 'Angular Speed', unit: 'rad/s', color: '#059669' },
  'ohms-law': { label: 'Current', unit: 'A', color: '#059669' },
  photosynthesis: { label: 'O₂ Rate', unit: '%', color: '#059669' },
  projectile: { label: 'Height', unit: 'm', color: '#D97706' },
  'acid-base': { label: 'pH Value', unit: '', color: '#7C3AED' },
}

function getSubjectBadge(subject) {
  const s = (subject || '').toLowerCase()
  if (s === 'physics') return 'exp-badge-physics'
  if (s === 'chemistry') return 'exp-badge-chemistry'
  if (s === 'biology') return 'exp-badge-biology'
  return 'exp-badge-physics'
}

export default function ExperimentView() {
  const { t } = useTheme()
  const { id } = useParams()
  const navigate = useNavigate()
  const exp = EXPERIMENTS.find(e => e.id === id)

  const [variables, setVariables] = useState(() => {
    if (!exp) return {}
    const init = {}
    Object.entries(exp.variables || {}).forEach(([k, v]) => {
      init[k] = v.default ?? (v.options ? v.options[0] : v.min || 0)
    })
    return init
  })

  const [sidebarTab, setSidebarTab] = useState('tutor')
  const [running, setRunning] = useState(true)
  const [graphData, setGraphData] = useState([])
  const [completedObjectives, setCompletedObjectives] = useState([])
  const [observations, setObservations] = useState([])
  const [observationInput, setObservationInput] = useState('')
  const [observationsLoading, setObservationsLoading] = useState(false)
  const [observationsSaving, setObservationsSaving] = useState(false)
  const [observationsError, setObservationsError] = useState('')
  const [showCompletion, setShowCompletion] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [controlPanelPos, setControlPanelPos] = useState({ x: null, y: null })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const canvasFrameRef = useRef(null)

  // Keyboard shortcut: spacebar to pause/resume
  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        setRunning(r => !r)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Check completion
  useEffect(() => {
    if (exp && completedObjectives.length === exp.objectives.length && completedObjectives.length > 0) {
      setShowCompletion(true)
    }
  }, [completedObjectives, exp])

  useEffect(() => {
    let cancelled = false
    setObservationInput('')
    setObservations([])
    setObservationsError('')
    if (!exp?.id) return () => {}

    setObservationsLoading(true)
    experimentsAPI.listObservations(exp.id)
      .then((data) => {
        if (cancelled) return
        const list = (data.observations || []).map((obs) => ({
          id: obs.id,
          text: obs.text,
          time: obs.created_at || obs.time || Date.now(),
        }))
        setObservations(list)
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
  }, [exp?.id])

  const handleVariableChange = useCallback((key, value) => {
    setVariables(prev => ({ ...prev, [key]: value }))
  }, [])

  const stableOnDataPoint = useCallback((point) => {
    setGraphData(prev => [...prev, point].slice(-20))
  }, [])

  const toggleObjective = (idx) => {
    setCompletedObjectives(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )
  }

  const handleAddObservation = () => {
    const text = observationInput.trim()
    if (!text || !exp?.id || observationsSaving) return
    setObservationsSaving(true)
    setObservationsError('')
    experimentsAPI.addObservation(exp.id, text)
      .then((saved) => {
        const item = {
          id: saved.id || `${Date.now()}`,
          text: saved.text || text,
          time: saved.created_at || Date.now(),
        }
        setObservations(prev => [...prev, item].slice(-50))
        setObservationInput('')
      })
      .catch((err) => {
        setObservationsError(err.message || 'Failed to save observation')
      })
      .finally(() => setObservationsSaving(false))
  }

  const formatObservationTime = (timestamp) => {
    try {
      const date = new Date(timestamp)
      if (Number.isNaN(date.getTime())) return ''
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const handleFullscreen = () => {
    const el = canvasFrameRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen()
  }

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
      if (!document.fullscreenElement) {
        setControlPanelPos({ x: null, y: null })
      }
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  const handleDragStart = (e) => {
    if (!e.target.closest('.exp-fs-drag-handle')) return
    const panel = e.currentTarget
    const rect = panel.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setIsDragging(true)
  }

  const handleDrag = (e) => {
    if (!isDragging || !canvasFrameRef.current) return
    e.preventDefault()
    const frameRect = canvasFrameRef.current.getBoundingClientRect()
    let newX = e.clientX - frameRect.left - dragOffset.x
    let newY = e.clientY - frameRect.top - dragOffset.y

    const panelWidth = 200
    const panelHeight = 300
    newX = Math.max(10, Math.min(newX, frameRect.width - panelWidth - 10))
    newY = Math.max(50, Math.min(newY, frameRect.height - panelHeight - 70))

    setControlPanelPos({ x: newX, y: newY })
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  if (!exp) {
    return (
      <div className="exp-page">
        <div className="exp-header-spacer" />
        <div className="exp-notfound">
          <div style={{ textAlign: 'center' }}>
            <h2>Experiment Not Found</h2>
            <p>The experiment you're looking for doesn't exist.</p>
            <Link to="/labs" className="exp-back-btn" style={{ display: 'inline-flex' }}>← Back to Labs</Link>
          </div>
        </div>
      </div>
    )
  }

  const SimComponent = SIM_MAP[exp.id]
  const graphCfg = GRAPH_CONFIG[exp.id] || { label: 'Value', unit: '', color: '#00D4FF' }

  return (
    <div className="exp-page">
      <div className="exp-header-spacer" />
      {/* ── Header ── */}
      <div className="exp-header">
        <div className="exp-header-left">
          <Link to="/labs" className="exp-back-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Labs
          </Link>
          <div className="exp-title-group">
            <h1>
              <span style={{ fontSize: '1.4rem' }}>{exp.icon}</span>
              {exp.title}
              <span className={`exp-badge ${getSubjectBadge(exp.subject)}`}>{exp.subject}</span>
            </h1>
            <div className="exp-meta">{exp.chapter} · {exp.difficulty} · {exp.duration}</div>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="exp-layout">
        {/* Canvas Panel */}
        <div className="exp-canvas-panel">
          <div className="exp-canvas-frame" ref={canvasFrameRef}>
            {/* LIVE badge */}
            <div className="exp-live-badge">
              <div className="exp-live-dot" />
              LIVE
            </div>

            {/* Fullscreen */}
            <button className="exp-fullscreen-btn" onClick={handleFullscreen} title="Fullscreen">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
              </svg>
            </button>

            {/* Simulation Canvas */}
            {SimComponent && running && (
              <Suspense fallback={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(0,0,0,0.3)', fontFamily: "'Syne'" }}>
                  Loading simulation...
                </div>
              }>
                <SimComponent variables={variables} onDataPoint={stableOnDataPoint} />
              </Suspense>
            )}

            {!SimComponent && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(0,0,0,0.3)', fontFamily: "'Syne'", gap: 8 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <span>Simulation coming soon</span>
              </div>
            )}

            {/* Canvas controls */}
            <div className="exp-canvas-controls">
              <button className={`exp-canvas-btn ${running ? 'active' : ''}`} onClick={() => setRunning(r => !r)}>
                {running ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="4" height="16"/><rect x="15" y="4" width="4" height="16"/></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>
                )}
                {running ? 'Pause' : 'Play'}
              </button>
              <button className="exp-canvas-btn" onClick={() => {
                const init = {}
                Object.entries(exp.variables || {}).forEach(([k, v]) => {
                  init[k] = v.default ?? (v.options ? v.options[0] : v.min || 0)
                })
                setVariables(init)
                setGraphData([])
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                </svg>
                Reset
              </button>
            </div>

            {/* In-canvas controls for fullscreen */}
            {isFullscreen && (
              <div
                className="exp-canvas-fullscreen-controls"
                style={{
                  left: controlPanelPos.x !== null ? `${controlPanelPos.x}px` : 'auto',
                  top: controlPanelPos.y !== null ? `${controlPanelPos.y}px` : '170px',
                  right: controlPanelPos.x === null ? '16px' : 'auto',
                }}
                onMouseMove={handleDrag}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                <div className="exp-fs-drag-handle" onMouseDown={handleDragStart}>
                  <span>Controls</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 9h8M8 15h8"/>
                  </svg>
                </div>
                {Object.entries(exp.variables || {}).map(([key, cfg]) => {
                  if (cfg.options) {
                    return (
                      <div className="exp-fs-control-group" key={key}>
                        <div className="exp-fs-control-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</div>
                        <div className="exp-fs-select-group">
                          {cfg.options.map(opt => (
                            <button
                              key={opt}
                              className={`exp-fs-select-btn ${variables[key] === opt ? 'active' : ''}`}
                              onClick={() => handleVariableChange(key, opt)}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  const value = variables[key] ?? cfg.default ?? cfg.min
                  const range = cfg.max - cfg.min
                  const pct = ((value - cfg.min) / range) * 100
                  return (
                    <div className="exp-fs-control-group" key={key}>
                      <div className="exp-fs-control-label">
                        <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                        <span className="exp-fs-control-value">
                          {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(2)) : value}{cfg.unit || ''}
                        </span>
                      </div>
                      <input
                        type="range"
                        className="exp-fs-slider"
                        min={cfg.min}
                        max={cfg.max}
                        step={range <= 2 ? 0.01 : range <= 10 ? 0.1 : 1}
                        value={value}
                        onChange={e => handleVariableChange(key, parseFloat(e.target.value))}
                        style={{
                          background: `linear-gradient(to right, rgba(0,212,255,0.8) 0%, rgba(0,212,255,1) ${pct}%, rgba(255,255,255,0.3) ${pct}%, rgba(255,255,255,0.3) 100%)`
                        }}
                      />
                      <div className="exp-fs-slider-ticks">
                        <span>{cfg.min}{cfg.unit || ''}</span>
                        <span>{cfg.max}{cfg.unit || ''}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <ControlsBar
            experiment={exp}
            variables={variables}
            onVariableChange={handleVariableChange}
          />
        </div>

        {/* ── Sidebar ── */}
        <div className="exp-sidebar">
          <div className="exp-sidebar-tabs">
            <button className={`exp-sidebar-tab ${sidebarTab === 'tutor' ? 'active' : ''}`} onClick={() => setSidebarTab('tutor')}>
              🤖 AI Tutor
            </button>
            <button className={`exp-sidebar-tab ${sidebarTab === 'data' ? 'active' : ''}`} onClick={() => setSidebarTab('data')}>
              📊 Live Data
            </button>
            <button className={`exp-sidebar-tab ${sidebarTab === 'recorder' ? 'active' : ''}`} onClick={() => setSidebarTab('recorder')}>
              📝 {t('exp.dataRecorder')}
            </button>
            <button className={`exp-sidebar-tab ${sidebarTab === 'objectives' ? 'active' : ''}`} onClick={() => setSidebarTab('objectives')}>
              🎯 Goals
            </button>
          </div>

          {sidebarTab === 'tutor' && (
            <AITutorChat experimentId={exp.id} variables={variables} />
          )}

          {sidebarTab === 'data' && (
            <LiveGraph
              data={graphData}
              label={graphCfg.label}
              unit={graphCfg.unit}
              color={graphCfg.color}
            />
          )}

          {sidebarTab === 'recorder' && (
            <div className="exp-observations-panel">
              <div className="exp-observations">
                <div className="exp-observations-title">📝 {t('exp.dataRecorder')}</div>
                <textarea
                  className="exp-observations-input"
                  placeholder={t('exp.recordObservation')}
                  value={observationInput}
                  onChange={(e) => setObservationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault()
                      handleAddObservation()
                    }
                  }}
                />
                <div className="exp-observations-actions">
                  <button
                    className="exp-observations-btn"
                    type="button"
                    onClick={handleAddObservation}
                    disabled={!observationInput.trim() || observationsSaving}
                  >
                    {observationsSaving ? 'Saving...' : 'Add'}
                  </button>
                </div>
                <div className="exp-observations-list">
                  {observationsLoading ? (
                    <div className="exp-observations-empty">Loading observations...</div>
                  ) : observationsError ? (
                    <div className="exp-observations-empty">{observationsError}</div>
                  ) : observations.length === 0 ? (
                    <div className="exp-observations-empty">{t('exp.noObservations')}</div>
                  ) : (
                    observations.map((obs) => (
                      <div className="exp-observations-item" key={obs.id || obs.time}>
                        <div className="exp-observations-text">{obs.text}</div>
                        <div className="exp-observations-meta">{formatObservationTime(obs.time)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {sidebarTab === 'objectives' && (
            <div className="exp-objectives">
              <div className="exp-objectives-title">
                🎯 Learning Objectives ({completedObjectives.length}/{exp.objectives.length})
              </div>
              {exp.objectives.map((obj, i) => (
                <div
                  key={i}
                  className={`exp-obj-item ${completedObjectives.includes(i) ? 'done' : ''}`}
                  onClick={() => toggleObjective(i)}
                >
                  <div className="exp-obj-check">
                    {completedObjectives.includes(i) && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                  {obj}
                </div>
              ))}

              {/* Theory section */}
              <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(5,150,105,0.04)', border: '1px solid rgba(5,150,105,0.1)', borderRadius: 12 }}>
                <div style={{ fontFamily: "'Syne'", fontSize: 12, fontWeight: 700, color: 'rgba(5,150,105,0.6)', marginBottom: 8 }}>
                  📖 THEORY
                </div>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(0,0,0,0.5)', margin: 0 }}>
                  {exp.detailedNotes || exp.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Completion Overlay ── */}
      {showCompletion && (
        <div className="exp-completion-overlay" onClick={() => setShowCompletion(false)}>
          <div className="exp-completion-card" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '3rem' }}>🏆</div>
            <h2>Experiment Complete!</h2>
            <p>You've completed all objectives for <strong>{exp.title}</strong>. Great work, scientist!</p>
            <div style={{
              padding: '12px 16px', margin: '16px 0', background: 'rgba(5,150,105,0.06)',
              border: '1px solid rgba(5,150,105,0.15)', borderRadius: 12,
              fontFamily: "'JetBrains Mono'", fontSize: 12, color: 'rgba(0,0,0,0.5)', textAlign: 'left'
            }}>
              ✅ Objectives completed: {exp.objectives.length}/{exp.objectives.length}<br/>
              📊 Data points recorded: {graphData.length}<br/>
              🧪 Experiment: {exp.title}
            </div>
            <div className="exp-completion-actions">
              <button className="exp-btn-ghost" onClick={() => {
                setShowCompletion(false)
                setCompletedObjectives([])
                setGraphData([])
              }}>
                Retry
              </button>
              <button className="exp-btn-primary" onClick={() => navigate('/labs')}>
                Next Experiment →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
