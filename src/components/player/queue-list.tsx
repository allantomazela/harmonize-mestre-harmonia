import { Track } from '@/hooks/use-audio-player'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  return (
    <div className="flex flex-col h-full bg-card/50 rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-card/80 backdrop-blur-sm">
        <h3 className="font-semibold text-lg">A Seguir</h3>
        <p className="text-xs text-muted-foreground">
          {queue.length - currentIndex - 1} faixas restantes
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {queue.map((track, index) => {
            const isCurrent = index === currentIndex
            const isPast = index < currentIndex
            return (
              <div
                key={`${track.id}-${index}`}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg transition-colors group',
                  isCurrent ? 'bg-primary/10 border border-primary/20' : '',
                  isPast ? 'opacity-50' : 'hover:bg-secondary/20',
                )}
              >
                <div className="w-8 text-center text-xs font-medium text-muted-foreground">
                  {isCurrent ? (
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse mx-auto" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onSkipTo(index)}
                >
                  <p
                    className={cn(
                      'text-sm font-medium truncate',
                      isCurrent && 'text-primary',
                    )}
                  >
                    {track.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {track.composer}
                  </p>
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={index === 0}
                    onClick={() => onReorder(index, index - 1)}
                  >
                    <ArrowUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={index === queue.length - 1}
                    onClick={() => onReorder(index, index + 1)}
                  >
                    <ArrowDown className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
