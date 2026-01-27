/* Mock Data for Google Drive Simulation */

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  thumbnailLink?: string
  size?: string
  parentId?: string
  url?: string // For simulation download
  artist?: string
  album?: string
  duration?: string
}

export const mockDriveFiles: DriveFile[] = [
  // Root Folders
  {
    id: 'folder-1',
    name: 'Músicas Maçônicas',
    mimeType: 'application/vnd.google-apps.folder',
  },
  {
    id: 'folder-2',
    name: 'Rituais Especiais',
    mimeType: 'application/vnd.google-apps.folder',
  },
  {
    id: 'folder-3',
    name: 'Backup 2024',
    mimeType: 'application/vnd.google-apps.folder',
  },

  // Files in 'Músicas Maçônicas'
  {
    id: 'file-1',
    name: 'Hino da Maçonaria.mp3',
    mimeType: 'audio/mpeg',
    parentId: 'folder-1',
    size: '4.2 MB',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    artist: 'Coral Maçônico',
    album: 'Hinos Solenes',
    duration: '3:45',
  },
  {
    id: 'file-2',
    name: 'Entrada do Venerável.mp3',
    mimeType: 'audio/mpeg',
    parentId: 'folder-1',
    size: '3.1 MB',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    artist: 'Orquestra Harmonia',
    album: 'Rituais',
    duration: '2:30',
  },
  {
    id: 'folder-1-1',
    name: 'Grau de Aprendiz',
    mimeType: 'application/vnd.google-apps.folder',
    parentId: 'folder-1',
  },

  // Files in 'Grau de Aprendiz'
  {
    id: 'file-3',
    name: 'Reflexão.mp3',
    mimeType: 'audio/mpeg',
    parentId: 'folder-1-1',
    size: '5.5 MB',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    artist: 'Piano Solo',
    album: 'Meditações',
    duration: '4:15',
  },

  // Files in 'Rituais Especiais'
  {
    id: 'file-4',
    name: 'Iniciação - Completo.mp3',
    mimeType: 'audio/mpeg',
    parentId: 'folder-2',
    size: '12.8 MB',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    artist: 'Loja Simbólica',
    album: 'Sessões Magnas',
    duration: '12:00',
  },
  {
    id: 'file-5',
    name: 'Pompa e Circunstância.wav',
    mimeType: 'audio/wav',
    parentId: 'folder-2',
    size: '25.0 MB',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    artist: 'Edward Elgar',
    album: 'Clássicos',
    duration: '5:40',
  },
]
