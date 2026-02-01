import { useEffect, useRef, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface WaveformProps {
  trackId: string
  progress: number // 0 to 100 or current time
  duration: number
  onSeek: (time: number) => void
  height?: number
  className?: string
  color?: string
}

export function Waveform({
  trackId,
  progress, // current time in seconds
  duration,
  onSeek,
  height = 64,
  className,
  color = 'hsl(var(--primary))',
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Generate deterministic random bars based on trackId
  const bars = useMemo(() => {
    const seed = trackId
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const count = 100 // Number of bars
    const data = []
    for (let i = 0; i < count; i++) {
      // Simple pseudo-random function
      const val = Math.sin(i * 0.2 + seed) * 0.5 + 0.5
      // Add some noise
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

    // Calculate progress ratio
    const ratio = duration > 0 ? progress / duration : 0

    bars.forEach((barHeight, index) => {
      const x = index * barWidth
      const h = barHeight * height
      const y = (height - h) / 2 // Center vertically

      // Determine color based on progress
      const isPlayed = index / bars.length < ratio

      ctx.fillStyle = isPlayed ? color : 'rgba(255, 255, 255, 0.1)'

      // Draw rounded rect
      ctx.beginPath()
      ctx.roundRect(x, y, Math.max(1, actualBarWidth), h, 2)
      ctx.fill()
    })
  }, [bars, progress, duration, height, color])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    onSeek(percentage * duration)
  }

  return (
    <div
      className={cn('relative w-full cursor-pointer group', className)}
      style={{ height }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        onClick={handleClick}
      />
      {/* Hover seeking indicator could go here */}
      <div
        className="absolute top-0 bottom-0 bg-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity w-[1px]"
        style={{ left: `${(progress / duration) * 100}%` }}
      />
    </div>
  )
}
