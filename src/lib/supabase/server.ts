import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server client bound to the request's session cookies. Use it in server
 * components and server actions; RLS then applies as the logged-in user.
 */
export async function createClient() {
  let cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a server component: the proxy refreshes the session.
          }
        },
      },
    },
  )
}
