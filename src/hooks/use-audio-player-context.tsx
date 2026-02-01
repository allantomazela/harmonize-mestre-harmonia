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
import { fetchDriveFileBlob } from '@/lib/google-drive'

export interface Track {
  id: string
  title: string
  composer: string
  album?: string
  url?: string
  file?: Blob
  gdriveId?: string
  dropboxId?: string
  onedriveId?: string
  cloudProvider?: 'google' | 'dropbox' | 'onedrive'
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
  updatedAt?: number
  offlineAvailable?: boolean
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
  trackVolumes: Record<string, number>
  acousticEnvironment: AcousticEnvironment
  fadeInDuration: number
  fadeOutDuration: number
  fadeCurve: FadeCurve
  isLoading: boolean
  isSyncing: boolean
  isAutoPlay: boolean
  isOfflineMode: boolean
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
  setIsSyncing: (syncing: boolean) => void
  downloadTrackForOffline: (track: Track) => Promise<void>
  removeTrackFromOffline: (track: Track) => Promise<void>
  toggleOfflineMode: () => void
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
  undefined,
)

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext)
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider')
  }
  return context
}

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
  const [isSyncing, setIsSyncing] = useState(false)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const playPromiseRef = useRef<Promise<void> | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const convolverNodeRef = useRef<ConvolverNode | null>(null)

  // Network Status Listener
  useEffect(() => {
    const handleOnline = () => setIsOfflineMode(false)
    const handleOffline = () => setIsOfflineMode(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

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
        gdriveId: lt.gdriveId,
        dropboxId: lt.dropboxId,
        onedriveId: lt.onedriveId,
        cloudProvider: lt.cloudProvider,
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
        updatedAt: lt.updatedAt,
        offlineAvailable: lt.offlineAvailable || !!lt.file,
      }))

      let allTracks = [...musicLibrary, ...formattedLocalTracks]

      // Filter for offline mode
      if (isOfflineMode) {
        allTracks = allTracks.filter((t) => t.offlineAvailable)
      }

      setLibrary(allTracks)
      setFolders(loadedFolders)
      setPlaylists(loadedPlaylists)

      setQueue((prev) => (prev.length === 0 ? allTracks : prev))
    } catch (error) {
      console.error('Failed to load library', error)
      setLibrary(musicLibrary)
      setQueue((prev) => (prev.length === 0 ? musicLibrary : prev))
    }
  }, [isOfflineMode])

  useEffect(() => {
    refreshLibrary()
  }, [refreshLibrary])

  // Audio Context Setup (unchanged logic)
  useEffect(() => {
    if (!audioContextRef.current && audioRef.current && isPlaying) {
      try {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext
        const ctx = new AudioContextClass()
        audioContextRef.current = ctx
        const source = ctx.createMediaElementSource(audioRef.current)
        const gain = ctx.createGain()
        const convolver = ctx.createConvolver()

        // Simple Impulse Response for Reverb
        const rate = ctx.sampleRate
        const length = rate * 2
        const decay = 2.0
        const impulse = ctx.createBuffer(2, length, rate)
        const impulseL = impulse.getChannelData(0)
        const impulseR = impulse.getChannelData(1)
        for (let i = 0; i < length; i++) {
          impulseL[i] =
            (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
          impulseR[i] =
            (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
        }
        convolver.buffer = impulse

        sourceNodeRef.current = source
        gainNodeRef.current = gain
        convolverNodeRef.current = convolver
        source.connect(gain)
        gain.connect(ctx.destination)
      } catch (e) {
        console.warn('Web Audio API setup failed', e)
      }
    }
  }, [isPlaying])

  // Environment switching (unchanged logic)
  useEffect(() => {
    if (
      !audioContextRef.current ||
      !sourceNodeRef.current ||
      !gainNodeRef.current ||
      !convolverNodeRef.current
    )
      return
    try {
      sourceNodeRef.current.disconnect()
      convolverNodeRef.current.disconnect()
      gainNodeRef.current.disconnect()
      if (acousticEnvironment === 'none') {
        sourceNodeRef.current.connect(gainNodeRef.current)
      } else {
        sourceNodeRef.current.connect(convolverNodeRef.current)
        convolverNodeRef.current.connect(gainNodeRef.current)
        sourceNodeRef.current.connect(gainNodeRef.current)
      }
      gainNodeRef.current.connect(audioContextRef.current.destination)
    } catch (e) {
      console.warn('Failed to update acoustic environment', e)
    }
  }, [acousticEnvironment])

  // Fade Logic (unchanged)
  const currentTrack = queue[currentIndex]
  const calculateCurve = useCallback((t: number, curve: FadeCurve) => {
    if (curve === 'exponential') return t * t
    if (curve === 'smooth') return t * t * (3 - 2 * t)
    return t
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
        audio.volume = Math.max(0, Math.min(1, newVol))
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
      if (audioContextRef.current?.state === 'suspended')
        audioContextRef.current.resume()
      playPromiseRef.current = audioRef.current.play()
      await playPromiseRef.current
      setIsPlaying(true)
    } catch (error: any) {
      if (error.name !== 'AbortError') {
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

  // Load and Play Logic
  const loadAndPlay = useCallback(
    async (track: Track) => {
      if (!audioRef.current) return
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }

      const startNewTrack = async () => {
        if (!audioRef.current) return
        let src = track.url

        // Priority: Blob (Offline/Local) -> GDrive -> External URL
        if (track.file) {
          src = URL.createObjectURL(track.file)
          objectUrlRef.current = src
        } else if (track.gdriveId && track.cloudProvider === 'google') {
          // Only fetch from drive if online, or handle error
          if (isOfflineMode) {
            toast({
              title: 'Offline',
              description: 'Arquivo não baixado para uso offline.',
              variant: 'destructive',
            })
            return
          }
          try {
            setIsLoading(true)
            const blob = await fetchDriveFileBlob(track.gdriveId)
            src = URL.createObjectURL(blob)
            objectUrlRef.current = src
          } catch (e) {
            console.error(e)
            toast({
              title: 'Erro',
              description: 'Falha ao baixar do Google Drive.',
              variant: 'destructive',
            })
            setIsLoading(false)
            return
          } finally {
            setIsLoading(false)
          }
        }

        if (!src) {
          toast({
            title: 'Erro',
            description: 'Arquivo de áudio indisponível.',
            variant: 'destructive',
          })
          return
        }

        audioRef.current.src = src
        audioRef.current.load()
        audioRef.current.volume = 0
        safePlay().then(() => performFade(volume, fadeInDuration, fadeCurve))
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
      isOfflineMode,
    ],
  )

  // Setup Audio Event Listeners (unchanged)
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.crossOrigin = 'anonymous'
      audioRef.current.preload = 'auto'
    }
    const audio = audioRef.current
    const updateTime = () => {
      if (!Number.isNaN(audio.currentTime)) setCurrentTime(audio.currentTime)
    }
    const updateDuration = () => {
      if (!Number.isNaN(audio.duration) && audio.duration !== Infinity)
        setDuration(audio.duration)
    }
    const handleEnded = () => {
      if (isAutoPlay) playNext()
      else setIsPlaying(false)
    }
    const handleWaiting = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleError = (e: Event) => {
      console.error('Audio Error', e)
      setIsLoading(false)
      if (audio.error?.code !== 20)
        toast({
          title: 'Erro',
          description: 'Erro na reprodução.',
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
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('durationchange', updateDuration)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
    }
  }, [isAutoPlay])

  useEffect(() => {
    if (audioRef.current && !fadeIntervalRef.current)
      audioRef.current.volume = getEffectiveVolume()
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
      performFade(0, fadeOutDuration, fadeCurve, () => safePause())
    } else {
      if (!audioRef.current.src && currentTrack) loadAndPlay(currentTrack)
      else {
        audioRef.current.volume = 0
        safePlay().then(() => performFade(volume, fadeInDuration, fadeCurve))
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
    if (isPlaying && audioRef.current)
      performFade(0, fadeOutDuration, fadeCurve, () => safePause())
  }, [isPlaying, fadeOutDuration, fadeCurve, performFade, safePause])

  const playNext = useCallback(() => {
    setQueue((q) => {
      setCurrentIndex((prev) => {
        if (prev < q.length - 1) {
          const next = prev + 1
          loadAndPlay(q[next])
          return next
        }
        setIsPlaying(false)
        return prev
      })
      return q
    })
  }, [loadAndPlay])

  const playPrev = useCallback(() => {
    setQueue((q) => {
      setCurrentIndex((prev) => {
        if (prev > 0) {
          const next = prev - 1
          loadAndPlay(q[next])
          return next
        }
        return prev
      })
      return q
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
        if (currentIndex === from) setCurrentIndex(to)
        else if (from < currentIndex && to >= currentIndex)
          setCurrentIndex(currentIndex - 1)
        else if (from > currentIndex && to <= currentIndex)
          setCurrentIndex(currentIndex + 1)
        return newQueue
      })
    },
    [currentIndex],
  )

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => {
      const n = [...prev]
      n.splice(index, 1)
      return n
    })
    setCurrentIndex((prev) => (index < prev ? prev - 1 : prev))
  }, [])

  const skipToIndex = useCallback(
    (index: number) => {
      setQueue((q) => {
        if (index >= 0 && index < q.length) {
          setCurrentIndex(index)
          loadAndPlay(q[index])
        }
        return q
      })
    },
    [loadAndPlay],
  )

  const addToQueue = useCallback((tracks: Track[]) => {
    setQueue((prev) => [...prev, ...tracks])
    toast({
      title: 'Adicionado à Fila',
      description: `${tracks.length} faixas adicionadas.`,
    })
  }, [])

  const replaceQueue = useCallback((tracks: Track[]) => {
    setQueue(tracks)
    setCurrentIndex(0)
  }, [])

  // CRUD Operations
  const createFolder = async (name: string) => {
    await saveFolder({ id: crypto.randomUUID(), name, createdAt: Date.now() })
    await refreshLibrary()
  }
  const removeFolder = async (id: string) => {
    await deleteFolder(id)
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
    // Logic from reference, mostly saving to DB
    if (!updatedTrack.isLocal) return
    const local: LocalTrack = {
      id: updatedTrack.id,
      title: updatedTrack.title,
      composer: updatedTrack.composer,
      album: updatedTrack.album,
      duration: updatedTrack.duration,
      file: updatedTrack.file,
      gdriveId: updatedTrack.gdriveId,
      dropboxId: updatedTrack.dropboxId,
      onedriveId: updatedTrack.onedriveId,
      cloudProvider: updatedTrack.cloudProvider,
      addedAt: Date.now(),
      updatedAt: Date.now(),
      offlineAvailable: updatedTrack.offlineAvailable,
      ...updatedTrack,
    }
    await saveTrack(local)
    await refreshLibrary()
  }

  const getPlaylistTracks = useCallback(
    (playlist: Playlist): Track[] => {
      if (!playlist) return []
      if (playlist.isSmart && playlist.rules) {
        return library.filter((track) =>
          playlist.rules!.every((rule) => {
            const tv = String((track as any)[rule.field] || '').toLowerCase()
            const rv = rule.value.toLowerCase()
            return rule.operator === 'equals' ? tv === rv : tv.includes(rv)
          }),
        )
      } else if (playlist.items) {
        return playlist.items
          .map((i) => library.find((t) => t.id === i.trackId))
          .filter((t): t is Track => !!t)
      }
      return []
    },
    [library],
  )

  const generateRitualSession = useCallback(
    (templateId: string) => {
      const tmpl = ritualTemplates.find((t) => t.id === templateId)
      if (!tmpl) return
      const tracks = matchTracksToTemplate(tmpl, library)
      replaceQueue(tracks)
    },
    [library, replaceQueue],
  )

  // Offline Management
  const downloadTrackForOffline = async (track: Track) => {
    if (track.file) return // Already downloaded

    toast({
      title: 'Baixando...',
      description: `Tornando "${track.title}" disponível offline.`,
    })

    try {
      let blob: Blob

      if (track.gdriveId && track.cloudProvider === 'google') {
        blob = await fetchDriveFileBlob(track.gdriveId)
      } else if (track.url) {
        const res = await fetch(track.url)
        blob = await res.blob()
      } else {
        throw new Error('No source available for download')
      }

      await updateTrack({
        ...track,
        isLocal: true, // Ensure it's treated as local now
        file: blob,
        offlineAvailable: true,
      })

      toast({
        title: 'Download Concluído',
        description: 'Faixa disponível offline.',
      })
    } catch (e) {
      console.error(e)
      toast({
        variant: 'destructive',
        title: 'Falha no Download',
        description: 'Não foi possível baixar a faixa.',
      })
    }
  }

  const removeTrackFromOffline = async (track: Track) => {
    if (!track.file) return
    await updateTrack({
      ...track,
      file: undefined, // Remove blob
      offlineAvailable: false,
    })
    toast({
      title: 'Removido',
      description: 'Faixa removida do armazenamento offline.',
    })
  }

  const toggleOfflineMode = () => {
    setIsOfflineMode((prev) => !prev)
    toast({
      title: !isOfflineMode ? 'Modo Offline' : 'Modo Online',
      description: !isOfflineMode
        ? 'Exibindo apenas conteúdo baixado.'
        : 'Conectado à nuvem.',
    })
  }

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
        isSyncing,
        isAutoPlay,
        isOfflineMode,
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
        setIsSyncing,
        downloadTrackForOffline,
        removeTrackFromOffline,
        toggleOfflineMode,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}
