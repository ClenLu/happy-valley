import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/games')({
  component: GamesLayout,
})

function GamesLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-kids-bg-sky via-kids-bg-cream to-kids-bg-warm">
      {/* 主内容区域 */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
