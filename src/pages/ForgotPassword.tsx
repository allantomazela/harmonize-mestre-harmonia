import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { useToast } from '@/hooks/use-toast'
import { ChevronLeft, Mail, Lock, CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
    toast({
      title: 'Código enviado',
      description: `Enviamos um código para ${email}`,
    })
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(3)
  }

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: 'Senha alterada',
      description: 'Sua senha foi redefinida com sucesso.',
    })
    navigate('/login')
  }

  return (
    <div className="w-full max-w-md">
      <Link
        to="/login"
        className="flex items-center text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
      </Link>

      <Card className="border-border shadow-elevation bg-card">
        <CardHeader>
          <CardTitle className="text-xl text-primary">
            Recuperar Senha
          </CardTitle>
          <CardDescription>
            {step === 1 &&
              'Informe seu email para receber o código de verificação.'}
            {step === 2 &&
              'Digite o código de 6 dígitos enviado para seu email.'}
            {step === 3 && 'Crie uma nova senha segura.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Cadastrado</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-9 bg-background"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Enviar Código
              </Button>
            </form>
          )}

          {step === 2 && (
            <form
              onSubmit={handleVerify}
              className="space-y-6 flex flex-col items-center"
            >
              <InputOTP maxLength={6}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button type="submit" className="w-full">
                Verificar
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-pass">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-pass"
                    type="password"
                    className="pl-9 bg-background"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pass">Confirmar Senha</Label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-pass"
                    type="password"
                    className="pl-9 bg-background"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Redefinir Senha
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-secondary'}`}
              />
            ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
