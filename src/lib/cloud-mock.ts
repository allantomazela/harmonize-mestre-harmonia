import { Playlist, EffectPreset } from './storage'
import { Track } from '@/hooks/use-audio-player-context'

// Types for Cloud Data
export interface CloudData {
  playlists: Playlist[]
  queue: Track[]
  settings: {
    volume: number
    effects: any
    theme: 'dark' | 'light' | 'system'
  }
  updatedAt: number
}

const CLOUD_STORAGE_KEY = 'harmonize_cloud_data'
const NETWORK_DELAY = 800 // ms

// Helper to get data from "Cloud"
export const fetchCloudData = async (): Promise<CloudData | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = localStorage.getItem(CLOUD_STORAGE_KEY)
      resolve(data ? JSON.parse(data) : null)
    }, NETWORK_DELAY)
  })
}

// Helper to save data to "Cloud"
export const saveCloudData = async (
  data: Partial<CloudData>,
): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const current = localStorage.getItem(CLOUD_STORAGE_KEY)
      const currentData = current ? JSON.parse(current) : {}

      const newData = {
        ...currentData,
        ...data,
        updatedAt: Date.now(),
      }

      localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(newData))
      resolve()
    }, NETWORK_DELAY)
  })
}

// Check if online
export const isOnline = () =>
  typeof navigator !== 'undefined' && navigator.onLine
