'use client'
import { useEffect } from 'react'
import { useActionState } from 'react'
import type { MenuSection } from '@repo/supabase'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@repo/ui'
import { updateSectionAction, type MenuActionState } from '../actions'

const idle: MenuActionState = { status: 'idle' }

export function RenameSectionDialog({
  section,
  onClose,
}: {
  section: MenuSection
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(updateSectionAction, idle)

  useEffect(() => {
    if (state.status === 'success') onClose()
  }, [state.status, onClose])

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rinomina sezione</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={section.id} />
          <div className="space-y-1">
            <Label htmlFor="rename-section-name">Nome</Label>
            <Input
              id="rename-section-name"
              name="name"
              defaultValue={section.name}
              required
              autoFocus
            />
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
