'use client'

import { ContainerInner, ContainerOuter } from '@/components/Container'
import { useTranslation } from '@/i18n'

export function Footer() {
  let { t } = useTranslation()

  return (
    <footer className="mt-32 flex-none">
      <ContainerOuter>
        <div className="border-t border-zinc-100 pt-10 pb-16 dark:border-zinc-700/40">
          <ContainerInner>
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                &copy; {new Date().getFullYear()} R&uuml;chan Sixt.{' '}
                {t('footer.rights')}
              </p>
            </div>
          </ContainerInner>
        </div>
      </ContainerOuter>
    </footer>
  )
}
