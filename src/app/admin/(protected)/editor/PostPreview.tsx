'use client'

import { Markdown } from '@/components/Markdown'
import { Prose } from '@/components/Prose'

export default function PostPreview({ markdown }: { markdown: string }) {
  return (
    <Prose>
      {markdown.trim() ? (
        <Markdown>{markdown}</Markdown>
      ) : (
        <p className="text-zinc-400">Vorschau erscheint hier …</p>
      )}
    </Prose>
  )
}
