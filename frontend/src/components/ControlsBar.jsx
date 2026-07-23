import React from 'react'

function formatLabel(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
}

export default function ControlsBar({ experiment, variables, onVariableChange }) {
  if (!experiment || !experiment.variables) return null

  const entries = Object.entries(experiment.variables)
  const sliders = entries.filter(([, cfg]) => cfg.min !== undefined)
  const selects = entries.filter(([, cfg]) => cfg.options)

  return (
    <div className="exp-controls-bar">
      {sliders.map(([key, cfg]) => {
        const value = variables[key] ?? cfg.default ?? cfg.min
        const range = cfg.max - cfg.min
        const pct = ((value - cfg.min) / range) * 100

        return (
          <div className="exp-control-group" key={key}>
            <div className="exp-control-label">
              <span>{formatLabel(key)}</span>
              <span className="exp-control-value">
                {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(2)) : value}{cfg.unit || ''}
              </span>
            </div>
            <input
              type="range"
              className="exp-slider"
              min={cfg.min}
              max={cfg.max}
              step={range <= 2 ? 0.01 : range <= 10 ? 0.1 : 1}
              value={value}
              onChange={e => onVariableChange(key, parseFloat(e.target.value))}
              style={{
                background: `linear-gradient(to right, rgba(0,212,255,0.5) 0%, rgba(0,212,255,0.8) ${pct}%, rgba(255,255,255,0.06) ${pct}%, rgba(255,255,255,0.06) 100%)`
              }}
            />
            <div className="exp-slider-ticks">
              <span>{cfg.min}{cfg.unit || ''}</span>
              <span>{cfg.max}{cfg.unit || ''}</span>
            </div>
          </div>
        )
      })}

      {selects.map(([key, cfg]) => (
        <div className="exp-control-group" key={key}>
          <div className="exp-control-label">
            <span>{formatLabel(key)}</span>
          </div>
          <div className="exp-select-group">
            {cfg.options.map(opt => (
              <button
                key={opt}
                className={`exp-select-btn ${variables[key] === opt ? 'active' : ''}`}
                onClick={() => onVariableChange(key, opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
