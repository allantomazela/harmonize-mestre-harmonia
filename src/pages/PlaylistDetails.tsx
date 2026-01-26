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
import {
  ChevronLeft,
  GripVertical,
  Play,
  Sparkles,
  Plus,
  Clock,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
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

export default function PlaylistDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const playlist = playlists.find((p) => p.id === id)
  // Mock playlist tracks
  const initialTracks =
    playlist?.items
      ?.map((itemId) => musicLibrary.find((m) => m.id === itemId))
      .filter(Boolean) || []
  const [tracks, setTracks] = useState(initialTracks)
  const [smartCriteria, setSmartCriteria] = useState({ degree: '', ritual: '' })

  if (!playlist) return <div className="p-6">Playlist não encontrada</div>

  const moveTrack = (index: number, direction: 'up' | 'down') => {
    const newTracks = [...tracks]
    if (direction === 'up' && index > 0) {
      ;[newTracks[index], newTracks[index - 1]] = [
        newTracks[index - 1],
        newTracks[index],
      ]
    } else if (direction === 'down' && index < newTracks.length - 1) {
      ;[newTracks[index], newTracks[index + 1]] = [
        newTracks[index + 1],
        newTracks[index],
      ]
    }
    setTracks(newTracks)
  }

  const handleSmartGenerate = () => {
    // Mock generation
    toast({
      title: 'Playlist Gerada',
      description: `Playlist atualizada com músicas para ${smartCriteria.ritual} de ${smartCriteria.degree}.`,
    })
    // Shuffle or replace mock tracks
    setTracks([...initialTracks].reverse())
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
        <div className="flex gap-4">
          <div className="w-32 h-32 rounded-lg bg-secondary overflow-hidden shadow-lg">
            <img
              src={playlist.cover}
              alt={playlist.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">
              {playlist.title}
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4" /> {playlist.duration} •{' '}
              {tracks.length} faixas
            </p>
            <div className="flex gap-2 mt-4">
              <Button className="bg-primary text-primary-foreground">
                <Play className="w-4 h-4 mr-2" /> Tocar
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Sparkles className="w-4 h-4 mr-2" /> Smart Playlist
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Gerar Smart Playlist</DialogTitle>
                    <DialogDescription>
                      Preencha os critérios para gerar uma lista automática.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Grau</Label>
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
                    <div className="space-y-2">
                      <Label>Ritual</Label>
                      <Select
                        onValueChange={(v) =>
                          setSmartCriteria((p) => ({ ...p, ritual: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Abertura">Abertura</SelectItem>
                          <SelectItem value="Encerramento">
                            Encerramento
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSmartGenerate}>Gerar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faixas</CardTitle>
          <CardDescription>
            Arraste para reordenar (Simulado com botões)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {tracks.map(
            (track, index) =>
              track && (
                <div
                  key={`${track.id}-${index}`}
                  className="flex items-center gap-4 p-4 border-b border-border last:border-0 hover:bg-secondary/10 group"
                >
                  <div className="flex flex-col gap-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveTrack(index, 'up')}
                      disabled={index === 0}
                    >
                      ▲
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveTrack(index, 'down')}
                      disabled={index === tracks.length - 1}
                    >
                      ▼
                    </Button>
                  </div>
                  <div className="text-muted-foreground w-6 text-center">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{track.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {track.composer}
                    </div>
                  </div>
                  <Badge variant="outline">{track.ritual}</Badge>
                  <div className="text-sm text-muted-foreground">
                    {track.duration}
                  </div>
                  <Button variant="ghost" size="icon">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ),
          )}
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full border-dashed border border-border"
            >
              <Plus className="w-4 h-4 mr-2" /> Adicionar Faixa
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
