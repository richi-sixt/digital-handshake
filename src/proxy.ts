import { NextResponse, type NextRequest } from 'next/server'

import { updateSession } from '@/lib/supabase/proxy'

const LOGIN_PATH = '/admin/login'

export async function proxy(request: NextRequest) {
  let { response, user } = await updateSession(request)
  let { pathname } = request.nextUrl

  let isLogin = pathname.replace(/\/$/, '') === LOGIN_PATH

  if (!user && !isLogin) {
    let url = request.nextUrl.clone()
    url.pathname = LOGIN_PATH
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
