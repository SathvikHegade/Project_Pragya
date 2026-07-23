import React, { useState, useRef, useCallback } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function LiveGraph({ data, label, unit, color }) {
  const [chartData, setChartData] = useState([])
  const dataRef = useRef([])

  // Accept data via prop updates
  React.useEffect(() => {
    if (data && data.length > 0) {
      const latest = data[data.length - 1]
      if (dataRef.current.length === 0 || dataRef.current[dataRef.current.length - 1].time !== latest.time) {
        dataRef.current = [...dataRef.current, latest].slice(-20)
        setChartData([...dataRef.current])
      }
    }
  }, [data])

  const exportCSV = useCallback(() => {
    if (chartData.length === 0) return
    const headers = 'Time (s),' + (label || 'Value') + '\n'
    const rows = chartData.map(d => `${d.time.toFixed(2)},${d.value.toFixed(4)}`).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `pragya_${label || 'data'}.csv`
    a.click(); URL.revokeObjectURL(url)
  }, [chartData, label])

  const accentColor = color || '#00D4FF'

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null
    return (
      <div style={{
        background: 'rgba(5,10,20,0.9)', border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: 8, padding: '8px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11
      }}>
        <div style={{ color: 'rgba(255,255,255,0.5)' }}>t = {payload[0].payload.time?.toFixed(1)}s</div>
        <div style={{ color: accentColor, fontWeight: 600 }}>{payload[0].value?.toFixed(2)} {unit || ''}</div>
      </div>
    )
  }

  return (
    <div className="exp-live-graph">
      <div className="exp-live-graph-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        Live Data — {label || 'Output'}
      </div>

      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <defs>
              <linearGradient id="graphGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity={0.3}/>
                <stop offset="100%" stopColor={accentColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)', fontFamily: "'JetBrains Mono'" }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false}
              tickFormatter={v => `${Number(v).toFixed(0)}s`}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)', fontFamily: "'JetBrains Mono'" }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone" dataKey="value" stroke={accentColor} strokeWidth={2}
              fill="url(#graphGrad)" dot={false}
              activeDot={{ r: 5, fill: accentColor, stroke: '#050A14', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Pulsing dot indicator */}
      {chartData.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: accentColor,
            animation: 'exp-pulse 1.5s ease-in-out infinite',
            boxShadow: `0 0 8px ${accentColor}`
          }}/>
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            Latest: {chartData[chartData.length - 1].value?.toFixed(2)} {unit || ''}
          </span>
        </div>
      )}

      <button className="exp-export-btn" onClick={exportCSV}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 6 }}>
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
        Export CSV
      </button>
    </div>
  )
}
