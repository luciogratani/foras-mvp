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
} from '@repo/ui'
import { createCategoryAction, type MenuActionState } from '../actions'

const idle: MenuActionState = { status: 'idle' }

export function CreateCategoryDialog({
  sectionId,
  onClose,
}: {
  sectionId: string
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(createCategoryAction, idle)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (state.status === 'success') onClose()
  }, [state.status, onClose])

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuova categoria</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="section_id" value={sectionId} />
          <input type="hidden" name="is_active" value={isActive.toString()} />
          <div className="space-y-1">
            <Label htmlFor="create-cat-name">Nome</Label>
            <Input id="create-cat-name" name="name" required autoFocus />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="create-cat-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="create-cat-active">Attiva</Label>
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
