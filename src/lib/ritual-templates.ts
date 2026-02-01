/* Ritual Templates Definition */
import { Track } from '@/hooks/use-audio-player-context'

export interface RitualStep {
  name: string
  ritualType: string // Matches 'ritual' field in Track
  required: boolean
  description?: string
}

export interface RitualTemplate {
  id: string
  title: string
  description: string
  steps: RitualStep[]
}

export const ritualTemplates: RitualTemplate[] = [
  {
    id: 'initiation-g1',
    title: 'Iniciação - Grau 1',
    description: 'Sessão Magna de Iniciação ao Grau de Aprendiz.',
    steps: [
      {
        name: 'Entrada do Venerável',
        ritualType: 'Abertura',
        required: true,
        description: 'Música solene para entrada das luzes.',
      },
      {
        name: 'Abertura do Livro',
        ritualType: 'Abertura',
        required: true,
        description: 'Momento de conexão espiritual.',
      },
      {
        name: 'Entrada dos Candidatos',
        ritualType: 'Geral',
        required: true,
        description: 'Música de suspense ou reflexão.',
      },
      {
        name: 'Juramento',
        ritualType: 'Elevação',
        required: true,
        description: 'Música suave de fundo.',
      },
      {
        name: 'Tronco de Beneficência',
        ritualType: 'Encerramento',
        required: true,
        description: 'Música calma e fraterna.',
      },
      {
        name: 'Cadeia de União',
        ritualType: 'Encerramento',
        required: true,
        description: 'Hino ou música de união.',
      },
      {
        name: 'Saída',
        ritualType: 'Encerramento',
        required: true,
        description: 'Música alegre e triunfante.',
      },
    ],
  },
  {
    id: 'elevation-g2',
    title: 'Elevação - Grau 2',
    description: 'Sessão Magna de Elevação ao Grau de Companheiro.',
    steps: [
      { name: 'Abertura', ritualType: 'Abertura', required: true },
      { name: 'Viagens', ritualType: 'Elevação', required: true },
      { name: 'Estrela Flamígera', ritualType: 'Elevação', required: true },
      { name: 'Encerramento', ritualType: 'Encerramento', required: true },
    ],
  },
  {
    id: 'ordinary-session',
    title: 'Sessão Ordinária',
    description: 'Sessão regular de estudos e administração.',
    steps: [
      { name: 'Entrada', ritualType: 'Abertura', required: true },
      { name: 'Harmonia de Fundo', ritualType: 'Geral', required: false },
      { name: 'Palavra a Bem da Ordem', ritualType: 'Geral', required: false },
      { name: 'Encerramento', ritualType: 'Encerramento', required: true },
    ],
  },
]

export const matchTracksToTemplate = (
  template: RitualTemplate,
  library: Track[],
): Track[] => {
  const selectedTracks: Track[] = []
  const usedTrackIds = new Set<string>()

  template.steps.forEach((step) => {
    // Find a track that matches the ritual type and hasn't been used yet
    const match = library.find((track) => {
      const typeMatch =
        track.ritual?.toLowerCase() === step.ritualType.toLowerCase() ||
        (step.ritualType === 'Geral' && !track.ritual)
      return typeMatch && !usedTrackIds.has(track.id)
    })

    if (match) {
      selectedTracks.push(match)
      usedTrackIds.add(match.id)
    } else {
      // Fallback: try to find any track if strict match fails, or skip
      const fallback = library.find((track) => !usedTrackIds.has(track.id))
      if (fallback && step.required) {
        selectedTracks.push(fallback)
        usedTrackIds.add(fallback.id)
      }
    }
  })

  return selectedTracks
}
