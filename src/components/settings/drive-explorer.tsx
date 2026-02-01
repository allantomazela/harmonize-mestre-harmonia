import { useEffect, useState } from 'react'
import { useGoogleDrive } from '@/hooks/use-google-drive'
import { GDriveFile } from '@/lib/google-drive'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function DriveExplorer() {
  const {
    isAuthenticated,
    login,
    logout,
    user,
    listFiles,
    currentPath,
    navigateToFolder,
    isLoading,
    syncFolder,
  } = useGoogleDrive()

  const [files, setFiles] = useState<GDriveFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [syncedFolders, setSyncedFolders] = useState<Set<string>>(new Set())

  // Load files when path changes
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingFiles(true)
      const currentFolder = currentPath[currentPath.length - 1]
      listFiles(currentFolder?.id || 'root').then((data) => {
        setFiles(data)
        setLoadingFiles(false)
      })
    }
  }, [isAuthenticated, currentPath, listFiles])

  const handleSyncToggle = (e: React.MouseEvent, folder: GDriveFile) => {
    e.stopPropagation()
    // Logic: In this demo, sync implies importing metadata.
    // Ideally we would un-sync (delete tracks) too, but let's stick to import.
    syncFolder(folder.id, folder.name)
    setSyncedFolders((prev) => {
      const next = new Set(prev)
      next.add(folder.id)
      return next
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-secondary/5 space-y-6">
        <div className="p-4 bg-primary/10 rounded-full">
          <Cloud className="w-12 h-12 text-primary" />
        </div>
        <div className="text-center space-y-2 max-w-sm">
          <h3 className="text-lg font-bold">Conectar ao Google Drive</h3>
          <p className="text-muted-foreground text-sm">
            Autentique-se para acessar suas músicas reais na nuvem. Nenhum
            arquivo será excluído do seu Drive.
          </p>
        </div>

        <Alert className="bg-blue-500/10 border-blue-500/20 max-w-md text-blue-700 dark:text-blue-300">
          <Info className="h-4 w-4" />
          <AlertTitle>Configuração Necessária</AlertTitle>
          <AlertDescription className="text-xs">
            Certifique-se de que o Client ID do Google Cloud está configurado no
            arquivo .env (VITE_GOOGLE_CLIENT_ID).
          </AlertDescription>
        </Alert>

        <Button
          onClick={login}
          disabled={isLoading}
          className="gap-2 w-full max-w-xs h-10"
        >
          {isLoading ? (
            'Carregando...'
          ) : (
            <>
              <img
                src="https://img.usecurling.com/i?q=google&shape=fill"
                className="w-4 h-4"
                alt="Google"
              />
              Entrar com Google
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 border rounded-lg overflow-hidden bg-card animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b bg-muted/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-primary/20">
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
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              {user?.email}
              <span className="flex items-center text-green-600 dark:text-green-400 font-medium text-[10px] bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/20">
                Connected
              </span>
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
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
          {loadingFiles ? (
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
              const isFolder =
                file.mimeType === 'application/vnd.google-apps.folder'
              const isSynced = syncedFolders.has(file.id)

              return (
                <div
                  key={file.id}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer border border-transparent',
                    isFolder
                      ? 'hover:bg-blue-50 dark:hover:bg-blue-900/10'
                      : 'hover:bg-secondary/20',
                  )}
                  onClick={() => {
                    if (isFolder) navigateToFolder(file)
                  }}
                >
                  <div
                    className={cn(
                      'h-10 w-10 flex items-center justify-center rounded-lg shadow-sm',
                      isFolder
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
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
                      variant={isSynced ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn(
                        'gap-2 h-8',
                        isSynced &&
                          'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400',
                      )}
                      onClick={(e) => handleSyncToggle(e, file)}
                      disabled={isLoading}
                    >
                      {isLoading && isSynced ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                      {isSynced ? 'Indexado' : 'Sincronizar'}
                    </Button>
                  )}
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Folder className="w-12 h-12 opacity-20 mb-2" />
              <p>Esta pasta está vazia</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 bg-muted/20 border-t text-xs text-center text-muted-foreground">
        Dica: Clique em "Sincronizar" numa pasta para importar todas as músicas
        contidas nela (incluindo subpastas).
      </div>
    </div>
  )
}
