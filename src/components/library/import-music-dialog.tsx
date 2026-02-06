import { useState, useRef } from 'react'
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

interface ImportMusicDialogProps {
  isOpen: boolean
  onClose: () => void
}

type ImportSource = 'drive' | 'local' | 'usb' | null

export function ImportMusicDialog({ isOpen, onClose }: ImportMusicDialogProps) {
  const [selectedSource, setSelectedSource] = useState<ImportSource>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { importLocalFiles, downloadProgress } = useAudioPlayer()
  const { isConfigured, error: driveError } = useGoogleDrive()

  const isImporting = downloadProgress['importing-local'] !== undefined

  const handleSourceSelect = (source: ImportSource) => {
    if (!isConfigured && source === 'drive') return

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
        onClick={() => !disabled && handleSourceSelect(id)}
        disabled={disabled}
        className={cn(
          'flex flex-col items-center justify-center p-6 rounded-xl border bg-white/5 transition-all group relative overflow-hidden w-full text-left',
          disabled
            ? 'opacity-50 cursor-not-allowed border-white/5'
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
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">{content}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Service Unavailable: Missing API Keys</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return content
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) setSelectedSource(null)
        onClose()
      }}
    >
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
              {selectedSource === 'drive'
                ? 'Google Drive'
                : 'Import Music Sources'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {selectedSource === 'drive'
              ? 'Browse and download tracks directly to your offline library.'
              : 'Choose a source to add music to your collection.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative">
          {isImporting && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 animate-fade-in">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="font-bold text-lg animate-pulse">
                Importing files...
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
                  ? 'Connect account to download files.'
                  : 'Configuration Missing',
                isConfigured
                  ? 'text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                  : 'text-muted-foreground',
                !isConfigured,
              )}
              {renderSourceCard(
                'local',
                <HardDrive className="w-8 h-8" />,
                'Local Folder',
                'Select folder from your device.',
                'text-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.3)]',
              )}
              {renderSourceCard(
                'usb',
                <Usb className="w-8 h-8" />,
                'USB Drive',
                'Import from connected storage.',
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
