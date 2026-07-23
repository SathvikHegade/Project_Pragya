import React, { useRef, useEffect, useCallback } from 'react'

const FONT_UI = "'Syne', sans-serif"
const FONT_MONO = "'JetBrains Mono', monospace"
const SOLUTION_BASE = {
  'Distilled Water': 0,
  'Salt Solution': 0.8,
  'Sugar Solution': 0.6
}
function lerp(a, b, t) { return a + (b - a) * t }

export default function OsmosisSim({ variables, onDataPoint }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    time: 0,
    dispVolume: 0.85
  })
  const varsRef = useRef(variables)
  varsRef.current = variables

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = canvas.width / dpr
    const H = canvas.height / dpr
    const s = stateRef.current

    s.time += 1 / 60
    const t = s.time

    const { concentration, solution } = varsRef.current
    const base = SOLUTION_BASE[solution] || 0
    const ext = Math.max(0, Math.min(2, (Number(concentration) || 0) + base))
    const internal = 0.6
    const flow = internal - ext

    const targetVolume = Math.max(0.6, Math.min(1.1, 0.85 + flow * 0.4))
    s.dispVolume = lerp(s.dispVolume, targetVolume, 0.03)

    const isDark = document.documentElement.dataset.theme === 'dark'
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    if (isDark) {
      bg.addColorStop(0, '#FFFFFF')
      bg.addColorStop(1, '#F0FDF4')
    } else {
      bg.addColorStop(0, '#050A14')
      bg.addColorStop(1, '#09172D')
    }
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    const cellW = Math.min(W * 0.5, 360)
    const cellH = Math.min(H * 0.45, 240)
    const cellX = W / 2 - cellW / 2
    const cellY = H / 2 - cellH / 2

    const wallColor = isDark ? 'rgba(5,150,105,0.25)' : 'rgba(16,185,129,0.25)'
    const membraneColor = isDark ? 'rgba(5,150,105,0.4)' : 'rgba(0,212,255,0.4)'

    ctx.fillStyle = isDark ? 'rgba(5,150,105,0.05)' : 'rgba(16,185,129,0.08)'
    ctx.strokeStyle = wallColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(cellX, cellY, cellW, cellH, 18)
    ctx.fill()
    ctx.stroke()

    const shrink = Math.max(0, Math.min(1, (1 - s.dispVolume) / 0.4))
    const memInset = 6 + shrink * 18

    ctx.strokeStyle = membraneColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(cellX + memInset, cellY + memInset, cellW - memInset * 2, cellH - memInset * 2, 14)
    ctx.stroke()

    const vacW = (cellW - memInset * 2 - 20) * s.dispVolume
    const vacH = (cellH - memInset * 2 - 20) * s.dispVolume
    const vacX = cellX + cellW / 2 - vacW / 2
    const vacY = cellY + cellH / 2 - vacH / 2
    ctx.fillStyle = isDark ? 'rgba(59,130,246,0.15)' : 'rgba(56,189,248,0.18)'
    ctx.strokeStyle = isDark ? 'rgba(59,130,246,0.4)' : 'rgba(56,189,248,0.45)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(vacX, vacY, vacW, vacH, 12)
    ctx.fill()
    ctx.stroke()

    ctx.font = `600 11px ${FONT_UI}`
    ctx.fillStyle = isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.6)'
    ctx.textAlign = 'center'
    ctx.fillText('Vacuole (water)', vacX + vacW / 2, vacY - 8)

    ctx.font = `600 12px ${FONT_MONO}`
    ctx.fillStyle = isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.6)'
    ctx.textAlign = 'left'
    ctx.fillText(`${solution || 'Water'} outside`, 18, 28)
    ctx.fillText('Cell sap inside', cellX + 12, cellY - 12)

    const flowStrength = Math.min(1, Math.abs(flow) / 0.6)
    const isEquilibrium = flowStrength < 0.05
    const flowDir = flow >= 0 ? 1 : -1
    const flowColor = flowDir > 0
      ? (isDark ? 'rgba(5,150,105,0.6)' : 'rgba(0,212,255,0.65)')
      : (isDark ? 'rgba(245,158,11,0.65)' : 'rgba(251,191,36,0.7)')

    ctx.save()
    ctx.globalAlpha = 0.25 + flowStrength * 0.6
    ctx.strokeStyle = flowColor
    ctx.lineWidth = 2
    for (let a = 0; a < 4; a++) {
      const ax = cellX - 22
      const ay = cellY + 30 + a * (cellH / 4)
      if (isEquilibrium) {
        ctx.beginPath()
        ctx.moveTo(ax - 6, ay)
        ctx.lineTo(ax + 10, ay)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(ax - 2, ay - 4)
        ctx.lineTo(ax - 6, ay)
        ctx.lineTo(ax - 2, ay + 4)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(ax + 6, ay - 4)
        ctx.lineTo(ax + 10, ay)
        ctx.lineTo(ax + 6, ay + 4)
        ctx.stroke()
      } else {
        const dir = flowDir
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(ax + dir * 20, ay)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(ax + dir * 16, ay - 4)
        ctx.lineTo(ax + dir * 20, ay)
        ctx.lineTo(ax + dir * 16, ay + 4)
        ctx.stroke()
      }
    }
    ctx.restore()

    const streamCount = 5
    const xOutside = cellX - 28
    const xInside = cellX + memInset + 28
    const xStart = flowDir > 0 ? xOutside : xInside
    const xEnd = flowDir > 0 ? xInside : xOutside
    const travel = Math.abs(xEnd - xStart)
    const speed = 18 + 48 * flowStrength

    if (!isEquilibrium) {
      ctx.save()
      ctx.globalAlpha = 0.2 + flowStrength * 0.7
      ctx.strokeStyle = flowColor
      ctx.lineWidth = 2
      for (let i = 0; i < streamCount; i++) {
        const y = cellY + 22 + i * ((cellH - 44) / (streamCount - 1))
        const progress = ((t * speed) + i * 18) % travel
        const pos = xStart + (xEnd - xStart) * (progress / travel)

        ctx.beginPath()
        ctx.moveTo(xStart, y)
        ctx.lineTo(xEnd, y)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(pos, y)
        ctx.lineTo(pos + flowDir * 12, y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(pos + flowDir * 8, y - 4)
        ctx.lineTo(pos + flowDir * 12, y)
        ctx.lineTo(pos + flowDir * 8, y + 4)
        ctx.stroke()
      }
      ctx.restore()
    }

    const legendX = 18
    const legendY = H - 92
    const legendW = 210
    const legendH = 56
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(5,10,20,0.85)'
    ctx.strokeStyle = isDark ? 'rgba(5,150,105,0.25)' : 'rgba(0,255,136,0.25)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(legendX, legendY, legendW, legendH, 10)
    ctx.fill()
    ctx.stroke()

    ctx.font = `700 10px ${FONT_UI}`
    ctx.fillStyle = isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.65)'
    ctx.textAlign = 'left'
    ctx.fillText('Legend', legendX + 10, legendY + 14)

    ctx.strokeStyle = flowColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(legendX + 10, legendY + 28)
    ctx.lineTo(legendX + 24, legendY + 28)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(legendX + 20, legendY + 24)
    ctx.lineTo(legendX + 24, legendY + 28)
    ctx.lineTo(legendX + 20, legendY + 32)
    ctx.stroke()
    ctx.fillStyle = isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)'
    ctx.fillText('Water flow direction', legendX + 30, legendY + 32)

    ctx.fillStyle = isDark ? 'rgba(59,130,246,0.25)' : 'rgba(56,189,248,0.3)'
    ctx.fillRect(legendX + 10, legendY + 40, 10, 8)
    ctx.strokeStyle = isDark ? 'rgba(59,130,246,0.5)' : 'rgba(56,189,248,0.55)'
    ctx.strokeRect(legendX + 10, legendY + 40, 10, 8)
    ctx.fillStyle = isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)'
    ctx.fillText('Vacuole (water store)', legendX + 30, legendY + 48)

    const hudX = W - 200, hudY = 16, hudW = 185, hudH = 110
    const hudFill = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(5,10,20,0.85)'
    const hudStroke = isDark ? 'rgba(5,150,105,0.2)' : 'rgba(0,255,136,0.2)'
    const hudLabel = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.35)'

    ctx.fillStyle = hudFill
    ctx.strokeStyle = hudStroke
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(hudX, hudY, hudW, hudH, 12)
    ctx.fill()
    ctx.stroke()

    const state = ext < internal * 0.8 ? 'Turgid' : ext > internal * 1.2 ? 'Plasmolyzed' : 'Flaccid'
    const stateColor = state === 'Turgid' ? (isDark ? '#059669' : '#00FF88')
      : state === 'Plasmolyzed' ? (isDark ? '#F59E0B' : '#FBBF24')
        : (isDark ? '#7C3AED' : '#A78BFA')

    ctx.font = `700 11px ${FONT_UI}`
    ctx.fillStyle = isDark ? '#059669' : '#00FF88'
    ctx.textAlign = 'left'
    ctx.fillText('OSMOSIS', hudX + 12, hudY + 20)

    const rows = [
      ['Solution', solution || 'Water', isDark ? '#059669' : '#00FF88'],
      ['Ext conc', `${ext.toFixed(2)} mol/L`, isDark ? '#0EA5E9' : '#38BDF8'],
      ['State', state, stateColor]
    ]

    rows.forEach(([label, val, color], i) => {
      const ry = hudY + 42 + i * 20
      ctx.font = `500 10px ${FONT_UI}`
      ctx.fillStyle = hudLabel
      ctx.textAlign = 'left'
      ctx.fillText(label, hudX + 12, ry)
      ctx.font = `600 12px ${FONT_MONO}`
      ctx.fillStyle = color
      ctx.textAlign = 'right'
      ctx.fillText(val, hudX + hudW - 12, ry)
    })

    ctx.font = `600 11px ${FONT_MONO}`
    ctx.fillStyle = isDark ? 'rgba(5,150,105,0.6)' : 'rgba(0,255,136,0.5)'
    ctx.textAlign = 'left'
    ctx.fillText(`Cell volume ~ ${(s.dispVolume * 100).toFixed(1)}%`, 18, H - 22)

    if (Math.round(t * 60) % 48 === 0 && onDataPoint) {
      onDataPoint({ time: t, value: s.dispVolume * 100 })
    }

    return requestAnimationFrame(draw)
  }, [onDataPoint])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const w = Math.max(1, parent.clientWidth)
      const h = Math.max(1, parent.clientHeight)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize()
    const raf = draw()
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [draw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.style.background = document.documentElement.dataset.theme === 'dark' ? '#FFFFFF' : '#050A14'
    return () => { canvas.style.background = '' }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        background: 'transparent'
      }}
    />
  )
}
