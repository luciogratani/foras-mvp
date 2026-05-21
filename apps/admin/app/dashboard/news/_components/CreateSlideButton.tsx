'use client'
import { useState } from 'react'
import { Button } from '@repo/ui'
import { CreateSlideDialog } from './CreateSlideDialog'

export function CreateSlideButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Aggiungi novità</Button>
      {open && <CreateSlideDialog onClose={() => setOpen(false)} />}
    </>
  )
}
