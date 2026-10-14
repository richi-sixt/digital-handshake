import Link from 'next/link'
import { redirect } from 'next/navigation'

import { signOut } from '@/app/admin/actions'
import { Container } from '@/components/Container'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let supabase = await createClient()
  let {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  let { data: isAdmin } = await supabase.rpc('is_admin')

  return (
    <Container className="mt-10 pb-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 text-sm dark:border-zinc-700/40">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="font-semibold text-zinc-800 dark:text-zinc-100"
          >
            Admin
          </Link>
          <Link
            href="/blog/"
            className="text-zinc-500 hover:text-violet-500 dark:text-zinc-400"
          >
            Zum Blog
          </Link>
        </div>
        <form action={signOut} className="flex items-center gap-3">
          <span className="text-zinc-500 dark:text-zinc-400">{user.email}</span>
          <button
            type="submit"
            className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Abmelden
          </button>
        </form>
      </div>

      {isAdmin ? (
        children
      ) : (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Kein Zugriff: {user.email} ist nicht als Admin eingetragen (Tabelle{' '}
          <code>admin_emails</code>).
        </p>
      )}
    </Container>
  )
}
