import { useState, useEffect, useRef, useCallback } from 'react'
import { musicLibrary } from '@/lib/mock-data'
import { toast } from '@/hooks/use-toast'

export interface Track {
  id: string
  title: string
  composer: string
  url?: string
  cover?: string
  duration: string
  degree: string
  ritual?: string
  occasion?: string
}

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [queue, setQueue] = useState<Track[]>(musicLibrary)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [fadeDuration, setFadeDuration] = useState(3)
  const [isLoading, setIsLoading] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const playPromiseRef = useRef<Promise<void> | null>(null)

  const currentTrack = queue[currentIndex]

  // Initialize Audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'metadata'
    }
    const audio = audioRef.current

    const updateTime = () => {
      if (!Number.isNaN(audio.currentTime)) {
        setCurrentTime(audio.currentTime)
      }
    }

    const updateDuration = () => {
      if (!Number.isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration)
      }
    }

    const handleEnded = () => {
      // Don't setPlaying false here, wait for next track load logic or stop
      playNext()
    }

    const handleWaiting = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleError = (e: Event) => {
      console.error('Audio Playback Error:', e)
      setIsLoading(false)
      setIsPlaying(false)
      toast({
        title: 'Erro na reprodução',
        description: 'Não foi possível reproduzir este áudio.',
        variant: 'destructive',
      })
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('durationchange', updateDuration)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('durationchange', updateDuration)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
    }
  }, []) // Empty dependency array means this runs once on mount

  // Sync Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume))
    }
  }, [volume])

  const safePlay = useCallback(async () => {
    if (!audioRef.current) return

    try {
      playPromiseRef.current = audioRef.current.play()
      await playPromiseRef.current
      setIsPlaying(true)
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Expected during rapid switching
      } else {
        console.error('Playback failed:', error)
        setIsPlaying(false)
      }
    } finally {
      playPromiseRef.current = null
    }
  }, [])

  const safePause = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    setIsPlaying(false)
  }, [])

  const performFade = useCallback(
    (targetVolume: number, onComplete?: () => void) => {
      if (!audioRef.current) return

      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)

      const audio = audioRef.current
      const startVolume = audio.volume
      const diff = targetVolume - startVolume

      if (Math.abs(diff) < 0.01) {
        audio.volume = targetVolume
        onComplete?.()
        return
      }

      const steps = 20
      const durationMs = fadeDuration * 1000
      const stepTime = durationMs / steps
      const volStep = diff / steps

      let currentStep = 0

      fadeIntervalRef.current = setInterval(() => {
        currentStep++
        const newVol = startVolume + volStep * currentStep

        // Clamp volume
        if (newVol < 0) audio.volume = 0
        else if (newVol > 1) audio.volume = 1
        else audio.volume = newVol

        if (currentStep >= steps) {
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
          audio.volume = targetVolume
          onComplete?.()
        }
      }, stepTime)
    },
    [fadeDuration],
  )

  const loadAndPlay = useCallback(
    (track: Track) => {
      if (!audioRef.current || !track.url) return

      const startNewTrack = () => {
        if (!audioRef.current) return
        audioRef.current.src = track.url!
        audioRef.current.load()
        audioRef.current.volume = 0
        safePlay().then(() => {
          performFade(volume)
        })
      }

      if (isPlaying) {
        performFade(0, startNewTrack)
      } else {
        startNewTrack()
      }
    },
    [isPlaying, performFade, volume, safePlay],
  )

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      performFade(0, () => {
        safePause()
      })
    } else {
      audioRef.current.volume = 0
      safePlay().then(() => {
        performFade(volume)
      })
    }
  }, [isPlaying, performFade, volume, safePlay, safePause])

  const playNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev < queue.length - 1) {
        const next = prev + 1
        loadAndPlay(queue[next])
        return next
      }
      setIsPlaying(false)
      return prev
    })
  }, [queue, loadAndPlay])

  const playPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev > 0) {
        const next = prev - 1
        loadAndPlay(queue[next])
        return next
      }
      return prev
    })
  }, [queue, loadAndPlay])

  const seek = useCallback((time: number) => {
    if (audioRef.current && Number.isFinite(time)) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const reorderQueue = useCallback(
    (from: number, to: number) => {
      setQueue((prev) => {
        const newQueue = [...prev]
        const [moved] = newQueue.splice(from, 1)
        newQueue.splice(to, 0, moved)

        if (currentIndex === from) {
          setCurrentIndex(to)
        } else if (from < currentIndex && to >= currentIndex) {
          setCurrentIndex(currentIndex - 1)
        } else if (from > currentIndex && to <= currentIndex) {
          setCurrentIndex(currentIndex + 1)
        }

        return newQueue
      })
    },
    [currentIndex],
  )

  const skipToIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < queue.length) {
        setCurrentIndex(index)
        loadAndPlay(queue[index])
      }
    },
    [queue, loadAndPlay],
  )

  return {
    isPlaying,
    currentTrack,
    queue,
    currentIndex,
    currentTime,
    duration,
    volume,
    fadeDuration,
    isLoading,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setVolume,
    setFadeDuration,
    reorderQueue,
    skipToIndex,
  }
}
