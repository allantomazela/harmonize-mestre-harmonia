import { useEffect, useState } from 'react'
import { useGoogleDrive } from '@/hooks/use-google-drive'
import { GDriveFile } from '@/lib/google-drive'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Folder,
  FileAudio,
  Cloud,
  ChevronLeft,
  Home,
  LogOut,
  RefreshCw,
  Info,
  Download,
  Check,
  Music,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { saveTrack } from '@/lib/storage'
import { toast } from '@/hooks/use-toast'

export function DriveExplorer() {
  const {
    isAuthenticated,
    login,
    logout,
    user,
    listFiles,
    currentPath,
    navigateToFolder,
    isLoading: isDriveLoading,
    syncFolder,
    error,
  } = useGoogleDrive()

  const {
    isSyncing,
    refreshLibrary,
    downloadTrackForOffline,
    downloadProgress,
  } = useAudioPlayer()

  const [files, setFiles] = useState<GDriveFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [importingIds, setImportingIds] = useState<Set<string>>(new Set())

  // Load files when path changes
  useEffect(() => {
    if (isAuthenticated && !error) {
      setLoadingFiles(true)
      const currentFolder = currentPath[currentPath.length - 1]
      listFiles(currentFolder?.id || 'root').then((data) => {
        setFiles(data)
        setLoadingFiles(false)
      })
    }
  }, [isAuthenticated, currentPath, listFiles, error])

  const handleSyncFolder = async (e: React.MouseEvent, folder: GDriveFile) => {
    e.stopPropagation()
    setImportingIds((prev) => new Set(prev).add(folder.id))
    await syncFolder(folder.id, folder.name)
    setImportingIds((prev) => {
      const next = new Set(prev)
      next.delete(folder.id)
      return next
    })
  }

  const handleImportFile = async (e: React.MouseEvent, file: GDriveFile) => {
    e.stopPropagation()
    if (importingIds.has(file.id)) return

    setImportingIds((prev) => new Set(prev).add(file.id))
    toast({
      title: 'Importando...',
      description: `Importando "${file.name}" para a biblioteca.`,
    })

    try {
      // Parse basic metadata
      const cleanName = file.name.replace(/\.[^/.]+$/, '')
      const regex = /^(.+?)\s-\s(.+)$/
      const match = cleanName.match(regex)
      const composer = match ? match[1].trim() : 'Importado do Drive'
      const title = match ? match[2].trim() : cleanName
      const durationSec = file.durationMillis
        ? parseInt(file.durationMillis) / 1000
        : 0
      const durationStr =
        durationSec > 0
          ? `${Math.floor(durationSec / 60)}:${Math.floor(durationSec % 60)
              .toString()
              .padStart(2, '0')}`
          : '0:00'

      const newTrack = {
        id: `gdrive-${file.id}`,
        gdriveId: file.id,
        title,
        composer,
        duration: durationStr,
        addedAt: Date.now(),
        updatedAt: Date.now(),
        size: file.size ? parseInt(file.size) : 0,
        cloudProvider: 'google' as const,
        degree: 'Geral',
        ritual: 'Geral',
        genre: 'Google Drive',
        offlineAvailable: false,
      }

      await saveTrack(newTrack)
      await refreshLibrary()

      // Immediately trigger download for offline use as per user story
      await downloadTrackForOffline(newTrack)
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao importar arquivo.',
      })
    } finally {
      setImportingIds((prev) => {
        const next = new Set(prev)
        next.delete(file.id)
        return next
      })
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-destructive/30 rounded-2xl bg-destructive/10 space-y-4 animate-fade-in h-full">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-destructive">
            Erro de Configuração
          </h3>
          <p className="text-sm text-destructive-foreground max-w-sm">
            {error}
          </p>
          <p className="text-xs text-muted-foreground">
            Verifique as chaves de API no arquivo .env
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/10 rounded-3xl bg-black/20 space-y-8 animate-fade-in h-full">
        <div className="p-6 bg-primary/10 rounded-full shadow-[0_0_30px_-10px_hsl(var(--primary))]">
          <img
            src="https://img.usecurling.com/i?q=google&shape=fill"
            className="w-16 h-16"
            alt="Google Drive"
          />
        </div>
        <div className="text-center space-y-3 max-w-md">
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Google Drive Import
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Conecte sua conta para navegar, importar e baixar suas músicas
            diretamente para uso offline.
          </p>
        </div>

        <Button
          onClick={login}
          disabled={isDriveLoading}
          className="gap-3 w-full max-w-xs h-12 text-base font-semibold shadow-lg hover:shadow-primary/25 transition-all"
        >
          {isDriveLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Conectar Google Drive'
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full space-y-4 border border-white/10 rounded-2xl overflow-hidden bg-black/40 backdrop-blur-md animate-fade-in shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary/20 shadow-glow-sm">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {user?.name?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{user?.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              {user?.email}
              <span className="inline-flex items-center text-[10px] text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full border border-green-400/20 font-medium">
                Connected
              </span>
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" /> Sair
        </Button>
      </div>

      {/* Navigation Bar */}
      <div className="px-4 py-3 bg-black/20 border-b border-white/5 flex items-center gap-2 shrink-0">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-lg shrink-0"
          onClick={() => navigateToFolder(null)}
          disabled={currentPath.length === 0}
        >
          <Home className="w-4 h-4" />
        </Button>

        {currentPath.length > 0 && (
          <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />
        )}

        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {currentPath.map((folder, index) => (
            <div
              key={folder.id}
              className="flex items-center whitespace-nowrap"
            >
              {index > 0 && (
                <span className="text-muted-foreground mx-1">/</span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 px-2 font-normal truncate max-w-[150px]',
                  index === currentPath.length - 1
                    ? 'font-bold text-white bg-white/10'
                    : 'text-muted-foreground',
                )}
                onClick={() => navigateToFolder(folder)}
              >
                {folder.name}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            {loadingFiles ? (
              Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))
            ) : files.length > 0 ? (
              files.map((file) => {
                const isFolder =
                  file.mimeType === 'application/vnd.google-apps.folder'
                const isProcessing =
                  importingIds.has(file.id) ||
                  downloadProgress[`gdrive-${file.id}`] !== undefined

                return (
                  <div
                    key={file.id}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer border border-transparent group',
                      isFolder
                        ? 'hover:bg-blue-500/10 hover:border-blue-500/20'
                        : 'hover:bg-white/5 hover:border-white/10',
                    )}
                    onClick={() => {
                      if (isFolder) navigateToFolder(file)
                    }}
                  >
                    <div
                      className={cn(
                        'h-10 w-10 flex items-center justify-center rounded-lg shadow-sm shrink-0 transition-transform group-hover:scale-105',
                        isFolder
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-orange-500/20 text-orange-400',
                      )}
                    >
                      {isFolder ? (
                        <Folder className="w-5 h-5 fill-current/30" />
                      ) : (
                        <Music className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium truncate',
                          isFolder ? 'text-blue-100' : 'text-zinc-200',
                        )}
                      >
                        {file.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {file.size
                          ? (parseInt(file.size) / 1024 / 1024).toFixed(1) +
                            ' MB'
                          : isFolder
                            ? 'Pasta'
                            : ''}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {isFolder ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            'gap-2 h-8 text-xs',
                            isProcessing && 'text-primary bg-primary/10',
                          )}
                          onClick={(e) => handleSyncFolder(e, file)}
                          disabled={isSyncing || isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              Syncing
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3" /> Sync
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          className={cn(
                            'gap-2 h-8 text-xs shadow-sm',
                            isProcessing
                              ? 'bg-green-500/20 text-green-500 border-green-500/30'
                              : 'hover:bg-primary hover:text-black',
                          )}
                          onClick={(e) => handleImportFile(e, file)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />{' '}
                              Baixando...
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3" /> Importar
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground h-full">
                <div className="p-4 bg-white/5 rounded-full mb-3">
                  <Folder className="w-8 h-8 opacity-30" />
                </div>
                <p>Esta pasta está vazia</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="p-3 bg-primary/5 border-t border-white/5 text-[10px] text-center text-primary/70 font-medium shrink-0">
        Arquivos de áudio importados serão baixados automaticamente para uso
        offline.
      </div>
    </div>
  )
}
