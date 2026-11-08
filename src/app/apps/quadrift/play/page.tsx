import { type Metadata } from 'next'

import { Container } from '@/components/Container'
import { GamePageHeader } from '@/components/GamePageHeader'
import { Quadrift } from '@/components/games/Quadrift'

export const metadata: Metadata = {
  title: 'Quadrift',
  description:
    'Stack falling blocks, clear full lines and keep up as the speed rises.',
}

export default function QuadriftPlayPage() {
  return (
    <Container className="mt-16 sm:mt-32">
      <GamePageHeader
        titleKey="quadrift.title"
        descriptionKey="quadrift.description"
      />
      <div className="mt-16 sm:mt-20">
        <Quadrift />
      </div>
    </Container>
  )
}
