import nextMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  images: { unoptimized: true },
  // Server-rendered (no static export): /admin, Supabase posts and redirects.
  // Screenshots stay under /journal/screenshots/ until posts move to the DB.
  async redirects() {
    return [
      {
        source: '/journal',
        destination: '/blog/',
        permanent: true,
      },
      {
        source: '/journal/:path((?!screenshots/).+)',
        destination: '/blog/:path',
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
