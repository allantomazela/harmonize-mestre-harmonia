import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { connectService, disconnectService } from '@/lib/integrations'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CheckCircle2, Cloud } from 'lucide-react'

export function IntegrationsSettings() {
  const { connectedServices, checkIntegrations } = useAudioPlayer()
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const handleToggle = async (
    service: 'spotify' | 'soundcloud',
    checked: boolean,
  ) => {
    setLoading(service)
    try {
      if (checked) {
        await connectService(service)
        toast({
          title: 'Connected',
          description: `${service} connected successfully.`,
        })
      } else {
        await disconnectService(service)
        toast({
          title: 'Disconnected',
          description: `${service} disconnected.`,
        })
      }
      checkIntegrations()
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update connection.',
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-primary" /> Music Services
        </CardTitle>
        <CardDescription>
          Connect external streaming platforms to import playlists.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Spotify */}
        <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg bg-card">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <div className="space-y-0.5">
              <Label className="text-base">Spotify</Label>
              <p className="text-sm text-muted-foreground">
                Import playlists and saved tracks.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {connectedServices.spotify && (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
            {loading === 'spotify' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Switch
                checked={connectedServices.spotify}
                onCheckedChange={(c) => handleToggle('spotify', c)}
              />
            )}
          </div>
        </div>

        {/* SoundCloud */}
        <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg bg-card">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#FF5500] rounded-full flex items-center justify-center text-white font-bold text-lg">
              SC
            </div>
            <div className="space-y-0.5">
              <Label className="text-base">SoundCloud</Label>
              <p className="text-sm text-muted-foreground">
                Access underground tracks and mixes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {connectedServices.soundcloud && (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
            {loading === 'soundcloud' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Switch
                checked={connectedServices.soundcloud}
                onCheckedChange={(c) => handleToggle('soundcloud', c)}
              />
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Note: Third-party integrations require valid accounts on respective
          platforms.
        </p>
      </CardFooter>
    </Card>
  )
}
