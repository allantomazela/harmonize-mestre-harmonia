import { Outlet, useLocation } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { MobileNav } from './MobileNav'
import { TopHeader } from './TopHeader'
import { cn } from '@/lib/utils'
import { MiniPlayer } from '@/components/player/mini-player'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'

export default function Layout() {
  const location = useLocation()
  const { currentTrack } = useAudioPlayer()

  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(
    location.pathname,
  )
  const isPlayerPage = ['/player', '/live-mode'].includes(location.pathname)

  if (isAuthPage) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Outlet />
      </main>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
        <TopHeader />
        <main
          className={cn(
            'flex-1 p-4 md:p-6 overflow-y-auto animate-fade-in',
            // Adjust bottom margin based on MiniPlayer presence
            // Mobile: Nav (~60px) + Player (80px) -> mb-36 approx
            // Desktop: Player (80px) -> mb-20
            currentTrack && !isPlayerPage ? 'mb-36 md:mb-20' : 'mb-16 md:mb-0',
          )}
        >
          <Outlet />
        </main>
      </div>

      {!isPlayerPage && <MiniPlayer />}
      <MobileNav />
    </div>
  )
}
