'use client'
import { useEffect, useState } from 'react'
import { useActionState } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Switch,
  Textarea,
} from '@repo/ui'
import { createSlideAction, type NewsActionState } from '../actions'

const idle: NewsActionState = { status: 'idle' }

export function CreateSlideDialog({ onClose }: { onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(createSlideAction, idle)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (state.status === 'success') onClose()
  }, [state.status, onClose])

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuova novità</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="is_active" value={isActive.toString()} />
          <div className="space-y-1">
            <Label htmlFor="create-slide-title">Titolo</Label>
            <Input id="create-slide-title" name="title" required autoFocus />
          </div>
          <div className="space-y-1">
            <Label htmlFor="create-slide-body">Testo</Label>
            <Textarea id="create-slide-body" name="body" rows={3} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="create-slide-image">URL immagine</Label>
            <Input id="create-slide-image" name="image_url" type="url" placeholder="https://…" />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="create-slide-active" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="create-slide-active">Attiva</Label>
          </div>
          {state.status === 'error' && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Annulla
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creazione…' : 'Crea'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
