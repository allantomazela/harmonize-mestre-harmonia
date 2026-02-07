import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { useTheme } from '@/components/theme-provider'
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
import { Button } from '@/components/ui/button'
import { Moon, Sun, Monitor, Laptop, Settings2, Volume2 } from 'lucide-react'

export function PreferencesPanel() {
  const { crossfadeDuration, setCrossfadeDuration } = useAudioPlayer()
  const { theme, setTheme } = useTheme()

  return (
    <Card className="border-border h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" /> Preferências Globais
        </CardTitle>
        <CardDescription>
          Personalize sua experiência no aplicativo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Audio Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="w-4 h-4" /> Áudio
          </h4>

          <div className="space-y-3 bg-secondary/10 p-4 rounded-lg border border-border">
            <div className="flex justify-between items-center">
              <Label htmlFor="fade-duration" className="font-medium">
                Duração da Transição (Fade)
              </Label>
              <span className="text-sm font-mono text-primary font-bold bg-primary/10 px-2 py-1 rounded">
                {crossfadeDuration}s
              </span>
            </div>
            <Slider
              id="fade-duration"
              value={[crossfadeDuration]}
              min={0}
              max={10}
              step={0.5}
              onValueChange={(v) => setCrossfadeDuration(v[0])}
              className="w-full py-2"
            />
            <p className="text-xs text-muted-foreground">
              Ajuste o tempo de mixagem automática entre faixas.
            </p>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Monitor className="w-4 h-4" /> Aparência
          </h4>

          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              className="flex flex-col h-20 gap-2 border-2"
              onClick={() => setTheme('light')}
            >
              <Sun className="w-6 h-6" />
              <span className="text-xs">Claro</span>
            </Button>

            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              className="flex flex-col h-20 gap-2 border-2"
              onClick={() => setTheme('dark')}
            >
              <Moon className="w-6 h-6" />
              <span className="text-xs">Escuro</span>
            </Button>

            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              className="flex flex-col h-20 gap-2 border-2"
              onClick={() => setTheme('system')}
            >
              <Laptop className="w-6 h-6" />
              <span className="text-xs">Sistema</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
