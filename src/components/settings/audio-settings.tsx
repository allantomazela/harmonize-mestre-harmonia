import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { Activity, Music, Zap, Shuffle } from 'lucide-react'

export function AudioSettings() {
  const {
    crossfadeDuration,
    setCrossfadeDuration,
    transitionType,
    setTransitionType,
    isNormalizationEnabled,
    setIsNormalizationEnabled,
    bassBoostLevel,
    setBassBoostLevel,
    isAutoPlay,
    toggleAutoPlay,
  } = useAudioPlayer()

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" /> Áudio e Reprodução
        </CardTitle>
        <CardDescription>
          Personalize as transições e o processamento de áudio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Transitions Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4" /> Mixagem e Transições
          </h3>

          <div className="grid gap-6">
            <div className="flex items-center justify-between md:justify-start md:gap-12">
              <div className="space-y-0.5">
                <Label>Crossfade Automático</Label>
                <p className="text-xs text-muted-foreground">
                  Habilitar mixagem entre faixas.
                </p>
              </div>
              <Switch
                checked={transitionType === 'fade'}
                onCheckedChange={(checked) =>
                  setTransitionType(checked ? 'fade' : 'instant')
                }
                className="data-[state=checked]:bg-[#CCFF00]"
              />
            </div>

            {transitionType === 'fade' && (
              <div className="space-y-3 p-4 border border-[#CCFF00]/20 bg-[#CCFF00]/5 rounded-lg">
                <div className="flex justify-between">
                  <Label className="flex items-center gap-2">
                    <Shuffle className="w-3 h-3 text-[#CCFF00]" /> Tempo de
                    Transição
                  </Label>
                  <span className="text-sm font-mono text-primary font-bold">
                    {crossfadeDuration}s
                  </span>
                </div>
                <Slider
                  value={[crossfadeDuration]}
                  min={1}
                  max={12}
                  step={0.5}
                  onValueChange={(v) => setCrossfadeDuration(v[0])}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Define a duração da sobreposição entre o fim da faixa atual e
                  o início da próxima.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Audio Effects Section - Default Preferences */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4" /> Processamento Padrão
          </h3>

          <div className="grid gap-6">
            <div className="flex items-center justify-between md:justify-start md:gap-12">
              <div className="space-y-0.5">
                <Label className="text-base">Normalização de Volume</Label>
                <p className="text-xs text-muted-foreground">
                  Mantém o volume consistente entre faixas.
                </p>
              </div>
              <Switch
                checked={isNormalizationEnabled}
                onCheckedChange={setIsNormalizationEnabled}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between md:justify-start md:gap-4">
                <Label>Reforço de Graves (Bass Boost)</Label>
                <span className="text-sm font-mono text-muted-foreground">
                  {bassBoostLevel}%
                </span>
              </div>
              <Slider
                value={[bassBoostLevel]}
                min={0}
                max={100}
                step={1}
                onValueChange={(v) => setBassBoostLevel(v[0])}
                className="w-full md:w-[300px]"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
