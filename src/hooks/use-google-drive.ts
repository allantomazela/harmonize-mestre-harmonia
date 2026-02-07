import { useState, useEffect, useCallback, useRef } from 'react'
import {
  loadGoogleScripts,
  initializeGapiClient,
  initializeTokenClient,
  handleAuthClick,
  handleSignOut,
  listDriveFiles,
  scanFolderForAudio,
  hasGoogleCredentials,
  GDriveFile,
} from '@/lib/google-drive'
import { saveTrack, getAllTracks } from '@/lib/storage'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { useToast } from '@/hooks/use-toast'

export interface GoogleUser {
  name: string
  email: string
  avatar: string
}

const parseMetadataFromFilename = (filename: string) => {
  const cleanName = filename.replace(/\.[^/.]+$/, '')
  const regex = /^(.+?)\s-\s(.+)$/
  const match = cleanName.match(regex)

  if (match) {
    return {
      composer: match[1].trim(),
      title: match[2].trim(),
    }
  }

  return {
    composer: 'Importado do Drive',
    title: cleanName,
  }
}

export function useGoogleDrive() {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isConfigured, setIsConfigured] = useState(true)
  const [user, setUser] = useState<GoogleUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPath, setCurrentPath] = useState<GDriveFile[]>([])
  const [error, setError] = useState<string | null>(null)

  // Use refs to prevent async state updates on unmounted component
  const isMounted = useRef(false)

  const { refreshLibrary, setIsSyncing } = useAudioPlayer()
  const { toast } = useToast()

  useEffect(() => {
    isMounted.current = true

    // Check local storage for previous connection
    const wasConnected = localStorage.getItem('gdrive_connected') === 'true'
    if (wasConnected) {
      setIsAuthenticated(true)
    }

    if (!hasGoogleCredentials()) {
      setError('VITE_GOOGLE_CLIENT_ID ou VITE_GOOGLE_API_KEY ausentes.')
      setIsConfigured(false)
      return () => {
        isMounted.current = false
      }
    }

    const initScripts = async () => {
      try {
        loadGoogleScripts(
          async () => {
            if (!isMounted.current) return
            try {
              await initializeGapiClient()
              if (wasConnected && isMounted.current) {
                // If we were connected, try to fetch user info to confirm session
                fetchUserInfo()
              }
            } catch (err: any) {
              console.error('GAPI Init Error', err)
              if (isMounted.current)
                setError(err.message || 'Falha ao inicializar GAPI')
            }
          },
          () => {
            if (!isMounted.current) return
            try {
              initializeTokenClient((response) => {
                if (response && response.access_token && isMounted.current) {
                  setIsAuthenticated(true)
                  fetchUserInfo()
                  localStorage.setItem('gdrive_connected', 'true')
                }
              })
              if (isMounted.current) setIsScriptLoaded(true)
            } catch (err: any) {
              console.error('GIS Init Error', err)
              if (isMounted.current)
                setError(err.message || 'Falha ao inicializar GIS')
            }
          },
        )
      } catch (e) {
        console.error('Script load error', e)
      }
    }

    initScripts()

    return () => {
      isMounted.current = false
    }
  }, [])

  const fetchUserInfo = async () => {
    if (!window.gapi?.client?.drive) return

    try {
      const response = await window.gapi.client.drive.about.get({
        fields: 'user',
      })
      if (isMounted.current && response.result.user) {
        const driveUser = response.result.user
        setUser({
          name: driveUser.displayName || 'Usuário Google',
          email: driveUser.emailAddress || '',
          avatar: driveUser.photoLink || '',
        })
      }
    } catch (e) {
      console.warn('Failed to fetch user info', e)
    }
  }

  const login = useCallback(() => {
    if (!isConfigured || error) {
      toast({
        variant: 'destructive',
        title: 'Erro de Configuração',
        description: 'Credenciais do Google Drive não configuradas.',
      })
      return
    }
    if (!isScriptLoaded) {
      toast({
        title: 'Inicializando...',
        description: 'Aguarde o carregamento dos serviços do Google.',
      })
      return
    }

    try {
      handleAuthClick()
    } catch (e) {
      console.error('Auth click error', e)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível abrir a janela de autenticação.',
      })
    }
  }, [isConfigured, error, isScriptLoaded, toast])

  const logout = useCallback(() => {
    handleSignOut()
    if (isMounted.current) {
      setIsAuthenticated(false)
      setUser(null)
    }
    localStorage.removeItem('gdrive_connected')
    toast({
      title: 'Desconectado',
      description: 'Conta do Google Drive desconectada.',
    })
  }, [toast])

  const listFiles = useCallback(
    async (folderId: string = 'root') => {
      if (error || !isConfigured) return []
      setIsLoading(true)
      try {
        const files = await listDriveFiles(folderId)
        if (isMounted.current) setIsLoading(false)
        return files
      } catch (e) {
        console.error(e)
        if (isMounted.current) setIsLoading(false)
        toast({
          variant: 'destructive',
          title: 'Erro ao listar arquivos',
          description: 'Verifique sua conexão ou permissões.',
        })
        return []
      }
    },
    [toast, error, isConfigured],
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
      if (error || !isConfigured) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Serviço não inicializado corretamente.',
        })
        return
      }

      setIsSyncing(true)
      setIsLoading(true)

      toast({
        title: 'Sincronização Iniciada',
        description: `Buscando arquivos em "${folderName}"...`,
      })

      let newCount = 0
      let updatedCount = 0
      let duplicates = 0

      try {
        const localTracks = await getAllTracks()
        const localMap = new Map(
          localTracks.filter((t) => t.gdriveId).map((t) => [t.gdriveId, t]),
        )

        const files = await scanFolderForAudio(folderId)

        for (const file of files) {
          const { composer, title } = parseMetadataFromFilename(file.name)
          const durationSec = file.durationMillis
            ? parseInt(file.durationMillis) / 1000
            : 0
          const durationStr =
            durationSec > 0
              ? `${Math.floor(durationSec / 60)}:${Math.floor(durationSec % 60)
                  .toString()
                  .padStart(2, '0')}`
              : '0:00'

          const fileSize = file.size ? parseInt(file.size) : 0
          const modifiedTime = file.modifiedTime
            ? new Date(file.modifiedTime).getTime()
            : 0

          if (localMap.has(file.id)) {
            const existing = localMap.get(file.id)!
            if (modifiedTime > (existing.updatedAt || existing.addedAt)) {
              await saveTrack({
                ...existing,
                title,
                composer,
                duration: durationStr,
                size: fileSize,
                updatedAt: Date.now(),
              })
              updatedCount++
            } else {
              duplicates++
            }
          } else {
            await saveTrack({
              id: `gdrive-${file.id}`,
              gdriveId: file.id,
              title,
              composer,
              duration: durationStr,
              addedAt: Date.now(),
              updatedAt: Date.now(),
              size: fileSize,
              degree: 'Geral',
              ritual: 'Geral',
              genre: 'Google Drive',
            })
            newCount++
          }
        }

        await refreshLibrary()

        let description = `${newCount} importados.`
        if (updatedCount > 0) description += ` ${updatedCount} atualizados.`

        toast({
          title: 'Sincronização Concluída',
          description,
        })
      } catch (e) {
        console.error(e)
        toast({
          variant: 'destructive',
          title: 'Erro na Sincronização',
          description: 'Falha ao processar arquivos.',
        })
      } finally {
        if (isMounted.current) {
          setIsLoading(false)
          setIsSyncing(false)
        }
      }
    },
    [refreshLibrary, toast, setIsSyncing, error, isConfigured],
  )

  return {
    isAuthenticated,
    isConfigured,
    user,
    isLoading,
    login,
    logout,
    listFiles,
    currentPath,
    navigateToFolder,
    syncFolder,
    error,
  }
}
