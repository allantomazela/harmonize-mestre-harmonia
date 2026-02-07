import { useGoogleDrive } from '@/hooks/use-google-drive'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Cloud,
  CheckCircle2,
  XCircle,
  RefreshCw,
  HardDrive,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export function IntegrationsStatus() {
  const { isAuthenticated, user, login, logout, isLoading } = useGoogleDrive()

  return (
    <Card className="h-full border-primary/10 bg-card/50 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Cloud className="w-5 h-5" /> Integrações & Nuvem
        </CardTitle>
        <CardDescription>
          Gerencie suas conexões externas para sincronização.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Google Drive Card */}
        <div
          className={cn(
            'rounded-xl border p-5 transition-all duration-300',
            isAuthenticated
              ? 'border-green-500/30 bg-green-500/5 shadow-[0_0_15px_-5px_rgba(34,197,94,0.2)]'
              : 'border-border bg-secondary/10',
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md p-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg"
                  alt="Google Drive"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-bold text-base">Google Drive</h4>
                <p className="text-xs text-muted-foreground">
                  Armazenamento em Nuvem
                </p>
              </div>
            </div>
            <Badge
              variant={isAuthenticated ? 'default' : 'secondary'}
              className={cn(
                'text-xs px-2.5 py-0.5',
                isAuthenticated
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : '',
              )}
            >
              {isAuthenticated ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>

          {isAuthenticated && user ? (
            <div className="bg-background/80 rounded-lg p-4 mb-4 flex items-center gap-4 border border-border/50">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          ) : (
            <div className="bg-background/50 rounded-lg p-4 mb-4 flex items-center gap-3 border border-dashed border-border text-muted-foreground justify-center">
              <XCircle className="w-4 h-4" />
              <p className="text-sm">Nenhuma conta vinculada</p>
            </div>
          )}

          <Button
            variant={isAuthenticated ? 'outline' : 'default'}
            className={cn(
              'w-full font-semibold',
              !isAuthenticated && 'bg-blue-600 hover:bg-blue-700 text-white',
            )}
            onClick={isAuthenticated ? logout : login}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : isAuthenticated ? (
              'Desconectar Conta'
            ) : (
              'Conectar Google Drive'
            )}
          </Button>
        </div>

        {/* Future Integrations */}
        <div className="grid grid-cols-2 gap-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="border border-border rounded-lg p-4 flex flex-col items-center justify-center gap-2 bg-secondary/5 cursor-not-allowed">
            <Cloud className="w-8 h-8 text-blue-400" />
            <span className="text-xs font-medium">OneDrive</span>
            <Badge variant="outline" className="text-[10px] h-5">
              Em Breve
            </Badge>
          </div>
          <div className="border border-border rounded-lg p-4 flex flex-col items-center justify-center gap-2 bg-secondary/5 cursor-not-allowed">
            <HardDrive className="w-8 h-8 text-indigo-400" />
            <span className="text-xs font-medium">Dropbox</span>
            <Badge variant="outline" className="text-[10px] h-5">
              Em Breve
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
