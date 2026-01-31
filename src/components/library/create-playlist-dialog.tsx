import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Wand2, Music, Plus, Trash } from 'lucide-react'
import { SmartPlaylistRule, Playlist } from '@/lib/storage'
import { useToast } from '@/hooks/use-toast'

interface CreatePlaylistDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (playlist: Playlist) => Promise<void>
}

export function CreatePlaylistDialog({
  isOpen,
  onClose,
  onCreate,
}: CreatePlaylistDialogProps) {
  const [title, setTitle] = useState('')
  const [isSmart, setIsSmart] = useState(false)
  const [rules, setRules] = useState<SmartPlaylistRule[]>([
    { field: 'genre', operator: 'equals', value: '' },
  ])
  const { toast } = useToast()

  const handleAddRule = () => {
    setRules([...rules, { field: 'genre', operator: 'equals', value: '' }])
  }

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index))
  }

  const handleRuleChange = (
    index: number,
    field: keyof SmartPlaylistRule,
    value: string,
  ) => {
    const newRules = [...rules]
    // @ts-expect-error
    newRules[index][field] = value
    setRules(newRules)
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'A playlist precisa de um nome.',
      })
      return
    }

    if (isSmart && rules.some((r) => !r.value)) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha todos os campos das regras.',
      })
      return
    }

    const playlist: Playlist = {
      id: crypto.randomUUID(),
      title,
      isSmart,
      rules: isSmart ? rules : undefined,
      items: isSmart ? undefined : [],
      createdAt: Date.now(),
      cover: `https://img.usecurling.com/p/400/400?q=${title}&color=black`,
    }

    await onCreate(playlist)
    toast({
      title: 'Playlist Criada',
      description: isSmart
        ? `Smart Playlist "${title}" gerada com sucesso.`
        : `Playlist "${title}" criada.`,
    })

    // Reset and close
    setTitle('')
    setIsSmart(false)
    setRules([{ field: 'genre', operator: 'equals', value: '' }])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Playlist</DialogTitle>
          <DialogDescription>
            Crie uma lista manual ou use regras inteligentes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Playlist</Label>
            <Input
              id="name"
              placeholder="Minha Playlist"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between border p-3 rounded-lg bg-secondary/10">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" /> Smart Playlist
              </Label>
              <p className="text-xs text-muted-foreground">
                Adicionar músicas automaticamente baseado em regras.
              </p>
            </div>
            <Switch checked={isSmart} onCheckedChange={setIsSmart} />
          </div>

          {isSmart && (
            <div className="space-y-3 bg-secondary/5 p-3 rounded-lg border">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Regras de Inclusão
              </Label>
              {rules.map((rule, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Select
                    value={rule.field}
                    onValueChange={(v) =>
                      handleRuleChange(index, 'field', v as any)
                    }
                  >
                    <SelectTrigger className="w-[110px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="genre">Gênero</SelectItem>
                      <SelectItem value="composer">Artista</SelectItem>
                      <SelectItem value="album">Álbum</SelectItem>
                      <SelectItem value="year">Ano</SelectItem>
                      <SelectItem value="degree">Grau</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={rule.operator}
                    onValueChange={(v) =>
                      handleRuleChange(index, 'operator', v as any)
                    }
                  >
                    <SelectTrigger className="w-[100px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Igual a</SelectItem>
                      <SelectItem value="contains">Contém</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    className="h-8 text-xs flex-1"
                    placeholder="Valor..."
                    value={rule.value}
                    onChange={(e) =>
                      handleRuleChange(index, 'value', e.target.value)
                    }
                  />

                  {rules.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveRule(index)}
                    >
                      <Trash className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs dashed border-dashed"
                onClick={handleAddRule}
              >
                <Plus className="w-3 h-3 mr-2" /> Adicionar Regra
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Criar Playlist</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
