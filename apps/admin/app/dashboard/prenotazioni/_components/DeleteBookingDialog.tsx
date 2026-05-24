'use client'
import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui'
import { Button, toast } from '@repo/ui'
import { cancelBookingAction } from '../actions'

type Props = {
  id: string
  name: string
  date: string
  slotLabel: string
}

export function DeleteBookingDialog({ id, name, date, slotLabel }: Props) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleConfirm() {
    setError(null)
    const fd = new FormData()
    fd.set('id', id)
    startTransition(async () => {
      const res = await cancelBookingAction({ status: 'idle' }, fd)
      if (res.status === 'success') {
        toast.success(`Prenotazione di ${name} cancellata`, {
          description: `${date} — turno ${slotLabel}`,
          duration: 6000,
        })
        setOpen(false)
      } else if (res.status === 'error') {
        setError(res.message)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Cancella
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancella prenotazione</DialogTitle>
          <DialogDescription>
            Stai per cancellare la prenotazione di <strong>{name}</strong> per il {date} — turno{' '}
            <strong>{slotLabel}</strong>. Questa azione non è reversibile.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Il cliente <strong>non</strong> riceve una notifica automatica: se vuoi avvisarlo,
          contattalo tu (es. telefono).
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={pending}>
            Annulla
          </Button>
          <Button variant="destructive" type="button" onClick={handleConfirm} disabled={pending}>
            {pending ? 'Cancellazione…' : 'Conferma cancellazione'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
