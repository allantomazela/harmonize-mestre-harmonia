import { Outlet, useLocation, Link } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { MobileNav } from './MobileNav'
import { TopHeader } from './TopHeader'
import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { upcomingEvents } from '@/lib/mock-data'
import { Calendar } from 'lucide-react'
import { Button } from './ui/button'

export default function Layout() {
  const location = useLocation()
  const { toast } = useToast()
  const notificationSentRef = useRef(false)

  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(
    location.pathname,
  )

  // Mock Notification Logic
  useEffect(() => {
    if (notificationSentRef.current) return

    // Simulate checking for events starting soon
    const nextEvent = upcomingEvents[0] // Mocking the "next" event logic
    if (nextEvent) {
      const timer = setTimeout(() => {
        toast({
          title: 'Sessão Iniciando em Breve',
          description: `"${nextEvent.title}" está agendada para hoje às ${nextEvent.date.split(',')[1].trim()}.`,
          action: (
            <Link to="/player">
              <Button size="sm" variant="secondary">
                <Calendar className="w-4 h-4 mr-2" /> Ir para Ritual
              </Button>
            </Link>
          ),
          duration: 10000,
        })
        notificationSentRef.current = true
      }, 3000) // Trigger 3s after mount for demo

      return () => clearTimeout(timer)
    }
  }, [toast])

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
        <main className="flex-1 p-4 md:p-6 overflow-y-auto mb-16 md:mb-0 animate-fade-in">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
