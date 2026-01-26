import { Outlet, useLocation } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { MobileNav } from './MobileNav'
import { TopHeader } from './TopHeader'
import { cn } from '@/lib/utils'

export default function Layout() {
  const location = useLocation()
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(
    location.pathname,
  )

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
