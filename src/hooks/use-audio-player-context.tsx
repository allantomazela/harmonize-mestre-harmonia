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
  getPresets,
  savePreset,
  deletePreset,
  LocalTrack,
  Folder,
  Playlist,
  EffectPreset,
} from '@/lib/storage'
import { ritualTemplates, matchTracksToTemplate } from '@/lib/ritual-templates'
import { fetchDriveFileBlob } from '@/lib/google-drive'
import { renderPlaylistMix } from '@/lib/audio-exporter'
import { isServiceConnected } from '@/lib/integrations'
import { fetchCloudData, saveCloudData, isOnline } from '@/lib/cloud-mock'

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
  spotifyId?: string
  soundcloudId?: string
  cloudProvider?: 'google' | 'dropbox' | 'onedrive' | 'spotify' | 'soundcloud'
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
  cues?: number[]
  trimStart?: number
  trimEnd?: number
  size?: number
}

export type AcousticEnvironment = 'none' | 'temple' | 'cathedral' | 'small-room'
export type FadeCurve = 'linear' | 'exponential' | 'smooth'
export type TransitionType = 'fade' | 'instant'
export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error'

interface EffectsState {
  reverb: { mix: number; decay: number; preDelay: number }
  delay: { mix: number; time: number; feedback: number }
  distortion: { amount: number }
}

interface AudioPlayerContextType {
  isPlaying: boolean
  currentTrack: Track | undefined
  queue: Track[]
  library: Track[]
  folders: Folder[]
  playlists: Playlist[]
  presets: EffectPreset[]
  currentIndex: number
  currentTime: number
  duration: number
  volume: number
  trackVolumes: Record<string, number>

  // Audio Effects
  acousticEnvironment: AcousticEnvironment
  effects: EffectsState
  setEffectParam: (
    effect: keyof EffectsState,
    param: string,
    value: number,
  ) => void
  analyserRef: React.MutableRefObject<AnalyserNode | null>

  // Playback Settings
  fadeInDuration: number
  fadeOutDuration: number
  crossfadeDuration: number
  transitionType: TransitionType
  isNormalizationEnabled: boolean
  bassBoostLevel: number
  fadeCurve: FadeCurve
  isLoading: boolean
  isSyncing: boolean
  syncStatus: SyncStatus
  lastSyncedAt: number | null
  isAutoPlay: boolean
  isOfflineMode: boolean
  isCorsRestricted: boolean

  // Cueing
  cueTrack: Track | undefined
  isCuePlaying: boolean
  toggleCue: (track: Track) => void
  addCuePoint: (time: number) => Promise<void>
  setTrim: (start: number, end: number) => Promise<void>

  // Integration States
  connectedServices: { spotify: boolean; soundcloud: boolean }
  checkIntegrations: () => void

  // Download Progress
  downloadProgress: Record<string, number> // trackId -> percentage (0-100)

  // Methods
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
  exportPlaylist: (tracks: Track[], title: string) => Promise<void>
  importLocalFiles: (files: FileList) => Promise<void>

  // Presets
  loadPreset: (preset: EffectPreset) => void
  saveCurrentPreset: (name: string) => Promise<void>
  deleteEffectPreset: (id: string) => Promise<void>
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
  const [presets, setPresets] = useState<EffectPreset[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [trackVolumes, setTrackVolumes] = useState<Record<string, number>>({})

  // Advanced Audio Effects
  const [effects, setEffects] = useState<EffectsState>({
    reverb: { mix: 0, decay: 2.0, preDelay: 0 },
    delay: { mix: 0, time: 0.5, feedback: 0.3 },
    distortion: { amount: 0 },
  })
  const [acousticEnvironment, setAcousticEnvironment] =
    useState<AcousticEnvironment>('none')

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
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced')
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)

  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [isCorsRestricted, setIsCorsRestricted] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<
    Record<string, number>
  >({})

  // Cue State
  const [cueTrack, setCueTrack] = useState<Track | undefined>(undefined)
  const [isCuePlaying, setIsCuePlaying] = useState(false)

  // Integration State
  const [connectedServices, setConnectedServices] = useState({
    spotify: false,
    soundcloud: false,
  })

  // Initialize autoPlay from localStorage
  const [isAutoPlay, setIsAutoPlay] = useState(() => {
    const saved = localStorage.getItem('harmonize-autoplay')
    return saved !== null ? saved === 'true' : true
  })

  // Audio Graph Refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  // ... (Other Refs omitted for brevity as they are handled inside useEffects or existing refs)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const distortionNodeRef = useRef<WaveShaperNode | null>(null)
  const bassBoostNodeRef = useRef<BiquadFilterNode | null>(null)
  const compressorNodeRef = useRef<DynamicsCompressorNode | null>(null)
  const delayNodeRef = useRef<DelayNode | null>(null)
  const delayFeedbackRef = useRef<GainNode | null>(null)
  const delayWetGainRef = useRef<GainNode | null>(null)
  const delayDryGainRef = useRef<GainNode | null>(null)
  const delayMergeRef = useRef<GainNode | null>(null)
  const reverbConvolverRef = useRef<ConvolverNode | null>(null)
  const reverbWetGainRef = useRef<GainNode | null>(null)
  const reverbDryGainRef = useRef<GainNode | null>(null)
  const reverbMergeRef = useRef<GainNode | null>(null)
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const playPromiseRef = useRef<Promise<void> | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const retryCountRef = useRef<number>(0)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Cloud Synchronization Logic
  const syncToCloud = useCallback(async () => {
    if (!isOnline() || isOfflineMode) {
      setSyncStatus('offline')
      return
    }

    setSyncStatus('syncing')
    try {
      await saveCloudData({
        playlists,
        queue: queue.map((t) => ({ ...t, file: undefined })), // Avoid sending blobs to mock storage
        settings: {
          volume,
          effects,
          theme: 'dark', // Mock theme sync
        },
      })
      setSyncStatus('synced')
      setLastSyncedAt(Date.now())
    } catch (e) {
      console.error('Cloud Sync Failed', e)
      setSyncStatus('error')
    }
  }, [playlists, queue, volume, effects, isOfflineMode])

  // Debounced Sync trigger
  useEffect(() => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    syncTimeoutRef.current = setTimeout(() => {
      syncToCloud()
    }, 2000) // Sync 2 seconds after last change

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    }
  }, [playlists, queue, volume, effects, syncToCloud])

  // Initial Load from Cloud
  useEffect(() => {
    const initCloud = async () => {
      if (!isOnline()) return
      const cloudData = await fetchCloudData()
      if (cloudData) {
        if (cloudData.playlists) setPlaylists(cloudData.playlists)
        if (queue.length === 0 && cloudData.queue) setQueue(cloudData.queue)

        if (cloudData.settings) {
          setVolume(cloudData.settings.volume ?? 0.8)
          if (cloudData.settings.effects) setEffects(cloudData.settings.effects)
        }
        setLastSyncedAt(cloudData.updatedAt)
      }
    }
    initCloud()
  }, [])

  // Network Status Listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOfflineMode(false)
      setSyncStatus('syncing')
      syncToCloud()
    }
    const handleOffline = () => {
      setIsOfflineMode(true)
      setSyncStatus('offline')
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [syncToCloud])

  const checkIntegrations = useCallback(() => {
    setConnectedServices({
      spotify: isServiceConnected('spotify'),
      soundcloud: isServiceConnected('soundcloud'),
    })
  }, [])

  useEffect(() => {
    checkIntegrations()
  }, [checkIntegrations])

  const refreshLibrary = useCallback(async () => {
    try {
      const [localTracks, loadedFolders, loadedPlaylists, loadedPresets] =
        await Promise.all([
          getAllTracks(),
          getFolders(),
          getPlaylists(),
          getPresets(),
        ])

      const dbTracksMap = new Map(localTracks.map((t) => [t.id, t]))
      const mergedMockTracks = musicLibrary.map((mockTrack) => {
        const override = dbTracksMap.get(mockTrack.id)
        if (override) {
          return { ...mockTrack, ...override, isLocal: true }
        }
        return mockTrack
      })

      const newLocalTracks = localTracks
        .filter((t) => !musicLibrary.find((m) => m.id === t.id))
        .map((lt) => ({
          ...lt,
          isLocal: true,
          offlineAvailable: lt.offlineAvailable || !!lt.file,
        }))

      let allTracks = [...mergedMockTracks, ...newLocalTracks] as Track[]

      if (isOfflineMode) {
        allTracks = allTracks.filter((t) => t.offlineAvailable)
      }

      setLibrary(allTracks)
      setFolders(loadedFolders)
      setPlaylists(loadedPlaylists)
      setPresets(loadedPresets)
    } catch (error) {
      console.error('Failed to load library', error)
      setLibrary(musicLibrary)
    }
  }, [isOfflineMode])

  useEffect(() => {
    refreshLibrary()
  }, [refreshLibrary])

  // Helper for Distortion
  function makeDistortionCurve(amount: number) {
    if (amount === 0) return null
    const k = amount * 5 // Sensitivity
    const n_samples = 44100
    const curve = new Float32Array(n_samples)
    const deg = Math.PI / 180
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x))
    }
    return curve
  }

  // Helper for Reverb Impulse
  function impulseResponse(
    duration: number,
    decay: number,
    reverse: boolean,
    ctx: AudioContext,
  ) {
    const sampleRate = ctx.sampleRate
    const length = sampleRate * duration
    const impulse = ctx.createBuffer(2, length, sampleRate)
    const impulseL = impulse.getChannelData(0)
    const impulseR = impulse.getChannelData(1)

    for (let i = 0; i < length; i++) {
      const n = reverse ? length - i : i
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay)
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay)
    }
    return impulse
  }

  // Setup Web Audio Graph
  useEffect(() => {
    if (!audioContextRef.current && audioRef.current) {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext
      const ctx = new AudioContextClass()
      audioContextRef.current = ctx

      const source = ctx.createMediaElementSource(audioRef.current)
      sourceNodeRef.current = source

      // Effects Setup
      const distortion = ctx.createWaveShaper()
      distortion.curve = makeDistortionCurve(0)
      distortion.oversample = '4x'
      distortionNodeRef.current = distortion

      const bassBoost = ctx.createBiquadFilter()
      bassBoost.type = 'lowshelf'
      bassBoost.frequency.value = 200
      bassBoost.gain.value = 0
      bassBoostNodeRef.current = bassBoost

      // Delay
      const delay = ctx.createDelay(5.0)
      const delayFeedback = ctx.createGain()
      const delayWet = ctx.createGain()
      const delayDry = ctx.createGain()
      const delayMerge = ctx.createGain()

      delay.delayTime.value = 0
      delayFeedback.gain.value = 0
      delayWet.gain.value = 0
      delayDry.gain.value = 1

      delay.connect(delayFeedback)
      delayFeedback.connect(delay)

      delayNodeRef.current = delay
      delayFeedbackRef.current = delayFeedback
      delayWetGainRef.current = delayWet
      delayDryGainRef.current = delayDry
      delayMergeRef.current = delayMerge

      // Reverb
      const convolver = ctx.createConvolver()
      const reverbWet = ctx.createGain()
      const reverbDry = ctx.createGain()
      const reverbMerge = ctx.createGain()

      reverbWet.gain.value = 0
      reverbDry.gain.value = 1

      reverbConvolverRef.current = convolver
      reverbWetGainRef.current = reverbWet
      reverbDryGainRef.current = reverbDry
      reverbMergeRef.current = reverbMerge

      // Compressor
      const compressor = ctx.createDynamicsCompressor()
      compressor.threshold.value = -24
      compressor.knee.value = 30
      compressor.ratio.value = 12
      compressor.attack.value = 0.003
      compressor.release.value = 0.25
      compressorNodeRef.current = compressor

      // Analyser
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      analyserRef.current = analyser

      // Master Gain
      const gain = ctx.createGain()
      gainNodeRef.current = gain

      // --- Connect Graph ---
      source.connect(distortion)
      distortion.connect(bassBoost)

      bassBoost.connect(delay)
      bassBoost.connect(delayDry)

      delay.connect(delayWet)
      delayWet.connect(delayMerge)
      delayDry.connect(delayMerge)

      delayMerge.connect(convolver)
      delayMerge.connect(reverbDry)

      convolver.connect(reverbWet)
      reverbWet.connect(reverbMerge)
      reverbDry.connect(reverbMerge)

      reverbMerge.connect(compressor)
      compressor.connect(analyser)
      analyser.connect(gain)
      gain.connect(ctx.destination)
    }
  }, [])

  // Update Effect Parameters
  useEffect(() => {
    if (!audioContextRef.current) return
    const ctx = audioContextRef.current

    if (distortionNodeRef.current) {
      distortionNodeRef.current.curve = makeDistortionCurve(
        effects.distortion.amount,
      )
    }

    if (bassBoostNodeRef.current) {
      bassBoostNodeRef.current.gain.value = (bassBoostLevel / 100) * 15
    }

    if (
      delayNodeRef.current &&
      delayFeedbackRef.current &&
      delayWetGainRef.current &&
      delayDryGainRef.current
    ) {
      delayNodeRef.current.delayTime.value = effects.delay.time
      delayFeedbackRef.current.gain.value = effects.delay.feedback
      delayWetGainRef.current.gain.value = effects.delay.mix
      delayDryGainRef.current.gain.value = 1 - effects.delay.mix
    }

    if (
      reverbConvolverRef.current &&
      reverbWetGainRef.current &&
      reverbDryGainRef.current
    ) {
      if (effects.reverb.mix > 0 && !reverbConvolverRef.current.buffer) {
        reverbConvolverRef.current.buffer = impulseResponse(
          effects.reverb.decay,
          effects.reverb.decay,
          false,
          ctx,
        )
      }
      reverbWetGainRef.current.gain.value = effects.reverb.mix
      reverbDryGainRef.current.gain.value = 1 - effects.reverb.mix
    }

    if (compressorNodeRef.current) {
      compressorNodeRef.current.ratio.value = isNormalizationEnabled ? 12 : 1
      compressorNodeRef.current.threshold.value = isNormalizationEnabled
        ? -24
        : 0
    }
  }, [effects, bassBoostLevel, isNormalizationEnabled])

  const setEffectParam = (
    effect: keyof EffectsState,
    param: string,
    value: number,
  ) => {
    setEffects((prev) => ({
      ...prev,
      [effect]: {
        ...prev[effect],
        [param]: value,
      },
    }))

    if (effect === 'reverb' && param === 'decay' && audioContextRef.current) {
      if (reverbConvolverRef.current) {
        reverbConvolverRef.current.buffer = impulseResponse(
          value,
          value,
          false,
          audioContextRef.current,
        )
      }
    }
  }

  const saveCurrentPreset = async (name: string) => {
    const preset: EffectPreset = {
      id: crypto.randomUUID(),
      name,
      settings: { ...effects, bassBoost: bassBoostLevel },
    }
    await savePreset(preset)
    await refreshLibrary()
    toast({
      title: 'Preset Saved',
      description: `Audio preset "${name}" saved.`,
    })
  }

  const loadPreset = (preset: EffectPreset) => {
    setEffects({
      reverb: preset.settings.reverb,
      delay: preset.settings.delay,
      distortion: preset.settings.distortion,
    })
    setBassBoostLevel(preset.settings.bassBoost)
    toast({ title: 'Preset Loaded', description: `Applied "${preset.name}".` })
  }

  const deleteEffectPreset = async (id: string) => {
    await deletePreset(id)
    await refreshLibrary()
    toast({
      title: 'Preset Deleted',
      description: 'Preset removed from library.',
    })
  }

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

  const loadAndPlay = useCallback(
    async (track: Track) => {
      if (!audioRef.current) return
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }

      const startNewTrack = async () => {
        if (!audioRef.current) return
        retryCountRef.current = 0
        setIsCorsRestricted(false)
        audioRef.current.crossOrigin = 'anonymous'

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
        if (track.trimStart) {
          audioRef.current.currentTime = track.trimStart
        }
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
      crossfadeDuration,
      transitionType,
      fadeCurve,
      safePlay,
      safePause,
      isOfflineMode,
      getEffectiveVolume,
    ],
  )

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

  const triggerFadeOut = useCallback(() => {
    if (isPlaying && audioRef.current)
      performFade(0, crossfadeDuration, fadeCurve, () => safePause())
  }, [isPlaying, crossfadeDuration, fadeCurve, performFade, safePause])

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.crossOrigin = 'anonymous'
      audioRef.current.preload = 'auto'
    }
    const audio = audioRef.current
    const updateTime = () => {
      if (!Number.isNaN(audio.currentTime)) {
        setCurrentTime(audio.currentTime)
        if (
          currentTrack?.trimEnd &&
          audio.currentTime >= currentTrack.trimEnd
        ) {
          handleEnded()
        }
      }
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
      const target = e.target as HTMLAudioElement
      const err = target.error
      console.warn('Audio Playback Error:', err)

      if (target.crossOrigin === 'anonymous' && retryCountRef.current === 0) {
        console.warn('Attempting fallback: disabling CORS for playback.')
        retryCountRef.current += 1
        target.removeAttribute('crossorigin')
        target.load()
        safePlay().catch(console.error)
        setIsCorsRestricted(true)
        return
      }

      setIsLoading(false)
      setIsPlaying(false)

      let errorMsg = 'Não foi possível reproduzir este áudio.'
      if (err?.code === 2) errorMsg = 'Erro de rede. Verifique sua conexão.'
      if (err?.code === 4)
        errorMsg = 'Formato não suportado ou arquivo não encontrado.'

      toast({
        title: 'Erro ao carregar o áudio',
        description: `${errorMsg} Verifique a origem do arquivo.`,
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
  }, [isAutoPlay, currentTrack, playNext, safePlay])

  useEffect(() => {
    if (
      audioRef.current &&
      !fadeIntervalRef.current &&
      transitionType !== 'fade'
    )
      audioRef.current.volume = getEffectiveVolume()
  }, [volume, trackVolumes, currentTrack, getEffectiveVolume, transitionType])

  const seek = useCallback((time: number) => {
    if (audioRef.current && Number.isFinite(time)) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const setTrackVolume = useCallback((trackId: string, vol: number) => {
    setTrackVolumes((prev) => ({
      ...prev,
      [trackId]: Math.max(0, Math.min(1, vol)),
    }))
  }, [])

  const toggleAutoPlay = useCallback(() => setIsAutoPlay((prev) => !prev), [])

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
    const local: LocalTrack = {
      ...updatedTrack,
      addedAt: updatedTrack.updatedAt || Date.now(),
      updatedAt: Date.now(),
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

  const downloadTrackForOffline = async (track: Track) => {
    if (track.file) {
      toast({
        title: 'Já disponível offline',
        description: `"${track.title}" já está salvo localmente.`,
      })
      return
    }

    setDownloadProgress((prev) => ({ ...prev, [track.id]: 0 }))

    toast({
      title: 'Baixando...',
      description: `Tornando "${track.title}" disponível offline.`,
    })

    try {
      let blob: Blob
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          const current = prev[track.id] || 0
          if (current >= 90) return prev
          return { ...prev, [track.id]: current + 10 }
        })
      }, 200)

      if (track.gdriveId && track.cloudProvider === 'google')
        blob = await fetchDriveFileBlob(track.gdriveId)
      else if (track.url) {
        const res = await fetch(track.url)
        blob = await res.blob()
      } else {
        clearInterval(progressInterval)
        throw new Error('No source available')
      }

      clearInterval(progressInterval)
      setDownloadProgress((prev) => ({ ...prev, [track.id]: 100 }))

      await updateTrack({ ...track, file: blob, offlineAvailable: true })

      toast({
        title: 'Download Concluído',
        description: 'Faixa disponível offline.',
      })

      setTimeout(() => {
        setDownloadProgress((prev) => {
          const next = { ...prev }
          delete next[track.id]
          return next
        })
      }, 1000)
    } catch (e) {
      setDownloadProgress((prev) => {
        const next = { ...prev }
        delete next[track.id]
        return next
      })

      toast({
        variant: 'destructive',
        title: 'Falha no Download',
        description: 'Não foi possível baixar a faixa.',
      })
    }
  }

  const removeTrackFromOffline = async (track: Track) => {
    if (!track.file) return
    await updateTrack({ ...track, file: undefined, offlineAvailable: false })
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

  const exportPlaylist = async (tracks: Track[], title: string) => {
    toast({ title: 'Exporting...', description: 'Rendering audio mix...' })
    try {
      const blob = await renderPlaylistMix(tracks, crossfadeDuration)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title} - Mix.wav`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({
        title: 'Export Complete',
        description: 'Playlist mix downloaded.',
      })
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Could not render audio.',
      })
    }
  }

  const importLocalFiles = async (files: FileList) => {
    if (!files || files.length === 0) return

    let importedCount = 0
    const failedFiles: string[] = []

    // Show initial toast
    toast({
      title: 'Importando...',
      description: `Processando ${files.length} arquivos.`,
    })

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Filter for audio files
      if (!file.type.startsWith('audio/')) {
        continue
      }

      // Update progress for UX
      const progress = Math.round(((i + 1) / files.length) * 100)
      setDownloadProgress((prev) => ({
        ...prev,
        ['importing-local']: progress,
      }))

      try {
        const id = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const fileName = file.name.replace(/\.[^/.]+$/, '')
        const parts = fileName.split('-')
        const title = parts.length > 1 ? parts[1].trim() : fileName
        const composer =
          parts.length > 1 ? parts[0].trim() : 'Artista Desconhecido'

        await saveTrack({
          id,
          title,
          composer,
          file,
          duration: '0:00', // Actual duration requires parsing audio buffer, simplified here
          addedAt: Date.now(),
          updatedAt: Date.now(),
          size: file.size,
          degree: 'Geral',
          ritual: 'Livre',
          folderId: undefined, // Or selected folder
          offlineAvailable: true,
          isLocal: true,
        })
        importedCount++
      } catch (e) {
        console.error('Error saving file', file.name, e)
        failedFiles.push(file.name)
      }
    }

    // Cleanup progress
    setDownloadProgress((prev) => {
      const next = { ...prev }
      delete next['importing-local']
      return next
    })

    if (importedCount > 0) {
      toast({
        title: 'Importação Concluída',
        description: `${importedCount} arquivos adicionados e disponíveis offline.`,
      })
      await refreshLibrary()
    }

    if (failedFiles.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Erros na Importação',
        description: `Falha ao importar ${failedFiles.length} arquivos.`,
      })
    }
  }

  const toggleCue = (track: Track) => {
    if (cueTrack?.id === track.id) {
      setIsCuePlaying(!isCuePlaying)
      if (isCuePlaying) setCueTrack(undefined)
    } else {
      setCueTrack(track)
      setIsCuePlaying(true)
    }
  }

  const addCuePoint = async (time: number) => {
    if (!currentTrack) return
    const newCues = [...(currentTrack.cues || []), time].sort((a, b) => a - b)
    await updateTrack({ ...currentTrack, cues: newCues })
    toast({
      title: 'Cue Point Added',
      description: `Marker set at ${time.toFixed(1)}s`,
    })
  }

  const setTrim = async (start: number, end: number) => {
    if (!currentTrack) return
    await updateTrack({ ...currentTrack, trimStart: start, trimEnd: end })
    toast({
      title: 'Track Trimmed',
      description: 'Start and End points saved.',
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
        presets,
        currentIndex,
        currentTime,
        duration,
        volume,
        trackVolumes,
        acousticEnvironment,
        effects,
        setEffectParam,
        analyserRef,
        fadeInDuration,
        fadeOutDuration,
        crossfadeDuration,
        transitionType,
        isNormalizationEnabled,
        bassBoostLevel,
        fadeCurve,
        isLoading,
        isSyncing,
        syncStatus,
        lastSyncedAt,
        isAutoPlay,
        isOfflineMode,
        isCorsRestricted,
        cueTrack,
        isCuePlaying,
        connectedServices,
        downloadProgress,
        toggleCue,
        addCuePoint,
        setTrim,
        checkIntegrations,
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
        exportPlaylist,
        importLocalFiles,
        loadPreset,
        saveCurrentPreset,
        deleteEffectPreset,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}
