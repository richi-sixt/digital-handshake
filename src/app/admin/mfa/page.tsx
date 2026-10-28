import { redirect } from 'next/navigation'

import { MfaForm } from '@/app/admin/mfa/MfaForm'
import { Container } from '@/components/Container'
import { needsMfa } from '@/lib/supabase/mfa'
import { createClient } from '@/lib/supabase/server'

export default async function MfaPage() {
  let supabase = await createClient()
  let {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  if (!(await needsMfa(supabase))) redirect('/admin')

  return (
    <Container className="mt-16 sm:mt-32">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          Zwei-Faktor-Code
        </h1>
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Gib den 6-stelligen Code aus deiner Authenticator-App ein.
        </p>
        <MfaForm />
      </div>
    </Container>
  )
}
