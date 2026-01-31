import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { PieChart, Pie, Cell } from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Play,
  Plus,
  HardDrive,
  Music,
  Calendar as CalendarIcon,
  Database,
  Sparkles,
} from 'lucide-react'
import { chartData } from '@/lib/mock-data'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export default function Dashboard() {
  const currentDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })
  const { queue, playlists } = useAudioPlayer()

  const localCount = queue.filter((t) => t.isLocal).length
  const storageUsagePercent = Math.min(100, (localCount / 100) * 100)

  const chartConfig = {
    opening: { label: 'Abertura', color: 'hsl(var(--chart-1))' },
    elevation: { label: 'Elevação', color: 'hsl(var(--chart-2))' },
    closing: { label: 'Encerramento', color: 'hsl(var(--chart-3))' },
    other: { label: 'Outros', color: 'hsl(var(--chart-4))' },
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Painel de Controle
          </h1>
          <p className="text-muted-foreground capitalize">{currentDate}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/library">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> Importar Arquivos
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Welcome & Stats */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle>Acervo Musical</CardTitle>
            <CardDescription>Distribuição por Ritual</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Local Storage Stats */}
        <Card className="col-span-1 border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" /> Armazenamento Local
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-bold">
              {localCount}{' '}
              <span className="text-sm font-normal text-muted-foreground">
                arquivos importados
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between text-xs font-medium">
                <span>Capacidade do Navegador</span>
                <span>{storageUsagePercent.toFixed(1)}% Usado</span>
              </div>
              <Progress value={storageUsagePercent} className="h-2" />
              <p className="text-xs text-muted-foreground pt-1">
                Seus arquivos estão salvos com segurança neste dispositivo.
              </p>
            </div>

            <Link to="/library">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs mt-2"
              >
                <HardDrive className="w-3 h-3 mr-2" /> Gerenciar Arquivos
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-1 border-border shadow-sm bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link to="/library">
              <Button
                variant="outline"
                className="w-full justify-start hover:border-primary"
              >
                <Music className="w-4 h-4 mr-2" /> Nova Playlist
              </Button>
            </Link>
            <Link to="/player">
              <Button
                variant="outline"
                className="w-full justify-start hover:border-primary"
              >
                <Play className="w-4 h-4 mr-2" /> Abrir Player
              </Button>
            </Link>
            <Link to="/calendar">
              <Button
                variant="outline"
                className="w-full justify-start hover:border-primary"
              >
                <CalendarIcon className="w-4 h-4 mr-2" /> Agenda
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Playlists */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Playlists</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {playlists.map((playlist) => (
            <Link
              to={`/playlists/${playlist.id}`}
              key={playlist.id}
              className="snap-start"
            >
              <Card className="w-[200px] flex-shrink-0 hover:scale-[1.02] transition-transform duration-200 cursor-pointer border-border relative">
                {playlist.isSmart && (
                  <Badge className="absolute top-2 right-2 z-10 bg-primary/20 text-primary hover:bg-primary/20 backdrop-blur-sm border-0">
                    <Sparkles className="w-3 h-3" />
                  </Badge>
                )}
                <div className="aspect-square w-full relative overflow-hidden rounded-t-lg bg-secondary">
                  <img
                    src={playlist.cover}
                    alt={playlist.title}
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
                    <Play className="w-10 h-10 text-white fill-current" />
                  </div>
                </div>
                <div className="p-3">
                  <h3
                    className="font-semibold text-sm truncate"
                    title={playlist.title}
                  >
                    {playlist.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {playlist.isSmart ? 'Smart' : 'Manual'}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
          {playlists.length === 0 && (
            <div className="text-muted-foreground p-8 border border-dashed rounded-lg w-full text-center">
              Você ainda não possui playlists. Crie uma na biblioteca.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
