import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { playlists, musicLibrary } from '@/lib/mock-data'
import { ChevronLeft, Play, Sparkles, Plus, Clock, Wand2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { TrackRow } from '@/components/track-row'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'

export default function PlaylistDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    addToQueue,
    replaceQueue,
    skipToIndex,
  } = useAudioPlayer()

  const playlist = playlists.find((p) => p.id === id)
  // Mock playlist tracks - in real app would query DB
  const initialTracks =
    playlist?.items
      ?.map((itemId) => musicLibrary.find((m) => m.id === itemId))
      .filter(Boolean) || []
  const [tracks, setTracks] = useState(initialTracks)
  const [smartCriteria, setSmartCriteria] = useState({
    degree: '',
    ritual: '',
    tone: '',
  })

  if (!playlist) return <div className="p-6">Playlist não encontrada</div>

  const handleSmartGenerate = () => {
    // Advanced mock generation logic based on criteria
    const filteredTracks = musicLibrary.filter((track) => {
      const matchDegree = smartCriteria.degree
        ? track.degree === smartCriteria.degree || track.degree === 'Todos'
        : true
      const matchRitual = smartCriteria.ritual
        ? track.ritual === smartCriteria.ritual
        : true
      const matchTone = smartCriteria.tone
        ? track.tone === smartCriteria.tone
        : true
      return matchDegree && matchRitual && matchTone
    })

    if (filteredTracks.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Nenhuma música encontrada',
        description: 'Tente ajustar os critérios da Smart Playlist.',
      })
      return
    }

    setTracks(filteredTracks)
    toast({
      title: 'Playlist Gerada',
      description: `Encontramos ${filteredTracks.length} faixas compatíveis no seu acervo local.`,
    })
  }

  const handlePlayAll = () => {
    // @ts-expect-error
    replaceQueue(tracks)
    setTimeout(() => skipToIndex(0), 0)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <Button
        variant="ghost"
        className="pl-0 text-muted-foreground"
        onClick={() => navigate('/playlists')}
      >
        <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>

      <div className="flex items-start justify-between">
        <div className="flex gap-6">
          <div className="w-40 h-40 rounded-lg bg-secondary overflow-hidden shadow-2xl">
            <img
              src={playlist.cover}
              alt={playlist.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-end pb-2">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2">
              Playlist
            </span>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {playlist.title}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4" /> {playlist.duration} •{' '}
              {tracks.length} faixas
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button
                className="bg-primary text-primary-foreground rounded-full px-8"
                onClick={handlePlayAll}
              >
                <Play className="w-4 h-4 mr-2 fill-current" /> Reproduzir
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-primary/50 text-primary hover:bg-primary/10 rounded-full"
                  >
                    <Wand2 className="w-4 h-4 mr-2" /> Smart Engine
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Gerador de Playlist Inteligente
                    </DialogTitle>
                    <DialogDescription>
                      O sistema selecionará automaticamente as melhores músicas
                      locais baseadas nos parâmetros definidos.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Grau do Trabalho</Label>
                      <Select
                        onValueChange={(v) =>
                          setSmartCriteria((p) => ({ ...p, degree: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aprendiz">Aprendiz</SelectItem>
                          <SelectItem value="Companheiro">
                            Companheiro
                          </SelectItem>
                          <SelectItem value="Mestre">Mestre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ritual / Momento</Label>
                        <Select
                          onValueChange={(v) =>
                            setSmartCriteria((p) => ({ ...p, ritual: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Qualquer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Abertura">Abertura</SelectItem>
                            <SelectItem value="Elevação">Elevação</SelectItem>
                            <SelectItem value="Exaltação">Exaltação</SelectItem>
                            <SelectItem value="Encerramento">
                              Encerramento
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tom Emocional</Label>
                        <Select
                          onValueChange={(v) =>
                            setSmartCriteria((p) => ({ ...p, tone: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Qualquer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Solene">Solene</SelectItem>
                            <SelectItem value="Introspectivo">
                              Introspectivo
                            </SelectItem>
                            <SelectItem value="Alegre">Alegre</SelectItem>
                            <SelectItem value="Fraternal">Fraternal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSmartGenerate} className="w-full">
                      <Wand2 className="w-4 h-4 mr-2" /> Gerar Automaticamente
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-6">
          <CardTitle>Faixas</CardTitle>
          <CardDescription>
            Lista de reprodução desta sequência.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-1">
          {tracks.map(
            (track, index) =>
              track && (
                <TrackRow
                  // @ts-expect-error
                  key={`${track.id}-${index}`}
                  // @ts-expect-error
                  track={track}
                  index={index}
                  isPlaying={isPlaying}
                  isCurrent={currentTrack?.id === track.id}
                  onPlay={() => {
                    // @ts-expect-error
                    replaceQueue(tracks)
                    setTimeout(() => skipToIndex(index), 0)
                  }}
                  // @ts-expect-error
                  onAddToQueue={() => addToQueue([track])}
                />
              ),
          )}
          <div className="pt-4">
            <Button
              variant="ghost"
              className="w-full border-dashed border border-border text-muted-foreground hover:text-primary"
            >
              <Plus className="w-4 h-4 mr-2" /> Adicionar Faixa Manualmente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
