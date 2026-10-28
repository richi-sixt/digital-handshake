'use client'

import { useCallback, useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

const inputClass =
  'mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
const buttonClass =
  'rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-60'

type Factor = { id: string; friendly_name?: string }
type Pending = { id: string; qr: string; secret: string }

/** Lists, adds and removes TOTP factors of the signed-in admin. */
export function SecurityForm() {
  let [factors, setFactors] = useState<Factor[]>([])
  let [pending, setPending] = useState<Pending | null>(null)
  let [code, setCode] = useState('')
  let [busy, setBusy] = useState(false)
  let [error, setError] = useState('')

  let load = useCallback(async () => {
    let { data } = await createClient().auth.mfa.listFactors()
    setFactors(data?.totp ?? [])
  }, [])

  useEffect(() => {
    createClient()
      .auth.mfa.listFactors()
      .then(({ data }) => setFactors(data?.totp ?? []))
  }, [])

  async function onEnroll() {
    setBusy(true)
    setError('')
    let { data, error } = await createClient().auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}`,
    })
    setBusy(false)
    if (error || !data) {
      setError(error?.message ?? 'Einrichten fehlgeschlagen.')
      return
    }
    setPending({
      id: data.id,
      qr: data.totp.qr_code,
      secret: data.totp.secret,
    })
  }

  async function onVerify(event: React.FormEvent) {
    event.preventDefault()
    if (!pending) return
    setBusy(true)
    setError('')
    let { error } = await createClient().auth.mfa.challengeAndVerify({
      factorId: pending.id,
      code: code.trim(),
    })
    setBusy(false)
    if (error) {
      setError('Der Code stimmt nicht.')
      return
    }
    setPending(null)
    setCode('')
    load()
  }

  async function onRemove(id: string) {
    if (!confirm('Diesen Faktor entfernen?')) return
    setBusy(true)
    setError('')
    let { error } = await createClient().auth.mfa.unenroll({ factorId: id })
    setBusy(false)
    if (error) setError(error.message)
    load()
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {factors.length > 0 && (
        <ul className="flex flex-col gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          {factors.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3">
              <span>{f.friendly_name ?? f.id}</span>
              <button
                type="button"
                disabled={busy}
                onClick={() => onRemove(f.id)}
                className="text-red-600 underline disabled:opacity-60 dark:text-red-400"
              >
                Entfernen
              </button>
            </li>
          ))}
        </ul>
      )}

      {pending ? (
        <form onSubmit={onVerify} className="flex flex-col gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pending.qr}
            alt="QR-Code für die Authenticator-App"
            className="h-48 w-48 rounded-lg bg-white p-2"
          />
          <p className="text-xs break-all text-zinc-500 dark:text-zinc-400">
            Oder manuell: {pending.secret}
          </p>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Code zur Bestätigung
            <input
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={inputClass}
            />
          </label>
          <button type="submit" disabled={busy} className={buttonClass}>
            Bestätigen
          </button>
        </form>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={onEnroll}
          className={buttonClass}
        >
          Authenticator hinzufügen
        </button>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
