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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { User, Camera } from 'lucide-react'

export function ProfileSettings() {
  const [name, setName] = useState('Ir. João Silva')
  const [email, setEmail] = useState('joao@loja.com')
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: 'Perfil Atualizado',
      description: 'Suas informações foram salvas com sucesso.',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>
          Gerencie suas informações pessoais e como você aparece no Harmonize.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative group cursor-pointer">
            <Avatar className="h-20 w-20">
              <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1" />
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-lg">Sua Foto</h3>
            <p className="text-sm text-muted-foreground">
              Clique para alterar seu avatar.
            </p>
          </div>
        </div>

        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="display-name">Nome de Exibição</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="display-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Para alterar seu email, entre em contato com o suporte.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t border-border pt-4">
        <Button onClick={handleSave}>Salvar Alterações</Button>
      </CardFooter>
    </Card>
  )
}
