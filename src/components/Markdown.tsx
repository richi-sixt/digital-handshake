import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypePrism from '@mapbox/rehype-prism'

// Posts may contain a little HTML (e.g. `<span id="anchor">` in headings), but
// everything runs through the sanitizer. Prism runs afterwards so the
// syntax-highlighting classes it adds are not stripped.
const sanitizeSchema = {
  ...defaultSchema,
  clobberPrefix: '',
  attributes: {
    ...defaultSchema.attributes,
    span: [...(defaultSchema.attributes?.span ?? []), 'id'],
  },
}

const components: Components = {
  a({ href, children, ...props }) {
    let external = typeof href === 'string' && /^https?:\/\//.test(href)
    return (
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...props}
      >
        {children}
      </a>
    )
  },
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ node: _node, alt, ...props }) => <img alt={alt ?? ''} loading="lazy" {...props} />,
}

/** Renders post Markdown (GFM, sanitized HTML, Prism highlighting). */
export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeRaw,
        [rehypeSanitize, sanitizeSchema],
        rehypePrism,
      ]}
      components={components}
    >
      {children}
    </ReactMarkdown>
  )
}
