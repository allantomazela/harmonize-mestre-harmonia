import { useState, useCallback } from 'react'
import {
  CloudProvider,
  CloudFile,
  CloudUser,
  listCloudFiles,
  scanCloudFolder,
  getCloudUser,
} from '@/lib/cloud-services'
import { useGoogleDrive } from './use-google-drive'
import { useAudioPlayer } from './use-audio-player-context'
import { useToast } from './use-toast'
import { saveTrack, getAllTracks } from '@/lib/storage'

export function useCloudStorage() {
  const [activeProvider, setActiveProvider] = useState<CloudProvider>('google')
  const [currentPath, setCurrentPath] = useState<CloudFile[]>([])
  const [files, setFiles] = useState<CloudFile[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Specific Google Hook
  const googleDrive = useGoogleDrive()

  const { refreshLibrary, setIsSyncing } = useAudioPlayer()
  const { toast } = useToast()

  // Mock Authentication States for other providers
  const [isDropboxConnected, setIsDropboxConnected] = useState(
    () => !!localStorage.getItem('dropbox_connected'),
  )
  const [isOnedriveConnected, setIsOnedriveConnected] = useState(
    () => !!localStorage.getItem('onedrive_connected'),
  )

  const connectProvider = async (provider: CloudProvider) => {
    if (provider === 'google') {
      googleDrive.login()
    } else if (provider === 'dropbox') {
      setIsLoading(true)
      setTimeout(() => {
        localStorage.setItem('dropbox_connected', 'true')
        setIsDropboxConnected(true)
        setIsLoading(false)
        toast({
          title: 'Dropbox Conectado',
          description: 'Acesso concedido com sucesso.',
        })
      }, 1000)
    } else if (provider === 'onedrive') {
      setIsLoading(true)
      setTimeout(() => {
        localStorage.setItem('onedrive_connected', 'true')
        setIsOnedriveConnected(true)
        setIsLoading(false)
        toast({
          title: 'OneDrive Conectado',
          description: 'Acesso concedido com sucesso.',
        })
      }, 1000)
    }
  }

  const disconnectProvider = (provider: CloudProvider) => {
    if (provider === 'google') {
      googleDrive.logout()
    } else if (provider === 'dropbox') {
      localStorage.removeItem('dropbox_connected')
      setIsDropboxConnected(false)
    } else if (provider === 'onedrive') {
      localStorage.removeItem('onedrive_connected')
      setIsOnedriveConnected(false)
    }
    toast({ title: 'Desconectado', description: `${provider} desconectado.` })
  }

  const isConnected = (provider: CloudProvider) => {
    if (provider === 'google') return googleDrive.isAuthenticated
    if (provider === 'dropbox') return isDropboxConnected
    if (provider === 'onedrive') return isOnedriveConnected
    return false
  }

  const listProviderFiles = useCallback(
    async (folderId: string = 'root') => {
      setIsLoading(true)
      try {
        const data = await listCloudFiles(activeProvider, folderId)
        setFiles(data)
      } catch (e) {
        console.error(e)
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Falha ao listar arquivos.',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [activeProvider, toast],
  )

  const navigateToFolder = (folder: CloudFile | null) => {
    if (!folder) {
      setCurrentPath([])
      listProviderFiles('root')
    } else {
      const index = currentPath.findIndex((f) => f.id === folder.id)
      let newPath
      if (index !== -1) {
        newPath = currentPath.slice(0, index + 1)
      } else {
        newPath = [...currentPath, folder]
      }
      setCurrentPath(newPath)
      listProviderFiles(folder.id)
    }
  }

  const syncCloudFolder = async (folder: CloudFile) => {
    setIsSyncing(true)
    toast({
      title: 'Sincronizando...',
      description: `Importando de ${folder.provider}`,
    })

    try {
      const files = await scanCloudFolder(folder.provider, folder.id)
      let count = 0

      for (const file of files) {
        // Parse metadata (simplified)
        const nameParts = file.name.replace(/\.[^/.]+$/, '').split('-')
        const composer =
          nameParts.length > 1 ? nameParts[0].trim() : 'Desconhecido'
        const title =
          nameParts.length > 1 ? nameParts[1].trim() : nameParts[0].trim()

        const trackId = `${folder.provider}-${file.id}`

        await saveTrack({
          id: trackId,
          title,
          composer,
          duration: '0:00', // Mock/Unknown duration for non-google providers without metadata
          addedAt: Date.now(),
          cloudProvider: folder.provider,
          gdriveId: folder.provider === 'google' ? file.id : undefined,
          dropboxId: folder.provider === 'dropbox' ? file.id : undefined,
          onedriveId: folder.provider === 'onedrive' ? file.id : undefined,
          isLocal: true, // It is a local reference
          offlineAvailable: false, // Default not downloaded
        })
        count++
      }
      await refreshLibrary()
      toast({ title: 'Sucesso', description: `${count} faixas importadas.` })
    } catch (e) {
      console.error(e)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha na sincronização.',
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return {
    activeProvider,
    setActiveProvider,
    files,
    currentPath,
    isLoading,
    connectProvider,
    disconnectProvider,
    isConnected,
    navigateToFolder,
    listProviderFiles,
    syncCloudFolder,
    googleUser: googleDrive.user,
  }
}
