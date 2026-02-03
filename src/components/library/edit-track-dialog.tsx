import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Track } from '@/hooks/use-audio-player-context'

interface EditTrackDialogProps {
  track: Track | null
  isOpen: boolean
  onClose: () => void
  onSave: (track: Track) => Promise<void>
}

export function EditTrackDialog({
  track,
  isOpen,
  onClose,
  onSave,
}: EditTrackDialogProps) {
  const [formData, setFormData] = useState<Partial<Track>>({})

  useEffect(() => {
    if (track) {
      setFormData({ ...track })
    }
  }, [track])

  const handleSave = async () => {
    if (track && formData) {
      await onSave({ ...track, ...formData })
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Metadados</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Título
            </Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="composer" className="text-right">
              Artista
            </Label>
            <Input
              id="composer"
              value={formData.composer || ''}
              onChange={(e) =>
                setFormData({ ...formData, composer: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="album" className="text-right">
              Álbum
            </Label>
            <Input
              id="album"
              value={formData.album || ''}
              onChange={(e) =>
                setFormData({ ...formData, album: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="genre" className="text-right">
              Gênero
            </Label>
            <Input
              id="genre"
              value={formData.genre || ''}
              onChange={(e) =>
                setFormData({ ...formData, genre: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="year" className="text-right">
              Ano
            </Label>
            <Input
              id="year"
              value={formData.year || ''}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bpm" className="text-right">
              BPM
            </Label>
            <Input
              id="bpm"
              value={formData.bpm || ''}
              onChange={(e) =>
                setFormData({ ...formData, bpm: e.target.value })
              }
              className="col-span-3"
              placeholder="Ex: 120"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tone" className="text-right">
              Tom / Key
            </Label>
            <Input
              id="tone"
              value={formData.tone || ''}
              onChange={(e) =>
                setFormData({ ...formData, tone: e.target.value })
              }
              className="col-span-3"
              placeholder="Ex: C Major"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ritual" className="text-right">
              Ritual
            </Label>
            <Select
              value={formData.ritual}
              onValueChange={(v) => setFormData({ ...formData, ritual: v })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Abertura">Abertura</SelectItem>
                <SelectItem value="Elevação">Elevação</SelectItem>
                <SelectItem value="Exaltação">Exaltação</SelectItem>
                <SelectItem value="Encerramento">Encerramento</SelectItem>
                <SelectItem value="Geral">Geral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
