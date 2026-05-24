'use client'
import { useEffect } from 'react'
import { useActionState } from 'react'
import type { MenuCategory } from '@repo/supabase'
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
import { deleteCategoryAction, type MenuActionState } from '../actions'

const idle: MenuActionState = { status: 'idle' }

export function DeleteCategoryDialog({
  category,
  onClose,
}: {
  category: MenuCategory
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(deleteCategoryAction, idle)

  useEffect(() => {
    if (state.status === 'success') {
      toast.success('Categoria eliminata')
      onClose()
    } else if (state.status === 'error') {
      toast.error(state.message ?? 'Operazione non riuscita')
    }
  }, [state.status, state, onClose])

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Elimina categoria</DialogTitle>
          <DialogDescription>
            Sei sicuro di voler eliminare la categoria{' '}
            <span className="font-semibold">{category.name}</span>?{' '}
            <span className="text-destructive font-medium">
              Tutti gli item collegati verranno eliminati definitivamente.
            </span>{' '}
            Questa azione non è reversibile.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="id" value={category.id} />
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
