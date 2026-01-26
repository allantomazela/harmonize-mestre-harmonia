import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react'
import { musicLibrary } from '@/lib/mock-data'
import { toast } from '@/hooks/use-toast'
import { getAllTracks, LocalTrack } from '@/lib/storage'

export interface Track {
  id: string
  title: string
  composer: string
  url?: string
  file?: Blob
  cover?: string
  duration: string
  degree: string
  ritual?: string
  occasion?: string
  isLocal?: boolean
}

type FadeCurve = 'linear' | 'exponential' | 'smooth'

interface AudioPlayerContextType {
  isPlaying: boolean
  currentTrack: Track | undefined
  queue: Track[]
  currentIndex: number
  currentTime: number
  duration: number
  volume: number
  fadeInDuration: number
  fadeOutDuration: number
  fadeCurve: FadeCurve
  isLoading: boolean
  togglePlay: () => void
  playNext: () => void
  playPrev: () => void
  seek: (time: number) => void
  setVolume: (vol: number) => void
  setFadeInDuration: (sec: number) => void
  setFadeOutDuration: (sec: number) => void
  setFadeCurve: (curve: FadeCurve) => void
  reorderQueue: (from: number, to: number) => void
  skipToIndex: (index: number) => void
  addToQueue: (tracks: Track[]) => void
  refreshLibrary: () => Promise<void>
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
  undefined,
)

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [queue, setQueue] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [fadeInDuration, setFadeInDuration] = useState(1.5) // Optimized default
  const [fadeOutDuration, setFadeOutDuration] = useState(1.5)
  const [fadeCurve, setFadeCurve] = useState<FadeCurve>('exponential') // Better default
  const [isLoading, setIsLoading] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const playPromiseRef = useRef<Promise<void> | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  // Initialize Library
  const refreshLibrary = useCallback(async () => {
    try {
      const localTracks = await getAllTracks()
      const formattedLocalTracks: Track[] = localTracks.map((lt) => ({
        id: lt.id,
        title: lt.title,
        composer: lt.composer,
        file: lt.file,
        duration: lt.duration,
        degree: lt.degree || 'Geral',
        ritual: lt.ritual || 'Geral',
        isLocal: true,
      }))
      // Merge mock data (as "system" tracks) and local data
      setQueue([...musicLibrary, ...formattedLocalTracks])
    } catch (error) {
      console.error('Failed to load local tracks', error)
      setQueue(musicLibrary)
    }
  }, [])

  useEffect(() => {
    refreshLibrary()
  }, [refreshLibrary])

  const currentTrack = queue[currentIndex]

  // Initialize Audio Element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'auto' // Better for local files
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
      playNext()
    }

    const handleWaiting = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleError = (e: Event) => {
      console.error('Audio Playback Error:', e)
      setIsLoading(false)
      // Only toast on real errors, not aborts
      if (audio.error && audio.error.code !== 20) {
        toast({
          title: 'Erro na reprodução',
          description: 'Não foi possível reproduzir o áudio.',
          variant: 'destructive',
        })
      }
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('durationchange', updateDuration)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('durationchange', updateDuration)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, []) // playNext dependency removed to avoid circular dep, handled in function

  // Sync Volume
  useEffect(() => {
    if (audioRef.current && !fadeIntervalRef.current) {
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
      if (error.name !== 'AbortError') {
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

  const calculateCurve = useCallback((t: number, curve: FadeCurve) => {
    switch (curve) {
      case 'exponential':
        return t * t
      case 'smooth':
        return t * t * (3 - 2 * t)
      case 'linear':
      default:
        return t
    }
  }, [])

  const performFade = useCallback(
    (
      targetVolume: number,
      duration: number,
      curve: FadeCurve,
      onComplete?: () => void,
    ) => {
      if (!audioRef.current) {
        onComplete?.()
        return
      }

      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)

      const audio = audioRef.current
      const startVolume = audio.volume
      const diff = targetVolume - startVolume

      if (Math.abs(diff) < 0.01 || duration <= 0) {
        audio.volume = targetVolume
        onComplete?.()
        return
      }

      const steps = 60 // Higher FPS for smoothness
      const durationMs = duration * 1000
      const stepTime = durationMs / steps

      let currentStep = 0

      fadeIntervalRef.current = setInterval(() => {
        currentStep++
        const progress = currentStep / steps
        const curvedProgress = calculateCurve(progress, curve)
        const newVol = startVolume + diff * curvedProgress

        if (newVol < 0) audio.volume = 0
        else if (newVol > 1) audio.volume = 1
        else audio.volume = newVol

        if (currentStep >= steps) {
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
          fadeIntervalRef.current = null
          audio.volume = targetVolume
          onComplete?.()
        }
      }, stepTime)
    },
    [calculateCurve],
  )

  const loadAndPlay = useCallback(
    (track: Track) => {
      if (!audioRef.current) return

      // Revoke previous blob URL if exists
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }

      const startNewTrack = () => {
        if (!audioRef.current) return

        let src = track.url
        if (track.file) {
          src = URL.createObjectURL(track.file)
          objectUrlRef.current = src
        }

        if (!src) {
          toast({
            title: 'Arquivo não encontrado',
            description: 'O arquivo de áudio não está acessível.',
            variant: 'destructive',
          })
          return
        }

        audioRef.current.src = src
        audioRef.current.load()
        audioRef.current.volume = 0
        safePlay().then(() => {
          performFade(volume, fadeInDuration, fadeCurve)
        })
      }

      if (isPlaying) {
        performFade(0, fadeOutDuration, fadeCurve, startNewTrack)
      } else {
        startNewTrack()
      }
    },
    [
      isPlaying,
      performFade,
      volume,
      fadeInDuration,
      fadeOutDuration,
      fadeCurve,
      safePlay,
    ],
  )

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      performFade(0, fadeOutDuration, fadeCurve, () => {
        safePause()
      })
    } else {
      if (!audioRef.current.src && currentTrack) {
        loadAndPlay(currentTrack)
      } else {
        audioRef.current.volume = 0
        safePlay().then(() => {
          performFade(volume, fadeInDuration, fadeCurve)
        })
      }
    }
  }, [
    isPlaying,
    currentTrack,
    loadAndPlay,
    performFade,
    volume,
    fadeInDuration,
    fadeOutDuration,
    fadeCurve,
    safePlay,
    safePause,
  ])

  const playNext = useCallback(() => {
    setQueue((currentQueue) => {
      // Use callback to get latest queue
      setCurrentIndex((prevIndex) => {
        if (prevIndex < currentQueue.length - 1) {
          const next = prevIndex + 1
          loadAndPlay(currentQueue[next])
          return next
        }
        setIsPlaying(false)
        return prevIndex
      })
      return currentQueue
    })
  }, [loadAndPlay])

  const playPrev = useCallback(() => {
    setQueue((currentQueue) => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex > 0) {
          const next = prevIndex - 1
          loadAndPlay(currentQueue[next])
          return next
        }
        return prevIndex
      })
      return currentQueue
    })
  }, [loadAndPlay])

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

  const addToQueue = useCallback((tracks: Track[]) => {
    setQueue((prev) => [...prev, ...tracks])
    toast({
      title: 'Adicionado à Fila',
      description: `${tracks.length} faixas adicionadas.`,
    })
  }, [])

  return (
    <AudioPlayerContext.Provider
      value={{
        isPlaying,
        currentTrack,
        queue,
        currentIndex,
        currentTime,
        duration,
        volume,
        fadeInDuration,
        fadeOutDuration,
        fadeCurve,
        isLoading,
        togglePlay,
        playNext,
        playPrev,
        seek,
        setVolume,
        setFadeInDuration,
        setFadeOutDuration,
        setFadeCurve,
        reorderQueue,
        skipToIndex,
        addToQueue,
        refreshLibrary,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext)
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider')
  }
  return context
}
