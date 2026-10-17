/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  // Stops `next dev` from generating AGENTS.md / CLAUDE.md in the repo.
  agentRules: false,
  images: { unoptimized: true },
  // Server-rendered (no static export): /admin, Supabase content and redirects.
  async redirects() {
    return [
      {
        source: '/journal/:path*',
        destination: '/blog/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
