import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react'
import { musicLibrary, playlists as mockPlaylists } from '@/lib/mock-data'
import { toast } from '@/hooks/use-toast'
import {
  getAllTracks,
  getFolders,
  saveFolder,
  deleteFolder,
  saveTrack,
  savePlaylist,
  getPlaylists,
  deletePlaylist as deletePlaylistStorage,
  LocalTrack,
  Folder,
  Playlist,
} from '@/lib/storage'
import { ritualTemplates, matchTracksToTemplate } from '@/lib/ritual-templates'

export interface Track {
  id: string
  title: string
  composer: string
  album?: string
  url?: string
  file?: Blob
  cover?: string
  duration: string
  degree: string
  ritual?: string
  occasion?: string
  isLocal?: boolean
  folderId?: string
  genre?: string
  bpm?: string
  year?: string
  tone?: string
}

export type AcousticEnvironment = 'none' | 'temple' | 'cathedral' | 'small-room'
export type FadeCurve = 'linear' | 'exponential' | 'smooth'

interface AudioPlayerContextType {
  isPlaying: boolean
  currentTrack: Track | undefined
  queue: Track[]
  library: Track[]
  folders: Folder[]
  playlists: Playlist[]
  currentIndex: number
  currentTime: number
  duration: number
  volume: number
  trackVolumes: Record<string, number> // Per-track volume balance (0.0 to 1.0)
  acousticEnvironment: AcousticEnvironment
  fadeInDuration: number
  fadeOutDuration: number
  fadeCurve: FadeCurve
  isLoading: boolean
  isAutoPlay: boolean
  togglePlay: () => void
  playNext: () => void
  playPrev: () => void
  seek: (time: number) => void
  setVolume: (vol: number) => void
  setTrackVolume: (trackId: string, vol: number) => void
  setAcousticEnvironment: (env: AcousticEnvironment) => void
  setFadeInDuration: (sec: number) => void
  setFadeOutDuration: (sec: number) => void
  setFadeCurve: (curve: FadeCurve) => void
  toggleAutoPlay: () => void
  reorderQueue: (from: number, to: number) => void
  removeFromQueue: (index: number) => void
  skipToIndex: (index: number) => void
  addToQueue: (tracks: Track[]) => void
  replaceQueue: (tracks: Track[]) => void
  refreshLibrary: () => Promise<void>
  createFolder: (name: string) => Promise<void>
  removeFolder: (id: string) => Promise<void>
  updateTrack: (track: Track) => Promise<void>
  triggerFadeOut: () => void
  createPlaylist: (playlist: Playlist) => Promise<void>
  removePlaylist: (id: string) => Promise<void>
  updatePlaylist: (playlist: Playlist) => Promise<void>
  getPlaylistTracks: (playlist: Playlist) => Track[]
  generateRitualSession: (templateId: string) => void
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
  undefined,
)

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [queue, setQueue] = useState<Track[]>([])
  const [library, setLibrary] = useState<Track[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [trackVolumes, setTrackVolumes] = useState<Record<string, number>>({})
  const [acousticEnvironment, setAcousticEnvironment] =
    useState<AcousticEnvironment>('none')
  const [fadeInDuration, setFadeInDuration] = useState(1.5)
  const [fadeOutDuration, setFadeOutDuration] = useState(3.0)
  const [fadeCurve, setFadeCurve] = useState<FadeCurve>('exponential')
  const [isLoading, setIsLoading] = useState(false)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const playPromiseRef = useRef<Promise<void> | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  // Web Audio API Refs (for advanced effects if possible)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const convolverNodeRef = useRef<ConvolverNode | null>(null) // Reverb

  const refreshLibrary = useCallback(async () => {
    try {
      const [localTracks, loadedFolders, loadedPlaylists] = await Promise.all([
        getAllTracks(),
        getFolders(),
        getPlaylists(),
      ])

      const formattedLocalTracks: Track[] = localTracks.map((lt) => ({
        id: lt.id,
        title: lt.title,
        composer: lt.composer,
        album: lt.album,
        file: lt.file,
        duration: lt.duration,
        degree: lt.degree || 'Geral',
        ritual: lt.ritual || 'Geral',
        occasion: lt.occasion,
        tone: lt.tone,
        isLocal: true,
        folderId: lt.folderId,
        genre: lt.genre,
        bpm: lt.bpm,
        year: lt.year,
      }))

      const allTracks = [...musicLibrary, ...formattedLocalTracks]
      setLibrary(allTracks)
      setFolders(loadedFolders)

      if (loadedPlaylists.length === 0 && mockPlaylists.length > 0) {
        const adaptedMocks: Playlist[] = mockPlaylists.map((mp) => ({
          id: mp.id,
          title: mp.title,
          isSmart: false,
          createdAt: Date.now(),
          cover: mp.cover,
          items: mp.items.map((tid) => ({ trackId: tid })),
        }))
        setPlaylists(adaptedMocks)
      } else {
        setPlaylists(loadedPlaylists)
      }

      setQueue((prev) => (prev.length === 0 ? allTracks : prev))
    } catch (error) {
      console.error('Failed to load library', error)
      setLibrary(musicLibrary)
      setQueue((prev) => (prev.length === 0 ? musicLibrary : prev))
    }
  }, [])

  useEffect(() => {
    refreshLibrary()
  }, [refreshLibrary])

  // --- Acoustic Environment Implementation (Mock/Simple DSP) ---
  // In a real browser environment, applying ConvolverNode requires CORS enabled audio sources.
  // We will attempt to set it up, but fallback to just state if it fails.
  useEffect(() => {
    // Only init AudioContext if user interaction happened ideally, but here we try lazy load
    if (!audioContextRef.current && audioRef.current && isPlaying) {
      try {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext
        const ctx = new AudioContextClass()
        audioContextRef.current = ctx

        // Create nodes
        const source = ctx.createMediaElementSource(audioRef.current)
        const gain = ctx.createGain()
        const convolver = ctx.createConvolver()

        // Simple impulse response generation for reverb
        const rate = ctx.sampleRate
        const length = rate * 2 // 2 seconds
        const decay = 2.0
        const impulse = ctx.createBuffer(2, length, rate)
        const impulseL = impulse.getChannelData(0)
        const impulseR = impulse.getChannelData(1)
        for (let i = 0; i < length; i++) {
          const n = length - i
          impulseL[i] =
            (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
          impulseR[i] =
            (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
        }
        convolver.buffer = impulse

        // Connect graph
        // Source -> Gain -> Destination (Dry)
        // Source -> Convolver -> Gain -> Destination (Wet) - simplified for now:
        // Source -> Convolver (optional) -> Gain -> Destination

        sourceNodeRef.current = source
        gainNodeRef.current = gain
        convolverNodeRef.current = convolver

        // Default direct connection
        source.connect(gain)
        gain.connect(ctx.destination)
      } catch (e) {
        console.warn('Web Audio API setup failed (likely CORS):', e)
      }
    }
  }, [isPlaying])

  useEffect(() => {
    // Apply acoustic environment effect
    if (
      !audioContextRef.current ||
      !sourceNodeRef.current ||
      !gainNodeRef.current ||
      !convolverNodeRef.current
    )
      return

    try {
      const source = sourceNodeRef.current
      const gain = gainNodeRef.current
      const convolver = convolverNodeRef.current
      const ctx = audioContextRef.current

      // Disconnect everything to reset
      source.disconnect()
      convolver.disconnect()
      gain.disconnect()

      if (acousticEnvironment === 'none') {
        source.connect(gain)
      } else {
        // Simple wet mix simulation
        source.connect(convolver)
        convolver.connect(gain)
        // Also connect dry
        source.connect(gain)
      }
      gain.connect(ctx.destination)
    } catch (e) {
      console.warn('Failed to update acoustic environment', e)
    }
  }, [acousticEnvironment])

  // --- End Acoustic Environment ---

  const currentTrack = queue[currentIndex]

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

  const getEffectiveVolume = useCallback(() => {
    if (!currentTrack) return volume
    const trackVol = trackVolumes[currentTrack.id] ?? 1.0
    return Math.max(0, Math.min(1, volume * trackVol))
  }, [volume, trackVolumes, currentTrack])

  const performFade = useCallback(
    (
      targetBaseVolume: number,
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

      // Calculate effective target based on track balance
      // targetBaseVolume is usually global 'volume' or 0
      const effectiveTarget = targetBaseVolume === 0 ? 0 : getEffectiveVolume()

      const diff = effectiveTarget - startVolume

      if (Math.abs(diff) < 0.01 || duration <= 0) {
        audio.volume = effectiveTarget
        onComplete?.()
        return
      }

      const steps = 60
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
          audio.volume = effectiveTarget
          onComplete?.()
        }
      }, stepTime)
    },
    [calculateCurve, getEffectiveVolume],
  )

  const safePlay = useCallback(async () => {
    if (!audioRef.current) return

    try {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume()
      }
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

  const loadAndPlay = useCallback(
    (track: Track) => {
      if (!audioRef.current) return

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

  const playNext = useCallback(() => {
    setQueue((currentQueue) => {
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

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlay((prev) => !prev)
    toast({
      title: !isAutoPlay ? 'Auto-Cue Ativado' : 'Modo Manual',
      description: !isAutoPlay
        ? 'A próxima música tocará automaticamente.'
        : 'O player parará após a música atual.',
    })
  }, [isAutoPlay])

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.crossOrigin = 'anonymous' // Attempt to fix CORS for WebAudio
      audioRef.current.preload = 'auto'
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
      if (isAutoPlay) {
        playNext()
      } else {
        setIsPlaying(false)
      }
    }

    const handleWaiting = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleError = (e: Event) => {
      console.error('Audio Playback Error:', e)
      setIsLoading(false)
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
  }, [isAutoPlay, playNext])

  // Volume Updates
  useEffect(() => {
    if (audioRef.current && !fadeIntervalRef.current) {
      const effective = getEffectiveVolume()
      audioRef.current.volume = effective
    }
  }, [volume, trackVolumes, currentTrack, getEffectiveVolume])

  const setTrackVolume = useCallback((trackId: string, vol: number) => {
    setTrackVolumes((prev) => ({
      ...prev,
      [trackId]: Math.max(0, Math.min(1, vol)),
    }))
  }, [])

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

  const triggerFadeOut = useCallback(() => {
    if (isPlaying && audioRef.current) {
      performFade(0, fadeOutDuration, fadeCurve, () => {
        safePause()
        toast({
          title: 'Fade Out Concluído',
          description: 'A reprodução foi encerrada suavemente.',
        })
      })
    }
  }, [isPlaying, fadeOutDuration, fadeCurve, performFade, safePause])

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

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => {
      const newQueue = [...prev]
      newQueue.splice(index, 1)
      return newQueue
    })
    setCurrentIndex((prev) => {
      if (index < prev) return prev - 1
      return prev
    })
  }, [])

  const skipToIndex = useCallback(
    (index: number) => {
      setQueue((currentQueue) => {
        if (index >= 0 && index < currentQueue.length) {
          setCurrentIndex(index)
          loadAndPlay(currentQueue[index])
        }
        return currentQueue
      })
    },
    [loadAndPlay],
  )

  const addToQueue = useCallback((tracks: Track[]) => {
    setQueue((prev) => [...prev, ...tracks])
    toast({
      title: 'Adicionado à Fila',
      description: `${tracks.length} faixas adicionadas à lista de reprodução.`,
    })
  }, [])

  const replaceQueue = useCallback((tracks: Track[]) => {
    setQueue(tracks)
    setCurrentIndex(0)
  }, [])

  // CRUD for Folders/Playlists/Tracks same as before...
  const createFolder = async (name: string) => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
    }
    await saveFolder(newFolder)
    await refreshLibrary()
  }

  const removeFolder = async (id: string) => {
    await deleteFolder(id)
    const tracksToUpdate = library.filter((t) => t.folderId === id && t.isLocal)
    for (const t of tracksToUpdate) {
      await updateTrack({ ...t, folderId: undefined })
    }
    await refreshLibrary()
  }

  const createPlaylist = async (playlist: Playlist) => {
    await savePlaylist(playlist)
    await refreshLibrary()
  }

  const removePlaylist = async (id: string) => {
    await deletePlaylistStorage(id)
    await refreshLibrary()
  }

  const updatePlaylist = async (playlist: Playlist) => {
    await savePlaylist(playlist)
    await refreshLibrary()
  }

  const updateTrack = async (updatedTrack: Track) => {
    if (!updatedTrack.isLocal || !updatedTrack.file) return
    const localTrack: LocalTrack = {
      id: updatedTrack.id,
      title: updatedTrack.title,
      composer: updatedTrack.composer,
      album: updatedTrack.album,
      duration: updatedTrack.duration,
      file: updatedTrack.file,
      addedAt: Date.now(),
      degree: updatedTrack.degree,
      ritual: updatedTrack.ritual,
      folderId: updatedTrack.folderId,
      genre: updatedTrack.genre,
      bpm: updatedTrack.bpm,
      year: updatedTrack.year,
      occasion: updatedTrack.occasion,
      tone: updatedTrack.tone,
    }
    await saveTrack(localTrack)
    await refreshLibrary()
  }

  const getPlaylistTracks = useCallback(
    (playlist: Playlist): Track[] => {
      if (!playlist) return []
      if (playlist.isSmart && playlist.rules) {
        return library.filter((track) => {
          return playlist.rules!.every((rule) => {
            const trackValue = String(
              (track as any)[rule.field] || '',
            ).toLowerCase()
            const ruleValue = rule.value.toLowerCase()
            if (rule.operator === 'equals') return trackValue === ruleValue
            else if (rule.operator === 'contains')
              return trackValue.includes(ruleValue)
            return false
          })
        })
      } else if (playlist.items) {
        return playlist.items
          .map((item) => library.find((t) => t.id === item.trackId))
          .filter((t): t is Track => !!t)
      }
      return []
    },
    [library],
  )

  const generateRitualSession = useCallback(
    (templateId: string) => {
      const template = ritualTemplates.find((t) => t.id === templateId)
      if (!template) {
        toast({
          title: 'Erro',
          description: 'Template não encontrado.',
          variant: 'destructive',
        })
        return
      }

      const generatedTracks = matchTracksToTemplate(template, library)
      if (generatedTracks.length === 0) {
        toast({
          title: 'Aviso',
          description: 'Nenhuma música compatível encontrada.',
          variant: 'destructive',
        })
        return
      }

      replaceQueue(generatedTracks)
      toast({
        title: 'Sessão Gerada',
        description: `Playlist criada para ${template.title} com ${generatedTracks.length} faixas.`,
      })
    },
    [library, replaceQueue],
  )

  return (
    <AudioPlayerContext.Provider
      value={{
        isPlaying,
        currentTrack,
        queue,
        library,
        folders,
        playlists,
        currentIndex,
        currentTime,
        duration,
        volume,
        trackVolumes,
        acousticEnvironment,
        fadeInDuration,
        fadeOutDuration,
        fadeCurve,
        isLoading,
        isAutoPlay,
        togglePlay,
        playNext,
        playPrev,
        seek,
        setVolume,
        setTrackVolume,
        setAcousticEnvironment,
        setFadeInDuration,
        setFadeOutDuration,
        setFadeCurve,
        toggleAutoPlay,
        reorderQueue,
        removeFromQueue,
        skipToIndex,
        addToQueue,
        replaceQueue,
        refreshLibrary,
        createFolder,
        removeFolder,
        createPlaylist,
        removePlaylist,
        updatePlaylist,
        getPlaylistTracks,
        updateTrack,
        triggerFadeOut,
        generateRitualSession,
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
