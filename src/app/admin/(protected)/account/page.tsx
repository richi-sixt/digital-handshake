import Link from 'next/link'

import { PasswordForm } from '@/app/admin/(protected)/account/PasswordForm'

export default function AccountPage() {
  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
        Konto
      </h1>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        Hier setzt oder änderst du das Passwort für den Login mit E-Mail und
        Passwort. Verwende ein langes, einmaliges Passwort aus deinem
        Passwortmanager.
      </p>
      <PasswordForm />
      <p className="mt-8 text-sm">
        <Link
          href="/admin/security"
          className="text-violet-500 hover:text-violet-600"
        >
          Zwei-Faktor-Login (Authenticator-App) verwalten
        </Link>
      </p>
    </div>
  )
}
