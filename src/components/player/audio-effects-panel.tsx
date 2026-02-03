import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { Activity, Waves } from 'lucide-react'

export function AudioEffectsPanel() {
  const {
    isNormalizationEnabled,
    setIsNormalizationEnabled,
    bassBoostLevel,
    setBassBoostLevel,
  } = useAudioPlayer()

  return (
    <Card className="border-border bg-card/95 backdrop-blur shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-primary">
          <Activity className="w-4 h-4" /> Efeitos de Áudio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Normalização</Label>
            <p className="text-[10px] text-muted-foreground">
              Compressor Dinâmico
            </p>
          </div>
          <Switch
            checked={isNormalizationEnabled}
            onCheckedChange={setIsNormalizationEnabled}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Waves className="w-3 h-3" /> Bass Boost
            </Label>
            <span className="text-xs font-mono text-primary">
              {bassBoostLevel}%
            </span>
          </div>
          <Slider
            value={[bassBoostLevel]}
            min={0}
            max={100}
            step={1}
            onValueChange={(v) => setBassBoostLevel(v[0])}
            className="[&_.bg-primary]:bg-primary"
          />
        </div>
      </CardContent>
    </Card>
  )
}
