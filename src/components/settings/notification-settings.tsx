import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Bell, Music, RefreshCw, Volume2 } from 'lucide-react'

export function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" /> Notificações
        </CardTitle>
        <CardDescription>
          Escolha quais alertas você deseja receber durante o uso do aplicativo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-1">
            <Label className="text-base font-medium">
              Reprodução Automática
            </Label>
            <p className="text-sm text-muted-foreground">
              Alertar quando a próxima faixa começar.
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-1">
            <Label className="text-base font-medium">
              Status de Sincronização
            </Label>
            <p className="text-sm text-muted-foreground">
              Notificar quando backups forem concluídos.
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-1">
            <Label className="text-base font-medium">Alertas de Sessão</Label>
            <p className="text-sm text-muted-foreground">
              Lembretes antes de rituais agendados.
            </p>
          </div>
          <Switch defaultChecked />
        </div>
      </CardContent>
    </Card>
  )
}
