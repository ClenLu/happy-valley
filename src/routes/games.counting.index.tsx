import { createFileRoute } from '@tanstack/react-router'
import { CountingGame } from '@/features/counting'

export const Route = createFileRoute('/games/counting/')({
  component: CountingPage,
})

function CountingPage() {
  return <CountingGame />
}
