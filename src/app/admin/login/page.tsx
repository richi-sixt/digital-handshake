import { LoginForm } from '@/app/admin/login/LoginForm'
import { Container } from '@/components/Container'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  let { error } = await searchParams

  return (
    <Container className="mt-16 sm:mt-32">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          Admin-Login
        </h1>
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Melde dich mit E-Mail und Passwort an. Alternativ schickt dir
          «Login-Link senden» einen Link per E-Mail (im selben Browser öffnen).
        </p>
        {error === 'link' && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            Der Link ist ungültig oder abgelaufen. Fordere einen neuen an.
          </p>
        )}
        <LoginForm />
      </div>
    </Container>
  )
}
