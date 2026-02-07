import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Loader2, User } from 'lucide-react'

interface EditProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  currentUser: {
    name: string
    email: string
    avatar: string
  }
  onSave: (data: { name: string; avatar: string }) => void
}

export function EditProfileDialog({
  isOpen,
  onClose,
  currentUser,
  onSave,
}: EditProfileDialogProps) {
  const [name, setName] = useState(currentUser.name)
  const [avatar, setAvatar] = useState(currentUser.avatar)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name)
      setAvatar(currentUser.avatar)
    }
  }, [isOpen, currentUser])

  const handleSave = () => {
    setIsLoading(true)
    // Simulate network delay
    setTimeout(() => {
      onSave({ name, avatar })
      setIsLoading(false)
      onClose()
    }, 800)
  }

  const handleRandomAvatar = () => {
    const seed = Math.floor(Math.random() * 1000)
    setAvatar(
      `https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${seed}`,
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais visíveis no Harmonize.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative group cursor-pointer"
              onClick={handleRandomAvatar}
            >
              <Avatar className="w-24 h-24 border-2 border-primary/20">
                <AvatarImage src={avatar} />
                <AvatarFallback>User</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Clique para gerar novo avatar
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Nome de Exibição</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={currentUser.email}
              disabled
              className="bg-muted text-muted-foreground"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
