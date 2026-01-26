import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronLeft,
  Save,
  Trash,
  Play,
  Pause,
  Download,
  Heart,
  FileAudio,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Slider } from '@/components/ui/slider'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { deleteTrack } from '@/lib/storage'

export default function MusicDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { queue, updateTrack, refreshLibrary } = useAudioPlayer()
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  // Find track in context queue
  const track = queue.find((m) => m.id === id)

  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (track) {
      setFormData({
        title: track.title,
        composer: track.composer,
        degree: track.degree,
        ritual: track.ritual,
        occasion: track.occasion,
        genre: track.genre,
        bpm: track.bpm,
        year: track.year,
        album: track.album,
      })
    }
  }, [track])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1))
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const handleSave = async () => {
    if (track && track.isLocal) {
      await updateTrack({ ...track, ...formData })
      toast({
        title: 'Salvo',
        description: 'As alterações foram salvas com sucesso.',
      })
    } else {
      toast({
        title: 'Ação não permitida',
        description: 'Apenas arquivos locais podem ser editados.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (track && track.isLocal && id) {
      if (confirm('Tem certeza que deseja excluir esta faixa?')) {
        await deleteTrack(id)
        await refreshLibrary()
        toast({ title: 'Faixa excluída' })
        navigate('/library')
      }
    }
  }

  const togglePlay = () => setIsPlaying(!isPlaying)

  if (!track) return <div className="p-8">Música não encontrada.</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button
        variant="ghost"
        className="pl-0 text-muted-foreground hover:text-foreground"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="border-border overflow-hidden">
            <div className="aspect-square bg-secondary/20 flex items-center justify-center relative group">
              {track.cover ? (
                <img src={track.cover} className="w-full h-full object-cover" />
              ) : (
                <FileAudio className="w-24 h-24 text-primary opacity-50" />
              )}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  className="rounded-full h-16 w-16"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </Button>
              </div>
            </div>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1 text-center">
                <h2 className="text-2xl font-bold font-serif">{track.title}</h2>
                <p className="text-muted-foreground">{track.composer}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.floor((progress / 100) * 200)}s</span>
                  <span>{track.duration}</span>
                </div>
                <Slider
                  value={[progress]}
                  max={100}
                  step={1}
                  className="w-full"
                  onValueChange={(vals) => setProgress(vals[0])}
                />
              </div>

              <div className="flex justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  disabled={!track.url && !track.file}
                >
                  <Download className="w-4 h-4" />{' '}
                  {track.file ? 'Baixado' : 'Stream'}
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-2/3">
          <Card className="border-border h-full">
            <CardHeader>
              <CardTitle>
                Editar Detalhes {track.isLocal && '(Local)'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    disabled={!track.isLocal}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="composer">Compositor</Label>
                  <Input
                    id="composer"
                    value={formData.composer || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, composer: e.target.value })
                    }
                    disabled={!track.isLocal}
                  />
                </div>

                {/* Advanced Metadata */}
                <div className="space-y-2">
                  <Label htmlFor="album">Álbum</Label>
                  <Input
                    id="album"
                    value={formData.album || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, album: e.target.value })
                    }
                    disabled={!track.isLocal}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Gênero</Label>
                  <Input
                    id="genre"
                    value={formData.genre || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, genre: e.target.value })
                    }
                    disabled={!track.isLocal}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="degree">Grau</Label>
                  <Select
                    value={formData.degree}
                    onValueChange={(v) =>
                      setFormData({ ...formData, degree: v })
                    }
                    disabled={!track.isLocal}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aprendiz">Aprendiz</SelectItem>
                      <SelectItem value="Companheiro">Companheiro</SelectItem>
                      <SelectItem value="Mestre">Mestre</SelectItem>
                      <SelectItem value="Todos">Todos</SelectItem>
                      <SelectItem value="Geral">Geral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ritual">Momento Ritualístico</Label>
                  <Select
                    value={formData.ritual}
                    onValueChange={(v) =>
                      setFormData({ ...formData, ritual: v })
                    }
                    disabled={!track.isLocal}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Abertura">Abertura</SelectItem>
                      <SelectItem value="Elevação">Elevação</SelectItem>
                      <SelectItem value="Exaltação">Exaltação</SelectItem>
                      <SelectItem value="Encerramento">Encerramento</SelectItem>
                      <SelectItem value="Geral">Geral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occasion">Ocasião</Label>
                  <Select
                    value={formData.occasion}
                    onValueChange={(v) =>
                      setFormData({ ...formData, occasion: v })
                    }
                    disabled={!track.isLocal}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular">Sessão Regular</SelectItem>
                      <SelectItem value="Solenidade">Solenidade</SelectItem>
                      <SelectItem value="Magna">Sessão Magna</SelectItem>
                      <SelectItem value="Festiva">Festiva/Banquete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-6 flex justify-between">
                {track.isLocal && (
                  <Button
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={handleDelete}
                  >
                    <Trash className="w-4 h-4 mr-2" /> Excluir Faixa
                  </Button>
                )}

                {track.isLocal && (
                  <Button
                    onClick={handleSave}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 ml-auto"
                  >
                    <Save className="w-4 h-4 mr-2" /> Salvar Alterações
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
