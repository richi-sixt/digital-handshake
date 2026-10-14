import { createBrowserClient } from '@supabase/ssr'

/** Browser client with the cookie session (admin login, image upload). */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
