/* Abstraction layer for multi-cloud support */
import { GDriveFile, listDriveFiles, scanFolderForAudio } from './google-drive'

export type CloudProvider = 'google' | 'dropbox' | 'onedrive'

export interface CloudFile {
  id: string
  name: string
  mimeType: string // 'folder' or 'audio'
  size?: string
  provider: CloudProvider
  thumbnail?: string
}

export interface CloudUser {
  name: string
  email: string
  avatar?: string
  provider: CloudProvider
}

// Mock Data for Dropbox/OneDrive simulation
const MOCK_DROPBOX_FILES: CloudFile[] = [
  { id: 'db-1', name: 'Ritual Music', mimeType: 'folder', provider: 'dropbox' },
  {
    id: 'db-2',
    name: 'Mozart - Symphony 40.mp3',
    mimeType: 'audio',
    size: '5400000',
    provider: 'dropbox',
  },
  { id: 'db-3', name: 'Backups', mimeType: 'folder', provider: 'dropbox' },
]

const MOCK_ONEDRIVE_FILES: CloudFile[] = [
  {
    id: 'od-1',
    name: 'Lodge Documents',
    mimeType: 'folder',
    provider: 'onedrive',
  },
  {
    id: 'od-2',
    name: 'Beethoven - Moonlight.mp3',
    mimeType: 'audio',
    size: '3200000',
    provider: 'onedrive',
  },
  { id: 'od-3', name: 'Recordings', mimeType: 'folder', provider: 'onedrive' },
]

export const listCloudFiles = async (
  provider: CloudProvider,
  folderId: string = 'root',
): Promise<CloudFile[]> => {
  switch (provider) {
    case 'google': {
      try {
        const files = await listDriveFiles(folderId)
        return files.map((f) => ({
          id: f.id,
          name: f.name,
          mimeType:
            f.mimeType === 'application/vnd.google-apps.folder'
              ? 'folder'
              : 'audio',
          size: f.size,
          provider: 'google',
          thumbnail: f.thumbnailLink,
        }))
      } catch (e) {
        console.error('Google Drive List Error', e)
        return []
      }
    }
    case 'dropbox':
      // Mock implementation
      return new Promise((resolve) =>
        setTimeout(() => resolve(MOCK_DROPBOX_FILES), 500),
      )
    case 'onedrive':
      // Mock implementation
      return new Promise((resolve) =>
        setTimeout(() => resolve(MOCK_ONEDRIVE_FILES), 500),
      )
    default:
      return []
  }
}

export const scanCloudFolder = async (
  provider: CloudProvider,
  folderId: string,
): Promise<CloudFile[]> => {
  // For now, only Google is fully recursive real implementation
  if (provider === 'google') {
    const files = await scanFolderForAudio(folderId)
    return files.map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: 'audio',
      size: f.size,
      provider: 'google',
    }))
  }
  // Mock for others
  if (provider === 'dropbox')
    return MOCK_DROPBOX_FILES.filter((f) => f.mimeType === 'audio')
  if (provider === 'onedrive')
    return MOCK_ONEDRIVE_FILES.filter((f) => f.mimeType === 'audio')
  return []
}

export const getCloudUser = async (
  provider: CloudProvider,
): Promise<CloudUser | null> => {
  // Google implementation is handled via hooks/context usually, but we can mock or bridge here
  // For this demo, we simulate user data for other providers
  if (provider === 'dropbox') {
    return {
      name: 'Dropbox User',
      email: 'user@dropbox.com',
      provider: 'dropbox',
    }
  }
  if (provider === 'onedrive') {
    return {
      name: 'OneDrive User',
      email: 'user@outlook.com',
      provider: 'onedrive',
    }
  }
  return null
}
