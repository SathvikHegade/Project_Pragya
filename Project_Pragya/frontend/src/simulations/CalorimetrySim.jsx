import React, { useRef, useEffect, useCallback } from 'react'

const FONT_UI = "'Syne', sans-serif"
const FONT_MONO = "'JetBrains Mono', monospace"
function lerp(a, b, t) { return a + (b - a) * t }

function lerpColor(a, b, t) {
  const ar = parseInt(a.slice(1, 3), 16)
  const ag = parseInt(a.slice(3, 5), 16)
  const ab = parseInt(a.slice(5, 7), 16)
  const br = parseInt(b.slice(1, 3), 16)
  const bg = parseInt(b.slice(3, 5), 16)
  const bb = parseInt(b.slice(5, 7), 16)
  const rr = Math.round(ar + (br - ar) * t)
  const rg = Math.round(ag + (bg - ag) * t)
  const rb = Math.round(ab + (bb - ab) * t)
  return `rgb(${rr},${rg},${rb})`
}

export default function CalorimetrySim({ variables, onDataPoint }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    time: 0,
    waterTemp: 25,
    metalTemp: 80,
    dispTemp: 25,
    prevKey: ''
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

    const { metalMass, initialTemp, waterMass } = varsRef.current
    const mMetal = Math.max(1, Number(metalMass) || 1)
    const mWater = Math.max(1, Number(waterMass) || 1)
    const tMetal = Number(initialTemp) || 25
    const tWater = 25
    const cm = 0.45
    const cw = 4.186
    const tf = (mMetal * cm * tMetal + mWater * cw * tWater) / (mMetal * cm + mWater * cw)

    const key = `${mMetal}-${mWater}-${tMetal}`
    if (s.prevKey !== key) {
      s.prevKey = key
      s.waterTemp = tWater
      s.metalTemp = tMetal
    }

    const mixRate = 0.02 + Math.min(0.02, (mMetal + mWater) / 8000)
    s.waterTemp = lerp(s.waterTemp, tf, mixRate)
    s.metalTemp = lerp(s.metalTemp, tf, mixRate * 1.2)
    s.dispTemp = lerp(s.dispTemp, s.waterTemp, 0.08)
    const tempGapStart = Math.max(0.1, Math.abs(tMetal - tWater))
    const tempGapNow = Math.abs(s.metalTemp - s.waterTemp)
    const mixProgress = Math.max(0, Math.min(1, 1 - tempGapNow / tempGapStart))
    const isEquilibrium = Math.abs(s.metalTemp - tf) < 0.4 && Math.abs(s.waterTemp - tf) < 0.4

    const isDark = document.documentElement.dataset.theme === 'dark'
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    if (isDark) {
      bg.addColorStop(0, '#FFFFFF')
      bg.addColorStop(1, '#F0FDF4')
    } else {
      bg.addColorStop(0, '#050A14')
      bg.addColorStop(1, '#08162A')
    }
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    const cupX = W * 0.3
    const cupY = 90
    const cupW = W * 0.4
    const cupH = H - 190

    const cupStroke = isDark ? 'rgba(5,150,105,0.25)' : 'rgba(0,212,255,0.25)'
    ctx.strokeStyle = cupStroke
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cupX, cupY + 20)
    ctx.lineTo(cupX - 6, cupY + cupH)
    ctx.quadraticCurveTo(cupX + cupW / 2, cupY + cupH + 18, cupX + cupW + 6, cupY + cupH)
    ctx.lineTo(cupX + cupW, cupY + 20)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(cupX + cupW / 2, cupY + 20, cupW / 2 + 4, 12, 0, 0, Math.PI * 2)
    ctx.stroke()

    const waterLevel = 0.4 + Math.min(0.5, mWater / 800)
    const waterTop = cupY + cupH * (1 - waterLevel)
    const waveAmp = 2

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(cupX + 2, cupY + 22)
    ctx.lineTo(cupX - 6, cupY + cupH - 2)
    ctx.quadraticCurveTo(cupX + cupW / 2, cupY + cupH + 16, cupX + cupW + 6, cupY + cupH - 2)
    ctx.lineTo(cupX + cupW - 2, cupY + 22)
    ctx.closePath()
    ctx.clip()

    const tempNorm = Math.max(0, Math.min(1, (s.waterTemp - 20) / 70))
    const waterColor = lerpColor('#38BDF8', '#F97316', tempNorm)
    ctx.fillStyle = waterColor
    ctx.beginPath()
    ctx.moveTo(cupX - 10, cupY + cupH + 20)
    ctx.lineTo(cupX - 10, waterTop)
    for (let wx = cupX - 10; wx <= cupX + cupW + 10; wx += 3) {
      const wy = waterTop + Math.sin(wx * 0.05 + t * 2) * waveAmp
      ctx.lineTo(wx, wy)
    }
    ctx.lineTo(cupX + cupW + 10, cupY + cupH + 20)
    ctx.closePath()
    ctx.fill()

    const metalW = cupW * 0.18
    const metalH = cupH * 0.2
    const metalX = cupX + cupW / 2 - metalW / 2
    const metalY = waterTop + (cupH - (waterTop - cupY)) * 0.35
    const metalNorm = Math.max(0, Math.min(1, (s.metalTemp - 20) / 70))
    const metalColor = lerpColor('#94A3B8', '#EF4444', metalNorm)
    ctx.fillStyle = metalColor
    ctx.strokeStyle = isDark ? 'rgba(5,150,105,0.3)' : 'rgba(0,212,255,0.3)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(metalX, metalY, metalW, metalH, 6)
    ctx.fill()
    ctx.stroke()

    ctx.font = `600 11px ${FONT_MONO}`
    ctx.fillStyle = isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.6)'
    ctx.textAlign = 'center'
    ctx.fillText(`Metal ${s.metalTemp.toFixed(1)} C`, metalX + metalW / 2, metalY - 10)
    ctx.fillText(`Water ${s.waterTemp.toFixed(1)} C`, cupX + cupW / 2, waterTop - 8)

    ctx.strokeStyle = isDark ? 'rgba(245,158,11,0.6)' : 'rgba(251,191,36,0.6)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(metalX + metalW / 2, metalY + metalH + 6)
    ctx.lineTo(metalX + metalW / 2, waterTop + 10)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(metalX + metalW / 2 - 5, waterTop + 14)
    ctx.lineTo(metalX + metalW / 2, waterTop + 10)
    ctx.lineTo(metalX + metalW / 2 + 5, waterTop + 14)
    ctx.stroke()

    const heatX = metalX + metalW / 2
    const heatStart = metalY + metalH + 6
    const heatEnd = waterTop + 10
    const heatDir = heatEnd < heatStart ? -1 : 1
    const heatTravel = Math.max(24, Math.abs(heatEnd - heatStart))
    const deltaT = Math.abs(s.metalTemp - s.waterTemp)
    const massFactor = mMetal / Math.max(1, mMetal + mWater)
    const heatStrength = Math.max(0.25, Math.min(1, (deltaT / 60) * (0.8 + massFactor)))
    const heatSpeed = 8 + heatStrength * 30
    const heatCount = Math.round(4 + heatStrength * 9)
    const heatRadius = 2.2 + heatStrength * 2.2
    const heatAlpha = 0.55 + heatStrength * 0.35
    const heatColor = isDark ? '255,158,11' : '251,191,36'

    ctx.font = `600 10px ${FONT_UI}`
    ctx.fillStyle = isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.6)'
    ctx.textAlign = 'left'
    ctx.fillText('Heat flows to water', metalX + metalW / 2 + 10, metalY + metalH + 8)

    ctx.restore()

    const heatLineColor = isDark ? 'rgba(245,158,11,0.9)' : 'rgba(251,191,36,0.95)'
    ctx.save()
    ctx.strokeStyle = heatLineColor
    ctx.lineWidth = 3
    ctx.setLineDash([6, 10])
    ctx.lineDashOffset = -t * (6 + heatStrength * 8) * heatDir
    ctx.beginPath()
    ctx.moveTo(heatX, heatStart)
    ctx.lineTo(heatX, heatEnd)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.shadowColor = heatLineColor
    ctx.shadowBlur = 14
    for (let i = 0; i < heatCount; i++) {
      const offset = ((t * heatSpeed) + i * (heatTravel / heatCount)) % heatTravel
      const y = heatStart + heatDir * offset
      ctx.beginPath()
      ctx.arc(heatX, y, heatRadius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${heatColor},${heatAlpha})`
      ctx.fill()
    }
    ctx.restore()

    const thermX = cupX + cupW + 40
    const thermY = cupY + 20
    const thermH = cupH - 40

    ctx.strokeStyle = isDark ? 'rgba(5,150,105,0.3)' : 'rgba(0,212,255,0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(thermX, thermY, 18, thermH, 10)
    ctx.stroke()

    const tempHeight = thermH * Math.max(0, Math.min(1, (s.waterTemp - 20) / 80))
    ctx.fillStyle = isDark ? '#F97316' : '#F59E0B'
    ctx.fillRect(thermX + 4, thermY + thermH - tempHeight, 10, tempHeight)

    const tPanelX = thermX - 118
    const tPanelY = cupY + 8
    const tPanelW = 108
    const tPanelH = 78
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(5,10,20,0.85)'
    ctx.strokeStyle = isDark ? 'rgba(5,150,105,0.2)' : 'rgba(0,255,136,0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(tPanelX, tPanelY, tPanelW, tPanelH, 10)
    ctx.fill()
    ctx.stroke()

    ctx.font = `700 10px ${FONT_UI}`
    ctx.fillStyle = isDark ? '#059669' : '#00FF88'
    ctx.textAlign = 'left'
    ctx.fillText('TEMP TRACKER', tPanelX + 8, tPanelY + 14)

    const tRows = [
      ['Metal', `${s.metalTemp.toFixed(1)} C`, isDark ? '#EF4444' : '#F97316'],
      ['Water', `${s.waterTemp.toFixed(1)} C`, isDark ? '#38BDF8' : '#0EA5E9'],
      ['Target', `${tf.toFixed(1)} C`, isDark ? '#F59E0B' : '#FBBF24']
    ]
    tRows.forEach(([label, val, color], i) => {
      const ry = tPanelY + 30 + i * 16
      ctx.font = `500 9px ${FONT_UI}`
      ctx.fillStyle = isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.5)'
      ctx.textAlign = 'left'
      ctx.fillText(label, tPanelX + 8, ry)
      ctx.font = `600 10px ${FONT_MONO}`
      ctx.fillStyle = color
      ctx.textAlign = 'right'
      ctx.fillText(val, tPanelX + tPanelW - 8, ry)
    })

    const hudX = 16, hudY = 16, hudW = 210, hudH = 150
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
    ctx.fillText('CALORIMETRY', hudX + 12, hudY + 20)

    const rows = [
      ['Metal mass', `${mMetal.toFixed(0)} g`, isDark ? '#059669' : '#00FF88'],
      ['Water mass', `${mWater.toFixed(0)} g`, isDark ? '#38BDF8' : '#0EA5E9'],
      ['Target Tf', `${tf.toFixed(1)} C`, isDark ? '#F59E0B' : '#FBBF24'],
      ['Mix temp', `${s.dispTemp.toFixed(1)} C`, isDark ? '#F97316' : '#FB923C']
    ]

    rows.forEach(([label, val, color], i) => {
      const ry = hudY + 38 + i * 18
      ctx.font = `500 10px ${FONT_UI}`
      ctx.fillStyle = hudLabel
      ctx.textAlign = 'left'
      ctx.fillText(label, hudX + 12, ry)
      ctx.font = `600 12px ${FONT_MONO}`
      ctx.fillStyle = color
      ctx.textAlign = 'right'
      ctx.fillText(val, hudX + hudW - 12, ry)
    })

    const barX = hudX + 12
    const barY = hudY + hudH - 16
    const barW = hudW - 24
    const barH = 6
    ctx.fillStyle = isDark ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'
    ctx.fillRect(barX, barY, barW, barH)
    ctx.fillStyle = isDark ? 'rgba(5,150,105,0.5)' : 'rgba(0,255,136,0.7)'
    ctx.fillRect(barX, barY, barW * mixProgress, barH)
    ctx.font = `500 10px ${FONT_UI}`
    ctx.fillStyle = hudLabel
    ctx.textAlign = 'left'
    ctx.fillText('Mixing progress', barX, barY - 4)

    if (isEquilibrium) {
      ctx.font = `700 11px ${FONT_UI}`
      ctx.fillStyle = isDark ? '#059669' : '#00FF88'
      ctx.textAlign = 'left'
      ctx.fillText('Equilibrium reached', hudX + 12, barY + 18)
    }

    ctx.font = `600 11px ${FONT_MONO}`
    ctx.fillStyle = isDark ? 'rgba(5,150,105,0.6)' : 'rgba(0,255,136,0.5)'
    ctx.textAlign = 'left'
    ctx.fillText(`Qlost = Qgain, Tf = ${tf.toFixed(1)} C`, 18, H - 22)

    if (Math.round(t * 60) % 48 === 0 && onDataPoint) {
      onDataPoint({ time: t, value: s.dispTemp })
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
