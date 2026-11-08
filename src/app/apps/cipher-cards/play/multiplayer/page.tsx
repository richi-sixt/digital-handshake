import { type Metadata } from 'next'

import { Container } from '@/components/Container'
import { MultiplayerPageHeader } from '@/components/GamePageHeader'
import { MultiplayerCipherCards } from '@/components/multiplayer/MultiplayerCipherCards'

export const metadata: Metadata = {
  title: 'Cipher Cards – Multiplayer',
  description: 'Play the team word-guessing game Cipher Cards online with 4 or more players.',
}

export default function MultiplayerCipherCardsPage() {
  return (
    <Container className="mt-16 sm:mt-32">
      <MultiplayerPageHeader
        titleKey="mp.cipher.title"
        descriptionKey="mp.cipher.description"
      />
      <div className="mt-16 sm:mt-20">
        <MultiplayerCipherCards />
      </div>
    </Container>
  )
}
