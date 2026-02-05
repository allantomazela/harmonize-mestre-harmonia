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
      // If CORS restricted, render a "No Signal" line with VJ aesthetic
      if (isCorsRestricted) {
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const cy = canvas.height / 2
        ctx.strokeStyle = '#CCFF00'
        ctx.lineWidth = 2
        ctx.shadowBlur = 10
        ctx.shadowColor = '#CCFF00'

        ctx.beginPath()
        ctx.moveTo(0, cy)
        // Draw static noise line
        for (let x = 0; x < canvas.width; x += 5) {
          ctx.lineTo(x, cy + (Math.random() - 0.5) * 50)
        }
        ctx.stroke()

        // Glitch Text
        ctx.font = 'bold 40px monospace'
        ctx.fillStyle = '#CCFF00'
        ctx.fillText('NO SIGNAL', canvas.width / 2 - 100, cy - 50)

        animationRef.current = requestAnimationFrame(render)
        return
      }

      if (!analyserRef.current) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        // Draw idle pulsing line
        ctx.fillStyle = '#111'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.strokeStyle = '#333'
        ctx.beginPath()
        ctx.moveTo(0, canvas.height / 2)
        ctx.lineTo(canvas.width, canvas.height / 2)
        ctx.stroke()

        animationRef.current = requestAnimationFrame(render)
        return
      }

      const analyser = analyserRef.current
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      analyser.getByteFrequencyData(dataArray)

      // Clear with trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2

      // Neon Green Palette
      const primaryColor = '#CCFF00'

      if (mode === 'bars') {
        const barWidth = (w / bufferLength) * 2.5
        let barHeight
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const val = dataArray[i]
          barHeight = (val / 255) * h

          // Dynamic coloring based on intensity
          const intensity = val / 255
          // Green to White gradient
          const r = 204 + (255 - 204) * intensity
          const g = 255
          const b = 0 + (255 - 0) * intensity

          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
          ctx.shadowBlur = intensity * 20
          ctx.shadowColor = primaryColor

          ctx.fillRect(x, h - barHeight, barWidth, barHeight)
          x += barWidth + 1
        }
      } else if (mode === 'circular') {
        const radius = Math.min(w, h) / 4
        ctx.beginPath()

        for (let i = 0; i < bufferLength; i++) {
          const amp = dataArray[i] / 255
          const angle = (i / bufferLength) * Math.PI * 2
          const r = radius + amp * (radius * 1.5)

          const x = cx + Math.cos(angle) * r
          const y = cy + Math.sin(angle) * r

          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.strokeStyle = primaryColor
        ctx.lineWidth = 4
        ctx.shadowBlur = 15
        ctx.shadowColor = primaryColor
        ctx.stroke()

        // Inner Bass Pulse
        const bass =
          dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255
        ctx.beginPath()
        ctx.arc(cx, cy, radius * (0.5 + bass * 0.5), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(204, 255, 0, ${bass})`
        ctx.fill()
      } else if (mode === 'particles') {
        const bass = dataArray.slice(0, 10).reduce((a, b) => a + b) / 10 / 255

        // Center Burst
        const particlesCount = 30 + Math.floor(bass * 50)

        for (let i = 0; i < particlesCount; i++) {
          const angle = Math.random() * Math.PI * 2
          // Explosive radius based on bass
          const dist = Math.random() * Math.min(w, h) * 0.6 * (bass + 0.2)
          const px = cx + Math.cos(angle) * dist
          const py = cy + Math.sin(angle) * dist

          const size = Math.random() * 5 * bass + 1

          ctx.beginPath()
          ctx.arc(px, py, size, 0, Math.PI * 2)
          ctx.fillStyle = primaryColor
          ctx.shadowBlur = 10
          ctx.shadowColor = primaryColor
          ctx.fill()
        }

        // Connecting lines for structure
        if (bass > 0.6) {
          ctx.beginPath()
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
          ctx.moveTo(cx, cy)
          ctx.lineTo(
            cx + (Math.random() - 0.5) * w,
            cy + (Math.random() - 0.5) * h,
          )
          ctx.stroke()
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
