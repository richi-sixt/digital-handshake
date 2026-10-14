'use client'

import { useState } from 'react'

import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  let [email, setEmail] = useState('')
  let [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  )
  let [message, setMessage] = useState('')

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setState('sending')

    let { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: {
        // Sign-ups are disabled; only the existing admin user can log in.
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setState('error')
      setMessage(error.message)
    } else {
      setState('sent')
    }
  }

  if (state === 'sent') {
    return (
      <p className="mt-6 rounded-lg bg-zinc-100 p-4 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
        Falls die Adresse bekannt ist, wurde ein Login-Link an{' '}
        <strong>{email}</strong> gesendet.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        E-Mail
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </label>
      <button
        type="submit"
        disabled={state === 'sending'}
        className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-60"
      >
        {state === 'sending' ? 'Sende …' : 'Login-Link senden'}
      </button>
      {state === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
      )}
    </form>
  )
}
