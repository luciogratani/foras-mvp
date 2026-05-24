'use client'
import { useEffect, useState } from 'react'
import { useActionState } from 'react'
import type { MenuCategory } from '@repo/supabase'
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
  toast,
} from '@repo/ui'
import { updateCategoryAction, type MenuActionState } from '../actions'

const idle: MenuActionState = { status: 'idle' }

export function EditCategoryDialog({
  category,
  onClose,
}: {
  category: MenuCategory
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(updateCategoryAction, idle)
  const [isActive, setIsActive] = useState(category.is_active)

  useEffect(() => {
    if (state.status === 'success') {
      toast.success('Categoria salvata')
      onClose()
    } else if (state.status === 'error') {
      toast.error(state.message ?? 'Operazione non riuscita')
    }
  }, [state.status, state, onClose])

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica categoria</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={category.id} />
          <input type="hidden" name="is_active" value={isActive.toString()} />
          <div className="space-y-1">
            <Label htmlFor="edit-cat-name">Nome</Label>
            <Input
              id="edit-cat-name"
              name="name"
              defaultValue={category.name}
              required
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="edit-cat-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="edit-cat-active">Visibile sul sito</Label>
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
