'use client'
import { useEffect } from 'react'
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
  toast,
} from '@repo/ui'
import { createSectionAction, type MenuActionState } from '../actions'

const idle: MenuActionState = { status: 'idle' }

export function CreateSectionDialog({ onClose }: { onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(createSectionAction, idle)

  useEffect(() => {
    if (state.status === 'success') {
      toast.success('Sezione creata')
      onClose()
    } else if (state.status === 'error') {
      toast.error(state.message ?? 'Operazione non riuscita')
    }
  }, [state.status, state, onClose])

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuova sezione</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="create-section-name">Nome</Label>
            <Input id="create-section-name" name="name" required autoFocus />
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
