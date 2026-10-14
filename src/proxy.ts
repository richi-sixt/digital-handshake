import { NextResponse, type NextRequest } from 'next/server'

import { publicOrigin } from '@/lib/site-origin'
import { updateSession } from '@/lib/supabase/proxy'

const LOGIN_PATH = '/admin/login'

export async function proxy(request: NextRequest) {
  let { response, user } = await updateSession(request)
  let { pathname } = request.nextUrl

  let isLogin = pathname.replace(/\/$/, '') === LOGIN_PATH

  if (!user && !isLogin) {
    return NextResponse.redirect(new URL(LOGIN_PATH, publicOrigin(request)))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
