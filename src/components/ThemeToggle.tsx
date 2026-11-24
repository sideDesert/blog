import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type ThemeMode = 'light' | 'dark' | 'auto'
type ResolvedTheme = Exclude<ThemeMode, 'auto'>

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'auto'
  }

  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    return stored
  }

  return 'auto'
}

function getResolvedTheme(mode: ThemeMode): ResolvedTheme {
  if (mode !== 'auto') {
    return mode
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function applyThemeMode(mode: ThemeMode) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode

  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(resolved)

  if (mode === 'auto') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', mode)
  }

  document.documentElement.style.colorScheme = resolved
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('auto')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')

  useEffect(() => {
    const initialMode = getInitialMode()
    setMode(initialMode)
    setResolvedTheme(getResolvedTheme(initialMode))
    applyThemeMode(initialMode)
  }, [])

  useEffect(() => {
    if (mode !== 'auto') {
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      setResolvedTheme(getResolvedTheme('auto'))
      applyThemeMode('auto')
    }

    media.addEventListener('change', onChange)
    return () => {
      media.removeEventListener('change', onChange)
    }
  }, [mode])

  const nextTheme: ResolvedTheme = resolvedTheme === 'dark' ? 'light' : 'dark'

  function toggleMode() {
    setMode(nextTheme)
    setResolvedTheme(nextTheme)
    applyThemeMode(nextTheme)
    window.localStorage.setItem('theme', nextTheme)
  }

  const label = `Theme: ${mode === 'auto' ? `auto (${resolvedTheme})` : mode}. Switch to ${nextTheme} mode.`

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={label}
      title={label}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-foreground hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
    >
      {resolvedTheme === 'dark' ? (
        <Moon aria-hidden="true" size={22} strokeWidth={1.5} />
      ) : (
        <Sun aria-hidden="true" size={22} strokeWidth={1.5} />
      )}
    </button>
  )
}
