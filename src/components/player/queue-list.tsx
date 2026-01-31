import { Track } from '@/hooks/use-audio-player-context'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  ListMusic,
  Play,
  Trash2,
  GripVertical,
  Clock,
  Disc,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

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
  const upcoming = queue
    .map((t, i) => ({ track: t, originalIndex: i }))
    .slice(currentIndex + 1)

  // Simple Native DnD state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    // Optional: set drag image
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault() // Necessary to allow dropping
    if (draggedIndex === null || draggedIndex === index) return
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      // Find original indices
      const sourceOriginalIndex = upcoming[draggedIndex].originalIndex
      const targetOriginalIndex = upcoming[targetIndex].originalIndex
      onReorder(sourceOriginalIndex, targetOriginalIndex)
    }
    setDraggedIndex(null)
  }

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden shadow-xl">
      <div className="p-4 bg-secondary/30 border-b border-border flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2 text-lg text-primary uppercase tracking-widest">
          <ListMusic className="w-5 h-5" /> On Air Queue
        </h3>
        <span className="text-[10px] font-bold text-black bg-primary px-2 py-1 rounded-sm uppercase">
          {upcoming.length} Next
        </span>
      </div>

      <ScrollArea className="flex-1 bg-black/20">
        <div className="p-4 space-y-6">
          {/* Now Playing - Highlighted */}
          {current && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                Currently Playing
              </h4>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/10 border-l-4 border-primary shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Disc className="w-24 h-24 animate-spin-slow" />
                </div>

                <div className="relative z-10 w-12 h-12 rounded bg-secondary overflow-hidden shadow-lg">
                  {current.cover && (
                    <img
                      src={current.cover}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0 z-10">
                  <p className="text-base font-bold text-primary truncate">
                    {current.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate font-medium">
                    {current.composer}
                  </p>
                </div>
                <div className="z-10 text-xs font-mono text-primary font-bold">
                  PLAYING
                </div>
              </div>
            </div>
          )}

          {/* Upcoming List */}
          {upcoming.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                Up Next
              </h4>
              <div className="space-y-1">
                {upcoming.map(({ track, originalIndex }, listIndex) => (
                  <div
                    key={`${track.id}-${originalIndex}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, listIndex)}
                    onDragOver={(e) => handleDragOver(e, listIndex)}
                    onDrop={(e) => handleDrop(e, listIndex)}
                    className={cn(
                      'group flex items-center gap-3 p-3 rounded-lg border border-transparent transition-all cursor-grab active:cursor-grabbing',
                      draggedIndex === listIndex
                        ? 'bg-primary/20 border-primary dashed opacity-50'
                        : 'bg-secondary/10 hover:bg-secondary/30 hover:border-primary/20',
                    )}
                  >
                    <div className="text-muted-foreground group-hover:text-primary cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <div className="w-10 h-10 rounded bg-secondary overflow-hidden flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      {track.cover && (
                        <img
                          src={track.cover}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                        {track.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {track.composer}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-xs font-mono text-muted-foreground flex items-center gap-1 mr-2">
                        <Clock className="w-3 h-3" /> {track.duration}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-primary hover:bg-primary/10"
                        onClick={() => onSkipTo(originalIndex)}
                        title="Play Now"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onRemove(originalIndex)}
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3 border-2 border-dashed border-border rounded-xl">
              <ListMusic className="w-10 h-10 opacity-20" />
              <p className="font-medium">End of Transmission</p>
              <p className="text-xs opacity-60">
                Drag tracks here or add from library
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
