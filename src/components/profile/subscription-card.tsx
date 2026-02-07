import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SubscriptionCard() {
  return (
    <Card className="border-border bg-gradient-to-br from-card to-primary/5 h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Crown className="w-32 h-32 rotate-12" />
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" /> Assinatura
            </CardTitle>
            <CardDescription>Plano Atual</CardDescription>
          </div>
          <Badge className="bg-primary text-black hover:bg-primary/90">
            Mestre de Harmonia
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        <div className="space-y-2">
          <div className="text-3xl font-bold">Pro Plan</div>
          <p className="text-sm text-muted-foreground">
            Acesso total a todas as ferramentas rituais e sincronização em
            nuvem.
          </p>
        </div>

        <div className="space-y-2">
          {[
            'Sincronização Multi-Cloud',
            'Modo VJ & Visualizer',
            'Gerador de Rituais IA',
            'Armazenamento Offline Ilimitado',
            'Suporte Prioritário',
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="rounded-full bg-primary/20 p-1">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full border-primary/30 hover:bg-primary/10"
        >
          <Zap className="w-4 h-4 mr-2 text-primary" /> Gerenciar Assinatura
        </Button>
      </CardContent>
    </Card>
  )
}
