import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import {
  fetchExternalPlaylists,
  fetchExternalTracks,
  ExternalPlaylist,
} from '@/lib/integrations'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Download, Music } from 'lucide-react'
import { saveTrack } from '@/lib/storage'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ImportStreamDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ImportStreamDialog({
  isOpen,
  onClose,
}: ImportStreamDialogProps) {
  const { connectedServices, refreshLibrary } = useAudioPlayer()
  const [playlists, setPlaylists] = useState<ExternalPlaylist[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState<string | null>(null)
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'spotify' | 'soundcloud'>(
    'spotify',
  )

  useEffect(() => {
    if (isOpen) {
      loadPlaylists(activeTab)
    }
  }, [isOpen, activeTab])

  const loadPlaylists = async (service: 'spotify' | 'soundcloud') => {
    if (!connectedServices[service]) {
      setPlaylists([])
      return
    }
    setLoading(true)
    try {
      const data = await fetchExternalPlaylists(service)
      setPlaylists(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (playlist: ExternalPlaylist) => {
    setImporting(playlist.id)
    try {
      const tracks = await fetchExternalTracks(playlist.id)
      let count = 0

      for (const track of tracks) {
        await saveTrack({
          id: `${playlist.provider}-${track.id}`,
          title: track.title,
          composer: track.artist,
          album: track.album,
          duration: track.duration,
          addedAt: Date.now(),
          url: track.url,
          cover: track.coverUrl,
          bpm: track.bpm,
          cloudProvider: playlist.provider,
          spotifyId: playlist.provider === 'spotify' ? track.id : undefined,
          soundcloudId:
            playlist.provider === 'soundcloud' ? track.id : undefined,
          isLocal: true,
          offlineAvailable: false,
        })
        count++
      }
      await refreshLibrary()
      toast({
        title: 'Import Successful',
        description: `${count} tracks imported from ${playlist.name}.`,
      })
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: 'Could not fetch tracks.',
      })
    } finally {
      setImporting(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[500px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import from Streaming Services</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-full flex-1 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="spotify" disabled={!connectedServices.spotify}>
              Spotify
            </TabsTrigger>
            <TabsTrigger
              value="soundcloud"
              disabled={!connectedServices.soundcloud}
            >
              SoundCloud
            </TabsTrigger>
          </TabsList>

          <TabsContent value="spotify" className="flex-1 mt-4 relative">
            {!connectedServices.spotify && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                Service not connected
              </div>
            )}
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <PlaylistList
                playlists={playlists}
                onImport={handleImport}
                importingId={importing}
              />
            )}
          </TabsContent>

          <TabsContent value="soundcloud" className="flex-1 mt-4 relative">
            {!connectedServices.soundcloud && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                Service not connected
              </div>
            )}
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <PlaylistList
                playlists={playlists}
                onImport={handleImport}
                importingId={importing}
              />
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PlaylistList({
  playlists,
  onImport,
  importingId,
}: {
  playlists: ExternalPlaylist[]
  onImport: (p: ExternalPlaylist) => void
  importingId: string | null
}) {
  if (playlists.length === 0)
    return (
      <div className="text-center p-8 text-muted-foreground">
        No playlists found.
      </div>
    )

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2 p-1">
        {playlists.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 p-2 rounded-lg border hover:bg-secondary/20"
          >
            <div className="w-12 h-12 rounded bg-secondary overflow-hidden">
              {p.coverUrl ? (
                <img src={p.coverUrl} className="w-full h-full object-cover" />
              ) : (
                <Music className="m-auto" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{p.name}</h4>
              <p className="text-xs text-muted-foreground">
                {p.trackCount} tracks
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onImport(p)}
              disabled={importingId === p.id}
            >
              {importingId === p.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
