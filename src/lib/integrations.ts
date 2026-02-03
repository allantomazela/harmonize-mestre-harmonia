/* Mock Integrations for Spotify and SoundCloud */

export interface ExternalPlaylist {
  id: string
  name: string
  description?: string
  trackCount: number
  coverUrl?: string
  provider: 'spotify' | 'soundcloud'
  tracksUrl: string
}

export interface ExternalTrack {
  id: string
  title: string
  artist: string
  album?: string
  duration: string // "MM:SS"
  url: string // Preview url or similar
  coverUrl?: string
  bpm?: string
}

// Mock Data
const SPOTIFY_PLAYLISTS: ExternalPlaylist[] = [
  {
    id: 'sp-1',
    name: 'Classical Essentials',
    description: 'Best classical music for concentration.',
    trackCount: 50,
    coverUrl: 'https://img.usecurling.com/p/200/200?q=classical&color=green',
    provider: 'spotify',
    tracksUrl: 'mock-url',
  },
  {
    id: 'sp-2',
    name: 'Masonic Ritual Music',
    description: 'Curated for ritualistic sessions.',
    trackCount: 12,
    coverUrl: 'https://img.usecurling.com/p/200/200?q=ritual&color=green',
    provider: 'spotify',
    tracksUrl: 'mock-url',
  },
]

const SOUNDCLOUD_PLAYLISTS: ExternalPlaylist[] = [
  {
    id: 'sc-1',
    name: 'Deep Focus',
    description: 'Ambient tracks.',
    trackCount: 20,
    coverUrl: 'https://img.usecurling.com/p/200/200?q=ambient&color=orange',
    provider: 'soundcloud',
    tracksUrl: 'mock-url',
  },
]

const MOCK_TRACKS: ExternalTrack[] = [
  {
    id: 'ext-1',
    title: 'Symphony No. 5',
    artist: 'Beethoven',
    album: 'Greatest Hits',
    duration: '7:30',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://img.usecurling.com/p/200/200?q=beethoven&color=black',
    bpm: '108',
  },
  {
    id: 'ext-2',
    title: 'Four Seasons: Spring',
    artist: 'Vivaldi',
    album: 'Essential Vivaldi',
    duration: '3:20',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://img.usecurling.com/p/200/200?q=vivaldi&color=black',
    bpm: '98',
  },
]

export const connectService = async (
  service: 'spotify' | 'soundcloud',
): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.setItem(`${service}_connected`, 'true')
      resolve(true)
    }, 1500)
  })
}

export const disconnectService = async (
  service: 'spotify' | 'soundcloud',
): Promise<boolean> => {
  localStorage.removeItem(`${service}_connected`)
  return true
}

export const isServiceConnected = (
  service: 'spotify' | 'soundcloud',
): boolean => {
  return localStorage.getItem(`${service}_connected`) === 'true'
}

export const fetchExternalPlaylists = async (
  service: 'spotify' | 'soundcloud',
): Promise<ExternalPlaylist[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (service === 'spotify') resolve(SPOTIFY_PLAYLISTS)
      else resolve(SOUNDCLOUD_PLAYLISTS)
    }, 1000)
  })
}

export const fetchExternalTracks = async (
  playlistId: string,
): Promise<ExternalTrack[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_TRACKS)
    }, 1000)
  })
}
