'use client'

import { useState } from 'react'
import clsx from 'clsx'

import {
  type Notice,
  inputClass,
  labelClass,
} from '@/app/admin/(protected)/editor/shared'
import { createClient } from '@/lib/supabase/client'

const MIN_LENGTH = 12

export function PasswordForm() {
  let [password, setPassword] = useState('')
  let [confirm, setConfirm] = useState('')
  let [busy, setBusy] = useState(false)
  let [notice, setNotice] = useState<Notice>()

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setNotice(undefined)

    if (password.length < MIN_LENGTH) {
      setNotice({ kind: 'error', text: `Mindestens ${MIN_LENGTH} Zeichen.` })
      return
    }
    if (password !== confirm) {
      setNotice({ kind: 'error', text: 'Die Passwörter stimmen nicht überein.' })
      return
    }

    setBusy(true)
    let { error } = await createClient().auth.updateUser({ password })
    setBusy(false)

    if (error) {
      setNotice({ kind: 'error', text: error.message })
      return
    }
    setPassword('')
    setConfirm('')
    setNotice({ kind: 'ok', text: 'Passwort gespeichert.' })
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
      <label className={labelClass}>
        Neues Passwort
        <input
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Passwort wiederholen
        <input
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="self-start rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-60"
      >
        {busy ? 'Speichere …' : 'Passwort speichern'}
      </button>
      {notice && (
        <p
          role="status"
          className={clsx(
            'rounded-lg p-3 text-sm',
            notice.kind === 'ok'
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
          )}
        >
          {notice.text}
        </p>
      )}
    </form>
  )
}
