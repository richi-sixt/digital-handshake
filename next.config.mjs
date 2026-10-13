import nextMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  images: { unoptimized: true },
  // Only active once the site runs as a server (no `output: 'export'`, Phase 3).
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
