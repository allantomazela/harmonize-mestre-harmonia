import { useLocation } from 'react-router-dom'
import { Bell, ChevronRight, HardDrive, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'

export function TopHeader() {
  const location = useLocation()
  const { isSyncing } = useAudioPlayer()

  const getBreadcrumbs = () => {
    const path = location.pathname
    const parts = path.split('/').filter(Boolean)

    const map: Record<string, string> = {
      dashboard: 'Painel',
      library: 'Acervo Local',
      playlists: 'Playlists',
      settings: 'Configurações',
      player: 'Player',
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
        {isSyncing && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 animate-fade-in">
            <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
            <span className="text-xs font-medium text-blue-500">
              Sincronizando...
            </span>
          </div>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/20 cursor-help">
                <HardDrive className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-green-500 hidden sm:inline">
                  Modo Local Ativo
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Operando em modo offline com arquivos locais</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <Badge className="absolute top-1 right-1 w-2 h-2 p-0 bg-primary border-none" />
        </Button>
      </div>
    </header>
  )
}
