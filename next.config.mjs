import nextMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
output: 'export',
images: { unoptimized: true },
pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
outputFileTracingIncludes: {
  '/projects/*': ['./src/app/projects/**/*.mdx'],
  '/work/*': ['./src/app/work/**/*.mdx'],
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
