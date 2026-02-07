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
import { Button } from '@/components/ui/button'
import { Moon, Sun, Monitor, Laptop, Settings2, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PreferencesPanel() {
  const { crossfadeDuration, setCrossfadeDuration } = useAudioPlayer()
  const { theme, setTheme } = useTheme()

  return (
    <Card className="h-full border-primary/10 bg-card/50 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Settings2 className="w-5 h-5" /> Configurações Gerais
        </CardTitle>
        <CardDescription>
          Personalize sua experiência no Harmonize.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Theme Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Monitor className="w-4 h-4" /> Aparência
          </h4>

          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              className={cn(
                'flex flex-col h-24 gap-2 border-2 transition-all',
                theme === 'light'
                  ? 'border-primary shadow-glow-sm'
                  : 'border-border hover:border-primary/50',
              )}
              onClick={() => setTheme('light')}
            >
              <Sun className="w-6 h-6" />
              <span className="text-xs font-semibold">Claro</span>
            </Button>

            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              className={cn(
                'flex flex-col h-24 gap-2 border-2 transition-all',
                theme === 'dark'
                  ? 'border-primary shadow-glow-sm'
                  : 'border-border hover:border-primary/50',
              )}
              onClick={() => setTheme('dark')}
            >
              <Moon className="w-6 h-6" />
              <span className="text-xs font-semibold">Escuro</span>
            </Button>

            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              className={cn(
                'flex flex-col h-24 gap-2 border-2 transition-all',
                theme === 'system'
                  ? 'border-primary shadow-glow-sm'
                  : 'border-border hover:border-primary/50',
              )}
              onClick={() => setTheme('system')}
            >
              <Laptop className="w-6 h-6" />
              <span className="text-xs font-semibold">Sistema</span>
            </Button>
          </div>
        </div>

        {/* Audio Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="w-4 h-4" /> Áudio
          </h4>

          <div className="space-y-4 bg-secondary/10 p-5 rounded-xl border border-white/5">
            <div className="flex justify-between items-center">
              <Label htmlFor="fade-duration" className="font-medium">
                Duração da Transição (Fade)
              </Label>
              <span className="text-sm font-mono text-primary font-bold bg-primary/10 px-2 py-1 rounded border border-primary/20">
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
              Tempo de mixagem automática entre faixas na playlist.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
