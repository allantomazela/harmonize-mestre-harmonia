import { useState } from 'react'
import { ritualTemplates, RitualTemplate } from '@/lib/ritual-templates'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Wand2, Play, CheckCircle2, ChevronRight, Music } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function RitualCreator() {
  const { generateRitualSession } = useAudioPlayer()
  const navigate = useNavigate()
  const [selectedTemplate, setSelectedTemplate] =
    useState<RitualTemplate | null>(null)

  const handleGenerate = () => {
    if (selectedTemplate) {
      generateRitualSession(selectedTemplate.id)
      navigate('/player')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <Wand2 className="w-8 h-8" /> Gerador de Sessão Ritualística
        </h1>
        <p className="text-muted-foreground text-lg">
          Selecione um modelo abaixo para gerar automaticamente uma playlist
          organizada para sua sessão.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Template Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-border pb-2">
            Modelos Disponíveis
          </h2>
          <div className="grid gap-4">
            {ritualTemplates.map((template) => (
              <Card
                key={template.id}
                className={cn(
                  'cursor-pointer transition-all border-2 hover:border-primary/50',
                  selectedTemplate?.id === template.id
                    ? 'border-primary bg-primary/5 shadow-glow-sm'
                    : 'border-border',
                )}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-start">
                    {template.title}
                    {selectedTemplate?.id === template.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {template.steps.length} Passos
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-border pb-2">
            Detalhes da Sessão
          </h2>

          {selectedTemplate ? (
            <Card className="h-full border-border bg-card">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">
                  {selectedTemplate.title}
                </CardTitle>
                <CardDescription>Estrutura da Playlist Gerada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {selectedTemplate.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-border"
                      >
                        <div className="flex flex-col items-center gap-1 min-w-[30px] pt-1">
                          <span className="text-xs font-bold text-muted-foreground">
                            {idx + 1}
                          </span>
                          <div className="w-px h-full bg-border" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm">{step.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-[10px] h-5"
                            >
                              {step.ritualType}
                            </Badge>
                            {step.required && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-5 text-primary bg-primary/10"
                              >
                                Obrigatório
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {step.description ||
                              'Música baseada no tipo ritualístico.'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleGenerate}
                  className="w-full h-12 text-lg font-bold gap-2"
                >
                  <Play className="w-5 h-5 fill-current" /> Gerar e Abrir Player
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl bg-secondary/5">
              <Music className="w-16 h-16 opacity-20 mb-4" />
              <p>Selecione um modelo à esquerda para visualizar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
