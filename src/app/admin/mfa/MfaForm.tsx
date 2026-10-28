'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { createClient } from '@/lib/supabase/client'

const inputClass =
  'mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'

/** Second login step: verifies the TOTP code and upgrades the session to aal2. */
export function MfaForm() {
  let router = useRouter()
  let [code, setCode] = useState('')
  let [busy, setBusy] = useState(false)
  let [error, setError] = useState('')

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')

    let supabase = createClient()
    let { data: factors } = await supabase.auth.mfa.listFactors()
    let factor = factors?.totp[0]
    if (!factor) {
      setBusy(false)
      setError('Kein Authenticator eingerichtet.')
      return
    }

    let { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: factor.id,
      code: code.trim(),
    })

    if (error) {
      setBusy(false)
      setError('Der Code stimmt nicht.')
      return
    }

    router.replace('/admin')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Code
        <input
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoFocus
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={inputClass}
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-60"
      >
        {busy ? 'Moment …' : 'Bestätigen'}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </form>
  )
}
