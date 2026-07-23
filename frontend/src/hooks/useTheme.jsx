import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import translations from '../utils/translations'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem('pragya_lang') || 'en')
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('pragya_theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('pragya_theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const changeLanguage = (lang) => {
    setLanguage(lang)
    localStorage.setItem('pragya_lang', lang)
  }

  const toggleTheme = () => setIsDark(prev => !prev)

  const t = useCallback((key) => {
    const entry = translations[key]
    if (!entry) return key
    return entry[language] || entry['en'] || key
  }, [language])

  return (
    <ThemeContext.Provider value={{ language, changeLanguage, t, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
