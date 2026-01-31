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

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      const sourceOriginalIndex = upcoming[draggedIndex].originalIndex
      const targetOriginalIndex = upcoming[targetIndex].originalIndex
      onReorder(sourceOriginalIndex, targetOriginalIndex)
    }
    setDraggedIndex(null)
  }

  return (
    <div className="flex flex-col h-full bg-card/50 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
      <div className="p-5 bg-black/20 border-b border-white/5 flex items-center justify-between backdrop-blur-md">
        <h3 className="font-bold flex items-center gap-2 text-sm text-primary uppercase tracking-widest">
          <ListMusic className="w-4 h-4" /> On Air Queue
        </h3>
        <span className="text-[10px] font-bold text-black bg-primary px-2 py-0.5 rounded-sm uppercase tracking-wider">
          {upcoming.length} Tracks
        </span>
      </div>

      <ScrollArea className="flex-1 bg-transparent">
        <div className="p-4 space-y-6">
          {/* Now Playing - Highlighted */}
          {current && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Currently Playing
              </h4>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20 shadow-glow-sm relative overflow-hidden group">
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary" />
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Disc className="w-20 h-20 animate-spin-slow" />
                </div>

                <div className="relative z-10 w-12 h-12 rounded-md bg-black/50 overflow-hidden shadow-lg border border-white/10 shrink-0">
                  {current.cover && (
                    <img
                      src={current.cover}
                      className="w-full h-full object-cover opacity-90"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0 z-10">
                  <p className="text-sm font-bold text-primary truncate">
                    {current.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate font-medium">
                    {current.composer}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming List */}
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                Coming Up
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
                        : 'hover:bg-white/5 hover:border-white/5',
                    )}
                  >
                    <div className="text-muted-foreground/50 group-hover:text-primary cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <div className="w-10 h-10 rounded-md bg-secondary overflow-hidden flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
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
                      <div className="text-[10px] font-mono text-muted-foreground mr-2">
                        {track.duration}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:text-primary hover:bg-primary/10 rounded-full"
                        onClick={() => onSkipTo(originalIndex)}
                        title="Play Now"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={() => onRemove(originalIndex)}
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 px-6 text-center text-muted-foreground flex flex-col items-center gap-4 border border-dashed border-white/10 rounded-xl bg-white/5">
              <ListMusic className="w-8 h-8 opacity-20" />
              <div>
                <p className="font-medium text-sm">End of Queue</p>
                <p className="text-xs opacity-50 mt-1">
                  Drag tracks here to queue
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
