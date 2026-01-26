import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { musicLibrary } from '@/lib/mock-data'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Repeat,
  Shuffle,
  Mic2,
  Settings2,
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'

export default function Player() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(30)
  const [crossfade, setCrossfade] = useState(2)
  const track = musicLibrary[0]

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 max-w-lg mx-auto w-full space-y-8 animate-fade-in">
      <div className="w-full aspect-square bg-secondary rounded-2xl shadow-2xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="flex items-center justify-center h-full text-9xl">
          🎵
        </div>
      </div>

      <div className="w-full space-y-2 text-center">
        <h1 className="text-2xl font-bold text-primary">{track.title}</h1>
        <p className="text-muted-foreground text-lg">{track.composer}</p>
      </div>

      <div className="w-full space-y-4">
        <Slider
          value={[progress]}
          max={100}
          step={1}
          className="w-full"
          onValueChange={(v) => setProgress(v[0])}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1:15</span>
          <span>{track.duration}</span>
        </div>
      </div>

      <div className="flex items-center justify-between w-full gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <Shuffle className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-6">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-2"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </Button>

          <Button
            className="h-16 w-16 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl scale-110"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-2"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <Repeat className="w-5 h-5" />
        </Button>
      </div>

      <div className="w-full grid grid-cols-2 gap-4 pt-8">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Volume</span>
            </div>
            <Slider defaultValue={[80]} max={100} step={1} className="w-20" />
          </CardContent>
        </Card>

        <Popover>
          <PopoverTrigger asChild>
            <Card className="bg-card/50 border-border cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Crossfade</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {crossfade}s
                </span>
              </CardContent>
            </Card>
          </PopoverTrigger>
          <PopoverContent className="w-60">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Duração do Crossfade</Label>
                <Slider
                  value={[crossfade]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={(v) => setCrossfade(v[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0s</span>
                  <span>{crossfade}s</span>
                  <span>10s</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Suaviza a transição entre faixas rituais.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
