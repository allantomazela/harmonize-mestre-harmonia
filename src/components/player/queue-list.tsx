import { Track } from '@/hooks/use-audio-player-context'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { ListMusic, Play, GripVertical, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

interface QueueListProps {
  queue: Track[]
  currentIndex: number
  onReorder: (from: number, to: number) => void
  onRemove: (index: number) => void
  onSkipTo: (index: number) => void
}

export function QueueList({
  queue,
  currentIndex,
  onReorder,
  onRemove,
  onSkipTo,
}: QueueListProps) {
  const current = queue[currentIndex]

  // Calculate upcoming tracks
  const upcoming = queue
    .map((t, i) => ({ track: t, originalIndex: i }))
    .slice(currentIndex + 1)

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between bg-card z-10">
        <h3 className="font-bold flex items-center gap-2 text-lg">
          <ListMusic className="w-5 h-5 text-primary" /> Fila
        </h3>
        <span className="text-xs text-muted-foreground font-medium px-2 py-1 bg-secondary rounded-full">
          {queue.length} faixas
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Now Playing */}
          {current && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Tocando Agora
              </h4>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20 shadow-sm">
                <div className="relative">
                  <div className="w-10 h-10 rounded bg-secondary overflow-hidden">
                    {current.cover && (
                      <img
                        src={current.cover}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-lg ring-2 ring-primary/30" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-primary truncate">
                    {current.title}
                  </p>
                  <p className="text-xs text-primary/80 truncate">
                    {current.composer}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next Up */}
          {upcoming.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                A Seguir
              </h4>
              <div className="space-y-1">
                {upcoming.map(({ track, originalIndex }, i) => (
                  <div
                    key={`${track.id}-${originalIndex}`}
                    className="group flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/40 transition-colors border border-transparent hover:border-border"
                  >
                    <span className="w-6 text-center text-xs text-muted-foreground group-hover:hidden">
                      {i + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hidden group-hover:flex"
                      onClick={() => onSkipTo(originalIndex)}
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </Button>

                    <div className="w-8 h-8 rounded bg-secondary overflow-hidden flex-shrink-0">
                      {track.cover && (
                        <img
                          src={track.cover}
                          className="w-full h-full object-cover opacity-80"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {track.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {track.composer}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                      onClick={() => onRemove(originalIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
              <ListMusic className="w-8 h-8 opacity-20" />
              <p>Sua fila está vazia.</p>
              <p className="text-xs opacity-60">
                Adicione músicas da biblioteca para continuar tocando.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
