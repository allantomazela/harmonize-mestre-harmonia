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
  Cloud,
  CheckCircle2,
  RefreshCw,
  WifiOff,
} from 'lucide-react'
import { chartData } from '@/lib/mock-data'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const currentDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })
  const { queue, playlists, syncStatus, isOfflineMode, lastSyncedAt } =
    useAudioPlayer()

  const localCount = queue.filter((t) => t.isLocal).length
  const storageUsagePercent = Math.min(100, (localCount / 100) * 100)

  const chartConfig = {
    opening: { label: 'Abertura', color: 'hsl(var(--chart-1))' },
    elevation: { label: 'Elevação', color: 'hsl(var(--chart-2))' },
    closing: { label: 'Encerramento', color: 'hsl(var(--chart-3))' },
    other: { label: 'Outros', color: 'hsl(var(--chart-4))' },
  }

  const getSyncBadge = () => {
    if (isOfflineMode) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground bg-secondary/30 px-3 py-1 rounded-full text-xs font-medium border border-border">
          <WifiOff className="w-3 h-3" /> Offline Mode
        </div>
      )
    }
    if (syncStatus === 'syncing') {
      return (
        <div className="flex items-center gap-2 text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full text-xs font-medium border border-blue-500/20">
          <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
        </div>
      )
    }
    if (syncStatus === 'synced') {
      return (
        <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-xs font-medium border border-green-500/20">
          <CheckCircle2 className="w-3 h-3" /> Cloud Synced
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-primary">
              Painel de Controle
            </h1>
            {getSyncBadge()}
          </div>
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

        {/* Cloud Sync Status Card */}
        <Card
          className={cn(
            'col-span-1 border-border shadow-sm transition-colors',
            syncStatus === 'synced' ? 'bg-green-500/5' : '',
          )}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary" /> Status da Nuvem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estado Atual</span>
              {syncStatus === 'synced' ? (
                <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full font-bold">
                  Ativo
                </span>
              ) : (
                <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-0.5 rounded-full font-bold capitalize">
                  {syncStatus}
                </span>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              {lastSyncedAt ? (
                <>
                  Última sincronização: <br />{' '}
                  <span className="font-mono text-foreground">
                    {format(lastSyncedAt, 'dd/MM HH:mm:ss')}
                  </span>
                </>
              ) : (
                'Aguardando primeira sincronização...'
              )}
            </div>

            <div className="pt-2 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground">
                Playlists, configurações e efeitos são salvos automaticamente.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-4 border-border shadow-sm bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link to="/library">
              <Button variant="outline" className="hover:border-primary">
                <Music className="w-4 h-4 mr-2" /> Nova Playlist
              </Button>
            </Link>
            <Link to="/player">
              <Button variant="outline" className="hover:border-primary">
                <Play className="w-4 h-4 mr-2" /> Abrir Player
              </Button>
            </Link>
            <Link to="/visualizer">
              <Button
                variant="outline"
                className="hover:border-primary border-primary/30 text-primary"
              >
                <Sparkles className="w-4 h-4 mr-2" /> VJ Mode Visualizer
              </Button>
            </Link>
            <Link to="/calendar">
              <Button variant="outline" className="hover:border-primary">
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
