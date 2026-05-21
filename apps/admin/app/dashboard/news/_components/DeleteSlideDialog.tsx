'use client'
import { useEffect } from 'react'
import { useActionState } from 'react'
import type { NewsSlideAdmin } from '@repo/supabase'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui'
import { deleteSlideAction, type NewsActionState } from '../actions'

const idle: NewsActionState = { status: 'idle' }

export function DeleteSlideDialog({
  slide,
  onClose,
}: {
  slide: NewsSlideAdmin
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(deleteSlideAction, idle)

  useEffect(() => {
    if (state.status === 'success') onClose()
  }, [state.status, onClose])

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Elimina novità</DialogTitle>
          <DialogDescription>
            Sei sicuro di voler eliminare la novità{' '}
            <span className="font-semibold">{slide.title}</span>? Questa azione non è reversibile.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="id" value={slide.id} />
          {state.status === 'error' && (
            <p className="text-sm text-destructive mb-4">{state.message}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Annulla
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? 'Eliminazione…' : 'Elimina'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
