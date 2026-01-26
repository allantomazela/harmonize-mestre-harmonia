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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, Music, Eye, EyeOff, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      // Allow demo credentials or non-empty inputs
      if (
        (email === 'admin@harmonize.com' && password === 'harmonize123') ||
        (email && password)
      ) {
        toast({
          title: 'Bem-vindo, Mestre de Harmonia',
          description: 'Login realizado com sucesso.',
        })
        navigate('/dashboard')
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro de Autenticação',
          description: 'Verifique suas credenciais e tente novamente.',
        })
      }
    }, 1500)
  }

  return (
    <Card
      id="login-card"
      className="w-full max-w-md border-border shadow-elevation bg-card"
    >
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Music className="w-10 h-10 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-primary">
          Harmonize
        </CardTitle>
        <CardDescription>Gestão Musical para Lojas Maçônicas</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 bg-secondary/20 border-secondary text-xs">
          <Info className="h-4 w-4" />
          <AlertTitle>Acesso de Demonstração</AlertTitle>
          <AlertDescription>
            Use <strong>admin@harmonize.com</strong> e senha{' '}
            <strong>harmonize123</strong> para testar.
          </AlertDescription>
        </Alert>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember" className="text-sm font-normal">
              Lembrar-me neste dispositivo
            </Label>
          </div>
          <Button
            type="submit"
            className="w-full font-semibold"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center text-muted-foreground">
          Não tem uma conta?
        </div>
        <Link to="/register" className="w-full">
          <Button variant="outline" className="w-full">
            Criar Conta
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
