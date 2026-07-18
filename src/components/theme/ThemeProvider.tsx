'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'
type ResolvedTheme = Theme

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)
const storageKey = 'app-theme'

function applyTheme(theme: Theme): ResolvedTheme {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
  return theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')

  const setTheme = useCallback((nextTheme: Theme) => {
    localStorage.setItem(storageKey, nextTheme)
    setThemeState(nextTheme)
  }, [])

  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey)
    setThemeState(storedTheme === 'dark' ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    if (document.documentElement.dataset.landingActive === 'true') {
      setResolvedTheme(theme)
      return
    }
    setResolvedTheme(applyTheme(theme))
  }, [theme])

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [resolvedTheme, setTheme, theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside ThemeProvider')
  return context
}
