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
export type TransitionType = 'fade' | 'instant'

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
  fadeInDuration: number // Legacy support
  fadeOutDuration: number // Legacy support
  crossfadeDuration: number
  transitionType: TransitionType
  isNormalizationEnabled: boolean
  bassBoostLevel: number
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
  setCrossfadeDuration: (sec: number) => void
  setTransitionType: (type: TransitionType) => void
  setIsNormalizationEnabled: (enabled: boolean) => void
  setBassBoostLevel: (level: number) => void
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

  // Audio Settings State with Persistence
  const [crossfadeDuration, setCrossfadeDuration] = useState(() =>
    Number(localStorage.getItem('harmonize-crossfade') ?? 2),
  )
  const [transitionType, setTransitionType] = useState<TransitionType>(
    () =>
      (localStorage.getItem('harmonize-transition') as TransitionType) ??
      'fade',
  )
  const [isNormalizationEnabled, setIsNormalizationEnabled] = useState(
    () => localStorage.getItem('harmonize-normalization') === 'true',
  )
  const [bassBoostLevel, setBassBoostLevel] = useState(() =>
    Number(localStorage.getItem('harmonize-bass') ?? 0),
  )

  const [fadeInDuration, setFadeInDuration] = useState(1.5)
  const [fadeOutDuration, setFadeOutDuration] = useState(3.0)
  const [fadeCurve, setFadeCurve] = useState<FadeCurve>('exponential')
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  // Initialize autoPlay from localStorage
  const [isAutoPlay, setIsAutoPlay] = useState(() => {
    const saved = localStorage.getItem('harmonize-autoplay')
    return saved !== null ? saved === 'true' : true
  })

  // Persistence Effects
  useEffect(
    () => localStorage.setItem('harmonize-autoplay', String(isAutoPlay)),
    [isAutoPlay],
  )
  useEffect(
    () =>
      localStorage.setItem('harmonize-crossfade', String(crossfadeDuration)),
    [crossfadeDuration],
  )
  useEffect(
    () => localStorage.setItem('harmonize-transition', transitionType),
    [transitionType],
  )
  useEffect(
    () =>
      localStorage.setItem(
        'harmonize-normalization',
        String(isNormalizationEnabled),
      ),
    [isNormalizationEnabled],
  )
  useEffect(
    () => localStorage.setItem('harmonize-bass', String(bassBoostLevel)),
    [bassBoostLevel],
  )

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const playPromiseRef = useRef<Promise<void> | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const convolverNodeRef = useRef<ConvolverNode | null>(null)
  const bassBoostNodeRef = useRef<BiquadFilterNode | null>(null)
  const compressorNodeRef = useRef<DynamicsCompressorNode | null>(null)

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

      const dbTracksMap = new Map(localTracks.map((t) => [t.id, t]))

      // Merge mock library with overrides from DB
      const mergedMockTracks = musicLibrary.map((mockTrack) => {
        const override = dbTracksMap.get(mockTrack.id)
        if (override) {
          // If override exists, prefer its metadata
          return {
            ...mockTrack,
            title: override.title,
            composer: override.composer,
            album: override.album,
            genre: override.genre,
            year: override.year,
            bpm: override.bpm,
            tone: override.tone,
            ritual: override.ritual,
            degree: override.degree,
            // Keep original URL/cover if not in override (usually overrides are just metadata for mock)
            // But if it's downloaded, it will have file blob in override
            file: override.file,
            offlineAvailable: override.offlineAvailable,
            isLocal: true, // Mark as managed by DB now
          }
        }
        return mockTrack
      })

      // Files that are purely local (imported) and not overrides of mock data
      const newLocalTracks = localTracks
        .filter((t) => !musicLibrary.find((m) => m.id === t.id))
        .map((lt) => ({
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

      let allTracks = [...mergedMockTracks, ...newLocalTracks] as Track[]

      // Filter for offline mode
      if (isOfflineMode) {
        allTracks = allTracks.filter((t) => t.offlineAvailable)
      }

      setLibrary(allTracks)
      setFolders(loadedFolders)
      setPlaylists(loadedPlaylists)

      // Update queue if it contains outdated tracks
      setQueue((prev) => {
        if (prev.length === 0) return allTracks
        return prev.map(
          (qTrack) => allTracks.find((t) => t.id === qTrack.id) || qTrack,
        )
      })
    } catch (error) {
      console.error('Failed to load library', error)
      setLibrary(musicLibrary)
    }
  }, [isOfflineMode])

  useEffect(() => {
    refreshLibrary()
  }, [refreshLibrary])

  // Audio Context Setup with Effects
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

        // Bass Boost
        const bassBoost = ctx.createBiquadFilter()
        bassBoost.type = 'lowshelf'
        bassBoost.frequency.value = 200 // Hz
        bassBoost.gain.value = 0 // dB

        // Compressor (Normalization)
        const compressor = ctx.createDynamicsCompressor()
        compressor.threshold.value = -24
        compressor.knee.value = 30
        compressor.ratio.value = 12
        compressor.attack.value = 0.003
        compressor.release.value = 0.25

        // Impulse Response
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

        // Connections
        // Source -> Bass -> Compressor -> (Split for Reverb) -> Destination
        source.connect(bassBoost)
        bassBoost.connect(compressor)

        // Store refs
        sourceNodeRef.current = source
        gainNodeRef.current = gain
        convolverNodeRef.current = convolver
        bassBoostNodeRef.current = bassBoost
        compressorNodeRef.current = compressor

        // Initial routing (Dry)
        compressor.connect(gain)
        gain.connect(ctx.destination)
      } catch (e) {
        console.warn('Web Audio API setup failed', e)
      }
    }
  }, [isPlaying])

  // Apply Effects Updates
  useEffect(() => {
    if (bassBoostNodeRef.current) {
      // Map 0-100 to 0-15dB
      bassBoostNodeRef.current.gain.value = (bassBoostLevel / 100) * 15
    }
  }, [bassBoostLevel])

  useEffect(() => {
    if (
      compressorNodeRef.current &&
      gainNodeRef.current &&
      audioContextRef.current
    ) {
      // Toggle compressor in/out of chain is complex dynamically,
      // easier to set ratio to 1 (off) or 12 (on)
      compressorNodeRef.current.ratio.value = isNormalizationEnabled ? 12 : 1
    }
  }, [isNormalizationEnabled])

  // Environment switching
  useEffect(() => {
    if (
      !audioContextRef.current ||
      !sourceNodeRef.current ||
      !gainNodeRef.current ||
      !convolverNodeRef.current ||
      !compressorNodeRef.current ||
      !bassBoostNodeRef.current
    )
      return

    try {
      // Disconnect everything relevant to reverb path
      compressorNodeRef.current.disconnect()
      convolverNodeRef.current.disconnect()

      if (acousticEnvironment === 'none') {
        compressorNodeRef.current.connect(gainNodeRef.current)
      } else {
        // Wet path
        compressorNodeRef.current.connect(convolverNodeRef.current)
        convolverNodeRef.current.connect(gainNodeRef.current)
        // Dry path (parallel)
        compressorNodeRef.current.connect(gainNodeRef.current)
      }
    } catch (e) {
      console.warn('Failed to update acoustic environment', e)
    }
  }, [acousticEnvironment])

  // Fade Logic
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

      // If Instant transition type, skip fade logic if duration is supposed to be 0
      if (duration <= 0) {
        audioRef.current.volume =
          targetBaseVolume === 0 ? 0 : getEffectiveVolume()
        onComplete?.()
        return
      }

      const audio = audioRef.current
      const startVolume = audio.volume
      const effectiveTarget = targetBaseVolume === 0 ? 0 : getEffectiveVolume()
      const diff = effectiveTarget - startVolume

      if (Math.abs(diff) < 0.01) {
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

        if (track.file) {
          src = URL.createObjectURL(track.file)
          objectUrlRef.current = src
        } else if (track.gdriveId && track.cloudProvider === 'google') {
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

        if (transitionType === 'instant') {
          audioRef.current.volume = getEffectiveVolume()
          safePlay()
        } else {
          audioRef.current.volume = 0
          safePlay().then(() =>
            performFade(volume, crossfadeDuration, fadeCurve),
          )
        }
      }

      if (isPlaying) {
        if (transitionType === 'instant') {
          safePause()
          startNewTrack()
        } else {
          performFade(0, crossfadeDuration, fadeCurve, startNewTrack)
        }
      } else {
        startNewTrack()
      }
    },
    [
      isPlaying,
      performFade,
      volume,
      crossfadeDuration, // Use unified duration
      transitionType,
      fadeCurve,
      safePlay,
      safePause,
      isOfflineMode,
      getEffectiveVolume,
    ],
  )

  // Setup Audio Event Listeners
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
    if (
      audioRef.current &&
      !fadeIntervalRef.current &&
      transitionType !== 'fade'
    )
      audioRef.current.volume = getEffectiveVolume()
  }, [volume, trackVolumes, currentTrack, getEffectiveVolume, transitionType])

  const setTrackVolume = useCallback((trackId: string, vol: number) => {
    setTrackVolumes((prev) => ({
      ...prev,
      [trackId]: Math.max(0, Math.min(1, vol)),
    }))
  }, [])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      if (transitionType === 'instant') safePause()
      else performFade(0, crossfadeDuration, fadeCurve, () => safePause())
    } else {
      if (!audioRef.current.src && currentTrack) loadAndPlay(currentTrack)
      else {
        if (transitionType === 'instant') {
          audioRef.current.volume = getEffectiveVolume()
          safePlay()
        } else {
          audioRef.current.volume = 0
          safePlay().then(() =>
            performFade(volume, crossfadeDuration, fadeCurve),
          )
        }
      }
    }
  }, [
    isPlaying,
    currentTrack,
    loadAndPlay,
    performFade,
    volume,
    crossfadeDuration,
    transitionType,
    fadeCurve,
    safePlay,
    safePause,
    getEffectiveVolume,
  ])

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlay((prev) => !prev)
  }, [])

  const triggerFadeOut = useCallback(() => {
    if (isPlaying && audioRef.current)
      performFade(0, crossfadeDuration, fadeCurve, () => safePause())
  }, [isPlaying, crossfadeDuration, fadeCurve, performFade, safePause])

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
    // Persistent Metadata Override
    // We save the track to IDB regardless of origin.
    // If it was a mock track, it will now be in IDB with the same ID and act as override.
    const local: LocalTrack = {
      id: updatedTrack.id,
      title: updatedTrack.title,
      composer: updatedTrack.composer,
      album: updatedTrack.album,
      duration: updatedTrack.duration,
      // If file exists (local or downloaded), keep it. If mock, file undefined.
      file: updatedTrack.file,
      gdriveId: updatedTrack.gdriveId,
      dropboxId: updatedTrack.dropboxId,
      onedriveId: updatedTrack.onedriveId,
      cloudProvider: updatedTrack.cloudProvider,
      addedAt: Date.now(), // Or preserve
      updatedAt: Date.now(),
      offlineAvailable: updatedTrack.offlineAvailable,
      degree: updatedTrack.degree,
      ritual: updatedTrack.ritual,
      genre: updatedTrack.genre,
      bpm: updatedTrack.bpm,
      year: updatedTrack.year,
      tone: updatedTrack.tone,
      folderId: updatedTrack.folderId,
      // URL might be needed if it's external (SoundHelix) and not downloaded
      url: updatedTrack.url,
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
    if (track.file) return

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
      file: undefined,
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
        crossfadeDuration,
        transitionType,
        isNormalizationEnabled,
        bassBoostLevel,
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
        setCrossfadeDuration,
        setTransitionType,
        setIsNormalizationEnabled,
        setBassBoostLevel,
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
