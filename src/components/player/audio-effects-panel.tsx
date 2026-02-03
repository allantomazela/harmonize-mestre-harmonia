import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import {
  Activity,
  Waves,
  Zap,
  Mic2,
  Save,
  Trash2,
  Speaker,
  Radio,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function AudioEffectsPanel() {
  const {
    isNormalizationEnabled,
    setIsNormalizationEnabled,
    bassBoostLevel,
    setBassBoostLevel,
    effects,
    setEffectParam,
    presets,
    loadPreset,
    saveCurrentPreset,
    deleteEffectPreset,
  } = useAudioPlayer()

  const [newPresetName, setNewPresetName] = useState('')
  const { toast } = useToast()

  const handleSave = async () => {
    if (!newPresetName.trim()) {
      toast({
        title: 'Error',
        description: 'Enter a preset name',
        variant: 'destructive',
      })
      return
    }
    await saveCurrentPreset(newPresetName)
    setNewPresetName('')
  }

  return (
    <Card className="border-border bg-card/95 backdrop-blur shadow-xl max-h-[500px] overflow-y-auto">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-primary">
          <Activity className="w-4 h-4" /> FX Rack
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Presets */}
        <div className="space-y-3 bg-secondary/10 p-3 rounded-md">
          <Label className="text-xs uppercase font-bold text-muted-foreground">
            Presets
          </Label>
          <div className="flex gap-2">
            <Select
              onValueChange={(id) => {
                const p = presets.find((ps) => ps.id === id)
                if (p) loadPreset(p)
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Load Preset..." />
              </SelectTrigger>
              <SelectContent>
                {presets.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Input
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="New Preset Name"
              className="h-8 text-xs"
            />
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0"
              onClick={handleSave}
            >
              <Save className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Global Processors */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Auto-Gain</Label>
              <p className="text-[10px] text-muted-foreground">
                Compressor / Limiter
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
            />
          </div>
        </div>

        {/* Advanced Effects */}
        <div className="space-y-6 border-t border-border pt-4">
          {/* Reverb */}
          <div className="space-y-3">
            <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
              <Mic2 className="w-3 h-3" /> Reverb
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">Mix</span>
                <Slider
                  value={[effects.reverb.mix * 100]}
                  max={100}
                  onValueChange={(v) =>
                    setEffectParam('reverb', 'mix', v[0] / 100)
                  }
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">Decay</span>
                <Slider
                  value={[effects.reverb.decay]}
                  max={10}
                  step={0.1}
                  onValueChange={(v) => setEffectParam('reverb', 'decay', v[0])}
                />
              </div>
            </div>
          </div>

          {/* Delay */}
          <div className="space-y-3">
            <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
              <Radio className="w-3 h-3" /> Delay
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">Mix</span>
                <Slider
                  value={[effects.delay.mix * 100]}
                  max={100}
                  onValueChange={(v) =>
                    setEffectParam('delay', 'mix', v[0] / 100)
                  }
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">
                  Time (s)
                </span>
                <Slider
                  value={[effects.delay.time]}
                  max={2}
                  step={0.1}
                  onValueChange={(v) => setEffectParam('delay', 'time', v[0])}
                />
              </div>
              <div className="space-y-1 col-span-2">
                <span className="text-[10px] text-muted-foreground">
                  Feedback
                </span>
                <Slider
                  value={[effects.delay.feedback * 100]}
                  max={90}
                  onValueChange={(v) =>
                    setEffectParam('delay', 'feedback', v[0] / 100)
                  }
                />
              </div>
            </div>
          </div>

          {/* Distortion */}
          <div className="space-y-3">
            <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
              <Zap className="w-3 h-3" /> Distortion / Bitcrusher
            </Label>
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground">Drive</span>
              <Slider
                value={[effects.distortion.amount]}
                max={100}
                onValueChange={(v) =>
                  setEffectParam('distortion', 'amount', v[0])
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
