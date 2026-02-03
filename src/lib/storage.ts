/* Storage Utility - Manages IndexedDB for local file persistence */

export interface LocalTrack {
  id: string
  title: string
  composer: string
  album?: string
  duration: string
  file?: Blob
  gdriveId?: string
  dropboxId?: string
  onedriveId?: string
  spotifyId?: string
  soundcloudId?: string
  cloudProvider?: 'google' | 'dropbox' | 'onedrive' | 'spotify' | 'soundcloud'
  addedAt: number
  updatedAt?: number
  size?: number
  degree?: string
  ritual?: string
  folderId?: string
  genre?: string
  bpm?: string
  year?: string
  occasion?: string
  tone?: string
  offlineAvailable?: boolean
  url?: string
  cues?: number[]
  trimStart?: number
  trimEnd?: number
}

export interface Folder {
  id: string
  name: string
  createdAt: number
}

export interface SmartPlaylistRule {
  field: 'genre' | 'composer' | 'album' | 'year' | 'degree'
  operator: 'equals' | 'contains'
  value: string
}

export interface PlaylistItem {
  trackId: string
  addedBy?: string
  addedAt?: number
}

export interface Collaborator {
  email: string
  role: 'viewer' | 'editor'
  status: 'pending' | 'accepted'
}

export interface Playlist {
  id: string
  title: string
  description?: string
  isSmart: boolean
  rules?: SmartPlaylistRule[]
  items?: PlaylistItem[]
  cover?: string
  createdAt: number
  collaborators?: Collaborator[]
  ritualTemplateId?: string
}

export interface EffectPreset {
  id: string
  name: string
  settings: {
    reverb: { mix: number; decay: number; preDelay: number }
    delay: { mix: number; time: number; feedback: number }
    distortion: { amount: number }
    bassBoost: number
  }
}

const DB_NAME = 'HarmonizeDB'
const DB_VERSION = 8

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('tracks')) {
        db.createObjectStore('tracks', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('folders')) {
        db.createObjectStore('folders', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('playlists')) {
        db.createObjectStore('playlists', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('presets')) {
        db.createObjectStore('presets', { keyPath: 'id' })
      }
    }
  })
}

// Tracks
export const saveTrack = async (track: LocalTrack): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('tracks', 'readwrite')
    const store = transaction.objectStore('tracks')
    const request = store.put(track)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const getAllTracks = async (): Promise<LocalTrack[]> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('tracks', 'readonly')
    const store = transaction.objectStore('tracks')
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const deleteTrack = async (id: string): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('tracks', 'readwrite')
    const store = transaction.objectStore('tracks')
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const clearAllTracks = async (): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      ['tracks', 'folders', 'playlists', 'presets'],
      'readwrite',
    )
    transaction.objectStore('tracks').clear()
    transaction.objectStore('folders').clear()
    transaction.objectStore('playlists').clear()
    transaction.objectStore('presets').clear()
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

// Folders
export const saveFolder = async (folder: Folder): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('folders', 'readwrite')
    const store = transaction.objectStore('folders')
    const request = store.put(folder)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const getFolders = async (): Promise<Folder[]> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('folders', 'readonly')
    const store = transaction.objectStore('folders')
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const deleteFolder = async (id: string): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('folders', 'readwrite')
    const store = transaction.objectStore('folders')
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// Playlists
export const savePlaylist = async (playlist: Playlist): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('playlists', 'readwrite')
    const store = transaction.objectStore('playlists')
    const request = store.put(playlist)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const getPlaylists = async (): Promise<Playlist[]> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('playlists', 'readonly')
    const store = transaction.objectStore('playlists')
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const deletePlaylist = async (id: string): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('playlists', 'readwrite')
    const store = transaction.objectStore('playlists')
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// Presets
export const savePreset = async (preset: EffectPreset): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('presets', 'readwrite')
    const store = transaction.objectStore('presets')
    const request = store.put(preset)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const getPresets = async (): Promise<EffectPreset[]> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('presets', 'readonly')
    const store = transaction.objectStore('presets')
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const deletePreset = async (id: string): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('presets', 'readwrite')
    const store = transaction.objectStore('presets')
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// Backup Utilities
export const exportLibraryData = async (): Promise<string> => {
  const tracks = await getAllTracks()
  const folders = await getFolders()
  const playlists = await getPlaylists()
  const presets = await getPresets()

  const tracksMetadata = tracks.map(({ file, ...meta }) => meta)

  return JSON.stringify({
    version: 2,
    createdAt: Date.now(),
    folders,
    playlists,
    presets,
    tracks: tracksMetadata,
  })
}

export const exportLibraryToCSV = async (): Promise<string> => {
  const tracks = await getAllTracks()
  const headers = [
    'Title',
    'Composer',
    'Album',
    'Genre',
    'Duration',
    'Degree',
    'Ritual',
    'Year',
    'BPM',
  ]
  const rows = tracks.map((t) =>
    [
      t.title,
      t.composer,
      t.album || '',
      t.genre || '',
      t.duration,
      t.degree || '',
      t.ritual || '',
      t.year || '',
      t.bpm || '',
    ]
      .map((field) => `"${field}"`)
      .join(','),
  )

  return [headers.join(','), ...rows].join('\n')
}

export const importLibraryData = async (jsonString: string): Promise<void> => {
  try {
    const data = JSON.parse(jsonString)
    if (!data.folders || !data.tracks) throw new Error('Invalid backup format')

    for (const folder of data.folders) {
      await saveFolder(folder)
    }

    if (data.playlists) {
      for (const playlist of data.playlists) {
        await savePlaylist(playlist)
      }
    }

    if (data.presets) {
      for (const preset of data.presets) {
        await savePreset(preset)
      }
    }

    const currentTracks = await getAllTracks()
    const currentMap = new Map(currentTracks.map((t) => [t.id, t]))

    for (const trackMeta of data.tracks) {
      if (currentMap.has(trackMeta.id)) {
        const existing = currentMap.get(trackMeta.id)!
        await saveTrack({ ...existing, ...trackMeta })
      } else {
        await saveTrack(trackMeta)
      }
    }
  } catch (e) {
    console.error('Import failed', e)
    throw e
  }
}
