import { SecurityForm } from '@/app/admin/(protected)/security/SecurityForm'

export default function SecurityPage() {
  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
        Zwei-Faktor-Login
      </h1>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        Richte eine Authenticator-App (TOTP) ein. Danach verlangt jeder Login
        zusätzlich einen 6-stelligen Code. Richte am besten einen zweiten
        Faktor auf einem Zweitgerät ein, es gibt keine Backup-Codes.
      </p>
      <SecurityForm />
    </div>
  )
}
