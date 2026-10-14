import { createClient } from '@supabase/supabase-js'

/**
 * Cookie-free anon client for public reads (published posts). Because it does
 * not touch request cookies, its results can be cached with unstable_cache.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
