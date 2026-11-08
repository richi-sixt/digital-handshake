import { useCallback, useSyncExternalStore } from 'react'

/** Reads a stored high score. Returns 0 on the server or when storage is unavailable. */
export function readHighScore(key: string): number {
  if (typeof window === 'undefined') return 0
  try {
    let value = Number(window.localStorage.getItem(key))
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
  } catch {
    return 0
  }
}

export function writeHighScore(key: string, score: number): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, String(Math.floor(score)))
  } catch {
    // Storage can be blocked (private mode); the score just isn't kept.
  }
}

let listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  window.addEventListener('storage', callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener('storage', callback)
  }
}

/**
 * High score persisted in localStorage. Renders 0 on the server and during
 * hydration, then the stored value. `submit` only stores a higher score.
 */
export function useHighScore(
  key: string,
): [number, (score: number) => boolean] {
  let high = useSyncExternalStore(
    subscribe,
    () => readHighScore(key),
    () => 0,
  )
  let submit = useCallback(
    (score: number) => {
      if (score <= readHighScore(key)) return false
      writeHighScore(key, score)
      listeners.forEach((l) => l())
      return true
    },
    [key],
  )
  return [high, submit]
}
