/* Mock Data for the application */
export const musicLibrary = [
  {
    id: '1',
    title: 'Entrada Solene',
    composer: 'Mozart',
    duration: '3:45',
    degree: 'Aprendiz',
    ritual: 'Abertura',
    occasion: 'Solenidade',
    isDownloaded: true,
    isFavorite: true,
  },
  {
    id: '2',
    title: 'Elevação Espiritual',
    composer: 'Bach',
    duration: '4:20',
    degree: 'Companheiro',
    ritual: 'Elevação',
    occasion: 'Regular',
    isDownloaded: true,
    isFavorite: false,
  },
  {
    id: '3',
    title: 'Meditação Profunda',
    composer: 'Beethoven',
    duration: '5:10',
    degree: 'Mestre',
    ritual: 'Exaltação',
    occasion: 'Magna',
    isDownloaded: false,
    isFavorite: true,
  },
  {
    id: '4',
    title: 'Cadeia de União',
    composer: 'Sibelius',
    duration: '2:55',
    degree: 'Todos',
    ritual: 'Encerramento',
    occasion: 'Regular',
    isDownloaded: true,
    isFavorite: false,
  },
  {
    id: '5',
    title: 'Harmonia Celeste',
    composer: 'Vivaldi',
    duration: '3:30',
    degree: 'Aprendiz',
    ritual: 'Abertura',
    occasion: 'Festiva',
    isDownloaded: false,
    isFavorite: false,
  },
]

export const playlists = [
  {
    id: '1',
    title: 'Sessão Magna de Iniciação',
    tracks: 12,
    duration: '45 min',
    cover:
      'https://img.usecurling.com/p/200/200?q=masonic%20ritual&color=black',
  },
  {
    id: '2',
    title: 'Elevação Regular',
    tracks: 8,
    duration: '32 min',
    cover: 'https://img.usecurling.com/p/200/200?q=sheet%20music&color=black',
  },
  {
    id: '3',
    title: 'Banquete Ritualístico',
    tracks: 15,
    duration: '60 min',
    cover: 'https://img.usecurling.com/p/200/200?q=dinner&color=black',
  },
]

export const upcomingEvents = [
  { id: '1', title: 'Sessão Ordinária', date: '28 Jan, 20:00', type: 'Grau 1' },
  { id: '2', title: 'Iniciação', date: '04 Fev, 19:30', type: 'Magna' },
  { id: '3', title: 'Elevação', date: '11 Fev, 20:00', type: 'Grau 2' },
]

export const chartData = [
  { name: 'Abertura', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'Elevação', value: 300, fill: 'hsl(var(--chart-2))' },
  { name: 'Encerramento', value: 300, fill: 'hsl(var(--chart-3))' },
  { name: 'Outros', value: 200, fill: 'hsl(var(--chart-4))' },
]
