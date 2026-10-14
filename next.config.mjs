import nextMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  // Stops `next dev` from generating AGENTS.md / CLAUDE.md in the repo.
  agentRules: false,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  images: { unoptimized: true },
  // Server-rendered (no static export): /admin, Supabase posts and redirects.
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

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: ['remark-gfm'],
    rehypePlugins: ['@mapbox/rehype-prism'],
  },
})

export default withMDX(nextConfig)
