import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Library, Music, Settings, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MobileNav() {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  const items = [
    { icon: LayoutDashboard, label: 'Início', path: '/dashboard' },
    { icon: Library, label: 'Acervo', path: '/library' },
    { icon: Music, label: 'Player', path: '/player' }, // Hypothetical player route
    { icon: Settings, label: 'Ajustes', path: '/settings' },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 px-4 py-2 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
      {items.map((item) => (
        <Link key={item.path} to={item.path} className="flex-1">
          <div
            className={cn(
              'flex flex-col items-center justify-center py-1 rounded-md transition-colors',
              isActive(item.path)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <item.icon
              className={cn(
                'w-6 h-6 mb-1',
                isActive(item.path) && 'fill-current/20',
              )}
            />
            <span className="text-[10px] font-medium">{item.label}</span>
          </div>
        </Link>
      ))}
      <Button
        variant="ghost"
        size="icon"
        className="flex flex-col items-center justify-center h-auto py-1 text-muted-foreground"
      >
        <Menu className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium">Menu</span>
      </Button>
    </div>
  )
}
