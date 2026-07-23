import React, { useRef, useEffect, useCallback } from 'react'

const FONT_UI = "'Syne', sans-serif"
const FONT_MONO = "'JetBrains Mono', monospace"
const STAGE_MAP = { Prophase: 0, Metaphase: 1, Anaphase: 2, Telophase: 3 }
const STAGE_INFO = {
  Prophase: { label: 'PROPHASE', desc: 'Chromosomes condense, spindle forms' },
  Metaphase: { label: 'METAPHASE', desc: 'Chromosomes align at equator' },
  Anaphase: { label: 'ANAPHASE', desc: 'Sister chromatids pull apart' },
  Telophase: { label: 'TELOPHASE', desc: 'Nuclei reform, cell divides' }
}
function lerp(a, b, t) { return a + (b - a) * t }

function drawChromosome(ctx, x, y, size, rotation, color) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.strokeStyle = color
  ctx.lineWidth = Math.max(2, size * 0.2)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-size, -size * 1.2)
  ctx.lineTo(size, size * 1.2)
  ctx.moveTo(-size, size * 1.2)
  ctx.lineTo(size, -size * 1.2)
  ctx.stroke()
  ctx.restore()
}

function drawChromatid(ctx, x, y, size, rotation, color) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.strokeStyle = color
  ctx.lineWidth = Math.max(2, size * 0.22)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.lineTo(0, size)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, Math.max(2, size * 0.2), 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}

export default function MitosisSim({ variables, onDataPoint }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    time: 0,
    dispProgress: 0,
    dispStage: 0,
    chromosomes: Array.from({ length: 8 }, (_, i) => ({
      angle: (i / 8) * Math.PI * 2,
      jitter: (i % 3) * 0.6 + 0.4
    }))
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

    const { stage, speed } = varsRef.current
    const stageName = stage || 'Prophase'
    const stageIndex = STAGE_MAP[stageName] ?? 0
    const speedMult = Math.max(0.4, Number(speed) || 1)

    s.time += (1 / 60) * speedMult
    const t = s.time
    const phase = (Math.sin(t * 0.7) + 1) / 2

    const isDark = document.documentElement.dataset.theme === 'dark'
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    if (isDark) {
      bg.addColorStop(0, '#FFFFFF')
      bg.addColorStop(1, '#F0FDF4')
    } else {
      bg.addColorStop(0, '#050A14')
      bg.addColorStop(1, '#07152A')
    }
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    const cx = W / 2
    const cy = H / 2
    const cellR = Math.min(W, H) * 0.32

    const cellFill = isDark ? 'rgba(5,150,105,0.06)' : 'rgba(16,185,129,0.08)'
    const cellStroke = isDark ? 'rgba(5,150,105,0.25)' : 'rgba(16,185,129,0.3)'
    ctx.fillStyle = cellFill
    ctx.strokeStyle = cellStroke
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(cx, cy, cellR, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.strokeStyle = isDark ? 'rgba(5,150,105,0.1)' : 'rgba(0,212,255,0.12)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, cellR - 8, 0, Math.PI * 2)
    ctx.stroke()

    const spindleColor = isDark ? 'rgba(5,150,105,0.35)' : 'rgba(0,212,255,0.35)'
    const chromoColor = isDark ? '#7C3AED' : '#A78BFA'
    const plateColor = isDark ? 'rgba(5,150,105,0.3)' : 'rgba(0,212,255,0.3)'

    const count = s.chromosomes.length
    const spacing = cellR * 0.12
    const topPole = { x: cx, y: cy - cellR * 0.38 }
    const bottomPole = { x: cx, y: cy + cellR * 0.38 }

    if (stageIndex === 1 || stageIndex === 2) {
      ctx.strokeStyle = spindleColor
      ctx.lineWidth = 1
      for (let i = 0; i < count; i++) {
        const x = cx - spacing * (count - 1) / 2 + i * spacing
        const y = stageIndex === 1 ? cy : cy + (i % 2 === 0 ? -1 : 1) * cellR * 0.3 * phase
        ctx.beginPath()
        ctx.moveTo(topPole.x, topPole.y)
        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(bottomPole.x, bottomPole.y)
        ctx.lineTo(x, y)
        ctx.stroke()
      }
    }

    if (stageIndex === 1) {
      ctx.setLineDash([6, 6])
      ctx.strokeStyle = plateColor
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx - cellR * 0.5, cy)
      ctx.lineTo(cx + cellR * 0.5, cy)
      ctx.stroke()
      ctx.setLineDash([])
    }

    if (stageIndex === 0) {
      const nucleusAlpha = lerp(0.9, 0.2, phase)
      ctx.fillStyle = `rgba(124,58,237,${nucleusAlpha * 0.18})`
      ctx.strokeStyle = `rgba(124,58,237,${nucleusAlpha * 0.5})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(cx, cy, cellR * 0.28, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }

    if (stageIndex === 3) {
      const nucleusAlpha = lerp(0.3, 0.9, phase)
      const nR = cellR * 0.22
      const nOffset = cellR * 0.28
      ctx.fillStyle = `rgba(124,58,237,${nucleusAlpha * 0.18})`
      ctx.strokeStyle = `rgba(124,58,237,${nucleusAlpha * 0.5})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(cx, cy - nOffset, nR, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cx, cy + nOffset, nR, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      const furrow = cellR * 0.2
      ctx.strokeStyle = isDark ? 'rgba(5,150,105,0.4)' : 'rgba(0,212,255,0.4)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(cx - furrow, cy)
      ctx.quadraticCurveTo(cx, cy - furrow * 0.6, cx + furrow, cy)
      ctx.moveTo(cx - furrow, cy)
      ctx.quadraticCurveTo(cx, cy + furrow * 0.6, cx + furrow, cy)
      ctx.stroke()
    }

    for (let i = 0; i < count; i++) {
      const seed = s.chromosomes[i]
      let x = cx
      let y = cy
      let size = cellR * 0.06
      let rot = seed.angle + t * 0.3

      if (stageIndex === 0) {
        const r = lerp(cellR * 0.45, cellR * 0.15, phase)
        x = cx + Math.cos(seed.angle + t * 0.4) * r
        y = cy + Math.sin(seed.angle + t * 0.4) * r
        size *= lerp(0.7, 1.1, phase)
      } else if (stageIndex === 1) {
        const startX = cx - spacing * (count - 1) / 2
        x = startX + i * spacing
        y = cy + Math.sin(t * 2 + i) * 3
        size *= 1.1
      } else if (stageIndex === 2) {
        const group = i % 2 === 0 ? -1 : 1
        const idx = Math.floor(i / 2)
        const midCount = Math.ceil(count / 2)
        const startX = cx - spacing * (midCount - 1) / 2
        x = startX + idx * spacing
        y = cy + group * cellR * 0.35 * phase
        size *= 1.0
      } else {
        const group = i < count / 2 ? -1 : 1
        const idx = i % (count / 2)
        const angle = (idx / (count / 2)) * Math.PI * 2
        const centerY = cy + group * cellR * 0.28
        x = cx + Math.cos(angle) * cellR * 0.12
        y = centerY + Math.sin(angle) * cellR * 0.12
        size *= 0.7
      }

      if (stageIndex === 2) {
        drawChromatid(ctx, x, y, size * 1.1, rot * seed.jitter, chromoColor)
      } else {
        drawChromosome(ctx, x, y, size, rot * seed.jitter, chromoColor)
      }
    }

    if (stageIndex === 2) {
      ctx.strokeStyle = isDark ? 'rgba(5,150,105,0.6)' : 'rgba(0,212,255,0.6)'
      ctx.lineWidth = 2
      for (let i = 0; i < 4; i++) {
        const arrowX = cx - cellR * 0.18 + i * cellR * 0.12
        const arrowY = cy + (i % 2 === 0 ? -1 : 1) * cellR * 0.18
        ctx.beginPath()
        ctx.moveTo(arrowX, arrowY)
        ctx.lineTo(arrowX, arrowY + (i % 2 === 0 ? -1 : 1) * 22)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(arrowX - 4, arrowY + (i % 2 === 0 ? -1 : 1) * 18)
        ctx.lineTo(arrowX, arrowY + (i % 2 === 0 ? -1 : 1) * 24)
        ctx.lineTo(arrowX + 4, arrowY + (i % 2 === 0 ? -1 : 1) * 18)
        ctx.stroke()
      }
    }

    const progressValue = stageIndex * 25 + phase * 25
    s.dispProgress = lerp(s.dispProgress, progressValue, 0.08)

    const hudX = 16, hudY = 16, hudW = 210, hudH = 118
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

    const stageInfo = STAGE_INFO[stageName] || STAGE_INFO.Prophase

    ctx.font = `700 11px ${FONT_UI}`
    ctx.fillStyle = isDark ? '#059669' : '#00FF88'
    ctx.textAlign = 'left'
    ctx.fillText(stageInfo.label, hudX + 12, hudY + 20)

    ctx.font = `500 10px ${FONT_UI}`
    ctx.fillStyle = hudLabel
    ctx.fillText('Key event', hudX + 12, hudY + 42)
    ctx.font = `600 10px ${FONT_UI}`
    ctx.fillStyle = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.55)'
    ctx.textAlign = 'left'
    ctx.fillText(stageInfo.desc, hudX + 12, hudY + 56)

    ctx.font = `500 10px ${FONT_UI}`
    ctx.fillStyle = hudLabel
    ctx.textAlign = 'left'
    ctx.fillText('Progress', hudX + 12, hudY + 78)
    ctx.font = `600 12px ${FONT_MONO}`
    ctx.fillStyle = chromoColor
    ctx.textAlign = 'right'
    ctx.fillText(`${s.dispProgress.toFixed(1)}%`, hudX + hudW - 12, hudY + 78)

    ctx.font = `500 10px ${FONT_UI}`
    ctx.fillStyle = hudLabel
    ctx.textAlign = 'left'
    ctx.fillText('Speed', hudX + 12, hudY + 98)
    ctx.font = `600 12px ${FONT_MONO}`
    ctx.fillStyle = isDark ? '#7C3AED' : '#A78BFA'
    ctx.textAlign = 'right'
    ctx.fillText(`${speedMult.toFixed(1)}x`, hudX + hudW - 12, hudY + 98)

    const barX = hudX + 12
    const barY = hudY + hudH - 14
    const barW = hudW - 24
    const barH = 6
    ctx.fillStyle = isDark ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'
    ctx.fillRect(barX, barY, barW, barH)
    ctx.fillStyle = isDark ? 'rgba(5,150,105,0.5)' : 'rgba(0,255,136,0.7)'
    ctx.fillRect(barX, barY, barW * (s.dispProgress / 100), barH)

    if (Math.round(t * 60) % 48 === 0 && onDataPoint) {
      onDataPoint({ time: t, value: s.dispProgress })
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
