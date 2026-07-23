import React, { useRef, useEffect, useCallback } from 'react'

const FONT_UI = "'Syne', sans-serif"
const FONT_MONO = "'JetBrains Mono', monospace"
function lerp(a, b, t) { return a + (b - a) * t }

export default function PhotosynthesisSim({ variables, onDataPoint }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    bubbles: [], stars: [], co2Arrows: [], time: 0,
    dispRate: 0, dispLight: 0, dispTemp: 0, dispCO2: 0
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
    const { lightIntensity, co2Level, temperature } = varsRef.current
    const lightN = lightIntensity / 100
    const co2N = Math.min(co2Level / 0.5, 1)
    const tempFactor = 1 - Math.abs(temperature - 25) / 20
    const rate = Math.max(0, Math.min(100, lightN * co2N * Math.max(0, tempFactor) * 100))

const isDark = document.documentElement.dataset.theme === 'dark'

    const bg = ctx.createLinearGradient(0, 0, 0, H)
    if (isDark) {
      bg.addColorStop(0, '#FFFFFF')
      bg.addColorStop(0.7, '#F0FDF4')
      bg.addColorStop(1, '#ECFDF5')
    } else {
      bg.addColorStop(0, '#050A14')
      bg.addColorStop(0.7, '#030D08')
      bg.addColorStop(1, '#051A0A')
    }
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

    if (isDark) {
      ctx.fillStyle = '#E8F5E9'
    } else {
      ctx.fillStyle = '#0A1A08'
    }
    ctx.fillRect(0, H - 80, W, 80)
    ctx.strokeStyle = isDark ? 'rgba(16,185,129,0.1)' : 'rgba(30,80,20,0.15)'
    ctx.lineWidth = 0.5
    for (let i = 0; i < 20; i++) {
      const gx = (i * 40 + t * 2) % W
      ctx.beginPath(); ctx.moveTo(gx, H - 80); ctx.lineTo(gx + 15, H - 60); ctx.stroke()
    }

    // ── Sun with corona ──
    const sunX = 60 + lightN * (W * 0.35 - 60)
    const sunY = H * 0.6 - lightN * (H * 0.6 - 80)
    const canvasBright = lightN * 0.08

    if (canvasBright > 0.01) {
      const brightG = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, H * 0.8)
      brightG.addColorStop(0, `rgba(255,220,100,${canvasBright * 0.3})`)
      brightG.addColorStop(1, 'rgba(255,220,100,0)')
      ctx.fillStyle = brightG; ctx.fillRect(0, 0, W, H)
    }

    const outerG = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 140)
    outerG.addColorStop(0, `rgba(255,150,0,${0.15 * lightN})`)
    outerG.addColorStop(1, 'rgba(255,150,0,0)')
    ctx.fillStyle = outerG; ctx.beginPath(); ctx.arc(sunX, sunY, 140, 0, Math.PI * 2); ctx.fill()

    const innerG = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 70)
    innerG.addColorStop(0, `rgba(255,200,0,${0.4 * lightN})`)
    innerG.addColorStop(1, 'rgba(255,200,0,0)')
    ctx.fillStyle = innerG; ctx.beginPath(); ctx.arc(sunX, sunY, 70, 0, Math.PI * 2); ctx.fill()

    const coreG = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 35)
    coreG.addColorStop(0, '#FFFFFF')
    coreG.addColorStop(0.4, '#FFF176')
    coreG.addColorStop(1, '#FFB300')
    ctx.fillStyle = coreG; ctx.beginPath(); ctx.arc(sunX, sunY, 35 * lightN + 8, 0, Math.PI * 2); ctx.fill()

    for (let r = 0; r < 12; r++) {
      const rayAngle = (r / 12) * Math.PI * 2 + t * 0.314
      const rayLen = 20 + Math.sin(t * 1.5 + r * 0.8) * 15
      const opacity = 0.4 + Math.sin(t * 2 + r) * 0.2
      ctx.beginPath()
      ctx.moveTo(sunX + Math.cos(rayAngle) * 38, sunY + Math.sin(rayAngle) * 38)
      ctx.lineTo(sunX + Math.cos(rayAngle) * (38 + rayLen * lightN), sunY + Math.sin(rayAngle) * (38 + rayLen * lightN))
      ctx.strokeStyle = `rgba(255,220,100,${opacity * lightN})`
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // ── Light rays to plant ──
    const plantCX = W * 0.5, plantBaseY = H - 80
    if (lightN > 0.2) {
      for (let lr = 0; lr < 5; lr++) {
        const targetX = plantCX - 20 + lr * 10
        const targetY = plantBaseY - 60
        ctx.beginPath()
        ctx.moveTo(sunX, sunY)
        ctx.lineTo(targetX - 3, targetY)
        ctx.lineTo(targetX + 3, targetY)
        ctx.closePath()
        const shimmer = 0.02 + Math.sin(t * 3 + lr * 1.3) * 0.015
        ctx.fillStyle = `rgba(255,220,50,${shimmer * lightN})`
        ctx.fill()
      }
    }

    // ── Plant stem ──
    const stemBaseX = plantCX
    const stemBaseY = plantBaseY
    const stemH = 110
    const sway = Math.sin(t * 2.1) * 2

    ctx.beginPath()
    ctx.moveTo(stemBaseX, stemBaseY)
    ctx.bezierCurveTo(
      stemBaseX + 5 + sway, stemBaseY - stemH * 0.33,
      stemBaseX - 8 + sway, stemBaseY - stemH * 0.66,
      stemBaseX + sway * 0.5, stemBaseY - stemH
    )
    const stemGrad = ctx.createLinearGradient(0, stemBaseY, 0, stemBaseY - stemH)
    stemGrad.addColorStop(0, '#1B5E20')
    stemGrad.addColorStop(1, '#4CAF50')
    ctx.strokeStyle = stemGrad
    ctx.lineWidth = 3
    ctx.stroke()

    // ── Plant glow ──
    const plantGlowG = ctx.createRadialGradient(stemBaseX, stemBaseY - stemH * 0.5, 10, stemBaseX, stemBaseY - stemH * 0.5, 80)
    plantGlowG.addColorStop(0, `rgba(76,175,80,${0.15 * (rate / 100)})`)
    plantGlowG.addColorStop(1, 'rgba(76,175,80,0)')
    ctx.fillStyle = plantGlowG
    ctx.fillRect(stemBaseX - 100, stemBaseY - stemH - 40, 200, stemH + 60)

    // ── Leaves ──
    const leafScale = 0.8 + (rate / 100) * 0.4
    const leaves = [
      { yFrac: 0.35, side: 1 },
      { yFrac: 0.55, side: -1 },
      { yFrac: 0.75, side: 1 },
    ]
    leaves.forEach((leaf, li) => {
      const ly = stemBaseY - stemH * leaf.yFrac + Math.sin(t * 1.5 + li) * 2
      const lx = stemBaseX + sway * (1 - leaf.yFrac)
      const dir = leaf.side
      ctx.save()
      ctx.translate(lx, ly)
      ctx.scale(leafScale, leafScale)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.bezierCurveTo(dir * 20, -12, dir * 50, -8, dir * 55, 3)
      ctx.bezierCurveTo(dir * 50, 10, dir * 20, 12, 0, 0)
      const leafG = ctx.createLinearGradient(0, 0, dir * 55, 0)
      leafG.addColorStop(0, '#1B5E20')
      leafG.addColorStop(1, '#66BB6A')
      ctx.fillStyle = leafG; ctx.fill()
      ctx.beginPath()
      ctx.moveTo(2 * dir, 0)
      ctx.lineTo(dir * 45, 1)
      ctx.strokeStyle = '#2E7D32'; ctx.lineWidth = 0.8; ctx.stroke()
      for (let sv = 1; sv <= 3; sv++) {
        const svx = dir * sv * 12
        ctx.beginPath(); ctx.moveTo(svx, 0)
        ctx.lineTo(svx + dir * 8, -4 + sv); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(svx, 0)
        ctx.lineTo(svx + dir * 8, 4 - sv); ctx.stroke()
      }
      ctx.restore()
    })

    // ── Flower ──
    const flowerX = stemBaseX + sway * 0.3
    const flowerY = stemBaseY - stemH - 5
    const petalRot = rate > 50 ? t * 0.5 : 0
    for (let p = 0; p < 5; p++) {
      const pa = (p / 5) * Math.PI * 2 + petalRot
      ctx.save()
      ctx.translate(flowerX + Math.cos(pa) * 8, flowerY + Math.sin(pa) * 8)
      ctx.rotate(pa)
      ctx.beginPath()
      ctx.ellipse(0, 0, 7, 4, 0, 0, Math.PI * 2)
      const petalG = ctx.createRadialGradient(0, 0, 0, 0, 0, 7)
      petalG.addColorStop(0, '#F06292'); petalG.addColorStop(1, '#E91E63')
      ctx.fillStyle = petalG; ctx.fill()
      ctx.restore()
    }
    ctx.beginPath(); ctx.arc(flowerX, flowerY, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#FFD700'; ctx.fill()

    // ── CO₂ arrows ──
    const co2Count = Math.round(co2N * 4)
    for (let i = 0; i < co2Count; i++) {
      const progress = ((t * 0.8 * (co2N + 0.2) + i * 0.6) % 2) / 2
      const startX = W - 40, startY = stemBaseY - stemH * 0.5 - 10 + i * 20
      const endX = stemBaseX + 30, endY = stemBaseY - stemH * 0.5
      const cx = lerp(startX, endX, progress)
      const cy = lerp(startY, endY, progress)
      ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(startX, startY)
      ctx.lineTo(cx, cy)
      ctx.strokeStyle = `rgba(255,183,77,${0.4 + (1 - progress) * 0.3})`
      ctx.lineWidth = 1.5; ctx.stroke()
      ctx.setLineDash([])
      if (progress < 0.3) {
        ctx.font = `600 9px ${FONT_MONO}`
        ctx.fillStyle = 'rgba(255,183,77,0.6)'; ctx.textAlign = 'center'
        ctx.fillText('CO₂', cx, cy - 8)
      }
    }

    // ── O₂ Bubbles ──
    const maxBubbles = Math.round((rate / 100) * 8)
    if (s.bubbles.length < maxBubbles && rate > 2) {
      s.bubbles.push({
        x: stemBaseX + 15 + Math.random() * 20,
        y: stemBaseY - stemH * 0.4,
        r: 3 + Math.random() * 6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.3,
        age: 0, popping: false, popFrame: 0
      })
    }
    if (rate < 1) s.bubbles = []

    s.bubbles = s.bubbles.filter(b => {
      b.age += 1 / 60
      if (b.popping) {
        b.popFrame++
        for (let ring = 0; ring < 3; ring++) {
          const rr = b.r + b.popFrame * 2 + ring * 4
          ctx.beginPath(); ctx.arc(b.x, b.y, rr, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(16,185,129,${0.3 - b.popFrame * 0.03 - ring * 0.08})`
          ctx.lineWidth = 1; ctx.stroke()
        }
        return b.popFrame < 10
      }
      b.y -= b.speed * (9 / (b.r + 3))
      b.x += Math.sin(b.age * 3 + b.phase) * 0.8
      if (b.y < 20) { b.popping = true; return true }

      const bubG = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, 0, b.x, b.y, b.r)
      bubG.addColorStop(0, 'rgba(5,150,105,0.3)')
      bubG.addColorStop(0.5, 'rgba(16,185,129,0.05)')
      bubG.addColorStop(1, 'rgba(16,185,129,0.08)')
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fillStyle = bubG; ctx.fill()
      ctx.strokeStyle = 'rgba(16,185,129,0.5)'; ctx.lineWidth = 1; ctx.stroke()

      const labelAlpha = Math.max(0, 1 - b.age * 0.5)
      if (labelAlpha > 0.1) {
        ctx.font = `600 ${Math.max(7, b.r * 1.2)}px ${FONT_MONO}`
        ctx.fillStyle = `rgba(5,150,105,${labelAlpha * 0.6})`; ctx.textAlign = 'center'
        ctx.fillText('O₂', b.x, b.y + 3)
      }
      return true
    })

    // ── Data panel (bottom-left) ──
    const dpX = 16, dpY = H - 160, dpW = 180, dpH = 140
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(5,10,20,0.85)'
    ctx.strokeStyle = isDark ? 'rgba(5,150,105,0.2)' : 'rgba(0,212,255,0.2)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.roundRect(dpX, dpY, dpW, dpH, 12)
    ctx.fill(); ctx.stroke()

    ctx.font = `700 12px ${FONT_UI}`
    ctx.fillStyle = isDark ? '#059669' : '#00D4FF'; ctx.textAlign = 'left'
    ctx.fillText('O₂ PRODUCTION RATE', dpX + 12, dpY + 22)

    s.dispRate = lerp(s.dispRate, rate, 0.06)
    const rateColor = s.dispRate < 30 ? '#EF4444' : s.dispRate < 60 ? (isDark ? '#D97706' : '#F59E0B') : '#10B981'
    ctx.font = `700 28px ${FONT_MONO}`
    ctx.fillStyle = rateColor
    ctx.fillText(`${Math.round(s.dispRate)}`, dpX + 12, dpY + 56)
    ctx.font = `500 12px ${FONT_MONO}`
    ctx.fillStyle = isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'
    ctx.fillText('units/min', dpX + 75, dpY + 56)

    s.dispLight = lerp(s.dispLight, lightIntensity, 0.08)
    s.dispTemp = lerp(s.dispTemp, temperature, 0.08)
    s.dispCO2 = lerp(s.dispCO2, co2Level * 100, 0.08)
    const readouts = [
      { icon: '⚡', label: 'Light', val: `${Math.round(s.dispLight)}%`, color: isDark ? '#059669' : '#00D4FF', n: s.dispLight / 100 },
      { icon: '🌡️', label: 'Temp', val: `${s.dispTemp.toFixed(1)}°C`, color: isDark ? '#D97706' : '#F59E0B', n: (s.dispTemp - 10) / 30 },
      { icon: '💨', label: 'CO₂', val: `${s.dispCO2.toFixed(1)}%`, color: '#10B981', n: s.dispCO2 / 50 },
    ]
    readouts.forEach((rd, i) => {
      const ry = dpY + 72 + i * 22
      ctx.font = `500 11px ${FONT_MONO}`
      ctx.fillStyle = rd.color; ctx.textAlign = 'left'
      ctx.fillText(`${rd.icon} ${rd.label}: ${rd.val}`, dpX + 12, ry)
      ctx.fillStyle = isDark ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'
      ctx.fillRect(dpX + 12, ry + 4, dpW - 28, 3)
      ctx.fillStyle = rd.color
      ctx.fillRect(dpX + 12, ry + 4, (dpW - 28) * Math.min(1, Math.max(0, rd.n)), 3)
    })

    // ── Rate meter (bottom-right) ──
    const gmX = W - 70, gmY = H - 80, gmR = 40
    const sA = (220 * Math.PI) / 180, eA = (320 * Math.PI) / 180
    const needA = sA + (eA - sA) * (s.dispRate / 100)
    ctx.beginPath(); ctx.arc(gmX, gmY, gmR, sA, eA)
    ctx.strokeStyle = isDark ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)'; ctx.lineWidth = 6; ctx.stroke()
    ctx.beginPath(); ctx.arc(gmX, gmY, gmR, sA, needA)
    ctx.strokeStyle = rateColor; ctx.lineWidth = 6; ctx.stroke()
    ctx.beginPath(); ctx.moveTo(gmX, gmY)
    ctx.lineTo(gmX + Math.cos(needA) * (gmR - 5), gmY + Math.sin(needA) * (gmR - 5))
    ctx.strokeStyle = isDark ? '#6B7280' : '#E2E8F0'; ctx.lineWidth = 1.5; ctx.stroke()
    ctx.font = `600 9px ${FONT_UI}`
    ctx.fillStyle = isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'; ctx.textAlign = 'center'
    ctx.fillText('Rate', gmX, gmY + 5)
    ctx.font = `700 16px ${FONT_MONO}`
    ctx.fillStyle = rateColor
    ctx.fillText(`${Math.round(s.dispRate)}`, gmX, gmY + 22)

    if (Math.round(t * 60) % 48 === 0 && onDataPoint) {
      onDataPoint({ time: t, value: rate })
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
