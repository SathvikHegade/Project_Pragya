import React, { useRef, useEffect, useCallback } from 'react'

const FONT_UI = "'Syne', sans-serif"
const FONT_MONO = "'JetBrains Mono', monospace"
function lerp(a, b, t) { return a + (b - a) * t }

export default function ProjectileSim({ variables, onDataPoint }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    time: 0, frame: 0, trail: [], stars: [],
    craterRipples: [], launched: true,
    dispH: 0, dispVx: 0, dispVy: 0, dispRange: 0,
    persistentResults: { range: 0, maxH: 0, vx: 0, vy: 0, landed: false },
    prevParams: null
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
    s.frame++
    s.time += 1 / 60
    const { velocity, angle, gravity } = varsRef.current
    const rad = angle * Math.PI / 180
    const vx0 = velocity * Math.cos(rad)
    const vy0 = velocity * Math.sin(rad)
    const g = gravity
    const groundY = H - 60

    // ── Sky gradient ──
    const isDark = document.documentElement.dataset.theme === 'dark'
    const sky = ctx.createLinearGradient(0, 0, 0, H)
    if (isDark) {
      sky.addColorStop(0, '#FFFFFF')
      sky.addColorStop(0.5, '#F0FDF4')
      sky.addColorStop(0.85, '#ECFDF5')
      sky.addColorStop(1, '#E8F5E9')
    } else {
      sky.addColorStop(0, '#050A14')
      sky.addColorStop(0.5, '#0A1628')
      sky.addColorStop(0.85, '#0F1F3A')
      sky.addColorStop(1, '#141E30')
    }
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H)

    // Ground
    const groundColor = isDark ? '#E8F5E9' : '#0A1628'
    const groundLineColor = isDark ? 'rgba(16,185,129,0.15)' : 'rgba(0,212,255,0.1)'
    ctx.fillStyle = groundColor; ctx.fillRect(0, groundY, W, H - groundY)
    const grassColor = isDark ? 'rgba(16,185,129,0.15)' : 'rgba(0,212,255,0.08)'
    const vertGridColor = isDark ? 'rgba(5,150,105,0.03)' : 'rgba(0,212,255,0.02)'
    ctx.strokeStyle = grassColor; ctx.lineWidth = 1
    for (let gx = 0; gx < W; gx += 8) {
      const gh = 4 + Math.sin(gx * 0.3 + s.time) * 2
      ctx.beginPath(); ctx.moveTo(gx, groundY); ctx.lineTo(gx + 2, groundY - gh); ctx.stroke()
    }
    ctx.strokeStyle = vertGridColor; ctx.lineWidth = 0.5
    for (let gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, groundY); ctx.lineTo(gx, H); ctx.stroke() }

    // ── Trajectory physics ──
    const scale = 3.5
    const launchX = 80, launchY = groundY
    const safeG = Math.max(g, 0.1)
    const totalTime = (2 * vy0) / safeG
    const maxHeight = Math.max(0, (vy0 * vy0) / (2 * safeG))
    const range = Math.max(0, (vx0 * 2 * vy0) / safeG)

    // Predicted trajectory
    const trajectoryColor = isDark ? 'rgba(5,150,105,0.15)' : 'rgba(0,212,255,0.15)'
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = trajectoryColor; ctx.lineWidth = 1
    ctx.beginPath()
    for (let tp = 0; tp <= totalTime; tp += totalTime / 60) {
      const px = launchX + vx0 * tp * scale
      const py = launchY - (vy0 * tp - 0.5 * g * tp * tp) * scale
      if (tp === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
    }
    ctx.stroke()
    ctx.setLineDash([])

    // Current position
    const cycleT = (s.time * 1.2) % (totalTime + 1)
    const curT = Math.min(cycleT, totalTime)
    const projX = launchX + vx0 * curT * scale
    const projY = launchY - (vy0 * curT - 0.5 * g * curT * curT) * scale
    const curVx = vx0
    const curVy = vy0 - g * curT
    const inFlight = cycleT <= totalTime && projY <= groundY

    // Max height line
    const maxHY = launchY - maxHeight * scale
    if (maxHY > 20) {
      const maxHColor = isDark ? 'rgba(16,185,129,0.2)' : 'rgba(0,212,255,0.2)'
      ctx.setLineDash([3, 6])
      ctx.strokeStyle = maxHColor; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(launchX, maxHY); ctx.lineTo(W - 20, maxHY); ctx.stroke()
      ctx.setLineDash([])
      ctx.font = `500 10px ${FONT_MONO}`
      ctx.fillStyle = isDark ? 'rgba(16,185,129,0.5)' : 'rgba(0,212,255,0.5)'; ctx.textAlign = 'left'
      ctx.fillText(`H_max = ${maxHeight.toFixed(1)}m`, launchX + 10, maxHY - 6)
    }

    // Range line
    const landX = launchX + range * scale
    const rangeColor = isDark ? 'rgba(217,119,6,0.2)' : 'rgba(0,212,255,0.2)'
    if (landX < W - 20 && landX > launchX + 20) {
      ctx.setLineDash([3, 6])
      ctx.strokeStyle = rangeColor; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(landX, groundY); ctx.lineTo(landX, groundY - 30); ctx.stroke()
      ctx.setLineDash([])
      ctx.font = `500 10px ${FONT_MONO}`
      ctx.fillStyle = isDark ? 'rgba(217,119,6,0.5)' : 'rgba(0,212,255,0.5)'; ctx.textAlign = 'center'
      ctx.fillText(`R = ${range.toFixed(1)}m`, landX, groundY + 16)
    }

    // ── Launch cannon ──
    const cannonFill = isDark ? 'rgba(180,190,200,0.5)' : 'rgba(100,130,170,0.6)'
    const cannonStroke = isDark ? 'rgba(150,170,190,0.5)' : 'rgba(80,110,150,0.6)'
    ctx.save()
    ctx.translate(launchX, launchY)
    ctx.rotate(-rad)
    ctx.fillStyle = cannonFill
    ctx.strokeStyle = cannonStroke; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.roundRect(0, -8, 50, 16, 4); ctx.fill(); ctx.stroke()
    ctx.fillStyle = isDark ? 'rgba(5,150,105,0.12)' : 'rgba(0,212,255,0.15)'
    ctx.beginPath(); ctx.roundRect(45, -10, 8, 20, 2); ctx.fill()
    ctx.restore()
    ctx.fillStyle = isDark ? 'rgba(160,180,200,0.4)' : 'rgba(80,120,180,0.5)'
    ctx.beginPath(); ctx.arc(launchX, launchY, 12, 0, Math.PI); ctx.fill()

    // Angle indicator
    ctx.beginPath(); ctx.arc(launchX, launchY, 35, -rad, 0)
    ctx.strokeStyle = isDark ? 'rgba(217,119,6,0.4)' : 'rgba(0,212,255,0.4)'; ctx.lineWidth = 1.5; ctx.stroke()
    ctx.font = `600 11px ${FONT_MONO}`
    ctx.fillStyle = isDark ? 'rgba(217,119,6,0.7)' : 'rgba(0,212,255,0.7)'; ctx.textAlign = 'left'
    ctx.fillText(`${angle}°`, launchX + 40, launchY - 5)

    const trailColor = isDark ? 'rgba(5,150,105,' : 'rgba(0,212,255,'
    if (inFlight) {
      s.trail.push({ x: projX, y: projY })
      if (s.trail.length > 30) s.trail.shift()
      for (let i = 0; i < s.trail.length; i++) {
        const alpha = i / s.trail.length
        ctx.beginPath(); ctx.arc(s.trail[i].x, s.trail[i].y, 2.5 * alpha, 0, Math.PI * 2)
        ctx.fillStyle = `${trailColor}${alpha * 0.5})`; ctx.fill()
      }

      const projGlow = ctx.createRadialGradient(projX, projY, 0, projX, projY, 20)
      projGlow.addColorStop(0, isDark ? 'rgba(5,150,105,0.4)' : 'rgba(0,212,255,0.4)')
      projGlow.addColorStop(1, isDark ? 'rgba(5,150,105,0)' : 'rgba(0,212,255,0)')
      ctx.fillStyle = projGlow; ctx.fillRect(projX - 20, projY - 20, 40, 40)

      const projG = ctx.createRadialGradient(projX - 3, projY - 3, 1, projX, projY, 10)
      projG.addColorStop(0, '#FFFFFF')
      projG.addColorStop(0.4, isDark ? '#4DD9FF' : '#00E5FF')
      projG.addColorStop(1, isDark ? '#0077AA' : '#00B8D4')
      ctx.beginPath(); ctx.arc(projX, projY, 10, 0, Math.PI * 2)
      ctx.fillStyle = projG; ctx.fill()

      // Velocity vectors
      const vScale = 2.5
      ctx.beginPath(); ctx.moveTo(projX, projY)
      ctx.lineTo(projX + curVx * vScale, projY)
      ctx.strokeStyle = isDark ? 'rgba(37,99,235,0.8)' : 'rgba(100,181,246,0.8)'; ctx.lineWidth = 2; ctx.stroke()
      ctx.font = `500 9px ${FONT_MONO}`; ctx.fillStyle = isDark ? 'rgba(37,99,235,0.7)' : 'rgba(100,181,246,0.7)'; ctx.textAlign = 'center'
      ctx.fillText(`Vx=${(curVx).toFixed(1)}`, projX + curVx * vScale * 0.5, projY + 14)

      ctx.beginPath(); ctx.moveTo(projX, projY)
      ctx.lineTo(projX, projY - curVy * vScale)
      ctx.strokeStyle = 'rgba(239,68,68,0.8)'; ctx.lineWidth = 2; ctx.stroke()
      ctx.font = `500 9px ${FONT_MONO}`; ctx.fillStyle = 'rgba(239,68,68,0.7)'; ctx.textAlign = 'left'
      ctx.fillText(`Vy=${(curVy).toFixed(1)}`, projX + 8, projY - curVy * vScale * 0.5)

      const vMag = Math.sqrt(curVx * curVx + curVy * curVy)
      const vAngle = Math.atan2(-curVy, curVx)
      ctx.beginPath(); ctx.moveTo(projX, projY)
      ctx.lineTo(projX + Math.cos(vAngle) * vMag * vScale, projY + Math.sin(vAngle) * vMag * vScale)
      ctx.strokeStyle = isDark ? 'rgba(75,85,99,0.6)' : 'rgba(144,202,249,0.6)'; ctx.lineWidth = 1.5; ctx.stroke()
    } else {
      s.trail = []
      if (cycleT > totalTime && cycleT < totalTime + 0.5) {
        const rippleAge = (cycleT - totalTime) * 4
        for (let r = 0; r < 3; r++) {
          const rr = 5 + (rippleAge + r * 0.3) * 20
          ctx.beginPath(); ctx.arc(landX, groundY, rr, Math.PI, Math.PI * 2)
          ctx.strokeStyle = `${trailColor}${0.3 - rippleAge * 0.2 - r * 0.08})`
          ctx.lineWidth = 1.5; ctx.stroke()
        }
      }
    }

    // ── HUD Panel ──
    // Calculate and store values - track final values when landed
    const currentH = inFlight ? Math.max(0, vy0 * curT - 0.5 * safeG * curT * curT) : 0
    
    // Check if parameters changed - reset persistent values
    const paramKey = `${velocity}-${angle}-${gravity}`
    const paramsChanged = s.prevParams !== paramKey
    if (paramsChanged) {
      s.prevParams = paramKey
      s.persistentResults = { range: 0, maxH: 0, vx: 0, vy: 0, landed: false }
    }
    
    // Update display values during flight
    s.dispH = lerp(s.dispH, currentH, 0.1)
    s.dispVx = lerp(s.dispVx, curVx, 0.1)
    s.dispVy = lerp(s.dispVy, curVy, 0.1)
    s.dispRange = lerp(s.dispRange, range, 0.08)
    
    // When landed, save persistent values (only save once per parameter change)
    if (!inFlight && !s.persistentResults.landed) {
      s.persistentResults = {
        range,
        maxH: maxHeight,
        vx: curVx,
        vy: curVy,
        landed: true
      }
    }
    
    // Display: show persistent values after landing, until parameters change
    const showPersistent = s.persistentResults.landed && !paramsChanged && !inFlight
    const dispH = showPersistent ? 0 : (Number.isFinite(s.dispH) ? s.dispH : 0)
    const dispVx = showPersistent ? s.persistentResults.vx : (Number.isFinite(s.dispVx) ? s.dispVx : 0)
    const dispVy = showPersistent ? s.persistentResults.vy : (Number.isFinite(s.dispVy) ? s.dispVy : 0)
    const dispRange = showPersistent ? s.persistentResults.range : (Number.isFinite(s.dispRange) ? s.dispRange : 0)
    const dispMaxH = showPersistent ? s.persistentResults.maxH : maxHeight

    const hudW = Math.max(150, Math.min(180, W - 40))
    const hudX = W - hudW - 15
    const hudY = 16
    const hudH = 140
    const hudFill = isDark ? 'rgba(255,255,255,0.92)' : 'rgba(5,10,20,0.88)'
    const hudStroke = isDark ? 'rgba(5,150,105,0.3)' : 'rgba(0,255,136,0.3)'
    const hudLabel = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.4)'
    ctx.fillStyle = hudFill
    ctx.strokeStyle = hudStroke; ctx.lineWidth = 1
    ctx.beginPath(); ctx.roundRect(hudX, hudY, hudW, hudH, 12); ctx.fill(); ctx.stroke()

    ctx.font = `700 11px ${FONT_UI}`
    ctx.fillStyle = isDark ? '#059669' : '#00FF88'; ctx.textAlign = 'left'
    ctx.fillText('FLIGHT DATA', hudX + 14, hudY + 20)

    const rows = [
      ['Height', `${dispH.toFixed(1)} m`, isDark ? '#10B981' : '#6EE7B7'],
      ['Vx', `${dispVx.toFixed(1)} m/s`, isDark ? '#2563EB' : '#64B5F6'],
      ['Vy', `${dispVy.toFixed(1)} m/s`, isDark ? '#EF4444' : '#FCA5A5'],
      ['Range', `${dispRange.toFixed(1)} m`, isDark ? '#D97706' : '#FCD34D'],
      ['Max H', `${dispMaxH.toFixed(1)} m`, isDark ? '#7C3AED' : '#A78BFA'],
    ]
    rows.forEach(([label, val, color], i) => {
      const ry = hudY + 38 + i * 20
      ctx.font = `500 10px ${FONT_UI}`; ctx.fillStyle = hudLabel; ctx.textAlign = 'left'
      ctx.fillText(label, hudX + 14, ry)
      ctx.font = `600 12px ${FONT_MONO}`; ctx.fillStyle = color; ctx.textAlign = 'right'
      ctx.fillText(val, hudX + hudW - 14, ry)
    })

    // ── Formula (bottom-left) ──
    ctx.font = `600 11px ${FONT_MONO}`
    ctx.fillStyle = isDark ? 'rgba(5,150,105,0.6)' : 'rgba(0,255,136,0.5)'; ctx.textAlign = 'left'
    ctx.fillText(`R = v²sin(2θ)/g = ${velocity}²×sin(${angle * 2}°)/${gravity}`, 20, H - 16)

    if (Math.round(s.time * 60) % 48 === 0 && onDataPoint) {
      onDataPoint({ time: s.time, value: inFlight ? s.dispH : 0, range })
    }

    return requestAnimationFrame(draw)
  }, [onDataPoint])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    let resizeTimeout
    const resize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        const parent = canvas.parentElement
        if (!parent) return
        const w = Math.max(100, parent.clientWidth)
        const h = Math.max(100, parent.clientHeight)
        if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
          canvas.width = w * dpr
          canvas.height = h * dpr
          canvas.style.width = w + 'px'
          canvas.style.height = h + 'px'
          const ctx = canvas.getContext('2d')
          if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }
      }, 50)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize()
    const raf = draw()
    return () => { cancelAnimationFrame(raf); ro.disconnect(); clearTimeout(resizeTimeout) }
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
