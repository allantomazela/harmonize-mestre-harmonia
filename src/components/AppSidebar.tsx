import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Library,
  ListMusic,
  Calendar,
  Settings,
  LogOut,
  Music,
  Wand2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SidebarPlayer } from '@/components/sidebar-player'
import { useEffect, useState } from 'react'

export function AppSidebar() {
  const location = useLocation()
  const isActive = (path: string) => location.pathname.startsWith(path)

  const [user, setUser] = useState({
    name: 'Ir. João Silva',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
  })

  // Simple hydration from local storage
  useEffect(() => {
    const saved = localStorage.getItem('harmonize_user_profile')
    if (saved) {
      const parsed = JSON.parse(saved)
      setUser({
        name: parsed.name,
        avatar: parsed.avatar,
      })
    }
  }, [])

  const navItems = [
    { icon: LayoutDashboard, label: 'Painel', path: '/dashboard' },
    { icon: Library, label: 'Acervo', path: '/library' },
    { icon: Wand2, label: 'Gerador Ritual', path: '/ritual-creator' },
    { icon: ListMusic, label: 'Playlists', path: '/playlists' },
    { icon: Calendar, label: 'Agenda', path: '/calendar' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ]

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-screen fixed left-0 top-0 z-30 transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary/20 p-2 rounded-lg">
          <Music className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-foreground">
            Harmonize
          </h1>
          <p className="text-xs text-muted-foreground">Gestão Musical</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 mb-1 font-medium transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive(item.path) &&
                  'bg-sidebar-accent text-primary border-r-2 border-primary rounded-r-none',
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      {/* Quick Player Control in Sidebar */}
      <SidebarPlayer />

      <div className="p-4 border-t border-sidebar-border">
        <Link
          to="/profile"
          className="flex items-center gap-3 mb-4 group cursor-pointer"
        >
          <Avatar className="group-hover:ring-2 ring-primary transition-all">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">Ver Perfil</p>
          </div>
        </Link>
        <Link to="/login">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/50"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </Link>
      </div>
    </aside>
  )
}
