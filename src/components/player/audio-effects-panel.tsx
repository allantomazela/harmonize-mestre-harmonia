import { useState } from 'react'
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
  Radio,
  AlertTriangle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

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
    isCorsRestricted,
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

  if (isCorsRestricted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4 opacity-70">
        <div className="bg-yellow-500/10 p-4 rounded-full border border-yellow-500/20">
          <AlertTriangle className="w-8 h-8 text-yellow-500" />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-foreground">Restricted Mode</h3>
          <p className="text-sm text-muted-foreground">
            Audio processing is unavailable due to CORS restrictions on the
            current track source.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-5 space-y-8">
        {/* Preset Manager */}
        <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
            Preset Manager
          </Label>
          <div className="grid gap-3">
            <Select
              onValueChange={(id) => {
                const p = presets.find((ps) => ps.id === id)
                if (p) loadPreset(p)
              }}
            >
              <SelectTrigger className="h-9 bg-black/40 border-white/10 text-xs">
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
            <div className="flex gap-2">
              <Input
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="Save current as..."
                className="h-9 bg-black/40 border-white/10 text-xs"
              />
              <Button
                size="icon"
                className="h-9 w-9 bg-primary text-black hover:bg-primary/90"
                onClick={handleSave}
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Global Processors */}
        <div className="space-y-6">
          {/* Normalization */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-md text-primary">
                <Activity className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Auto-Gain</Label>
                <p className="text-[10px] text-muted-foreground">
                  Compressor / Limiter
                </p>
              </div>
            </div>
            <Switch
              checked={isNormalizationEnabled}
              onCheckedChange={setIsNormalizationEnabled}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* Bass Boost */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Waves className="w-3 h-3" /> Bass Boost
              </Label>
              <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                {bassBoostLevel}%
              </span>
            </div>
            <Slider
              value={[bassBoostLevel]}
              min={0}
              max={100}
              step={1}
              onValueChange={(v) => setBassBoostLevel(v[0])}
              className="py-2"
            />
          </div>
        </div>

        <div className="h-px bg-white/10" />

        {/* Reverb */}
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Mic2 className="w-3 h-3" /> Reverb
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[10px] text-muted-foreground uppercase">
                Mix
              </span>
              <Slider
                value={[effects.reverb.mix * 100]}
                max={100}
                onValueChange={(v) =>
                  setEffectParam('reverb', 'mix', v[0] / 100)
                }
              />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] text-muted-foreground uppercase">
                Decay
              </span>
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
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Radio className="w-3 h-3" /> Delay
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[10px] text-muted-foreground uppercase">
                Mix
              </span>
              <Slider
                value={[effects.delay.mix * 100]}
                max={100}
                onValueChange={(v) =>
                  setEffectParam('delay', 'mix', v[0] / 100)
                }
              />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] text-muted-foreground uppercase">
                Time
              </span>
              <Slider
                value={[effects.delay.time]}
                max={2}
                step={0.1}
                onValueChange={(v) => setEffectParam('delay', 'time', v[0])}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <span className="text-[10px] text-muted-foreground uppercase">
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
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Zap className="w-3 h-3" /> Drive
          </Label>
          <div className="space-y-2">
            <span className="text-[10px] text-muted-foreground uppercase">
              Amount
            </span>
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
    </ScrollArea>
  )
}
