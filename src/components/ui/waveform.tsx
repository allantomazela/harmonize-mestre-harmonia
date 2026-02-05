import { useEffect, useRef, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { Button } from './button'
import { Flag, Scissors } from 'lucide-react'

interface WaveformProps {
  trackId: string
  progress: number // current time in seconds
  duration: number
  onSeek: (time: number) => void
  height?: number
  className?: string
  color?: string
}

export function Waveform({
  trackId,
  progress,
  duration,
  onSeek,
  height = 96,
  className,
  color = 'hsl(var(--primary))',
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { currentTrack, addCuePoint, setTrim } = useAudioPlayer()
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [dragMode, setDragMode] = useState<'start' | 'end' | null>(null)

  // Only active if this waveform represents the current track
  const isCurrent = currentTrack?.id === trackId
  const cues = isCurrent ? currentTrack?.cues || [] : []
  const trimStart = isCurrent ? currentTrack?.trimStart || 0 : 0
  const trimEnd = isCurrent ? currentTrack?.trimEnd || duration : duration

  // Generate deterministic random bars with a "mirrored" look for studio vibe
  const bars = useMemo(() => {
    const seed = trackId
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const count = 120
    const data = []
    for (let i = 0; i < count; i++) {
      const val = Math.sin(i * 0.15 + seed) * 0.5 + 0.5
      const noise = (Math.sin(i * 13.5 + seed) * 0.5 + 0.5) * 0.5
      data.push(Math.max(0.1, (val + noise) / 1.5))
    }
    return data
  }, [trackId])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const barWidth = width / bars.length
    const gap = 2
    const actualBarWidth = Math.max(1, barWidth - gap)

    ctx.clearRect(0, 0, width, height)

    // Calculate crop ranges in pixels
    const trimStartX = (trimStart / duration) * width
    const trimEndX = (trimEnd / duration) * width

    // Draw Bars (Mirrored Style)
    bars.forEach((barHeight, index) => {
      const x = index * barWidth
      const h = barHeight * height * 0.6 // Reduce max height to keep in bounds
      const y = (height - h) / 2

      // Check if within trim
      const isTrimmed = x < trimStartX || x > trimEndX
      // Check if played
      const isPlayed = (x / width) * duration < progress

      if (isTrimmed) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      } else {
        ctx.fillStyle = isPlayed ? color : 'rgba(255, 255, 255, 0.2)'
      }

      ctx.beginPath()
      // Top rounded bar
      ctx.roundRect(x, y, actualBarWidth, h, 2)
      ctx.fill()
    })

    // Draw Playhead
    const playheadX = (progress / duration) * width
    ctx.beginPath()
    ctx.moveTo(playheadX, 0)
    ctx.lineTo(playheadX, height)
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2
    ctx.stroke()

    // Playhead Glow
    ctx.shadowBlur = 10
    ctx.shadowColor = color
    ctx.stroke()
    ctx.shadowBlur = 0 // Reset

    // Draw Cues
    cues.forEach((cueTime) => {
      const cx = (cueTime / duration) * width
      ctx.fillStyle = '#ef4444' // Red
      ctx.beginPath()
      ctx.moveTo(cx, height / 2 - 10)
      ctx.lineTo(cx, height / 2 + 10)
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 2
      ctx.stroke()

      // Marker Head
      ctx.beginPath()
      ctx.arc(cx, height / 2 - 12, 3, 0, Math.PI * 2)
      ctx.fill()
    })

    // Hover Line
    if (hoverTime !== null) {
      const hx = (hoverTime / duration) * width
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(hx, 0)
      ctx.lineTo(hx, height)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }, [
    bars,
    progress,
    duration,
    height,
    color,
    cues,
    trimStart,
    trimEnd,
    isCurrent,
    hoverTime,
  ])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const time = (x / rect.width) * duration
    setHoverTime(time)

    if (dragMode === 'start') {
      const newStart = Math.max(0, Math.min(time, trimEnd - 1))
      setTrim(newStart, trimEnd)
    } else if (dragMode === 'end') {
      const newEnd = Math.max(trimStart + 1, Math.min(time, duration))
      setTrim(trimStart, newEnd)
    }
  }

  const handleMouseUp = () => {
    setDragMode(null)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (dragMode) return
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    onSeek(percentage * duration)
  }

  const handleAddCue = () => {
    addCuePoint(progress)
  }

  const handleSetTrimStart = () => {
    setTrim(progress, trimEnd)
  }

  const handleSetTrimEnd = () => {
    setTrim(trimStart, progress)
  }

  return (
    <div
      className={cn('relative w-full group select-none', className)}
      style={{ height }}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setHoverTime(null)
        setDragMode(null)
      }}
      onMouseUp={handleMouseUp}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair"
        onClick={handleClick}
      />

      {/* Interactive Controls Overlay */}
      {isCurrent && (
        <div className="absolute -top-10 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-white/10"
            onClick={handleAddCue}
            title="Add Cue Point"
          >
            <Flag className="w-4 h-4 text-red-500" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-white/10"
            onClick={handleSetTrimStart}
            title="Set Start Crop"
          >
            <Scissors className="w-4 h-4 rotate-180" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-white/10"
            onClick={handleSetTrimEnd}
            title="Set End Crop"
          >
            <Scissors className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
