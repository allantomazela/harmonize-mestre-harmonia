import { useState, useEffect, useCallback } from 'react'
import {
  loadGoogleScripts,
  initializeGapiClient,
  initializeTokenClient,
  handleAuthClick,
  handleSignOut,
  listDriveFiles,
  scanFolderForAudio,
  GDriveFile,
} from '@/lib/google-drive'
import { saveTrack } from '@/lib/storage'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { useToast } from '@/hooks/use-toast'

export interface GoogleUser {
  name: string
  email: string
  avatar: string
}

export function useGoogleDrive() {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<GoogleUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPath, setCurrentPath] = useState<GDriveFile[]>([])

  const { refreshLibrary } = useAudioPlayer()
  const { toast } = useToast()

  // Load Scripts on Mount
  useEffect(() => {
    loadGoogleScripts(
      async () => {
        // GAPI Loaded
        try {
          await initializeGapiClient()

          // Check if previously authorized (crude check via token presence logic or storage)
          // For simplicity in this flow, we rely on TokenClient callback for auth state
        } catch (error) {
          console.error('GAPI Init Error', error)
        }
      },
      () => {
        // GIS Loaded
        initializeTokenClient((response) => {
          if (response && response.access_token) {
            setIsAuthenticated(true)
            // Fetch basic profile info usually requires 'profile' scope or separate API
            // For now, we mock the user display or fetch via Drive 'about'
            fetchUserInfo()
          }
        })
        setIsScriptLoaded(true)
      },
    )
  }, [])

  const fetchUserInfo = async () => {
    try {
      const response = await window.gapi.client.drive.about.get({
        fields: 'user',
      })
      const driveUser = response.result.user
      setUser({
        name: driveUser.displayName,
        email: driveUser.emailAddress,
        avatar: driveUser.photoLink,
      })
      localStorage.setItem('gdrive_connected', 'true')
    } catch (e) {
      console.warn('Failed to fetch user info', e)
    }
  }

  const login = () => {
    if (!isScriptLoaded) {
      toast({
        variant: 'destructive',
        title: 'Serviço Indisponível',
        description: 'Os scripts do Google ainda não foram carregados.',
      })
      return
    }
    handleAuthClick()
  }

  const logout = () => {
    handleSignOut()
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('gdrive_connected')
    toast({
      title: 'Desconectado',
      description: 'Conta do Google Drive desconectada.',
    })
  }

  const listFiles = useCallback(
    async (folderId: string = 'root') => {
      setIsLoading(true)
      try {
        const files = await listDriveFiles(folderId)
        setIsLoading(false)
        return files
      } catch (e) {
        console.error(e)
        setIsLoading(false)
        toast({
          variant: 'destructive',
          title: 'Erro ao listar arquivos',
          description: 'Verifique sua conexão ou permissões.',
        })
        return []
      }
    },
    [toast],
  )

  const navigateToFolder = (folder: GDriveFile | null) => {
    if (!folder) {
      setCurrentPath([])
    } else {
      const index = currentPath.findIndex((f) => f.id === folder.id)
      if (index !== -1) {
        setCurrentPath((prev) => prev.slice(0, index + 1))
      } else {
        setCurrentPath((prev) => [...prev, folder])
      }
    }
  }

  const syncFolder = useCallback(
    async (folderId: string, folderName: string) => {
      setIsLoading(true)
      let count = 0
      try {
        const files = await scanFolderForAudio(folderId)

        for (const file of files) {
          // Parse metadata if available, otherwise default
          const durationSec = file.durationMillis
            ? parseInt(file.durationMillis) / 1000
            : 0
          const durationStr =
            durationSec > 0
              ? `${Math.floor(durationSec / 60)}:${Math.floor(durationSec % 60)
                  .toString()
                  .padStart(2, '0')}`
              : '0:00'

          await saveTrack({
            id: `gdrive-${file.id}`,
            gdriveId: file.id,
            title: file.name.replace(/\.[^/.]+$/, ''),
            composer: 'Importado do Drive', // Metadata API limited without extra logic
            duration: durationStr,
            addedAt: Date.now(),
            folderId: undefined, // Or we could create a local folder for it
            degree: 'Geral',
            ritual: 'Geral',
            genre: 'Google Drive',
          })
          count++
        }

        await refreshLibrary()
        toast({
          title: 'Sincronização Concluída',
          description: `${count} faixas da pasta "${folderName}" foram indexadas.`,
        })
      } catch (e) {
        console.error(e)
        toast({
          variant: 'destructive',
          title: 'Erro na Sincronização',
          description: 'Falha ao processar arquivos da pasta.',
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
    syncFolder,
  }
}
