import { useEffect, useState } from 'react'
import { useGoogleDrive } from '@/hooks/use-google-drive'
import { DriveFile } from '@/lib/mock-drive-data'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Folder,
  FileAudio,
  Download,
  ChevronLeft,
  HardDrive,
  Home,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
    downloadFiles,
  } = useGoogleDrive()

  const [files, setFiles] = useState<DriveFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())

  // Load files when path changes
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingFiles(true)
      const currentFolder = currentPath[currentPath.length - 1]
      listFiles(currentFolder?.id).then((data) => {
        setFiles(data)
        setLoadingFiles(false)
        setSelectedFiles(new Set()) // Clear selection on navigate
      })
    }
  }, [isAuthenticated, currentPath, listFiles])

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedFiles)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedFiles(newSet)
  }

  const handleDownload = () => {
    const filesToDownload = files.filter((f) => selectedFiles.has(f.id))
    downloadFiles(filesToDownload)
    setSelectedFiles(new Set())
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-secondary/5">
        <div className="p-4 bg-primary/10 rounded-full mb-4">
          <HardDrive className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-lg font-bold mb-2">Conectar ao Google Drive</h3>
        <p className="text-center text-muted-foreground max-w-sm mb-6">
          Conecte sua conta para navegar e importar arquivos de música
          diretamente da nuvem para sua biblioteca local.
        </p>
        <Button onClick={login} disabled={isLoading} className="gap-2">
          {isLoading ? (
            'Conectando...'
          ) : (
            <>
              <img
                src="https://img.usecurling.com/i?q=google&shape=fill"
                className="w-4 h-4"
              />
              Entrar com Google
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="p-4 border-b bg-muted/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full overflow-hidden border">
            {user?.avatar && <img src={user.avatar} alt="Avatar" />}
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          Desconectar
        </Button>
      </div>

      {/* Navigation Bar */}
      <div className="px-4 py-2 bg-secondary/10 border-b flex items-center gap-2 overflow-x-auto">
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
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
        <div className="flex items-center gap-1 text-sm">
          {currentPath.map((folder, index) => (
            <div key={folder.id} className="flex items-center gap-1">
              {index > 0 && <span className="text-muted-foreground">/</span>}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 px-2 font-normal',
                  index === currentPath.length - 1 &&
                    'font-bold text-foreground',
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
      <ScrollArea className="h-[400px]">
        <div className="p-2 space-y-1">
          {loadingFiles ? (
            Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))
          ) : files.length > 0 ? (
            files.map((file) => {
              const isFolder = file.mimeType.includes('folder')
              const isSelected = selectedFiles.has(file.id)

              return (
                <div
                  key={file.id}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer border border-transparent',
                    isSelected
                      ? 'bg-primary/10 border-primary/30'
                      : 'hover:bg-secondary/10',
                  )}
                  onClick={() => {
                    if (isFolder) navigateToFolder(file)
                    else handleToggleSelect(file.id)
                  }}
                >
                  <div
                    className="flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!isFolder && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelect(file.id)}
                      />
                    )}
                  </div>

                  <div
                    className={cn(
                      'h-10 w-10 flex items-center justify-center rounded-md',
                      isFolder
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-orange-100 text-orange-600',
                    )}
                  >
                    {isFolder ? (
                      <Folder className="w-5 h-5" />
                    ) : (
                      <FileAudio className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground flex gap-2">
                      {isFolder
                        ? 'Pasta'
                        : `${file.size} • ${file.mimeType.split('/')[1].toUpperCase()}`}
                    </p>
                  </div>

                  {!isFolder && file.url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100"
                    >
                      <Download className="w-4 h-4 text-muted-foreground" />
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

      {/* Footer Actions */}
      <div className="p-4 border-t bg-muted/20 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {selectedFiles.size} arquivo(s) selecionado(s)
        </p>
        <Button
          onClick={handleDownload}
          disabled={selectedFiles.size === 0 || isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Baixar para Biblioteca
        </Button>
      </div>
    </div>
  )
}
