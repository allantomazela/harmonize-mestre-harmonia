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
import { saveTrack, getAllTracks, LocalTrack } from '@/lib/storage'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { useToast } from '@/hooks/use-toast'

export interface GoogleUser {
  name: string
  email: string
  avatar: string
}

// Helper to parse filename "Artist - Title.mp3"
const parseMetadataFromFilename = (filename: string) => {
  const cleanName = filename.replace(/\.[^/.]+$/, '') // Remove extension
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
  const [user, setUser] = useState<GoogleUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPath, setCurrentPath] = useState<GDriveFile[]>([])

  const { refreshLibrary, setIsSyncing } = useAudioPlayer()
  const { toast } = useToast()

  // Load Scripts on Mount
  useEffect(() => {
    loadGoogleScripts(
      async () => {
        // GAPI Loaded
        try {
          await initializeGapiClient()
        } catch (error) {
          console.error('GAPI Init Error', error)
        }
      },
      () => {
        // GIS Loaded
        initializeTokenClient((response) => {
          if (response && response.access_token) {
            setIsAuthenticated(true)
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
      setIsSyncing(true)
      setIsLoading(true)

      toast({
        title: 'Sincronização Iniciada',
        description: `Buscando arquivos em "${folderName}" e subpastas...`,
      })

      let newCount = 0
      let updatedCount = 0
      let duplicates = 0

      try {
        // 1. Fetch current local library to check for duplicates/updates
        const localTracks = await getAllTracks()
        const localMap = new Map(
          localTracks.filter((t) => t.gdriveId).map((t) => [t.gdriveId, t]),
        )

        // 2. Scan Google Drive recursively
        const files = await scanFolderForAudio(folderId)

        for (const file of files) {
          const { composer, title } = parseMetadataFromFilename(file.name)

          // Metadata Parsing
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

          // 3. Conflict Resolution
          if (localMap.has(file.id)) {
            const existing = localMap.get(file.id)!

            // Check if file on Drive is newer than our local metadata update
            if (modifiedTime > (existing.updatedAt || existing.addedAt)) {
              // Update logic
              await saveTrack({
                ...existing,
                title,
                composer,
                duration: durationStr,
                size: fileSize,
                updatedAt: Date.now(),
                // Keep user preferences like ritual/degree
              })
              updatedCount++
            } else {
              // Exact match or older, skip
              duplicates++
            }
          } else {
            // New File
            await saveTrack({
              id: `gdrive-${file.id}`,
              gdriveId: file.id,
              title,
              composer, // Parsed from filename
              duration: durationStr,
              addedAt: Date.now(),
              updatedAt: Date.now(),
              size: fileSize,
              folderId: undefined,
              degree: 'Geral',
              ritual: 'Geral',
              genre: 'Google Drive', // Fallback genre
            })
            newCount++
          }
        }

        await refreshLibrary()

        let description = `${newCount} novos arquivos importados.`
        if (updatedCount > 0) description += ` ${updatedCount} atualizados.`
        if (duplicates > 0)
          description += ` ${duplicates} já existentes ignorados.`

        toast({
          title: 'Sincronização Concluída',
          description,
          variant: newCount > 0 || updatedCount > 0 ? 'default' : 'default', // could use different variant
        })
      } catch (e) {
        console.error(e)
        toast({
          variant: 'destructive',
          title: 'Erro na Sincronização',
          description: 'Falha ao processar arquivos. Tente novamente.',
        })
      } finally {
        setIsLoading(false)
        setIsSyncing(false)
      }
    },
    [refreshLibrary, toast, setIsSyncing],
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
