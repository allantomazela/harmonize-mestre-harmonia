import { Track } from '@/hooks/use-audio-player-context'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { ListMusic, Play, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

interface QueueListProps {
  queue: Track[]
  currentIndex: number
  onReorder: (from: number, to: number) => void
  onSkipTo: (index: number) => void
}

export function QueueList({
  queue,
  currentIndex,
  onReorder,
  onSkipTo,
}: QueueListProps) {
  const upcoming = queue.slice(currentIndex + 1)
  const history = queue.slice(0, currentIndex)
  const current = queue[currentIndex]

  // Helper to move item up
  const moveUp = (index: number) => {
    if (index > 0) onReorder(index, index - 1)
  }

  // Helper to move item down
  const moveDown = (index: number) => {
    if (index < queue.length - 1) onReorder(index, index + 1)
  }

  return (
    <div className="flex flex-col h-full bg-card/50 rounded-xl border border-border overflow-hidden">
      <div className="p-4 bg-secondary/10 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-primary" /> Fila de Reprodução
        </h3>
        <span className="text-xs text-muted-foreground">
          {queue.length} faixas
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {history.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Anteriores
              </div>
              {history.map((track, i) => (
                <div
                  key={`${track.id}-${i}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/20 transition-colors opacity-60"
                >
                  <span className="w-6 text-center text-xs text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {track.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {track.composer}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onSkipTo(i)}
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <Separator className="my-2" />
            </>
          )}

          {current && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-primary uppercase tracking-wider">
                Tocando Agora
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-primary truncate">
                    {current.title}
                  </p>
                  <p className="text-xs text-primary/70 truncate">
                    {current.composer}
                  </p>
                </div>
              </div>
              <Separator className="my-2" />
            </>
          )}

          {upcoming.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                A Seguir
              </div>
              {upcoming.map((track, i) => {
                const actualIndex = currentIndex + 1 + i
                return (
                  <div
                    key={`${track.id}-${actualIndex}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/20 transition-colors group"
                  >
                    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity absolute left-2 bg-background shadow-md z-10 rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-6 rounded-none rounded-t-md"
                        onClick={() => moveUp(actualIndex)}
                      >
                        ▲
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-6 rounded-none rounded-b-md"
                        onClick={() => moveDown(actualIndex)}
                      >
                        ▼
                      </Button>
                    </div>

                    <span className="w-6 text-center text-xs text-muted-foreground group-hover:opacity-0">
                      {actualIndex + 1}
                    </span>
                    <div className="flex-1 min-w-0 pl-2 group-hover:pl-6 transition-all">
                      <p className="text-sm font-medium truncate">
                        {track.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {track.composer}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onSkipTo(actualIndex)}
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                    <GripVertical className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                )
              })}
            </>
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground italic">
              Fim da fila
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
