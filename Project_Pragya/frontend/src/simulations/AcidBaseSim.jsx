import React, { useRef, useEffect, useCallback } from 'react'

const FONT_UI = "'Syne', sans-serif"
const FONT_MONO = "'JetBrains Mono', monospace"
function lerp(a, b, t) { return a + (b - a) * t }

const PH_MAP = { 'Lemon Juice': 2.2, 'Vinegar': 3.0, 'Water': 7.0, 'Milk': 6.5, 'Baking Soda': 9.0, 'Bleach': 12.5 }
function getPhColor(pH) {
  if (pH <= 3) return '#EF4444'
  if (pH <= 6) return '#F59E0B'
  if (pH <= 8) return '#BAE6FD'
  if (pH <= 10) return '#7C3AED'
  return '#4C1D95'
}

export default function AcidBaseSim({ variables, onDataPoint }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    time: 0, bubbles: [], dispPH: 7, particles: []
  })
  const varsRef = useRef(variables)
  varsRef.current = variables

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const ctx = canvas.getContext('2d')
    const W = canvas.width / dpr, H = canvas.height / dpr
    const s = stateRef.current
    s.time += 1 / 60
    const t = s.time
    const { substance, indicator } = varsRef.current
    const pH = PH_MAP[substance] || 7
    const liquidColor = getPhColor(pH)

    // ── Background ──
    const isDark = document.documentElement.dataset.theme === 'dark'
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    if (isDark) {
      bg.addColorStop(0, '#FFFFFF')
      bg.addColorStop(1, '#F0FDF4')
    } else {
      bg.addColorStop(0, '#050A14')
      bg.addColorStop(1, '#0A1628')
    }
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

    // Hex grid overlay
    ctx.strokeStyle = isDark ? 'rgba(5,150,105,0.03)' : 'rgba(0,212,255,0.03)'; ctx.lineWidth = 0.5
    const hexSize = 20
    for (let row = 0; row < H / (hexSize * 1.5); row++) {
      for (let col = 0; col < W / (hexSize * 1.73); col++) {
        const hx = col * hexSize * 1.73 + (row % 2 ? hexSize * 0.87 : 0)
        const hy = row * hexSize * 1.5
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const a = (i * 60 - 30) * Math.PI / 180
          const px = hx + hexSize * Math.cos(a), py = hy + hexSize * Math.sin(a)
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
        }
        ctx.closePath(); ctx.stroke()
      }
    }

    // Lab bench surface
    ctx.fillStyle = isDark ? 'rgba(240,245,240,0.9)' : 'rgba(15,30,50,0.9)'
    ctx.fillRect(0, H - 40, W, 40)
    ctx.strokeStyle = isDark ? 'rgba(5,150,105,0.1)' : 'rgba(0,212,255,0.15)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, H - 40); ctx.lineTo(W, H - 40); ctx.stroke()

    // ── Beaker ──
    const bx = W * 0.4, by = 80, bw = 140, bh = H - 140
    const beakerStroke = isDark ? 'rgba(5,150,105,0.2)' : 'rgba(0,212,255,0.25)'
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(bx, by + 30)
    ctx.lineTo(bx - 8, by + bh)
    ctx.quadraticCurveTo(bx + bw / 2, by + bh + 20, bx + bw + 8, by + bh)
    ctx.lineTo(bx + bw, by + 30)
    ctx.strokeStyle = beakerStroke; ctx.lineWidth = 2; ctx.stroke()
    ctx.beginPath(); ctx.moveTo(bx, by + 30)
    ctx.quadraticCurveTo(bx - 10, by + 20, bx - 5, by + 10)
    ctx.strokeStyle = beakerStroke; ctx.lineWidth = 1.5; ctx.stroke()
    ctx.beginPath(); ctx.ellipse(bx + bw / 2, by + 30, bw / 2 + 4, 12, 0, 0, Math.PI * 2)
    ctx.strokeStyle = beakerStroke; ctx.lineWidth = 1.5; ctx.stroke()

    // ── Liquid ──
    const liquidTop = by + bh * 0.35
    const waveAmp = 2
    s.dispPH = lerp(s.dispPH, pH, 0.04)

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(bx + 2, by + 32)
    ctx.lineTo(bx - 6, by + bh - 2)
    ctx.quadraticCurveTo(bx + bw / 2, by + bh + 18, bx + bw + 6, by + bh - 2)
    ctx.lineTo(bx + bw - 2, by + 32)
    ctx.closePath()
    ctx.clip()

    const liqGrad = ctx.createLinearGradient(0, liquidTop, 0, by + bh)
    liqGrad.addColorStop(0, liquidColor + 'CC')
    liqGrad.addColorStop(1, liquidColor + '66')
    ctx.fillStyle = liqGrad

    ctx.beginPath()
    ctx.moveTo(bx - 10, by + bh + 20)
    ctx.lineTo(bx - 10, liquidTop)
    for (let wx = bx - 10; wx <= bx + bw + 10; wx += 3) {
      const wy = liquidTop + Math.sin(wx * 0.05 + t * 2.5) * waveAmp + Math.sin(wx * 0.08 + t * 1.8) * waveAmp * 0.5
      ctx.lineTo(wx, wy)
    }
    ctx.lineTo(bx + bw + 10, by + bh + 20)
    ctx.closePath()
    ctx.fill()

    if (pH < 5 || pH > 9) {
      if (s.bubbles.length < 12) {
        s.bubbles.push({
          x: bx + 20 + Math.random() * (bw - 40),
          y: by + bh - 10,
          r: 2 + Math.random() * 4,
          speed: 0.3 + Math.random() * 0.5,
          wobble: Math.random() * Math.PI * 2
        })
      }
    }
    s.bubbles = s.bubbles.filter(b => {
      b.y -= b.speed
      b.x += Math.sin(t * 3 + b.wobble) * 0.5
      if (b.y < liquidTop) return false
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,212,255,0.1)'; ctx.fill()
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,212,255,0.08)'; ctx.lineWidth = 0.5; ctx.stroke()
      return true
    })
    ctx.restore()

    const markColor = isDark ? 'rgba(5,150,105,0.15)' : 'rgba(0,212,255,0.15)'
    const markLabelColor = isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'
    ctx.font = `500 9px ${FONT_MONO}`
    ctx.fillStyle = markLabelColor; ctx.textAlign = 'right'
    for (let m = 0; m < 5; m++) {
      const my = by + bh * 0.3 + m * (bh * 0.15)
      ctx.beginPath(); ctx.moveTo(bx + bw - 4, my); ctx.lineTo(bx + bw + 4, my)
      ctx.strokeStyle = markColor; ctx.lineWidth = 1; ctx.stroke()
      ctx.fillText(`${500 - m * 100}`, bx - 12, my + 3)
    }

    // ── Indicator strip ──
    const stripX = bx + bw + 50, stripY = by + 40, stripW = 24, stripH = bh - 40
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(5,10,20,0.85)'
    ctx.strokeStyle = isDark ? 'rgba(5,150,105,0.15)' : 'rgba(0,212,255,0.15)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.roundRect(stripX - 4, stripY - 10, stripW + 8, stripH + 20, 8)
    ctx.fill(); ctx.stroke()
    let stripColor = liquidColor
    if (indicator === 'Phenolphthalein') stripColor = pH > 8.2 ? '#FF69B4' : 'rgba(200,200,200,0.3)'
    else if (indicator === 'Litmus') stripColor = pH < 7 ? '#EF4444' : pH > 7 ? '#3B82F6' : '#888888'
    ctx.fillStyle = stripColor
    ctx.beginPath(); ctx.roundRect(stripX, stripY, stripW, stripH, 4); ctx.fill()
    ctx.font = `600 10px ${FONT_UI}`; ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.textAlign = 'center'
    ctx.fillText(indicator, stripX + stripW / 2, stripY - 16)

    // ── pH Scale bar ──
    const scaleX = 20, scaleY = H - 90, scaleW = W - 40, scaleH = 16
    const phLabelColor = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)'
    const phColors = ['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#7C3AED', '#9333EA', '#A855F7', '#C084FC', '#4C1D95']
    for (let p = 0; p <= 14; p++) {
      const px = scaleX + (p / 14) * scaleW
      const pw = scaleW / 14 + 1
      ctx.fillStyle = phColors[p]; ctx.fillRect(px, scaleY, pw, scaleH)
      if (p % 2 === 0) {
        ctx.font = `500 9px ${FONT_MONO}`; ctx.fillStyle = phLabelColor; ctx.textAlign = 'center'
        ctx.fillText(`${p}`, px + pw / 2, scaleY + scaleH + 12)
      }
    }
    const arrowX = scaleX + (s.dispPH / 14) * scaleW
    ctx.beginPath()
    ctx.moveTo(arrowX, scaleY - 4)
    ctx.lineTo(arrowX - 6, scaleY - 14)
    ctx.lineTo(arrowX + 6, scaleY - 14)
    ctx.closePath()
    ctx.fillStyle = isDark ? '#059669' : '#00FF88'; ctx.fill()
    ctx.font = `700 12px ${FONT_MONO}`; ctx.fillStyle = isDark ? '#059669' : '#00FF88'; ctx.textAlign = 'center'
    ctx.fillText(`pH ${s.dispPH.toFixed(1)}`, arrowX, scaleY - 18)

    ctx.font = `600 10px ${FONT_UI}`; ctx.textAlign = 'center'
    ctx.fillStyle = '#EF4444'; ctx.fillText('ACIDIC', scaleX + scaleW * 0.15, scaleY + scaleH + 26)
    ctx.fillStyle = isDark ? '#10B981' : '#6EE7B7'; ctx.fillText('NEUTRAL', scaleX + scaleW * 0.5, scaleY + scaleH + 26)
    ctx.fillStyle = isDark ? '#7C3AED' : '#A78BFA'; ctx.fillText('BASIC', scaleX + scaleW * 0.85, scaleY + scaleH + 26)

    // ── HUD ──
    const hudFill = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(5,10,20,0.85)'
    const hudStroke = isDark ? 'rgba(5,150,105,0.2)' : 'rgba(0,255,136,0.2)'
    const hudLabel = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.35)'
    const hudX = 16, hudY = 16, hudW = 170, hudH = 100
    ctx.fillStyle = hudFill
    ctx.strokeStyle = hudStroke; ctx.lineWidth = 1
    ctx.beginPath(); ctx.roundRect(hudX, hudY, hudW, hudH, 12); ctx.fill(); ctx.stroke()

    ctx.font = `700 11px ${FONT_UI}`; ctx.fillStyle = isDark ? '#059669' : '#00FF88'; ctx.textAlign = 'left'
    ctx.fillText('ACID-BASE DATA', hudX + 12, hudY + 20)

    const type = pH < 6.5 ? 'Acidic' : pH > 7.5 ? 'Basic' : 'Neutral'
    const typeColor = pH < 6.5 ? '#EF4444' : pH > 7.5 ? (isDark ? '#7C3AED' : '#A78BFA') : (isDark ? '#10B981' : '#6EE7B7')
    ctx.font = `500 10px ${FONT_UI}`; ctx.fillStyle = hudLabel
    ctx.fillText('Substance', hudX + 12, hudY + 40)
    ctx.font = `600 12px ${FONT_MONO}`; ctx.fillStyle = isDark ? '#059669' : '#00FF88'; ctx.textAlign = 'right'
    ctx.fillText(substance, hudX + hudW - 12, hudY + 40)

    ctx.font = `500 10px ${FONT_UI}`; ctx.fillStyle = hudLabel; ctx.textAlign = 'left'
    ctx.fillText('pH Value', hudX + 12, hudY + 60)
    ctx.font = `700 14px ${FONT_MONO}`; ctx.fillStyle = typeColor; ctx.textAlign = 'right'
    ctx.fillText(s.dispPH.toFixed(1), hudX + hudW - 12, hudY + 62)

    ctx.font = `500 10px ${FONT_UI}`; ctx.fillStyle = hudLabel; ctx.textAlign = 'left'
    ctx.fillText('Type', hudX + 12, hudY + 82)
    ctx.font = `600 12px ${FONT_MONO}`; ctx.fillStyle = typeColor; ctx.textAlign = 'right'
    ctx.fillText(type, hudX + hudW - 12, hudY + 82)

    ctx.font = `600 11px ${FONT_MONO}`; ctx.fillStyle = isDark ? 'rgba(5,150,105,0.6)' : 'rgba(0,255,136,0.5)'; ctx.textAlign = 'left'
    ctx.fillText(`pH = -log[H⁺]  →  ${type} (pH ${s.dispPH.toFixed(1)})`, 20, H - 110)

    if (Math.round(t * 60) % 48 === 0 && onDataPoint) {
      onDataPoint({ time: t, value: s.dispPH })
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
