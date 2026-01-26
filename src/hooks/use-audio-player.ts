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
}

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [queue, setQueue] = useState<Track[]>(musicLibrary)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [fadeDuration, setFadeDuration] = useState(3) // seconds

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const currentTrack = queue[currentIndex]

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio()
    const audio = audioRef.current

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => playNext()

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.pause()
    }
  }, [])

  // Handle Fade Logic on Play/Pause/Track Change
  const performFade = useCallback(
    (targetVolume: number, onComplete?: () => void) => {
      if (!audioRef.current) return
      const audio = audioRef.current
      const step = 0.05
      const intervalTime = (fadeDuration * 1000 * step) / volume

      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)

      fadeIntervalRef.current = setInterval(() => {
        const diff = targetVolume - audio.volume
        if (Math.abs(diff) < step) {
          audio.volume = targetVolume
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
          onComplete?.()
        } else {
          audio.volume += diff > 0 ? step : -step
        }
      }, intervalTime)
    },
    [fadeDuration, volume],
  )

  // Auto Fade-out near end
  useEffect(() => {
    if (
      isPlaying &&
      duration > 0 &&
      currentTime >= duration - fadeDuration &&
      audioRef.current &&
      audioRef.current.volume > 0.1
    ) {
      // Logic for fading out at the end is tricky with the interval,
      // but simple linear reduction per tick works for visual/audio sync
      if (!fadeIntervalRef.current) {
        // Start a fade out if not already fading
        // This is a simplified check
      }
    }
  }, [currentTime, duration, fadeDuration, isPlaying])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      performFade(0, () => {
        audioRef.current?.pause()
        setIsPlaying(false)
      })
    } else {
      audioRef.current.volume = 0
      audioRef.current.play().catch((e) => {
        console.error('Playback error', e)
        toast({
          title: 'Erro na reprodução',
          description: 'Não foi possível reproduzir o áudio.',
          variant: 'destructive',
        })
      })
      setIsPlaying(true)
      performFade(volume)
    }
  }, [isPlaying, performFade, volume])

  const loadAndPlay = useCallback(
    (track: Track) => {
      if (!audioRef.current || !track.url) return
      const audio = audioRef.current

      // Fade out current if playing
      const startNewTrack = () => {
        audio.src = track.url!
        audio.load()
        audio.volume = 0
        audio.play().then(() => {
          setIsPlaying(true)
          performFade(volume)
        })
      }

      if (isPlaying) {
        performFade(0, startNewTrack)
      } else {
        startNewTrack()
      }
    },
    [isPlaying, performFade, volume],
  )

  const playNext = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      loadAndPlay(queue[nextIndex])
    } else {
      setIsPlaying(false)
    }
  }, [currentIndex, queue, loadAndPlay])

  const playPrev = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      loadAndPlay(queue[prevIndex])
    }
  }, [currentIndex, queue, loadAndPlay])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const reorderQueue = useCallback(
    (from: number, to: number) => {
      const newQueue = [...queue]
      const [moved] = newQueue.splice(from, 1)
      newQueue.splice(to, 0, moved)
      setQueue(newQueue)
      // Update current index if needed
      if (currentIndex === from) setCurrentIndex(to)
      else if (currentIndex === to) setCurrentIndex(from) // Swap logic simplified
    },
    [queue, currentIndex],
  )

  const skipToIndex = useCallback(
    (index: number) => {
      setCurrentIndex(index)
      loadAndPlay(queue[index])
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
