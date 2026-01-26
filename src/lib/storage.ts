/* Storage Utility - Manages IndexedDB for local file persistence */

export interface LocalTrack {
  id: string
  title: string
  composer: string
  album?: string
  duration: string
  file: Blob
  addedAt: number
  degree?: string
  ritual?: string
  folderId?: string
  genre?: string
  bpm?: string
  year?: string
  occasion?: string
  tone?: string
}

export interface Folder {
  id: string
  name: string
  createdAt: number
}

const DB_NAME = 'HarmonizeDB'
const DB_VERSION = 2

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
    const transaction = db.transaction(['tracks', 'folders'], 'readwrite')
    transaction.objectStore('tracks').clear()
    transaction.objectStore('folders').clear()
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

// Backup Utilities
export const exportLibraryData = async (): Promise<string> => {
  const tracks = await getAllTracks()
  const folders = await getFolders()

  // Export metadata only to avoid massive JSON files with base64 audio
  const tracksMetadata = tracks.map(({ file, ...meta }) => meta)

  return JSON.stringify({
    version: 1,
    createdAt: Date.now(),
    folders,
    tracks: tracksMetadata,
  })
}

export const importLibraryData = async (jsonString: string): Promise<void> => {
  try {
    const data = JSON.parse(jsonString)
    if (!data.folders || !data.tracks) throw new Error('Invalid backup format')

    // Restore Folders
    for (const folder of data.folders) {
      await saveFolder(folder)
    }

    // Restore Track Metadata (Only updates existing tracks or adds entries without file)
    // Note: Since we can't restore the file Blob from JSON easily without huge size,
    // this effectively restores the organization. User might need to re-link files or
    // we assume this is for metadata of existing files.
    // For this implementation, we will update metadata of tracks if ID matches,
    // or create "Ghost" tracks that need file repair (advanced feature),
    // but here we just try to update metadata of what we can.
    const currentTracks = await getAllTracks()
    const currentMap = new Map(currentTracks.map((t) => [t.id, t]))

    for (const trackMeta of data.tracks) {
      if (currentMap.has(trackMeta.id)) {
        const existing = currentMap.get(trackMeta.id)!
        await saveTrack({ ...existing, ...trackMeta })
      }
    }
  } catch (e) {
    console.error('Import failed', e)
    throw e
  }
}
