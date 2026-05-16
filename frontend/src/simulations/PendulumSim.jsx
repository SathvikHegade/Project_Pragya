import React, { useRef, useEffect, useCallback } from 'react'

const FONT_UI = "'Syne', sans-serif"
const FONT_MONO = "'JetBrains Mono', monospace"
function lerp(a, b, t) { return a + (b - a) * t }

export default function PendulumSim({ variables, onDataPoint }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    angle: Math.PI / 6, vel: 0,
    trail: [], displayT: 0, displayTheta: 0, displayV: 0,
    displayKE: 0, displayPE: 0, time: 0
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

    const { length, mass } = varsRef.current
    const isDark = document.documentElement.dataset.theme === 'dark'

    const L = length * 1.5
    const g = 0.003
    s.vel += (-g / L) * Math.sin(s.angle)
    s.vel *= 0.9997
    s.angle += s.vel

    const pivotX = W / 2
    const pivotY = 80
    const bobX = pivotX + Math.sin(s.angle) * L
    const bobY = pivotY + Math.cos(s.angle) * L
    const radius = Math.max(14, Math.sqrt(mass / 8) * 3)

    ctx.fillStyle = isDark ? '#FFFFFF' : '#050A14'
    ctx.fillRect(0, 0, W, H)

    ctx.setLineDash([4, 4])
    ctx.strokeStyle = isDark ? '#FF6B35' : 'rgba(0,212,255,0.15)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(pivotX, pivotY)
    ctx.lineTo(bobX, bobY)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.beginPath()
    ctx.moveTo(pivotX - 50, pivotY)
    ctx.lineTo(pivotX + 50, pivotY)
    ctx.strokeStyle = isDark ? '#10B981' : 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 3
    ctx.stroke()

    const glow = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, radius * 2.5)
    glow.addColorStop(0, isDark ? 'rgba(124,58,237,0.4)' : 'rgba(124,58,237,0.3)')
    glow.addColorStop(1, 'rgba(124,58,237,0)')
    ctx.fillStyle = glow
    ctx.fillRect(bobX - radius * 3, bobY - radius * 3, radius * 6, radius * 6)

    const bobGrad = ctx.createRadialGradient(bobX - radius * 0.3, bobY - radius * 0.3, 1, bobX, bobY, radius)
    bobGrad.addColorStop(0, '#FFFFFF')
    bobGrad.addColorStop(0.3, '#C4B5FD')
    bobGrad.addColorStop(0.7, '#7C3AED')
    bobGrad.addColorStop(1, '#3B0764')
    ctx.beginPath()
    ctx.arc(bobX, bobY, radius, 0, Math.PI * 2)
    ctx.fillStyle = bobGrad
    ctx.fill()

    ctx.beginPath()
    ctx.arc(bobX - radius * 0.25, bobY - radius * 0.3, radius * 0.2, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fill()

    s.displayT = lerp(s.displayT, 2 * Math.PI * Math.sqrt(L / (g * 10000 / 9.8)), 0.08)
    s.displayTheta = lerp(s.displayTheta, s.angle * 180 / Math.PI, 0.12)
    s.displayV = lerp(s.displayV, Math.abs(s.vel * L * 60), 0.1)

    const hudX = W - 255, hudY = 16, hudW = 240, hudH = 150
    ctx.fillStyle = isDark ? 'rgba(20,20,20,0.9)' : 'rgba(5,10,20,0.85)'
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,255,136,0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(hudX, hudY, hudW, hudH, 12)
    ctx.fill()
    ctx.stroke()

    ctx.font = `700 14px ${FONT_UI}`
    ctx.fillStyle = isDark ? '#FFFFFF' : '#00FF88'
    ctx.textAlign = 'left'
    ctx.fillText('PENDULUM', hudX + 18, hudY + 28)

    const KE = 0.5 * mass * 0.001 * Math.pow(L * s.vel, 2)
    const PE = mass * 0.001 * g * 10000 * L * (1 - Math.cos(s.angle))
    const totalE = Math.max(KE + PE, 0.01)

    const barW = 210, barH = 10, barX = hudX + 14, barY = hudY + 52
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
    ctx.fillRect(barX, barY, barW, barH)
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,212,255,0.8)'
    ctx.fillRect(barX, barY, barW * (KE / totalE), barH)
    ctx.fillStyle = 'rgba(124,58,237,0.9)'
    ctx.fillRect(barX + barW * (KE / totalE), barY, barW * (PE / totalE), barH)
    ctx.font = `600 11px ${FONT_MONO}`
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,212,255,0.8)'
    ctx.textAlign = 'left'
    ctx.fillText('KE', barX, barY - 4)
    ctx.fillStyle = 'rgba(124,58,237,0.9)'
    ctx.textAlign = 'right'
    ctx.fillText('PE', barX + barW, barY - 4)

    const rows = [
      [`Period`, `${s.displayT.toFixed(2)}s`, isDark ? '#FFFFFF' : '#00FF88'],
      [`Angle`, `${s.displayTheta.toFixed(1)}°`, isDark ? '#FFFFFF' : '#64B5F6'],
      [`Speed`, `${s.displayV.toFixed(1)}`, isDark ? '#FFFFFF' : '#FCD34D'],
    ]
    rows.forEach(([label, val, color], i) => {
      const ry = hudY + 80 + i * 28
      ctx.font = `600 15px ${FONT_UI}`
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.35)'
      ctx.textAlign = 'left'
      ctx.fillText(label, hudX + 18, ry)
      ctx.font = `700 18px ${FONT_MONO}`
      ctx.fillStyle = color
      ctx.textAlign = 'right'
      ctx.fillText(val, hudX + hudW - 18, ry)
    })

    ctx.font = `500 10px ${FONT_MONO}`
    ctx.fillStyle = isDark ? 'rgba(5,150,105,0.5)' : 'rgba(0,255,136,0.4)'
    ctx.textAlign = 'left'
    ctx.fillText(`L=${length}cm  m=${mass}g  θ=${Math.round(s.angle * 180 / Math.PI)}°`, 16, H - 16)

    if (Math.round(s.time * 60) % 48 === 0 && onDataPoint) {
      onDataPoint({ time: s.time, value: Math.abs(s.vel * L * 60), period: s.displayT })
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