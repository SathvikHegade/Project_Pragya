import React, { useRef, useEffect, useCallback } from 'react'

const FONT_UI = "'Syne', sans-serif"
const FONT_MONO = "'JetBrains Mono', monospace"
function lerp(a, b, t) { return a + (b - a) * t }

export default function OhmsLawSim({ variables, onDataPoint }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    time: 0, electrons: [], particles: [],
    dispV: 0, dispI: 0, dispR: 0, dispP: 0,
    ammeterNeedle: 0, voltmeterNeedle: 0
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
    const { voltage, resistance } = varsRef.current
    const current = voltage / Math.max(resistance, 0.1)
    const power = voltage * current
    const isDark = document.documentElement.dataset.theme === 'dark'
    const heatIntensity = Math.min(1, power / 50)

    const C = {
      bg: isDark ? '#FFFFFF' : '#050A14',
      grid: isDark ? 'rgba(5,150,105,0.04)' : 'rgba(0,212,255,0.04)',
      particle: isDark ? 'rgba(5,150,105,0.08)' : 'rgba(0,212,255,0.08)',
      wire: isDark ? '#6B7280' : '#4A5568',
      wireGlow: isDark ? 'rgba(5,150,105,0.15)' : 'rgba(0,212,255,0.2)',
      batteryFill: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.05)',
      batteryStroke: isDark ? 'rgba(5,150,105,0.5)' : 'rgba(217,249,157,0.5)',
      batteryStroke2: isDark ? 'rgba(5,150,105,0.8)' : 'rgba(217,249,157,0.8)',
      posColor: isDark ? '#059669' : '#D9F99D',
      negColor: '#EF4444',
      resistorFill: isDark ? `rgba(217,119,6,${0.06 + heatIntensity * 0.1})` : `rgba(251,191,36,${0.08 + heatIntensity * 0.1})`,
      resistorStroke: isDark ? `rgba(217,119,6,${0.4 + heatIntensity * 0.4})` : `rgba(251,191,36,${0.5 + heatIntensity * 0.4})`,
      resistorInner: isDark ? `rgba(217,119,6,${0.6 + heatIntensity * 0.3})` : `rgba(251,191,36,${0.7 + heatIntensity * 0.2})`,
      resistorLabel: isDark ? '#D97706' : '#FCD34D',
      meterFill: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.05)',
      meterStroke: isDark ? 'rgba(5,150,105,0.5)' : 'rgba(217,249,157,0.4)',
      electron: isDark ? 'rgba(5,150,105,0.9)' : 'rgba(217,249,157,0.9)',
      electronGlow: isDark ? 'rgba(5,150,105,0.6)' : 'rgba(217,249,157,0.6)',
      hudFill: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(5,10,20,0.85)',
      hudStroke: isDark ? 'rgba(5,150,105,0.2)' : 'rgba(0,255,136,0.2)',
      hudLabel: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.35)',
      formula: isDark ? 'rgba(5,150,105,0.6)' : 'rgba(0,255,136,0.5)',
    }

    // ── Background ──
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H)
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

    if (s.particles.length < 25) {
      s.particles.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2, s: Math.random() + 0.3 })
    }
    s.particles.forEach(p => {
      p.x += p.vx; p.y += p.vy
      if (p.x < 0 || p.x > W) p.vx *= -1
      if (p.y < 0 || p.y > H) p.vy *= -1
      ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
      ctx.fillStyle = C.particle; ctx.fill()
    })

    const cx = W / 2, cy = H / 2
    const boxL = 80, boxR = W - 80, boxT = cy - 80, boxB = cy + 80

    // ── Wires ──
    ctx.strokeStyle = C.wire; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.shadowColor = C.wireGlow; ctx.shadowBlur = 6
    ctx.beginPath()
    ctx.moveTo(boxL, boxT); ctx.lineTo(boxR, boxT)
    ctx.stroke()
    ctx.beginPath(); ctx.moveTo(boxR, boxT); ctx.lineTo(boxR, boxB); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(boxR, boxB); ctx.lineTo(boxL, boxB); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(boxL, boxB); ctx.lineTo(boxL, boxT); ctx.stroke()
    ctx.shadowBlur = 0

    // ── Battery ──
    const batX = boxL - 25, batY = cy - 35, batW = 50, batH = 70
    ctx.fillStyle = C.batteryFill
    ctx.strokeStyle = C.batteryStroke; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.roundRect(batX, batY, batW, batH, 8); ctx.fill(); ctx.stroke()
    ctx.strokeStyle = C.batteryStroke2; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(boxL - 12, cy - 10); ctx.lineTo(boxL + 12, cy - 10); ctx.stroke()
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(boxL - 6, cy); ctx.lineTo(boxL + 6, cy); ctx.stroke()
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(boxL - 12, cy + 10); ctx.lineTo(boxL + 12, cy + 10); ctx.stroke()
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(boxL - 6, cy + 20); ctx.lineTo(boxL + 6, cy + 20); ctx.stroke()
    ctx.shadowColor = C.electronGlow; ctx.shadowBlur = 10
    ctx.font = `700 14px ${FONT_MONO}`; ctx.textAlign = 'center'
    ctx.fillStyle = C.posColor; ctx.fillText('+', boxL, batY - 6)
    ctx.shadowColor = 'rgba(239,68,68,0.6)'
    ctx.fillStyle = '#EF4444'; ctx.fillText('−', boxL, batY + batH + 16)
    ctx.shadowBlur = 0
    ctx.font = `600 13px ${FONT_MONO}`; ctx.fillStyle = C.posColor
    ctx.fillText(`${voltage}V`, boxL, cy + 40)

    // ── Resistor (zigzag) ──
    const resX = cx - 40, resY = boxT - 4, resW = 80, resH = 26
    if (heatIntensity > 0.1) {
      ctx.shadowColor = C.resistorFill; ctx.shadowBlur = 15
    }
    ctx.fillStyle = C.resistorFill
    ctx.strokeStyle = C.resistorStroke; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.roundRect(resX, resY, resW, resH, 6); ctx.fill(); ctx.stroke()
    ctx.shadowBlur = 0

    ctx.strokeStyle = C.resistorInner; ctx.lineWidth = 2
    ctx.beginPath()
    const zzY = boxT + 8
    ctx.moveTo(resX + 5, zzY)
    for (let i = 0; i < 6; i++) {
      ctx.lineTo(resX + 10 + i * 10, zzY + (i % 2 === 0 ? -8 : 8))
    }
    ctx.lineTo(resX + resW - 5, zzY)
    ctx.stroke()

    if (heatIntensity > 0.3) {
      for (let sh = 0; sh < 4; sh++) {
        const shx = resX + 10 + sh * 20 + Math.sin(t * 4 + sh) * 3
        const shy = resY - 10 - Math.sin(t * 3 + sh * 2) * 5
        ctx.beginPath(); ctx.arc(shx, shy, 2, 0, Math.PI * 2)
        ctx.fillStyle = C.resistorFill; ctx.fill()
      }
    }
    ctx.font = `600 11px ${FONT_MONO}`; ctx.fillStyle = C.resistorLabel; ctx.textAlign = 'center'
    ctx.fillText(`${resistance}Ω`, cx, resY - 8)

    // ── Ammeter ──
    const amX = cx + 100, amY = boxT
    ctx.beginPath(); ctx.arc(amX, amY, 18, 0, Math.PI * 2)
    ctx.fillStyle = C.meterFill; ctx.fill()
    ctx.strokeStyle = C.meterStroke; ctx.lineWidth = 1.5; ctx.stroke()
    ctx.font = `700 14px ${FONT_MONO}`; ctx.fillStyle = C.posColor; ctx.textAlign = 'center'
    ctx.fillText('A', amX, amY + 5)
    s.ammeterNeedle = lerp(s.ammeterNeedle, Math.min(1, current / 2), 0.06)
    const amAngle = -Math.PI / 2 + s.ammeterNeedle * Math.PI * 0.8 - Math.PI * 0.4
    ctx.beginPath(); ctx.moveTo(amX, amY)
    ctx.lineTo(amX + Math.cos(amAngle) * 14, amY + Math.sin(amAngle) * 14)
    ctx.strokeStyle = '#EF4444'; ctx.lineWidth = 1.5; ctx.stroke()

    // ── Voltmeter ──
    const vmX = cx, vmY = boxB
    ctx.beginPath(); ctx.arc(vmX, vmY, 18, 0, Math.PI * 2)
    ctx.fillStyle = C.meterFill; ctx.fill()
    ctx.strokeStyle = C.meterStroke; ctx.lineWidth = 1.5; ctx.stroke()
    ctx.font = `700 14px ${FONT_MONO}`; ctx.fillStyle = isDark ? '#7C3AED' : '#A78BFA'; ctx.textAlign = 'center'
    ctx.fillText('V', vmX, vmY + 5)
    s.voltmeterNeedle = lerp(s.voltmeterNeedle, voltage / 12, 0.06)
    const vmAngle = -Math.PI / 2 + s.voltmeterNeedle * Math.PI * 0.8 - Math.PI * 0.4
    ctx.beginPath(); ctx.moveTo(vmX, vmY)
    ctx.lineTo(vmX + Math.cos(vmAngle) * 14, vmY + Math.sin(vmAngle) * 14)
    ctx.strokeStyle = '#EF4444'; ctx.lineWidth = 1.5; ctx.stroke()

    // ── Electrons ──
    const eSpeed = Math.max(0.5, Math.min(current * 1.5, 6))
    const eCount = Math.max(2, Math.round(current * 5))
    if (s.electrons.length < Math.min(eCount, 20)) {
      s.electrons.push({ progress: Math.random() })
    }
    while (s.electrons.length > Math.min(eCount, 20) + 2) s.electrons.pop()

    const pathPoints = [
      { x: boxL, y: boxT }, { x: boxR, y: boxT },
      { x: boxR, y: boxB }, { x: boxL, y: boxB }
    ]
    const segLens = []
    let totalLen = 0
    for (let i = 0; i < 4; i++) {
      const next = (i + 1) % 4
      const dx = pathPoints[next].x - pathPoints[i].x
      const dy = pathPoints[next].y - pathPoints[i].y
      const len = Math.sqrt(dx * dx + dy * dy)
      segLens.push(len); totalLen += len
    }

    s.electrons.forEach(e => {
      e.progress += eSpeed * 0.002
      if (e.progress > 1) e.progress -= 1
      let dist = e.progress * totalLen
      let seg = 0
      while (seg < 3 && dist > segLens[seg]) { dist -= segLens[seg]; seg++ }
      const frac = dist / segLens[seg]
      const next = (seg + 1) % 4
      const ex = lerp(pathPoints[seg].x, pathPoints[next].x, frac)
      const ey = lerp(pathPoints[seg].y, pathPoints[next].y, frac) + Math.sin(t * 5 + e.progress * 20) * 2

      ctx.shadowColor = C.electronGlow; ctx.shadowBlur = 8
      ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI * 2)
      ctx.fillStyle = C.electron; ctx.fill()
      ctx.shadowBlur = 0
      ctx.beginPath(); ctx.moveTo(ex - 2.5, ey); ctx.lineTo(ex + 2.5, ey)
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1.5; ctx.stroke()
    })

    // ── HUD Panel (top-right) ──
    s.dispV = lerp(s.dispV, voltage, 0.08)
    s.dispI = lerp(s.dispI, current, 0.08)
    s.dispR = lerp(s.dispR, resistance, 0.08)
    s.dispP = lerp(s.dispP, power, 0.08)

    const hudX = W - 195, hudY = 16, hudW = 180, hudH = 120
    ctx.fillStyle = C.hudFill
    ctx.strokeStyle = C.hudStroke; ctx.lineWidth = 1
    ctx.beginPath(); ctx.roundRect(hudX, hudY, hudW, hudH, 12); ctx.fill(); ctx.stroke()

    ctx.font = `700 11px ${FONT_UI}`
    ctx.fillStyle = C.posColor; ctx.textAlign = 'left'
    ctx.fillText('CIRCUIT DATA', hudX + 14, hudY + 20)

    const rows = [
      [`Voltage V`, `${s.dispV.toFixed(1)} V`, C.posColor],
      [`Current I`, `${s.dispI.toFixed(4)} A`, isDark ? '#10B981' : '#6EE7B7'],
      [`Resist R`, `${s.dispR.toFixed(0)} Ω`, C.resistorLabel],
      [`Power P`, `${s.dispP.toFixed(2)} W`, isDark ? '#7C3AED' : '#A78BFA'],
    ]
    rows.forEach(([label, val, color], i) => {
      const ry = hudY + 38 + i * 20
      ctx.font = `500 10px ${FONT_UI}`; ctx.fillStyle = C.hudLabel; ctx.textAlign = 'left'
      ctx.fillText(label, hudX + 14, ry)
      ctx.font = `600 12px ${FONT_MONO}`; ctx.fillStyle = color; ctx.textAlign = 'right'
      ctx.fillText(val, hudX + hudW - 14, ry)
    })

    // ── Formula display (bottom-left) ──
    ctx.font = `600 12px ${FONT_MONO}`
    ctx.fillStyle = C.formula; ctx.textAlign = 'left'
    ctx.fillText(`V = IR → ${s.dispV.toFixed(1)} = ${s.dispI.toFixed(3)} × ${s.dispR.toFixed(0)}`, 20, H - 20)

    if (Math.round(t * 60) % 48 === 0 && onDataPoint) {
      onDataPoint({ time: t, value: current, voltage, resistance })
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
