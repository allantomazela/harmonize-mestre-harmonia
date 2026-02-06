import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  FolderInput,
  Usb,
  UploadCloud,
  HardDrive,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { DriveExplorer } from '@/components/settings/drive-explorer'
import { cn } from '@/lib/utils'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGoogleDrive } from '@/hooks/use-google-drive'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type ImportSource = 'drive' | 'local' | 'usb' | null

interface ImportMusicDialogProps {
  isOpen: boolean
  onClose: () => void
  initialSource?: ImportSource
}

export function ImportMusicDialog({
  isOpen,
  onClose,
  initialSource = null,
}: ImportMusicDialogProps) {
  const [selectedSource, setSelectedSource] = useState<ImportSource>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { importLocalFiles, downloadProgress } = useAudioPlayer()
  const { isConfigured, error: driveError } = useGoogleDrive()

  const isImporting = downloadProgress['importing-local'] !== undefined

  // Handle initial source from props
  useEffect(() => {
    if (isOpen) {
      if (initialSource === 'drive') {
        setSelectedSource('drive')
      } else if (initialSource === 'local' || initialSource === 'usb') {
        // Allow content to mount before clicking
        setTimeout(() => {
          if (fileInputRef.current) {
            fileInputRef.current.click()
          }
        }, 100)
        setSelectedSource(null)
      } else {
        setSelectedSource(null)
      }
    } else {
      // Reset when closed
      setTimeout(() => setSelectedSource(null), 300)
    }
  }, [isOpen, initialSource])

  const handleSourceSelect = (source: ImportSource) => {
    if (source === 'drive') {
      // Always allow selection, DriveExplorer handles error/auth state
      setSelectedSource('drive')
      return
    }

    if (source === 'local' || source === 'usb') {
      // Trigger file input
      if (fileInputRef.current) {
        fileInputRef.current.click()
      }
    } else {
      setSelectedSource(source)
    }
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files
    if (files && files.length > 0) {
      await importLocalFiles(files)
      onClose()
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const renderSourceCard = (
    id: ImportSource,
    icon: React.ReactNode,
    title: string,
    description: string,
    colorClass: string,
    disabled: boolean = false,
  ) => {
    const content = (
      <button
        onClick={() => handleSourceSelect(id)}
        className={cn(
          'flex flex-col items-center justify-center p-6 rounded-xl border bg-white/5 transition-all group relative overflow-hidden w-full text-left',
          disabled
            ? 'opacity-70 border-destructive/20 bg-destructive/5'
            : 'border-white/10 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:border-white/20',
        )}
      >
        <div
          className={cn(
            'p-4 rounded-full bg-black/40 mb-4 transition-transform shadow-lg relative',
            !disabled && 'group-hover:scale-110',
            colorClass,
          )}
        >
          {icon}
          {disabled && (
            <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 border border-black">
              <AlertCircle className="w-3 h-3" />
            </div>
          )}
        </div>
        <h3 className="text-lg font-bold mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground text-center">
          {description}
        </p>

        {!disabled && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        )}
      </button>
    )

    if (disabled) {
      // Even if "disabled" visually, we allow click to show the error view in Explorer
      // But for local/usb we might not have a view.
      // For Drive, we now allow clicking through to see the error.
      // So 'disabled' prop is mostly for styling here.
      return <div className="w-full">{content}</div>
    }

    return content
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[600px] flex flex-col p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-white/10 shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-white/5 bg-black/20">
          <div className="flex items-center gap-2">
            {selectedSource && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 mr-2 rounded-full"
                onClick={() => setSelectedSource(null)}
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </Button>
            )}
            <DialogTitle className="text-xl font-bold tracking-tight">
              {selectedSource === 'drive' ? 'Google Drive' : 'Importar Músicas'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {selectedSource === 'drive'
              ? 'Navegue e baixe faixas diretamente para sua biblioteca offline.'
              : 'Escolha uma fonte para adicionar músicas à sua coleção.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative">
          {isImporting && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 animate-fade-in">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="font-bold text-lg animate-pulse">
                Importando arquivos...
              </p>
            </div>
          )}

          {selectedSource === 'drive' ? (
            <div className="h-full p-4">
              <ScrollArea className="h-full">
                <DriveExplorer />
              </ScrollArea>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-8 h-full place-content-center">
              {renderSourceCard(
                'drive',
                <UploadCloud className="w-8 h-8" />,
                'Google Drive',
                isConfigured
                  ? 'Conecte sua conta para baixar arquivos.'
                  : 'Configuração Necessária',
                isConfigured
                  ? 'text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                  : 'text-destructive',
                !isConfigured, // Visually indicates issue, but still clickable
              )}
              {renderSourceCard(
                'local',
                <HardDrive className="w-8 h-8" />,
                'Pasta Local',
                'Selecione uma pasta do seu dispositivo.',
                'text-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.3)]',
              )}
              {renderSourceCard(
                'usb',
                <Usb className="w-8 h-8" />,
                'Dispositivo USB',
                'Importe de um armazenamento conectado.',
                'text-primary shadow-[0_0_15px_hsl(var(--primary)/0.3)]',
              )}
            </div>
          )}
        </div>

        {/* Hidden File Input for Local/USB */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          // @ts-expect-error webkitdirectory is non-standard but supported in most modern browsers
          webkitdirectory=""
          onChange={handleFileChange}
        />
      </DialogContent>
    </Dialog>
  )
}
