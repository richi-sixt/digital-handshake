import { type NextRequest } from 'next/server'

/**
 * Public origin of a request. Behind the reverse proxy, `request.url` points
 * at the internal address (http://localhost:<port>), so redirects built from
 * it send visitors to the wrong host. Use the forwarded headers instead.
 */
export function publicOrigin(request: NextRequest): string {
  let host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  if (!host) return request.nextUrl.origin

  let proto =
    request.headers.get('x-forwarded-proto')?.split(',')[0].trim() ??
    request.nextUrl.protocol.replace(':', '')

  return `${proto}://${host}`
}
