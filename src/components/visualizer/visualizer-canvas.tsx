import { useEffect, useRef } from 'react'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { cn } from '@/lib/utils'

export type VisualizationMode = 'bars' | 'circular' | 'particles'

interface VisualizerCanvasProps {
  mode: VisualizationMode
  className?: string
  width?: number
  height?: number
}

export function VisualizerCanvas({
  mode,
  className,
  width,
  height,
}: VisualizerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { analyserRef, isCorsRestricted } = useAudioPlayer()
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Resize handling
    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = width || parent.clientWidth
        canvas.height = height || parent.clientHeight
      }
    }
    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const render = () => {
      // If CORS restricted, render a static "No Signal" line and stop
      if (isCorsRestricted) {
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.strokeStyle = '#333'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, canvas.height / 2)
        ctx.lineTo(canvas.width, canvas.height / 2)
        ctx.stroke()
        return
      }

      if (!analyserRef.current) {
        // If no analyser, allow loop to clear canvas or show idle state
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        // Draw idle text or static line
        ctx.fillStyle = '#333'
        ctx.fillRect(0, canvas.height / 2, canvas.width, 2)
        animationRef.current = requestAnimationFrame(render)
        return
      }

      const analyser = analyserRef.current
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      analyser.getByteFrequencyData(dataArray)

      // Clear
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)' // Trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2

      if (mode === 'bars') {
        const barWidth = (w / bufferLength) * 2.5
        let barHeight
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * h

          const hue = (i / bufferLength) * 360 + 75 // Shift hue towards primary
          ctx.fillStyle = `hsl(${hue}, 100%, 50%)`

          ctx.fillRect(x, h - barHeight, barWidth, barHeight)
          x += barWidth + 1
        }
      } else if (mode === 'circular') {
        const radius = Math.min(w, h) / 3
        ctx.beginPath()

        for (let i = 0; i < bufferLength; i++) {
          const amp = dataArray[i] / 255
          const angle = (i / bufferLength) * Math.PI * 2
          const r = radius + amp * 100

          const x = cx + Math.cos(angle) * r
          const y = cy + Math.sin(angle) * r

          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.strokeStyle = 'hsl(75, 100%, 50%)'
        ctx.lineWidth = 3
        ctx.stroke()

        // Inner glow
        ctx.beginPath()
        ctx.arc(cx, cy, radius * 0.8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(191, 255, 0, ${(dataArray[10] / 255) * 0.5})`
        ctx.fill()
      } else if (mode === 'particles') {
        // Simplified particle effect driven by bass (low freq)
        const bass = dataArray.slice(0, 10).reduce((a, b) => a + b) / 10 / 255
        const treble =
          dataArray.slice(100, 120).reduce((a, b) => a + b) / 20 / 255

        const particlesCount = 50

        for (let i = 0; i < particlesCount; i++) {
          const angle = Math.random() * Math.PI * 2
          const dist = Math.random() * Math.min(w, h) * 0.5 * (bass + 0.5)
          const px = cx + Math.cos(angle) * dist
          const py = cy + Math.sin(angle) * dist

          ctx.beginPath()
          ctx.arc(px, py, Math.random() * 5 * treble + 1, 0, Math.PI * 2)
          ctx.fillStyle = `hsl(${Math.random() * 60 + 60}, 100%, 50%)`
          ctx.fill()
        }
      }

      animationRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [mode, analyserRef, width, height, isCorsRestricted])

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'w-full h-full bg-black rounded-lg shadow-inner',
        className,
      )}
    />
  )
}
