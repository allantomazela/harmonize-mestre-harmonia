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
  CardFooter,
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
import { lodgeMembers } from '@/lib/mock-data'
import { useToast } from '@/hooks/use-toast'
import {
  Mail,
  UserPlus,
  Trash2,
  Database,
  HardDrive,
  Download,
  Upload,
  Cloud,
  CheckCircle2,
  RefreshCw,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import {
  clearAllTracks,
  exportLibraryData,
  importLibraryData,
} from '@/lib/storage'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function Settings() {
  const { toast } = useToast()
  const { library, refreshLibrary } = useAudioPlayer()
  const [inviteEmail, setInviteEmail] = useState('')

  // Cloud Sync State
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null)
  const [lastSynced, setLastSynced] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<
    'google' | 'dropbox' | null
  >(null)
  const [mockAccountSelection, setMockAccountSelection] = useState('account1')

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: 'Convite Enviado',
      description: `Um convite foi enviado para ${inviteEmail}.`,
    })
    setInviteEmail('')
  }

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

  const initiateConnection = (provider: 'google' | 'dropbox') => {
    setSelectedProvider(provider)
    setIsAccountDialogOpen(true)
  }

  const confirmConnection = () => {
    setIsAccountDialogOpen(false)
    const email =
      mockAccountSelection === 'account1'
        ? 'admin@harmonize.com'
        : 'mestre.harmonia@loja.com.br'

    setConnectedAccount(email)
    toast({
      title: 'Conta Conectada',
      description: `${selectedProvider === 'google' ? 'Google Drive' : 'Dropbox'} vinculado a ${email}.`,
    })
  }

  const disconnectAccount = () => {
    if (
      confirm(
        'Deseja desconectar sua conta de nuvem? Os backups automáticos serão interrompidos.',
      )
    ) {
      setConnectedAccount(null)
      toast({
        title: 'Conta Desconectada',
        description: 'O vínculo com a nuvem foi removido.',
      })
    }
  }

  const handleSyncNow = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      setLastSynced(new Date().toLocaleString())
      toast({
        title: 'Sincronização Concluída',
        description: 'Seus dados foram salvos na nuvem.',
      })
    }, 2000)
  }

  const localFileCount = library.filter((t) => t.isLocal).length

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <h1 className="text-3xl font-bold text-primary">Configurações</h1>

      <Tabs defaultValue="local" className="w-full">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="lodge">Loja & Membros</TabsTrigger>
          <TabsTrigger value="local">Armazenamento Local</TabsTrigger>
          <TabsTrigger value="cloud">Cloud Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="cloud" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-primary" /> Sincronização em
                Nuvem
              </CardTitle>
              <CardDescription>
                Mantenha seus backups salvos automaticamente no Google Drive ou
                Dropbox.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!connectedAccount ? (
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg flex items-center justify-between hover:bg-secondary/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <img
                          src="https://img.usecurling.com/i?q=google&shape=fill"
                          className="w-6 h-6"
                          alt="Google Drive"
                        />
                      </div>
                      <div>
                        <p className="font-medium">Google Drive</p>
                        <p className="text-xs text-muted-foreground">
                          Salvar backups no seu drive pessoal
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => initiateConnection('google')}>
                      Conectar
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg flex items-center justify-between hover:bg-secondary/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <img
                          src="https://img.usecurling.com/i?q=dropbox&shape=fill"
                          className="w-6 h-6"
                          alt="Dropbox"
                        />
                      </div>
                      <div>
                        <p className="font-medium">Dropbox</p>
                        <p className="text-xs text-muted-foreground">
                          Salvar backups na pasta de aplicativos
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => initiateConnection('dropbox')}
                    >
                      Conectar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-primary/5 border border-primary/20 rounded-xl">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage
                          src={`https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${mockAccountSelection === 'account1' ? 99 : 88}`}
                        />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">
                            {connectedAccount}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Conectado
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          Vinculado ao{' '}
                          {selectedProvider === 'google'
                            ? 'Google Drive'
                            : 'Dropbox'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAccountDialogOpen(true)}
                      >
                        Trocar Conta
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={disconnectAccount}
                      >
                        <LogOut className="w-4 h-4 mr-2" /> Desconectar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Última Sincronização Automática
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {lastSynced || 'Pendente'}
                      </span>
                    </div>
                    <Button
                      className="w-full h-12 text-base"
                      onClick={handleSyncNow}
                      disabled={isSyncing}
                    >
                      <RefreshCw
                        className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`}
                      />
                      {isSyncing
                        ? 'Sincronizando seus dados...'
                        : 'Fazer Backup Manual Agora'}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground pt-2">
                      O backup automático ocorre sempre que o navegador é
                      fechado (requer internet).
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                    metadados (não inclui os arquivos de áudio).
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

      {/* Account Selection Dialog */}
      <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar Conta</DialogTitle>
            <DialogDescription>
              Escolha qual conta Google você deseja usar para sincronizar seus
              backups.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <RadioGroup
              value={mockAccountSelection}
              onValueChange={setMockAccountSelection}
              className="gap-3"
            >
              <div
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${mockAccountSelection === 'account1' ? 'border-primary bg-primary/5' : 'border-border'}`}
                onClick={() => setMockAccountSelection('account1')}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=99" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Admin Harmonize</p>
                    <p className="text-sm text-muted-foreground">
                      admin@harmonize.com
                    </p>
                  </div>
                </div>
                <RadioGroupItem value="account1" id="account1" />
              </div>

              <div
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${mockAccountSelection === 'account2' ? 'border-primary bg-primary/5' : 'border-border'}`}
                onClick={() => setMockAccountSelection('account2')}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=88" />
                    <AvatarFallback>MH</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Mestre Harmonia</p>
                    <p className="text-sm text-muted-foreground">
                      mestre.harmonia@loja.com.br
                    </p>
                  </div>
                </div>
                <RadioGroupItem value="account2" id="account2" />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border opacity-60 cursor-not-allowed">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <p className="font-medium">Adicionar outra conta...</p>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsAccountDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={confirmConnection}>Confirmar Seleção</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
