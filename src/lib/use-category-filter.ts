import { useCallback, useSyncExternalStore } from 'react'

const PARAM = 'category'

let listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  window.addEventListener('popstate', callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener('popstate', callback)
  }
}

function getSnapshot() {
  return new URLSearchParams(window.location.search).get(PARAM) ?? 'all'
}

/**
 * Category filter kept in the URL (`?category=games`) instead of component
 * state, so the history entry remembers it: opening an item and navigating back
 * restores the filter. The server render and hydration use 'all'. Reading the
 * URL with useSyncExternalStore avoids a Suspense boundary on static pages.
 * Unknown values in the URL fall back to 'all'.
 */
export function useCategoryFilter(
  categories: string[],
): [string, (category: string) => void] {
  let raw = useSyncExternalStore(subscribe, getSnapshot, () => 'all')
  let category = categories.includes(raw) ? raw : 'all'

  let setCategory = useCallback((next: string) => {
    let url = new URL(window.location.href)
    if (next === 'all') url.searchParams.delete(PARAM)
    else url.searchParams.set(PARAM, next)
    window.history.replaceState(null, '', url.pathname + url.search + url.hash)
    listeners.forEach((listener) => listener())
  }, [])

  return [category, setCategory]
}
