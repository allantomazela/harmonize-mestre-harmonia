import { useEffect, useState } from 'react'
import { useCloudStorage } from '@/hooks/use-cloud-storage'
import { CloudProvider, CloudFile } from '@/lib/cloud-services'
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
  Check,
  HardDrive,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function CloudExplorer() {
  const {
    activeProvider,
    setActiveProvider,
    isConnected,
    connectProvider,
    disconnectProvider,
    listProviderFiles,
    files,
    isLoading,
    currentPath,
    navigateToFolder,
    syncCloudFolder,
    googleUser,
  } = useCloudStorage()

  const { isSyncing } = useAudioPlayer()
  const [syncedFolderId, setSyncedFolderId] = useState<string | null>(null)

  useEffect(() => {
    if (isConnected(activeProvider)) {
      listProviderFiles(currentPath[currentPath.length - 1]?.id || 'root')
    }
  }, [activeProvider, currentPath, isConnected, listProviderFiles])

  const handleSyncToggle = async (e: React.MouseEvent, folder: CloudFile) => {
    e.stopPropagation()
    setSyncedFolderId(folder.id)
    await syncCloudFolder(folder)
    setSyncedFolderId(null)
  }

  if (!isConnected(activeProvider)) {
    return (
      <div className="space-y-4">
        <Tabs
          value={activeProvider}
          onValueChange={(v) => setActiveProvider(v as CloudProvider)}
          className="w-full"
        >
          <TabsList className="w-full">
            <TabsTrigger value="google" className="flex-1">
              Google Drive
            </TabsTrigger>
            <TabsTrigger value="dropbox" className="flex-1">
              Dropbox
            </TabsTrigger>
            <TabsTrigger value="onedrive" className="flex-1">
              OneDrive
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-lg bg-secondary/5 space-y-6 animate-fade-in">
          <div className="p-4 bg-primary/10 rounded-full">
            <Cloud className="w-12 h-12 text-primary" />
          </div>
          <div className="text-center space-y-2 max-w-sm">
            <h3 className="text-lg font-bold capitalize">
              Conectar ao {activeProvider}
            </h3>
            <p className="text-muted-foreground text-sm">
              Autentique-se para acessar seus arquivos.
            </p>
          </div>

          <Button
            onClick={() => connectProvider(activeProvider)}
            disabled={isLoading}
            className="gap-2 w-full max-w-xs h-10"
          >
            {isLoading ? 'Conectando...' : `Entrar com ${activeProvider}`}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 border rounded-lg overflow-hidden bg-card animate-fade-in">
      <Tabs
        value={activeProvider}
        onValueChange={(v) => {
          setActiveProvider(v as CloudProvider)
          navigateToFolder(null)
        }}
        className="w-full p-2 border-b"
      >
        <TabsList className="w-full bg-secondary">
          <TabsTrigger
            value="google"
            className="flex-1 data-[state=active]:bg-background"
          >
            Google Drive
          </TabsTrigger>
          <TabsTrigger
            value="dropbox"
            className="flex-1 data-[state=active]:bg-background"
          >
            Dropbox
          </TabsTrigger>
          <TabsTrigger
            value="onedrive"
            className="flex-1 data-[state=active]:bg-background"
          >
            OneDrive
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Header */}
      <div className="p-4 border-b bg-muted/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-primary/20 bg-primary/10 flex items-center justify-center">
            {activeProvider === 'google' && googleUser?.avatar ? (
              <img
                src={googleUser.avatar}
                className="w-full h-full object-cover"
              />
            ) : (
              <Cloud className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold capitalize">
              {activeProvider} Connected
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              {activeProvider === 'google' && googleUser?.email}
              <span className="flex items-center text-green-500 font-medium text-[10px]">
                Online
              </span>
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnectProvider(activeProvider)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
        >
          <LogOut className="w-4 h-4 mr-2" /> Desconectar
        </Button>
      </div>

      {/* Navigation Bar */}
      <div className="px-4 py-2 bg-secondary/10 border-b flex items-center justify-between">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => navigateToFolder(null)}
            disabled={currentPath.length === 0}
          >
            <Home className="w-4 h-4" />
          </Button>
          {currentPath.length > 0 && (
            <ChevronLeft className="w-4 h-4 text-muted-foreground mx-1" />
          )}
          <div className="flex items-center">
            {currentPath.map((folder, index) => (
              <div key={folder.id} className="flex items-center">
                {index > 0 && (
                  <span className="text-muted-foreground mx-1">/</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-7 px-2 font-normal max-w-[120px] truncate',
                    index === currentPath.length - 1 &&
                      'font-bold text-foreground bg-background shadow-sm',
                  )}
                  onClick={() => navigateToFolder(folder)}
                >
                  {folder.name}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* File List */}
      <ScrollArea className="h-[400px]">
        <div className="p-2 space-y-1">
          {isLoading ? (
            Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))
          ) : files.length > 0 ? (
            files.map((file) => {
              const isFolder = file.mimeType === 'folder'
              const isSyncingThis = syncedFolderId === file.id && isSyncing

              return (
                <div
                  key={file.id}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer border border-transparent',
                    isFolder ? 'hover:bg-primary/5' : 'hover:bg-secondary/20',
                  )}
                  onClick={() => {
                    if (isFolder) navigateToFolder(file)
                  }}
                >
                  <div
                    className={cn(
                      'h-10 w-10 flex items-center justify-center rounded-lg shadow-sm',
                      isFolder
                        ? 'bg-primary/10 text-primary'
                        : 'bg-secondary text-muted-foreground',
                    )}
                  >
                    {isFolder ? (
                      <Folder className="w-5 h-5 fill-current/20" />
                    ) : (
                      <FileAudio className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground flex gap-2">
                      {file.size
                        ? (parseInt(file.size) / 1024 / 1024).toFixed(1) + ' MB'
                        : isFolder
                          ? 'Pasta'
                          : 'Desconhecido'}
                    </p>
                  </div>

                  {isFolder && (
                    <Button
                      variant={isSyncingThis ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn(
                        'gap-2 h-8',
                        isSyncingThis &&
                          'bg-primary/10 text-primary border border-primary/20',
                      )}
                      onClick={(e) => handleSyncToggle(e, file)}
                      disabled={isSyncing}
                    >
                      {isSyncingThis ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />{' '}
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3" /> Sync
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Folder className="w-12 h-12 opacity-20 mb-2" />
              <p>Pasta vazia</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
