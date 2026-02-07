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
  ExternalLink,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function IntegrationsStatus() {
  const { isAuthenticated, user, login, logout, isLoading } = useGoogleDrive()

  return (
    <Card className="border-border h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-primary" /> Integrações
        </CardTitle>
        <CardDescription>Gerencie suas conexões externas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google Drive Card */}
        <div className="rounded-lg border border-border bg-secondary/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg"
                  alt="Google Drive"
                  className="w-6 h-6"
                />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Google Drive</h4>
                <p className="text-xs text-muted-foreground">
                  Armazenamento em Nuvem
                </p>
              </div>
            </div>
            <Badge
              variant={isAuthenticated ? 'default' : 'secondary'}
              className={
                isAuthenticated
                  ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                  : ''
              }
            >
              {isAuthenticated ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>

          {isAuthenticated && user ? (
            <div className="bg-background rounded-md p-3 mb-4 flex items-center gap-3 border border-border">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
          ) : (
            <div className="bg-background rounded-md p-3 mb-4 flex items-center gap-3 border border-border border-dashed text-muted-foreground">
              <XCircle className="w-4 h-4" />
              <p className="text-sm">Nenhuma conta vinculada</p>
            </div>
          )}

          <Button
            variant={isAuthenticated ? 'outline' : 'default'}
            className="w-full"
            onClick={isAuthenticated ? logout : login}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : isAuthenticated ? (
              'Desconectar'
            ) : (
              'Conectar Conta'
            )}
          </Button>
        </div>

        {/* Placeholder for future integrations */}
        <div className="rounded-lg border border-border border-dashed p-4 flex flex-col items-center justify-center text-center space-y-2 opacity-60">
          <p className="text-sm font-medium">Mais Integrações em Breve</p>
          <p className="text-xs text-muted-foreground">
            Dropbox e OneDrive estão chegando.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
