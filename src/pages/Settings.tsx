import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { lodgeMembers, musicLibrary } from '@/lib/mock-data'
import { useToast } from '@/hooks/use-toast'
import { Mail, UserPlus, Wifi, Download, Trash2, Database } from 'lucide-react'

export default function Settings() {
  const { toast } = useToast()
  const [inviteEmail, setInviteEmail] = useState('')
  // Mock state for offline management
  const [offlineItems, setOfflineItems] = useState(musicLibrary)

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: 'Convite Enviado',
      description: `Um convite foi enviado para ${inviteEmail}.`,
    })
    setInviteEmail('')
  }

  const toggleOfflinePriority = (id: string) => {
    setOfflineItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, offlinePriority: !item.offlinePriority }
          : item,
      ),
    )
    toast({
      title: 'Prioridade Atualizada',
      description: 'As configurações de cache foram salvas.',
    })
  }

  const clearCache = () => {
    toast({
      title: 'Cache Limpo',
      description: 'Arquivos não prioritários foram removidos do dispositivo.',
    })
  }

  const downloadedCount = offlineItems.filter((i) => i.isDownloaded).length
  const priorityCount = offlineItems.filter((i) => i.offlinePriority).length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-primary">Configurações</h1>

      <Tabs defaultValue="audio" className="w-full">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="lodge">Loja & Membros</TabsTrigger>
          <TabsTrigger value="audio">Áudio & Offline</TabsTrigger>
        </TabsList>

        <TabsContent value="lodge" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Convidar Membros</CardTitle>
              <CardDescription>
                Envie convites para Oficiais da Loja acessarem o Harmonize.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="email">Email do Irmão</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      placeholder="exemplo@loja.com"
                      className="pl-9"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="w-48 space-y-2">
                  <Label>Função</Label>
                  <Select defaultValue="observer">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Mestre de Harmonia</SelectItem>
                      <SelectItem value="observer">
                        Venerável / Observador
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit">
                  <UserPlus className="w-4 h-4 mr-2" /> Enviar
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Membros Ativos</CardTitle>
              <CardDescription>
                Gerencie quem tem acesso ao acervo da Loja.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lodgeMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          member.role === 'Mestre de Harmonia'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {member.role}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audio" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" /> Armazenamento Local
              </CardTitle>
              <CardDescription>
                Gerencie o uso de espaço e prioridade de download para uso
                offline.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Uso do Armazenamento</span>
                  <span>1.2 GB / 5 GB</span>
                </div>
                <Progress value={24} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {downloadedCount} faixas baixadas • {priorityCount} marcadas
                  como prioritárias
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg border border-border">
                <div className="space-y-0.5">
                  <h4 className="font-medium text-sm">Limpeza Inteligente</h4>
                  <p className="text-xs text-muted-foreground">
                    Remove automaticamente arquivos não utilizados há 30 dias,
                    exceto prioritários.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive hover:border-destructive"
                  onClick={clearCache}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Limpar Cache
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" /> Prioridade Offline
              </CardTitle>
              <CardDescription>
                Marque faixas ou playlists como críticas para garantir que nunca
                sejam removidas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {offlineItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border-b border-border last:border-0 hover:bg-secondary/5"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          item.isDownloaded ? 'bg-green-500' : 'bg-secondary',
                        )}
                      />
                      <div>
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.ritual} • {item.degree}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {item.isDownloaded && (
                        <Badge variant="secondary" className="text-[10px]">
                          <Download className="w-3 h-3 mr-1" /> Baixado
                        </Badge>
                      )}
                      <div className="flex items-center space-x-2">
                        <Label
                          htmlFor={`priority-${item.id}`}
                          className="text-xs font-normal text-muted-foreground"
                        >
                          Prioritário
                        </Label>
                        <Switch
                          id={`priority-${item.id}`}
                          checked={item.offlinePriority}
                          onCheckedChange={() => toggleOfflinePriority(item.id)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Opções gerais do sistema.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
