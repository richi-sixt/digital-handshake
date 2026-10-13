'use client'

import { useTranslation } from '@/i18n'

export function BlogHeader() {
  let { t } = useTranslation()

  return (
    <header className="max-w-2xl">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
        {t('blog.title')}
      </h1>
      <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
        {t('blog.description')}
      </p>
    </header>
  )
}
