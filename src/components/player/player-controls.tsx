import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Waveform } from '@/components/ui/waveform'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  TrendingDown,
  Headphones,
  Music,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'

interface PlayerControlsProps {
  isPlaying: boolean
  isLoading: boolean
  isAutoPlay: boolean
  onTogglePlay: () => void
  onToggleAutoPlay: () => void
  onNext: () => void
  onPrev: () => void
  onFadeOut: () => void
  progress: number
  duration: number
  onSeek: (time: number) => void
  volume: number
  onVolumeChange: (vol: number) => void
  currentTrackId?: string
}

export function PlayerControls({
  isPlaying,
  isLoading,
  isAutoPlay,
  onTogglePlay,
  onToggleAutoPlay,
  onNext,
  onPrev,
  onFadeOut,
  progress,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  currentTrackId,
}: PlayerControlsProps) {
  const {
    queue,
    currentIndex,
    toggleCue,
    cueTrack,
    isCuePlaying,
    currentTrack,
  } = useAudioPlayer()

  const nextTrack = queue[currentIndex + 1]

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const remaining = Math.max(0, duration - progress)

  // Visual BPM Sync Indicator
  const currentBPM = currentTrack?.bpm ? parseInt(currentTrack.bpm) : 0
  const nextBPM = nextTrack?.bpm ? parseInt(nextTrack.bpm) : 0
  const bpmDiff = Math.abs(currentBPM - nextBPM)
  const isBPMMatch = currentBPM > 0 && nextBPM > 0 && bpmDiff < 5

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* High-End Glass Container */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
        {/* Neon Glow Effects */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-1000 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-1000 pointer-events-none" />

        {/* Top Info Bar */}
        <div className="mb-6 space-y-2 relative z-10">
          <div className="flex justify-between items-end px-2 mb-3">
            <div className="text-left">
              <span className="text-3xl font-mono font-bold text-white tracking-tighter drop-shadow-md">
                {formatTime(progress)}
              </span>
            </div>

            {/* Center Info / BPM */}
            <div className="flex flex-col items-center gap-1">
              {currentTrack ? (
                <div className="text-center">
                  <h3 className="text-white font-bold text-lg leading-tight tracking-wide uppercase drop-shadow-sm truncate max-w-[300px]">
                    {currentTrack.title}
                  </h3>
                  <p className="text-primary text-xs font-semibold tracking-widest uppercase opacity-80">
                    {currentTrack.composer}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Music className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    No Track Loaded
                  </span>
                </div>
              )}

              {currentBPM > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-md',
                      isBPMMatch
                        ? 'bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_-2px_hsl(var(--primary))]'
                        : 'bg-white/5 text-muted-foreground',
                    )}
                  >
                    {currentBPM} BPM {nextBPM > 0 && `→ ${nextBPM}`}
                  </div>
                </div>
              )}
            </div>

            <div className="text-right">
              <span
                className={cn(
                  'text-3xl font-mono font-bold tracking-tighter transition-colors drop-shadow-md',
                  remaining < 10 && remaining > 0
                    ? 'text-destructive animate-pulse'
                    : 'text-muted-foreground',
                )}
              >
                -{formatTime(remaining)}
              </span>
            </div>
          </div>

          {/* Waveform Visualization */}
          <div className="relative h-28 w-full flex items-center justify-center bg-black/40 rounded-xl overflow-hidden border border-white/5 shadow-inner">
            {currentTrackId ? (
              <Waveform
                trackId={currentTrackId}
                progress={progress}
                duration={duration || 1}
                onSeek={onSeek}
                height={112}
                color="hsl(var(--primary))"
              />
            ) : (
              <div className="w-full h-[1px] bg-white/5" />
            )}
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 relative z-10 pt-4">
          {/* Left Controls: Auto/Cue */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
            <Button
              variant="outline"
              onClick={onToggleAutoPlay}
              className={cn(
                'h-14 px-6 border transition-all duration-300 relative overflow-hidden rounded-2xl group/auto',
                isAutoPlay
                  ? 'border-primary/50 bg-primary/10 text-primary shadow-[0_0_20px_-5px_hsl(var(--primary))]'
                  : 'border-white/10 bg-black/20 text-muted-foreground hover:border-white/20 hover:bg-white/5',
              )}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] leading-none opacity-70">
                  Auto Cue
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full transition-colors duration-300',
                      isAutoPlay
                        ? 'bg-primary shadow-[0_0_10px_hsl(var(--primary))]'
                        : 'bg-muted-foreground/30',
                    )}
                  />
                  <span className="text-sm font-bold">
                    {isAutoPlay ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => nextTrack && toggleCue(nextTrack)}
              disabled={!nextTrack}
              className={cn(
                'h-14 px-6 border transition-all duration-300 relative overflow-hidden rounded-2xl group/cue',
                cueTrack?.id === nextTrack?.id && isCuePlaying
                  ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500 shadow-[0_0_20px_-5px_rgba(234,179,8,0.5)]'
                  : 'border-white/10 bg-black/20 text-muted-foreground hover:border-white/20 hover:bg-white/5',
              )}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] leading-none opacity-70">
                  Preview
                </span>
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4" />
                  <span className="text-sm font-bold">NEXT</span>
                </div>
              </div>
            </Button>
          </div>

          {/* Center Controls: Playback */}
          <div className="flex items-center gap-8">
            <Button
              variant="ghost"
              size="icon"
              className="h-14 w-14 rounded-full text-muted-foreground hover:text-white hover:bg-white/5 transition-all hover:scale-110 active:scale-95"
              onClick={onPrev}
              disabled={isLoading}
            >
              <SkipBack className="w-8 h-8 fill-current" />
            </Button>

            <Button
              className={cn(
                'h-24 w-24 rounded-full transition-all duration-500 flex items-center justify-center border-4 relative overflow-hidden group',
                isPlaying
                  ? 'bg-transparent border-primary text-primary shadow-[0_0_40px_rgba(191,255,0,0.4)] hover:scale-105 hover:shadow-[0_0_60px_rgba(191,255,0,0.6)]'
                  : 'bg-primary border-primary text-black shadow-[0_0_50px_rgba(191,255,0,0.7)] hover:scale-105 hover:shadow-[0_0_80px_rgba(191,255,0,0.9)]',
              )}
              onClick={onTogglePlay}
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {isPlaying ? (
                <Pause className="w-10 h-10 fill-current relative z-10" />
              ) : (
                <Play className="w-10 h-10 fill-current ml-1.5 relative z-10" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-14 w-14 rounded-full text-muted-foreground hover:text-white hover:bg-white/5 transition-all hover:scale-110 active:scale-95"
              onClick={onNext}
              disabled={isLoading}
            >
              <SkipForward className="w-8 h-8 fill-current" />
            </Button>
          </div>

          {/* Right Controls: Volume / Fade */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={onFadeOut}
              className="h-14 w-14 rounded-2xl border-white/10 bg-black/20 text-muted-foreground hover:border-destructive/50 hover:text-destructive hover:bg-destructive/10 hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.5)] transition-all"
              title="Fade Out"
            >
              <TrendingDown className="w-6 h-6" />
            </Button>

            <div className="flex items-center gap-4 bg-black/30 p-4 rounded-2xl border border-white/10 h-14 w-full md:w-48 backdrop-blur-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full shrink-0"
                onClick={() => onVolumeChange(volume === 0 ? 0.5 : 0)}
              >
                {volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
              <Slider
                value={[volume]}
                max={1}
                step={0.01}
                onValueChange={(v) => onVolumeChange(v[0])}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
