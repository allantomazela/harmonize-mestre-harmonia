import { useState, useCallback } from 'react'
import { mockDriveFiles, DriveFile } from '@/lib/mock-drive-data'
import { saveTrack } from '@/lib/storage'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { useToast } from '@/hooks/use-toast'

export interface GoogleUser {
  name: string
  email: string
  avatar: string
}

export function useGoogleDrive() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('gdrive_connected') === 'true'
  })
  const [user, setUser] = useState<GoogleUser | null>(() => {
    const saved = localStorage.getItem('gdrive_user')
    return saved ? JSON.parse(saved) : null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentPath, setCurrentPath] = useState<DriveFile[]>([]) // Breadcrumbs (folders)
  const { refreshLibrary } = useAudioPlayer()
  const { toast } = useToast()

  const login = useCallback(async () => {
    setIsLoading(true)
    // Simulate OAuth Popup
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const mockUser = {
          name: 'Irmão Admin',
          email: 'admin@lojamaconica.com.br',
          avatar:
            'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=42',
        }
        setIsAuthenticated(true)
        setUser(mockUser)
        localStorage.setItem('gdrive_connected', 'true')
        localStorage.setItem('gdrive_user', JSON.stringify(mockUser))
        setIsLoading(false)
        toast({
          title: 'Google Drive Conectado',
          description: `Conectado como ${mockUser.email}`,
        })
        resolve()
      }, 1500)
    })
  }, [toast])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    setUser(null)
    setCurrentPath([])
    localStorage.removeItem('gdrive_connected')
    localStorage.removeItem('gdrive_user')
    toast({
      title: 'Desconectado',
      description: 'A conta do Google Drive foi desconectada.',
    })
  }, [toast])

  const listFiles = useCallback((folderId?: string) => {
    // Simulate API delay
    return new Promise<DriveFile[]>((resolve) => {
      setTimeout(() => {
        const files = mockDriveFiles.filter((f) => {
          if (!folderId) return !f.parentId // Root files
          return f.parentId === folderId
        })
        resolve(files)
      }, 500)
    })
  }, [])

  const navigateToFolder = (folder: DriveFile | null) => {
    if (!folder) {
      setCurrentPath([])
    } else {
      // Check if we are going back or deeper
      const index = currentPath.findIndex((f) => f.id === folder.id)
      if (index !== -1) {
        setCurrentPath((prev) => prev.slice(0, index + 1))
      } else {
        setCurrentPath((prev) => [...prev, folder])
      }
    }
  }

  const downloadFiles = useCallback(
    async (files: DriveFile[]) => {
      setIsLoading(true)
      let successCount = 0

      try {
        for (const file of files) {
          if (file.mimeType.includes('folder')) continue

          // Simulate download by fetching the URL
          if (file.url) {
            const response = await fetch(file.url)
            const blob = await response.blob()

            await saveTrack({
              id: `gdrive-${file.id}-${Date.now()}`,
              title: file.name.replace(/\.[^/.]+$/, ''),
              composer: file.artist || 'Desconhecido',
              album: file.album,
              duration: file.duration || '0:00',
              file: blob,
              addedAt: Date.now(),
              degree: 'Geral',
              ritual: 'Geral',
              genre: 'Importado',
              tone: 'N/A',
            })
            successCount++
          }
        }

        await refreshLibrary()
        toast({
          title: 'Download Concluído',
          description: `${successCount} arquivos foram importados para o acervo local.`,
        })
      } catch (error) {
        console.error(error)
        toast({
          variant: 'destructive',
          title: 'Erro no Download',
          description: 'Não foi possível baixar alguns arquivos.',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [refreshLibrary, toast],
  )

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    listFiles,
    currentPath,
    navigateToFolder,
    downloadFiles,
  }
}
