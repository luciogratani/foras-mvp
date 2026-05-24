'use client'
import { useEffect } from 'react'
import { useActionState } from 'react'
import type { MenuItem } from '@repo/supabase'
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
import { deleteItemAction, type MenuActionState } from '../actions'

const idle: MenuActionState = { status: 'idle' }

export function DeleteItemDialog({
  item,
  onClose,
}: {
  item: MenuItem
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(deleteItemAction, idle)

  useEffect(() => {
    if (state.status === 'success') {
      toast.success('Voce eliminata')
      onClose()
    } else if (state.status === 'error') {
      toast.error(state.message ?? 'Operazione non riuscita')
    }
  }, [state.status, state, onClose])

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Elimina item</DialogTitle>
          <DialogDescription>
            Sei sicuro di voler eliminare l&apos;item{' '}
            <span className="font-semibold">{item.name}</span>? Questa azione non è reversibile.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="id" value={item.id} />
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
