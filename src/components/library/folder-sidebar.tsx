import { useState } from 'react'
import { Folder } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Folder as FolderIcon,
  FolderPlus,
  Trash2,
  ChevronRight,
  Music,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

interface FolderSidebarProps {
  folders: Folder[]
  currentFolderId: string | null
  onSelectFolder: (id: string | null) => void
  onCreateFolder: (name: string) => void
  onDeleteFolder: (id: string) => void
}

export function FolderSidebar({
  folders,
  currentFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
}: FolderSidebarProps) {
  const [newFolderName, setNewFolderName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const handleCreate = () => {
    if (!newFolderName.trim()) return
    onCreateFolder(newFolderName)
    setNewFolderName('')
    setIsCreating(false)
    toast({
      title: 'Pasta Criada',
      description: `Pasta "${newFolderName}" criada com sucesso.`,
    })
  }

  return (
    <div className="w-full md:w-64 flex flex-col gap-4 h-full border-r border-border pr-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Pastas</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCreating(!isCreating)}
          title="Nova Pasta"
        >
          <FolderPlus className="w-5 h-5 text-primary" />
        </Button>
      </div>

      {isCreating && (
        <div className="flex gap-2 animate-fade-in-down">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nome da pasta..."
            className="h-8 text-sm"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Button size="sm" onClick={handleCreate}>
            OK
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1 -mr-2 pr-2">
        <div className="space-y-1">
          <Button
            variant={currentFolderId === null ? 'secondary' : 'ghost'}
            className="w-full justify-start font-normal"
            onClick={() => onSelectFolder(null)}
          >
            <Music className="w-4 h-4 mr-2" />
            Todas as Músicas
          </Button>

          {folders.map((folder) => (
            <div
              key={folder.id}
              className={cn(
                'group flex items-center justify-between rounded-md px-2 py-1 transition-colors hover:bg-secondary/10',
                currentFolderId === folder.id && 'bg-secondary/20',
              )}
            >
              <button
                className="flex items-center flex-1 overflow-hidden py-1.5"
                onClick={() => onSelectFolder(folder.id)}
              >
                <FolderIcon
                  className={cn(
                    'w-4 h-4 mr-2 shrink-0 transition-colors',
                    currentFolderId === folder.id
                      ? 'text-primary fill-primary/20'
                      : 'text-muted-foreground',
                  )}
                />
                <span className="truncate text-sm font-medium">
                  {folder.name}
                </span>
              </button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Pasta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Isso excluirá a pasta "{folder.name}". As músicas contidas
                      nela não serão apagadas, apenas removidas desta
                      organização.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteFolder(folder.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
