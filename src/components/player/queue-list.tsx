import { Track } from '@/hooks/use-audio-player-context'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  Play,
  Trash2,
  GripVertical,
  WifiOff,
  CloudDownload,
  Disc,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

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
    <div className="flex flex-col h-full w-full">
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/5 backdrop-blur-xl">
        <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
          Next Up
        </h3>
        <Badge variant="outline" className="border-white/10 text-xs font-mono">
          {upcoming.length}
        </Badge>
      </div>

      <ScrollArea className="flex-1 bg-transparent">
        <div className="p-4 space-y-6">
          {/* Now Playing */}
          {current && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest pl-1">
                Now Playing
              </span>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20 relative overflow-hidden group">
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary shadow-glow-sm" />
                <div className="relative w-12 h-12 rounded-lg bg-black/50 overflow-hidden shadow-lg border border-white/10 shrink-0">
                  {current.cover ? (
                    <img
                      src={current.cover}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                      <Disc className="w-6 h-6 text-zinc-700" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {current.title}
                  </p>
                  <p className="text-xs text-primary/80 truncate">
                    {current.composer}
                  </p>
                </div>
                <div className="mr-2">
                  <div className="flex space-x-1">
                    <div className="w-1 h-3 bg-primary animate-[bounce_1s_infinite]" />
                    <div className="w-1 h-3 bg-primary animate-[bounce_1.2s_infinite]" />
                    <div className="w-1 h-3 bg-primary animate-[bounce_0.8s_infinite]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* List */}
          <div className="space-y-1">
            {upcoming.map(({ track, originalIndex }, listIndex) => (
              <div
                key={`${track.id}-${originalIndex}`}
                draggable
                onDragStart={(e) => handleDragStart(e, listIndex)}
                onDragOver={(e) => handleDragOver(e, listIndex)}
                onDrop={(e) => handleDrop(e, listIndex)}
                className={cn(
                  'group flex items-center gap-3 p-2 rounded-lg border border-transparent transition-all cursor-grab active:cursor-grabbing hover:bg-white/5',
                  draggedIndex === listIndex &&
                    'bg-white/10 border-white/20 opacity-50',
                )}
              >
                <div className="text-muted-foreground/30 group-hover:text-white/60">
                  <GripVertical className="w-4 h-4" />
                </div>

                <div className="w-10 h-10 rounded bg-white/5 overflow-hidden flex-shrink-0 relative">
                  {track.cover && (
                    <img
                      src={track.cover}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-zinc-300 group-hover:text-white transition-colors">
                    {track.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {track.composer}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Offline Status */}
                  {track.offlineAvailable ? (
                    <div title="Available Offline">
                      <WifiOff className="w-3 h-3 text-green-500/70" />
                    </div>
                  ) : (
                    <div title="Cloud Stream">
                      <CloudDownload className="w-3 h-3 text-muted-foreground/30" />
                    </div>
                  )}

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:text-primary hover:bg-primary/10 rounded-full"
                      onClick={() => onSkipTo(originalIndex)}
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:text-destructive hover:bg-destructive/10 rounded-full"
                      onClick={() => onRemove(originalIndex)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
