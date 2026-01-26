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
  Wand2,
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
            <div className="flex gap-2 mt-4 flex-wrap">
              <Button className="bg-primary text-primary-foreground">
                <Play className="w-4 h-4 mr-2" /> Tocar
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-primary/50 text-primary hover:bg-primary/10"
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
                  <div className="flex gap-2">
                    <Badge variant="outline">{track.ritual}</Badge>
                    {track.tone && (
                      <Badge variant="secondary">{track.tone}</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground w-12 text-right">
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
              <Plus className="w-4 h-4 mr-2" /> Adicionar Faixa Manualmente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
