import React, { useState, useRef, useEffect, useMemo } from 'react'
import { EXPERIMENTS } from '../utils/experiments'

const EDU_RESPONSES = {
  pendulum: {
    explain: "A simple pendulum shows SHM — the bob swings back and forth under gravity. The period T = 2π√(L/g) depends ONLY on the string length, not the mass. Try changing the mass slider — notice the period stays the same!",
    hint: "Try setting length to 100cm and measure the period. Then double it to 200cm. Does the period double? (Hint: T ∝ √L, so it increases by √2 ≈ 1.41×)",
    formula: "T = 2π√(L/g)\nwhere L = pendulum length, g = 9.8 m/s²\n\nKey insight: Period is independent of mass and amplitude (for small angles < 15°)",
    quiz: "🧠 Quick Quiz: If you take this pendulum to the Moon (g = 1.6 m/s²), will the period increase or decrease? Why?"
  },
  'ohms-law': {
    explain: "Ohm's Law: V = IR. Current is directly proportional to voltage and inversely proportional to resistance. Watch the electrons — they speed up when you increase voltage!",
    hint: "Record V-I data for different voltages at fixed resistance. Plot them — you should get a straight line through the origin. The slope = 1/R.",
    formula: "V = IR → I = V/R → R = V/I\nPower: P = VI = I²R = V²/R\n\nThe V-I graph slope gives resistance.",
    quiz: "🧠 Quick Quiz: If you double both voltage AND resistance simultaneously, what happens to the current?"
  },
  photosynthesis: {
    explain: "Plants use light energy to convert CO₂ + H₂O → glucose + O₂. The rate depends on light intensity, CO₂ concentration, and temperature. Watch the O₂ bubbles — they show production rate!",
    hint: "Set light to 100% and vary CO₂. Notice how rate plateaus? That's because light becomes the limiting factor. This is Blackman's Law of Limiting Factors.",
    formula: "6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂\n\nRate limiting factors:\n• Light intensity\n• CO₂ concentration\n• Temperature (optimal ~25°C)",
    quiz: "🧠 Quick Quiz: Why does the rate decrease above 35°C even with maximum light and CO₂?"
  },
  projectile: {
    explain: "Projectile motion = constant horizontal velocity + accelerating vertical motion. The path is a parabola. Maximum range occurs at 45°. Watch the Vx (blue) and Vy (red) vectors!",
    hint: "Try complementary angles like 30° and 60° — they give the same range! That's because sin(2×30°) = sin(2×60°) = sin(60°) = sin(120°).",
    formula: "Range R = v²sin(2θ)/g\nMax Height H = v²sin²θ/(2g)\nTime of flight T = 2v·sinθ/g\n\nAt θ = 45°: R is maximum",
    quiz: "🧠 Quick Quiz: A ball is thrown horizontally from a cliff. Another is dropped from the same height at the same time. Which hits the ground first?"
  },
  'acid-base': {
    explain: "The pH scale (0-14) measures acidity. Acids donate H⁺ ions (pH < 7), bases accept them (pH > 7). Watch how different indicators change color at different pH values!",
    hint: "Try testing Lemon Juice with all three indicators. Litmus turns red, Phenolphthalein stays colorless, and pH paper shows orange. Each indicator has a different transition range.",
    formula: "pH = -log[H⁺]\npH 7 = neutral (pure water)\n\nAcid + Base → Salt + Water\n(Neutralisation reaction)",
    quiz: "🧠 Quick Quiz: Stomach acid has pH ~2. What type of substance (antacid) would you take to neutralize excess stomach acid?"
  }
}

const DEFAULT_RESPONSES = {
  explain: 'This experiment explores a key concept. Use the controls to change one variable at a time and observe the outcome.',
  hint: 'Try a small change first, then a large change. Record what changes and what stays the same.',
  formula: 'Check the theory section for formulas and key relationships.',
  quiz: 'Quiz: What variable has the biggest effect on the outcome? Why?'
}

function toLabel(text) {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
}

function extractFormula(notes) {
  if (!notes) return ''
  const lines = notes.split(/\n|\.|;/).map((s) => s.trim()).filter(Boolean)
  const formulaLine = lines.find((line) => line.includes('=') || line.includes('->') || line.includes('→'))
  return formulaLine || ''
}

function buildResponses(exp, variables) {
  if (!exp) return DEFAULT_RESPONSES
  const variableKeys = Object.keys(exp.variables || {})
  const variableHint = variableKeys.length
    ? `Try changing ${variableKeys.slice(0, 2).map(toLabel).join(' and ')} one at a time. Current: ${variableKeys.map((k) => `${toLabel(k)}=${variables?.[k] ?? ''}`).join(', ')}`
    : 'Try changing one variable at a time and observe the outcome.'

  const formulaLine = extractFormula(exp.detailedNotes)
  const quizItem = (exp.vivaQuestions || [])[0]

  return {
    explain: exp.detailedNotes || exp.description || DEFAULT_RESPONSES.explain,
    hint: variableHint,
    formula: formulaLine ? `Formula: ${formulaLine}` : DEFAULT_RESPONSES.formula,
    quiz: quizItem ? `Quiz: ${quizItem.q}` : DEFAULT_RESPONSES.quiz
  }
}

export default function AITutorChat({ experimentId, variables }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)
  const exp = useMemo(() => EXPERIMENTS.find((e) => e.id === experimentId), [experimentId])
  const responses = useMemo(() => {
    if (EDU_RESPONSES[experimentId]) return EDU_RESPONSES[experimentId]
    return buildResponses(exp, variables)
  }, [experimentId, exp, variables])

  useEffect(() => {
    // Welcome message
    setMessages([{
      role: 'ai',
      text: `Welcome to the PRAGYA Lab! 🔬 I'm your AI tutor. Ask me anything about this experiment, or tap one of the quick actions below to get started.`,
      time: Date.now()
    }])
  }, [experimentId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typing])

  const addAIResponse = (text) => {
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, { role: 'ai', text, time: Date.now() }])
    }, 800 + Math.random() * 600)
  }

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userMsg, time: Date.now() }])
    setInput('')

    const lower = userMsg.toLowerCase()
    if (lower.includes('formula') || lower.includes('equation')) addAIResponse(responses.formula)
    else if (lower.includes('hint') || lower.includes('help') || lower.includes('stuck')) addAIResponse(responses.hint)
    else if (lower.includes('quiz') || lower.includes('test') || lower.includes('question')) addAIResponse(responses.quiz)
    else if (lower.includes('explain') || lower.includes('what') || lower.includes('how') || lower.includes('why')) addAIResponse(responses.explain)
    else addAIResponse(responses.explain)
  }

  const handleChip = (type) => {
    const chipLabels = { explain: 'Explain this experiment', hint: 'Give me a hint', formula: 'Show the formula', quiz: 'Quiz me!' }
    setMessages(prev => [...prev, { role: 'user', text: chipLabels[type], time: Date.now() }])
    addAIResponse(responses[type])
  }

  return (
    <div className="exp-chat">
      <div className="exp-chat-messages" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === 'ai' && (
              <div className="exp-chat-avatar" />
            )}
            <div className={`exp-chat-bubble ${msg.role}`}>
              {msg.text.split('\n').map((line, li) => (
                <React.Fragment key={li}>{line}<br/></React.Fragment>
              ))}
            </div>
          </div>
        ))}
        {typing && (
          <div>
            <div className="exp-chat-avatar" />
            <div className="exp-typing-indicator">
              <div className="exp-typing-dot" />
              <div className="exp-typing-dot" />
              <div className="exp-typing-dot" />
            </div>
          </div>
        )}
      </div>

      <div className="exp-quick-chips">
        <button className="exp-chip" onClick={() => handleChip('explain')}>💡 Explain</button>
        <button className="exp-chip" onClick={() => handleChip('hint')}>🔑 Hint</button>
        <button className="exp-chip" onClick={() => handleChip('formula')}>📐 Formula</button>
        <button className="exp-chip" onClick={() => handleChip('quiz')}>🧠 Quiz</button>
      </div>

      <div className="exp-chat-input-area">
        <input
          className="exp-chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything..."
        />
        <button className="exp-chat-send" onClick={handleSend}>Send</button>
      </div>

      <div style={{
        padding: '8px 16px', textAlign: 'center',
        fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 600,
        background: 'linear-gradient(90deg, rgba(0,212,255,0.7), rgba(124,58,237,0.7))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        letterSpacing: '0.05em'
      }}>
        POWERED BY PRAGYA AI
      </div>
    </div>
  )
}
