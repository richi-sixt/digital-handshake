'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { createClient } from '@/lib/supabase/client'

const inputClass =
  'mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'

/** Email + password login, with a magic link as fallback. */
export function LoginForm() {
  let router = useRouter()
  let [email, setEmail] = useState('')
  let [password, setPassword] = useState('')
  let [state, setState] = useState<'idle' | 'busy' | 'sent'>('idle')
  let [error, setError] = useState('')

  async function onPassword(event: React.FormEvent) {
    event.preventDefault()
    setState('busy')
    setError('')

    let { error } = await createClient().auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setState('idle')
      setError('E-Mail oder Passwort stimmt nicht.')
      return
    }

    router.replace('/admin')
    router.refresh()
  }

  async function onMagicLink() {
    if (!email.trim()) {
      setError('Bitte zuerst die E-Mail-Adresse eintragen.')
      return
    }
    setState('busy')
    setError('')

    let { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: {
        // Sign-ups are disabled; only the existing admin user can log in.
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setState('idle')
      setError(error.message)
    } else {
      setState('sent')
    }
  }

  if (state === 'sent') {
    return (
      <p className="mt-6 rounded-lg bg-zinc-100 p-4 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
        Falls die Adresse bekannt ist, wurde ein Login-Link an{' '}
        <strong>{email}</strong> gesendet. Öffne ihn im selben Browser.
      </p>
    )
  }

  return (
    <form onSubmit={onPassword} className="mt-6 flex flex-col gap-3">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        E-Mail
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Passwort
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </label>
      <button
        type="submit"
        disabled={state === 'busy'}
        className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-60"
      >
        {state === 'busy' ? 'Moment …' : 'Anmelden'}
      </button>
      <button
        type="button"
        disabled={state === 'busy'}
        onClick={onMagicLink}
        className="text-sm text-zinc-500 underline hover:text-zinc-700 disabled:opacity-60 dark:text-zinc-400"
      >
        Passwort vergessen? Login-Link per E-Mail senden
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </form>
  )
}
