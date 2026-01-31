import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Check, Users, Mail } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface SharePlaylistDialogProps {
  isOpen: boolean
  onClose: () => void
  playlistTitle: string
}

export function SharePlaylistDialog({
  isOpen,
  onClose,
  playlistTitle,
}: SharePlaylistDialogProps) {
  const [email, setEmail] = useState('')
  const [inviteSent, setInviteSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `https://harmonize.app/p/${crypto.randomUUID()}`,
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: 'Link Copiado',
      description: 'Link de colaboração copiado para a área de transferência.',
    })
  }

  const handleInvite = () => {
    if (!email) return
    setInviteSent(true)
    setEmail('')
    toast({
      title: 'Convite Enviado',
      description: `Um convite de colaboração foi enviado para ${email}.`,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Colaboração</DialogTitle>
          <DialogDescription>
            Compartilhe "{playlistTitle}" para editar com outros Irmãos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Link de Compartilhamento</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={`https://harmonize.app/p/${crypto.randomUUID().slice(0, 8)}`}
                className="bg-muted text-muted-foreground font-mono text-xs"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou convide por email
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email do Colaborador</Label>
            <div className="flex gap-2">
              <Input
                placeholder="irmao@loja.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={handleInvite} disabled={!email}>
                <Mail className="w-4 h-4 mr-2" /> Convidar
              </Button>
            </div>
          </div>

          <div className="bg-secondary/10 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> Membros com Acesso
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1" />
                  <AvatarFallback>EU</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">Você</p>
                  <p className="text-xs text-muted-foreground">Proprietário</p>
                </div>
              </div>
              {inviteSent && (
                <div className="flex items-center gap-3 animate-fade-in">
                  <Avatar className="w-8 h-8 opacity-50">
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Convidado</p>
                    <p className="text-xs text-muted-foreground">Pendente...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Concluído
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
