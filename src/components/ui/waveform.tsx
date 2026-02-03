import { useEffect, useRef, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useAudioPlayer, Track } from '@/hooks/use-audio-player-context'
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

  // Generate deterministic random bars
  const bars = useMemo(() => {
    const seed = trackId
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const count = 150
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
    const gap = 1
    const actualBarWidth = barWidth - gap

    ctx.clearRect(0, 0, width, height)

    // Calculate crop ranges in pixels
    const trimStartX = (trimStart / duration) * width
    const trimEndX = (trimEnd / duration) * width
    const progressX = (progress / duration) * width

    // Background for trimmed area
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, trimStartX, height)
    ctx.fillRect(trimEndX, 0, width - trimEndX, height)

    // Draw Bars
    bars.forEach((barHeight, index) => {
      const x = index * barWidth
      const h = barHeight * height * 0.8
      const y = (height - h) / 2

      // Check if within trim
      const isTrimmed = x < trimStartX || x > trimEndX
      // Check if played
      const isPlayed = (x / width) * duration < progress

      if (isTrimmed) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      } else {
        ctx.fillStyle = isPlayed ? color : 'rgba(255, 255, 255, 0.3)'
      }

      ctx.beginPath()
      ctx.roundRect(x, y, Math.max(1, actualBarWidth), h, 2)
      ctx.fill()
    })

    // Draw Cues
    cues.forEach((cueTime) => {
      const cx = (cueTime / duration) * width
      ctx.fillStyle = '#ef4444' // Red
      ctx.beginPath()
      ctx.moveTo(cx, 0)
      ctx.lineTo(cx, height)
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 2
      ctx.stroke()

      // Marker Head
      ctx.beginPath()
      ctx.arc(cx, 10, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw Trim Handles
    if (isCurrent) {
      // Start
      ctx.fillStyle = '#eab308' // Yellow
      ctx.fillRect(trimStartX - 2, 0, 4, height)

      // End
      ctx.fillRect(trimEndX - 2, 0, 4, height)
    }

    // Hover Line
    if (hoverTime !== null) {
      const hx = (hoverTime / duration) * width
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(hx, 0)
      ctx.lineTo(hx, height)
      ctx.stroke()
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
    // Basic seek
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
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="h-6 w-6"
            onClick={handleAddCue}
            title="Add Cue Point"
          >
            <Flag className="w-3 h-3 text-red-500" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-6 w-6"
            onClick={handleSetTrimStart}
            title="Set Start Crop"
          >
            <Scissors className="w-3 h-3 rotate-180" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-6 w-6"
            onClick={handleSetTrimEnd}
            title="Set End Crop"
          >
            <Scissors className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  )
}
