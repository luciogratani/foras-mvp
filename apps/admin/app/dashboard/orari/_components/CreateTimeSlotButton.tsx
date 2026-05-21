'use client'
import { useState } from 'react'
import { Button } from '@repo/ui'
import { CreateTimeSlotDialog } from './CreateTimeSlotDialog'

export function CreateTimeSlotButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Aggiungi turno</Button>
      {open && <CreateTimeSlotDialog onClose={() => setOpen(false)} />}
    </>
  )
}
