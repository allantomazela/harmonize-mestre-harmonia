import { useLocation, Link } from 'react-router-dom'
import {
  Bell,
  ChevronRight,
  Cloud,
  CloudOff,
  Check,
  RefreshCw,
  LogOut,
  User,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEffect, useState } from 'react'

export function TopHeader() {
  const location = useLocation()
  const { isSyncing, syncStatus, isOfflineMode } = useAudioPlayer()

  // Read user profile from local storage to keep sync with Profile page
  const [userAvatar, setUserAvatar] = useState(
    'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
  )

  useEffect(() => {
    const saved = localStorage.getItem('harmonize_user_profile')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.avatar) setUserAvatar(parsed.avatar)
    }
  }, []) // Simplistic sync on mount

  const getBreadcrumbs = () => {
    const path = location.pathname
    const parts = path.split('/').filter(Boolean)

    const map: Record<string, string> = {
      dashboard: 'Painel',
      library: 'Acervo Local',
      playlists: 'Playlists',
      settings: 'Configurações',
      player: 'Player',
      profile: 'Meu Perfil',
      'ritual-creator': 'Gerador de Rituais',
    }

    return parts.map((part, index) => {
      const label = map[part] || part.charAt(0).toUpperCase() + part.slice(1)
      return (
        <span key={part} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
          )}
          <span
            className={
              index === parts.length - 1
                ? 'text-foreground font-medium'
                : 'text-muted-foreground'
            }
          >
            {label}
          </span>
        </span>
      )
    })
  }

  const getSyncStatusIcon = () => {
    if (isOfflineMode) return <CloudOff className="w-3.5 h-3.5" />
    if (syncStatus === 'syncing')
      return <RefreshCw className="w-3.5 h-3.5 animate-spin" />
    if (syncStatus === 'synced') return <Check className="w-3.5 h-3.5" />
    return <Cloud className="w-3.5 h-3.5" />
  }

  const getSyncStatusLabel = () => {
    if (isOfflineMode) return 'Offline'
    if (syncStatus === 'syncing') return 'Sincronizando...'
    if (syncStatus === 'synced') return 'Nuvem Ok'
    return 'Conectado'
  }

  const getSyncStatusColor = () => {
    if (isOfflineMode)
      return 'text-muted-foreground bg-secondary/50 border-transparent'
    if (syncStatus === 'syncing')
      return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    if (syncStatus === 'synced')
      return 'text-green-500 bg-green-500/10 border-green-500/20'
    return 'text-foreground bg-secondary/20 border-transparent'
  }

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center text-sm">
        <span className="text-muted-foreground mr-2 hidden sm:inline">
          Harmonize
        </span>
        <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground hidden sm:inline" />
        {getBreadcrumbs()}
      </div>

      <div className="flex items-center gap-4">
        {/* Cloud Sync Indicator */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-help',
                  getSyncStatusColor(),
                )}
              >
                {getSyncStatusIcon()}
                <span className="text-xs font-medium hidden sm:inline">
                  {getSyncStatusLabel()}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isOfflineMode
                  ? 'Modo Offline ativo. Alterações serão salvas localmente.'
                  : 'Seus dados estão sendo sincronizados com a nuvem.'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <Badge className="absolute top-1 right-1 w-2 h-2 p-0 bg-primary border-none" />
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={userAvatar} alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Minha Conta</p>
                <p className="text-xs leading-none text-muted-foreground">
                  Mestre de Harmonia
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link to="/profile">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
            </Link>
            <Link to="/settings">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <Link to="/login">
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
