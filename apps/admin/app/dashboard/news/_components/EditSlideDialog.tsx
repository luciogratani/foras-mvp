'use client'
import { useEffect, useState } from 'react'
import { useActionState } from 'react'
import type { NewsSlideAdmin } from '@repo/supabase'
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
import { updateSlideAction, type NewsActionState } from '../actions'

const idle: NewsActionState = { status: 'idle' }

export function EditSlideDialog({
  slide,
  onClose,
}: {
  slide: NewsSlideAdmin
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(updateSlideAction, idle)
  const [isActive, setIsActive] = useState(slide.is_active)

  useEffect(() => {
    if (state.status === 'success') onClose()
  }, [state.status, onClose])

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica novità</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={slide.id} />
          <input type="hidden" name="is_active" value={isActive.toString()} />
          <div className="space-y-1">
            <Label htmlFor="edit-slide-title">Titolo</Label>
            <Input
              id="edit-slide-title"
              name="title"
              defaultValue={slide.title}
              required
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-slide-body">Testo</Label>
            <Textarea
              id="edit-slide-body"
              name="body"
              rows={3}
              defaultValue={slide.body ?? ''}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-slide-image">URL immagine</Label>
            <Input
              id="edit-slide-image"
              name="image_url"
              type="url"
              placeholder="https://…"
              defaultValue={slide.image_url ?? ''}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="edit-slide-active" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="edit-slide-active">Visibile sul sito</Label>
          </div>
          {state.status === 'error' && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Annulla
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvataggio…' : 'Salva'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
