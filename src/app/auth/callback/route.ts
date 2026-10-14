import { NextResponse, type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

/** Magic-link landing: exchanges the one-time code for a session cookie. */
export async function GET(request: NextRequest) {
  let { searchParams, origin } = new URL(request.url)
  let code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/admin'
  // Only allow redirects inside /admin.
  if (!next.startsWith('/admin')) next = '/admin'

  if (code) {
    let supabase = await createClient()
    let { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/admin/login?error=link`)
}
