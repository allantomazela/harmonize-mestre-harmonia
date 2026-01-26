import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Play,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Music,
  Bell,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { upcomingEvents, playlists } from '@/lib/mock-data'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { Switch } from '@/components/ui/switch'

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [events, setEvents] = useState(upcomingEvents)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const { toast } = useToast()

  // Form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '20:00',
    type: 'Ordinária',
    playlistId: '',
  })

  // Filter events for selected date (mock logic since mock data dates are strings)
  const selectedDateEvents = events.filter((event) => {
    // Very simple loose match for demo purposes as mock data is loose
    if (!date) return false
    const day = format(date, 'dd', { locale: ptBR })
    const month = format(date, 'MMM', { locale: ptBR })
      .replace('.', '')
      .toLowerCase()
    // Check if mock date string contains day and month
    return (
      event.date.toLowerCase().includes(`${day} `) &&
      event.date.toLowerCase().includes(month)
    )
  })

  const handleAddEvent = () => {
    if (!date) return

    const formattedDate =
      format(date, 'dd MMM', { locale: ptBR }) + `, ${newEvent.time}`

    const eventToAdd = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title || 'Nova Sessão',
      date: formattedDate,
      type: newEvent.type,
      playlistId: newEvent.playlistId || null,
    }

    setEvents([...events, eventToAdd])
    setIsDialogOpen(false)
    toast({
      title: 'Sessão Agendada',
      description: `${eventToAdd.title} adicionada para ${formattedDate}.`,
    })
    setNewEvent({ title: '', time: '20:00', type: 'Ordinária', playlistId: '' })
  }

  const toggleNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled)
    toast({
      title: enabled ? 'Notificações Ativadas' : 'Notificações Desativadas',
      description: enabled
        ? 'Você receberá alertas 30min antes das sessões.'
        : 'Você não receberá mais alertas de rituais.',
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:flex-row gap-6 p-4 max-w-7xl mx-auto animate-fade-in">
      <div className="flex-1 md:max-w-md space-y-4">
        <Card className="h-full border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" /> Calendário
              Ritualístico
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border shadow w-full flex justify-center"
              classNames={{
                head_cell:
                  'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors',
                day_selected:
                  'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                day_today: 'bg-accent text-accent-foreground',
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-primary">Eventos</h2>
            <p className="text-muted-foreground capitalize">
              {date
                ? format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
                : 'Selecione uma data'}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Agendar Sessão
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agendar Nova Sessão</DialogTitle>
                <DialogDescription>
                  Defina os detalhes e vincule uma playlist para o dia{' '}
                  {date ? format(date, 'dd/MM/yyyy') : ''}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Sessão</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Iniciação de Fulano"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={newEvent.type}
                      onValueChange={(v) =>
                        setNewEvent({ ...newEvent, type: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ordinária">Ordinária</SelectItem>
                        <SelectItem value="Magna">Magna</SelectItem>
                        <SelectItem value="Festiva">Festiva</SelectItem>
                        <SelectItem value="Fúnebre">Fúnebre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Horário</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="time"
                        type="time"
                        className="pl-9"
                        value={newEvent.time}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, time: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Playlist Vinculada</Label>
                  <Select
                    value={newEvent.playlistId}
                    onValueChange={(v) =>
                      setNewEvent({ ...newEvent, playlistId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma playlist..." />
                    </SelectTrigger>
                    <SelectContent>
                      {playlists.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddEvent}>Agendar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-secondary/10 p-4 rounded-lg flex items-center justify-between border border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Lembretes de Sessão</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Alertar 30min antes
            </span>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={toggleNotifications}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {selectedDateEvents.length > 0 ? (
            selectedDateEvents.map((event) => {
              const linkedPlaylist = playlists.find(
                (p) => p.id === event.playlistId,
              )
              return (
                <Card key={event.id} className="border-border animate-slide-up">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {event.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3 h-3" /> {event.date.split(',')[1]}
                      </p>
                      {linkedPlaylist ? (
                        <div className="flex items-center gap-1 text-xs text-primary font-medium mt-1">
                          <Music className="w-3 h-3" />
                          Playlist: {linkedPlaylist.title}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic mt-1">
                          Nenhuma playlist vinculada
                        </p>
                      )}
                    </div>
                    <div>
                      {linkedPlaylist ? (
                        <Link to={`/playlists/${linkedPlaylist.id}`}>
                          <Button size="sm" className="gap-2">
                            <Play className="w-3 h-3" /> Iniciar
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="secondary" size="sm" disabled>
                          Pendente
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground bg-secondary/10 rounded-lg border border-dashed border-border">
              <CalendarIcon className="w-8 h-8 mb-2 opacity-50" />
              <p>Nenhum evento agendado para este dia.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
