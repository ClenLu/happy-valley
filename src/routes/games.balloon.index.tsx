import { createFileRoute } from '@tanstack/react-router'
import { BalloonGame } from '@/features/balloon'

export const Route = createFileRoute('/games/balloon/')({
  component: BalloonPage,
})

function BalloonPage() {
  return <BalloonGame />
}
