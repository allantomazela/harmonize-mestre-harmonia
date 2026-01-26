import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { ChevronLeft } from 'lucide-react'

export default function Register() {
  const [password, setPassword] = useState('')
  const [strength, setStrength] = useState(0)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setPassword(val)
    // Simple strength calc
    let score = 0
    if (val.length > 6) score += 25
    if (/[A-Z]/.test(val)) score += 25
    if (/[0-9]/.test(val)) score += 25
    if (/[^A-Za-z0-9]/.test(val)) score += 25
    setStrength(score)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: 'Conta criada com sucesso!',
      description: 'Bem-vindo ao Harmonize.',
    })
    navigate('/dashboard')
  }

  return (
    <div className="w-full max-w-lg space-y-4">
      <Link
        to="/login"
        className="flex items-center text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Voltar para Login
      </Link>
      <Card className="border-border shadow-elevation bg-card">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Criar Conta</CardTitle>
          <CardDescription>
            Cadastre-se para gerenciar a harmonia de sua Loja.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Dados Pessoais
              </h3>
              <div className="grid gap-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="Ir. João da Silva"
                  required
                  className="bg-background"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  className="bg-background"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="bg-background"
                  required
                />
                <Progress value={strength} className="h-1 mt-1" />
                <p className="text-xs text-muted-foreground text-right">
                  {strength < 50 ? 'Fraca' : strength < 75 ? 'Média' : 'Forte'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Dados da Loja
              </h3>
              <div className="grid gap-2">
                <Label htmlFor="lodge">Nome da Loja</Label>
                <Input
                  id="lodge"
                  placeholder="Aug. e Resp. Loja..."
                  required
                  className="bg-background"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="jurisdiction">Potência / Jurisdição</Label>
                <Select>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gob">GOB</SelectItem>
                    <SelectItem value="comab">COMAB</SelectItem>
                    <SelectItem value="gl">Grande Loja</SelectItem>
                    <SelectItem value="other">Outra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox id="terms" required />
              <Label
                htmlFor="terms"
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Eu concordo com os{' '}
                <a href="#" className="text-primary hover:underline">
                  Termos de Uso
                </a>{' '}
                e Política de Privacidade.
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={strength < 50}>
              Registrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
