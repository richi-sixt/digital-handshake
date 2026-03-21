'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'

/**
 * Renders `primary` content, but falls back to `fallback` if the primary
 * renders empty (e.g. an empty MDX file for a missing translation).
 */
export function FallbackContent({
  primary,
  fallback,
}: {
  primary: ReactNode
  fallback: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [empty, setEmpty] = useState(false)

  useEffect(() => {
    if (
      ref.current &&
      ref.current.childElementCount === 0 &&
      !ref.current.textContent?.trim()
    ) {
      setEmpty(true)
    }
  }, [])

  if (empty) return <>{fallback}</>

  return <div ref={ref}>{primary}</div>
}
