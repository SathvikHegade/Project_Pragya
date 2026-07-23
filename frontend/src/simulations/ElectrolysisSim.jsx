import React, { useRef, useEffect, useCallback } from 'react'

const FONT_UI = "'Syne', sans-serif"
const FONT_MONO = "'JetBrains Mono', monospace"
function lerp(a, b, t) { return a + (b - a) * t }

export default function ElectrolysisSim({ variables, onDataPoint }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    time: 0,
    bubblesH: [],
    bubblesO: [],
    h2: 0,
    o2: 0,
    dispRate: 0
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

    const { voltage, concentration } = varsRef.current
    const rate = Math.max(0.2, (Number(voltage) || 0) * (Number(concentration) || 0) * 0.25)

    s.time += 1 / 60
    const t = s.time

    s.h2 = Math.min(100, s.h2 + rate * 0.08)
    s.o2 = Math.min(50, s.o2 + rate * 0.04)
    s.dispRate = lerp(s.dispRate, rate, 0.08)

    const isDark = document.documentElement.dataset.theme === 'dark'
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    if (isDark) {
      bg.addColorStop(0, '#FFFFFF')
      bg.addColorStop(1, '#ECFDF5')
    } else {
      bg.addColorStop(0, '#050A14')
      bg.addColorStop(1, '#08172D')
    }
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    const gridColor = isDark ? 'rgba(5,150,105,0.04)' : 'rgba(0,212,255,0.04)'
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 1
    for (let x = 0; x < W; x += 32) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, H)
      ctx.stroke()
    }
    for (let y = 0; y < H; y += 32) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(W, y)
      ctx.stroke()
    }

    const bx = W * 0.2
    const by = 80
    const bw = W * 0.6
    const bh = H - 170

    const beakerStroke = isDark ? 'rgba(5,150,105,0.2)' : 'rgba(0,212,255,0.25)'
    ctx.strokeStyle = beakerStroke
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(bx, by + 20)
    ctx.lineTo(bx - 6, by + bh)
    ctx.quadraticCurveTo(bx + bw / 2, by + bh + 18, bx + bw + 6, by + bh)
    ctx.lineTo(bx + bw, by + 20)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(bx + bw / 2, by + 20, bw / 2 + 4, 12, 0, 0, Math.PI * 2)
    ctx.stroke()

    const waterTop = by + bh * 0.35
    const waveAmp = 2
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(bx + 2, by + 22)
    ctx.lineTo(bx - 6, by + bh - 2)
    ctx.quadraticCurveTo(bx + bw / 2, by + bh + 16, bx + bw + 6, by + bh - 2)
    ctx.lineTo(bx + bw - 2, by + 22)
    ctx.closePath()
    ctx.clip()

    const liqGrad = ctx.createLinearGradient(0, waterTop, 0, by + bh)
    liqGrad.addColorStop(0, isDark ? 'rgba(59,130,246,0.2)' : 'rgba(56,189,248,0.18)')
    liqGrad.addColorStop(1, isDark ? 'rgba(59,130,246,0.35)' : 'rgba(56,189,248,0.3)')
    ctx.fillStyle = liqGrad
    ctx.beginPath()
    ctx.moveTo(bx - 10, by + bh + 20)
    ctx.lineTo(bx - 10, waterTop)
    for (let wx = bx - 10; wx <= bx + bw + 10; wx += 3) {
      const wy = waterTop + Math.sin(wx * 0.05 + t * 2) * waveAmp + Math.sin(wx * 0.08 + t * 1.4) * waveAmp * 0.5
      ctx.lineTo(wx, wy)
    }
    ctx.lineTo(bx + bw + 10, by + bh + 20)
    ctx.closePath()
    ctx.fill()

    const leftElectrodeX = bx + bw * 0.28
    const rightElectrodeX = bx + bw * 0.72
    const electrodeTop = waterTop + 10
    const electrodeBottom = by + bh - 20

    ctx.strokeStyle = isDark ? 'rgba(5,150,105,0.5)' : 'rgba(0,212,255,0.5)'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(leftElectrodeX, electrodeTop)
    ctx.lineTo(leftElectrodeX, electrodeBottom)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(rightElectrodeX, electrodeTop)
    ctx.lineTo(rightElectrodeX, electrodeBottom)
    ctx.stroke()

    ctx.font = `700 12px ${FONT_MONO}`
    ctx.fillStyle = isDark ? '#059669' : '#00FF88'
    ctx.textAlign = 'center'
    ctx.fillText('−', leftElectrodeX, electrodeTop - 12)
    ctx.fillStyle = isDark ? '#F59E0B' : '#FBBF24'
    ctx.fillText('+', rightElectrodeX, electrodeTop - 12)

    const makeBubble = (x, y, group) => ({
      x: x + (Math.random() - 0.5) * 10,
      y: y + Math.random() * 8,
      r: 2 + Math.random() * 3,
      vy: 0.6 + Math.random() * 0.6,
      group
    })

    if (Math.random() < Math.min(0.5, rate * 0.03)) {
      s.bubblesH.push(makeBubble(leftElectrodeX, electrodeBottom - 6, 'h2'))
      if (Math.random() < 0.6) s.bubblesH.push(makeBubble(leftElectrodeX, electrodeBottom - 6, 'h2'))
    }
    if (Math.random() < Math.min(0.5, rate * 0.02)) {
      s.bubblesO.push(makeBubble(rightElectrodeX, electrodeBottom - 6, 'o2'))
    }

    const drawBubble = (b, color) => {
      b.y -= b.vy
      b.x += Math.sin(t * 2 + b.y * 0.04) * 0.4
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    }

    const hColor = isDark ? 'rgba(59,130,246,0.4)' : 'rgba(56,189,248,0.35)'
    const oColor = isDark ? 'rgba(245,158,11,0.4)' : 'rgba(251,191,36,0.35)'
    s.bubblesH = s.bubblesH.filter(b => {
      if (b.y < waterTop + 6) return false
      drawBubble(b, hColor)
      return true
    })
    s.bubblesO = s.bubblesO.filter(b => {
      if (b.y < waterTop + 6) return false
      drawBubble(b, oColor)
      return true
    })

    ctx.restore()

    const tubeW = 46
    const tubeH = 120
    const tubeY = by - 30
    const tubeLeftX = leftElectrodeX - tubeW / 2
    const tubeRightX = rightElectrodeX - tubeW / 2

    const tubeStroke = isDark ? 'rgba(5,150,105,0.3)' : 'rgba(0,212,255,0.3)'
    const tubeFill = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(5,10,20,0.8)'

    const drawTube = (x, gasLevel, gasColor, label) => {
      ctx.fillStyle = tubeFill
      ctx.strokeStyle = tubeStroke
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.roundRect(x, tubeY, tubeW, tubeH, 10)
      ctx.fill()
      ctx.stroke()

      const gasH = tubeH * Math.min(1, gasLevel)
      ctx.fillStyle = gasColor
      ctx.fillRect(x + 4, tubeY + tubeH - gasH + 4, tubeW - 8, gasH - 8)

      ctx.font = `600 10px ${FONT_MONO}`
      ctx.fillStyle = gasColor
      ctx.textAlign = 'center'
      ctx.fillText(label, x + tubeW / 2, tubeY - 8)
    }

    const hColorText = isDark ? '#3B82F6' : '#38BDF8'
    const oColorText = isDark ? '#F59E0B' : '#FBBF24'
    drawTube(tubeLeftX, s.h2 / 100, hColorText, 'H2')
    drawTube(tubeRightX, s.o2 / 100, oColorText, 'O2')

    ctx.font = `600 10px ${FONT_MONO}`
    ctx.fillStyle = hColorText
    ctx.textAlign = 'center'
    ctx.fillText(`${s.h2.toFixed(0)} mL`, tubeLeftX + tubeW / 2, tubeY + tubeH + 16)
    ctx.fillStyle = oColorText
    ctx.fillText(`${s.o2.toFixed(0)} mL`, tubeRightX + tubeW / 2, tubeY + tubeH + 16)

    ctx.font = `600 11px ${FONT_MONO}`
    ctx.fillStyle = isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.5)'
    ctx.textAlign = 'center'
    ctx.fillText('Cathode (H2)', leftElectrodeX, by + bh + 28)
    ctx.fillText('Anode (O2)', rightElectrodeX, by + bh + 28)

    ctx.strokeStyle = isDark ? 'rgba(5,150,105,0.35)' : 'rgba(0,212,255,0.35)'
    ctx.lineWidth = 2
    ctx.setLineDash([8, 6])
    ctx.beginPath()
    ctx.moveTo(leftElectrodeX, by + 8)
    ctx.lineTo(rightElectrodeX, by + 8)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.moveTo(rightElectrodeX - 10, by + 2)
    ctx.lineTo(rightElectrodeX, by + 8)
    ctx.lineTo(rightElectrodeX - 10, by + 14)
    ctx.stroke()

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

    ctx.font = `700 11px ${FONT_UI}`
    ctx.fillStyle = isDark ? '#059669' : '#00FF88'
    ctx.textAlign = 'left'
    ctx.fillText('ELECTROLYSIS', hudX + 12, hudY + 20)

    const ratio = s.o2 > 0 ? (s.h2 / s.o2) : 0
    const rows = [
      ['Voltage', `${Number(voltage || 0).toFixed(1)} V`, isDark ? '#059669' : '#00FF88'],
      ['Concentration', `${Number(concentration || 0).toFixed(2)} mol/L`, isDark ? '#3B82F6' : '#38BDF8'],
      ['Gas Ratio', `${ratio.toFixed(1)} : 1`, isDark ? '#F59E0B' : '#FBBF24']
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
    ctx.fillText(`Rate ~ ${s.dispRate.toFixed(2)} mL/s`, 18, H - 22)

    if (Math.round(t * 60) % 48 === 0 && onDataPoint) {
      onDataPoint({ time: t, value: s.dispRate })
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
