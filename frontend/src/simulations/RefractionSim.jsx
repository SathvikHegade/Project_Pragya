import React, { useRef, useEffect, useCallback } from 'react'

const FONT_UI = "'Syne', sans-serif"
const FONT_MONO = "'JetBrains Mono', monospace"
const N_MAP = { Glass: 1.5, Water: 1.33, Diamond: 2.42, Air: 1.0 }
function lerp(a, b, t) { return a + (b - a) * t }

export default function RefractionSim({ variables, onDataPoint }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({ time: 0, dispTheta2: 0 })
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

    const { angle, medium } = varsRef.current
    const theta1Deg = Math.max(0, Math.min(80, Number(angle) || 0))
    const n2 = N_MAP[medium] || 1.0
    const theta1 = theta1Deg * Math.PI / 180
    const sinTheta2 = Math.sin(theta1) / n2
    const tir = sinTheta2 > 1
    const theta2 = tir ? Math.PI / 2 : Math.asin(sinTheta2)
    const theta2Deg = theta2 * 180 / Math.PI
    s.dispTheta2 = lerp(s.dispTheta2, theta2Deg, 0.08)

    const isDark = document.documentElement.dataset.theme === 'dark'
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    if (isDark) {
      bg.addColorStop(0, '#FFFFFF')
      bg.addColorStop(1, '#ECFDF5')
    } else {
      bg.addColorStop(0, '#050A14')
      bg.addColorStop(1, '#08162A')
    }
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    const midY = H * 0.52
    const topFill = isDark ? 'rgba(5,150,105,0.05)' : 'rgba(0,212,255,0.05)'
    const bottomFill = isDark ? 'rgba(5,150,105,0.1)' : 'rgba(0,212,255,0.08)'
    ctx.fillStyle = topFill
    ctx.fillRect(0, 0, W, midY)
    ctx.fillStyle = bottomFill
    ctx.fillRect(0, midY, W, H - midY)
    ctx.strokeStyle = isDark ? 'rgba(5,150,105,0.25)' : 'rgba(0,212,255,0.25)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(40, midY)
    ctx.lineTo(W - 40, midY)
    ctx.stroke()

    ctx.setLineDash([6, 8])
    ctx.strokeStyle = isDark ? 'rgba(5,150,105,0.35)' : 'rgba(0,212,255,0.35)'
    ctx.beginPath()
    ctx.moveTo(W / 2, 40)
    ctx.lineTo(W / 2, H - 40)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.font = `600 12px ${FONT_MONO}`
    ctx.fillStyle = isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.6)'
    ctx.textAlign = 'left'
    ctx.fillText('Air (n1=1.00)', 18, 28)
    ctx.fillText(`${medium || 'Air'} (n2=${n2.toFixed(2)})`, 18, midY + 28)

    const origin = { x: W / 2, y: midY }
    const rayLen = Math.min(W, H) * 0.48

    const incAngle = Math.PI / 2 - theta1
    const incEnd = {
      x: origin.x - Math.cos(incAngle) * rayLen,
      y: origin.y - Math.sin(incAngle) * rayLen
    }

    const refrAngle = Math.PI / 2 - theta2
    const refrEnd = {
      x: origin.x + Math.cos(refrAngle) * rayLen,
      y: origin.y + Math.sin(refrAngle) * rayLen
    }

    ctx.lineWidth = 3
    ctx.strokeStyle = isDark ? '#0EA5E9' : '#38BDF8'
    ctx.setLineDash([12, 12])
    ctx.lineDashOffset = -t * 30
    ctx.beginPath()
    ctx.moveTo(incEnd.x, incEnd.y)
    ctx.lineTo(origin.x, origin.y)
    ctx.stroke()

    ctx.strokeStyle = tir ? (isDark ? '#F59E0B' : '#FBBF24') : (isDark ? '#7C3AED' : '#A78BFA')
    ctx.beginPath()
    ctx.moveTo(origin.x, origin.y)
    if (tir) {
      const reflEnd = {
        x: origin.x + Math.cos(incAngle) * rayLen,
        y: origin.y - Math.sin(incAngle) * rayLen
      }
      ctx.lineTo(reflEnd.x, reflEnd.y)
    } else {
      ctx.lineTo(refrEnd.x, refrEnd.y)
    }
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = isDark ? '#059669' : '#00FF88'
    ctx.beginPath()
    ctx.arc(origin.x, origin.y, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = isDark ? 'rgba(5,150,105,0.4)' : 'rgba(0,212,255,0.4)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(origin.x, origin.y, 36, Math.PI * 1.1, Math.PI * 1.1 + theta1)
    ctx.stroke()

    ctx.beginPath()
    const arcStart = Math.PI * 1.5
    const arcEnd = arcStart + theta2
    ctx.arc(origin.x, origin.y, 28, arcStart, arcEnd)
    ctx.stroke()

    ctx.font = `600 11px ${FONT_MONO}`
    ctx.fillStyle = isDark ? '#0EA5E9' : '#38BDF8'
    ctx.textAlign = 'left'
    ctx.fillText(`theta1 = ${theta1Deg.toFixed(1)} deg`, origin.x - 140, origin.y - 20)
    ctx.fillStyle = tir ? (isDark ? '#F59E0B' : '#FBBF24') : (isDark ? '#7C3AED' : '#A78BFA')
    ctx.fillText(tir ? 'TIR' : `theta2 = ${s.dispTheta2.toFixed(1)} deg`, origin.x + 12, origin.y + 32)

    const hudX = W - 210, hudY = 16, hudW = 195, hudH = 120
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

    ctx.font = `700 11px ${FONT_UI}`
    ctx.fillStyle = isDark ? '#059669' : '#00FF88'
    ctx.textAlign = 'left'
    ctx.fillText('REFRACTION', hudX + 12, hudY + 20)

    const rows = [
      ['Medium', medium || 'Air', isDark ? '#059669' : '#00FF88'],
      ['Index n2', n2.toFixed(2), isDark ? '#0EA5E9' : '#38BDF8'],
      ['Angle in', `${theta1Deg.toFixed(1)} deg`, isDark ? '#7C3AED' : '#A78BFA'],
      ['Angle out', tir ? 'TIR' : `${s.dispTheta2.toFixed(1)} deg`, isDark ? '#F59E0B' : '#FBBF24']
    ]

    rows.forEach(([label, val, color], i) => {
      const ry = hudY + 42 + i * 18
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
    ctx.fillText(`n1 * sin(theta1) = n2 * sin(theta2)`, 18, H - 22)

    if (tir) {
      ctx.font = `700 12px ${FONT_UI}`
      ctx.fillStyle = isDark ? '#F59E0B' : '#FBBF24'
      ctx.textAlign = 'left'
      ctx.fillText('Total internal reflection', 18, H - 44)
    }

    if (Math.round(t * 60) % 48 === 0 && onDataPoint) {
      onDataPoint({ time: t, value: tir ? 0 : s.dispTheta2 })
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
