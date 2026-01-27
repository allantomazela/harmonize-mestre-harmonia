import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  Database,
  HardDrive,
  Download,
  Upload,
  Trash2,
  Mail,
  UserPlus,
  Cloud,
} from 'lucide-react'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import {
  clearAllTracks,
  exportLibraryData,
  importLibraryData,
} from '@/lib/storage'
import { useToast } from '@/hooks/use-toast'
import { ProfileSettings } from '@/components/settings/profile-settings'
import { AppearanceSettings } from '@/components/settings/appearance-settings'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { DriveExplorer } from '@/components/settings/drive-explorer'
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { lodgeMembers } from '@/lib/mock-data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default function Settings() {
  const { toast } = useToast()
  const { library, refreshLibrary } = useAudioPlayer()
  const [inviteEmail, setInviteEmail] = useState('')
  const localFileCount = library.filter((t) => t.isLocal).length

  const handleClearLibrary = async () => {
    if (
      confirm(
        'Tem certeza que deseja apagar todos os arquivos locais importados?',
      )
    ) {
      await clearAllTracks()
      refreshLibrary()
      toast({
        title: 'Acervo Limpo',
        description: 'Todos os arquivos locais foram removidos.',
      })
    }
  }

  const handleExportBackup = async () => {
    try {
      const data = await exportLibraryData()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `harmonize-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({
        title: 'Backup Exportado',
        description: 'Arquivo de configuração salvo com sucesso.',
      })
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Exportar',
        description: 'Não foi possível gerar o arquivo de backup.',
      })
    }
  }

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string
        await importLibraryData(json)
        await refreshLibrary()
        toast({
          title: 'Backup Importado',
          description: 'Estrutura e configurações restauradas com sucesso.',
        })
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro na Importação',
          description: 'Arquivo de backup inválido ou corrompido.',
        })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: 'Convite Enviado',
      description: `Um convite foi enviado para ${inviteEmail}.`,
    })
    setInviteEmail('')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary">Configurações</h1>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="lodge">Loja</TabsTrigger>
          <TabsTrigger value="local">Dados</TabsTrigger>
          <TabsTrigger value="cloud">Nuvem</TabsTrigger>
        </TabsList>

        {/* GENERAL TAB */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <ProfileSettings />
          <AppearanceSettings />
          <NotificationSettings />
        </TabsContent>

        {/* LODGE TAB */}
        <TabsContent value="lodge" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Convidar Membros</CardTitle>
              <CardDescription>
                Envie convites para Oficiais da Loja acessarem o Harmonize
                Localmente.
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
              <CardDescription>Gerencie quem tem acesso.</CardDescription>
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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LOCAL DATA TAB */}
        <TabsContent value="local" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" /> Armazenamento & Backup
              </CardTitle>
              <CardDescription>
                Gerencie arquivos locais e backups de configuração.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Arquivos Locais Importados</span>
                  <span>{localFileCount} faixas</span>
                </div>
                <Progress
                  value={Math.min((localFileCount / 100) * 100, 100)}
                  className="h-3"
                />
                <p className="text-xs text-muted-foreground">
                  Estes arquivos estão salvos no banco de dados local do seu
                  navegador.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 font-medium">
                    <Download className="w-4 h-4 text-primary" /> Exportar
                    Backup
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Salva um arquivo JSON com sua organização de pastas e
                    metadados.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleExportBackup}
                  >
                    Baixar Configuração
                  </Button>
                </div>

                <div className="border border-border p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 font-medium">
                    <Upload className="w-4 h-4 text-primary" /> Importar Backup
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Restaura pastas e configurações a partir de um arquivo
                    previamente exportado.
                  </p>
                  <div className="relative">
                    <Button variant="outline" className="w-full">
                      Selecionar Arquivo
                    </Button>
                    <input
                      type="file"
                      accept=".json"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImportBackup}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg border border-border">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-primary" />
                    <h4 className="font-medium text-sm">Persistência Local</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Seus arquivos permanecerão disponíveis mesmo após fechar o
                    navegador.
                  </p>
                </div>
                <Switch defaultChecked disabled />
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive hover:border-destructive"
                  onClick={handleClearLibrary}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Apagar Todo o Acervo Local
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CLOUD TAB */}
        <TabsContent value="cloud" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-primary" /> Integração com Google
                Drive
              </CardTitle>
              <CardDescription>
                Conecte seu Google Drive para importar arquivos diretamente para
                sua biblioteca local.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DriveExplorer />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
