import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const theme = mounted ? resolvedTheme : undefined
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <Button aria-label={`Switch to ${next} mode`} className="shrink-0" onClick={() => setTheme(next)} size="icon" title={`Switch to ${next} mode`} type="button" variant="outline">
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </Button>
  )
}
