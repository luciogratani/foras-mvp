'use client'
import { useEffect } from 'react'
import { useActionState } from 'react'
import type { MenuSection } from '@repo/supabase'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  toast,
} from '@repo/ui'
import { deleteSectionAction, type MenuActionState } from '../actions'

const idle: MenuActionState = { status: 'idle' }

export function DeleteSectionDialog({
  section,
  categoryCount,
  itemCount,
  onClose,
}: {
  section: MenuSection
  categoryCount: number
  itemCount: number
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(deleteSectionAction, idle)

  useEffect(() => {
    if (state.status === 'success') {
      toast.success('Sezione eliminata')
      onClose()
    } else if (state.status === 'error') {
      toast.error(state.message ?? 'Operazione non riuscita')
    }
  }, [state.status, state, onClose])

  const cascadeLabel =
    categoryCount === 0
      ? 'La sezione è vuota.'
      : `Eliminerai ${categoryCount} ${categoryCount === 1 ? 'categoria' : 'categorie'} e ${itemCount} ${itemCount === 1 ? 'voce' : 'voci'}.`

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Elimina sezione</DialogTitle>
          <DialogDescription>
            Sei sicuro di voler eliminare la sezione{' '}
            <span className="font-semibold">{section.name}</span>?{' '}
            <span className="text-destructive font-medium">{cascadeLabel}</span>{' '}
            Questa azione non è reversibile.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="id" value={section.id} />
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
