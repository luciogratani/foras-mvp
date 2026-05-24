'use client'
import { useEffect, useState } from 'react'
import { useActionState } from 'react'
import type { Allergen } from '@repo/supabase'
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Switch,
  Textarea,
} from '@repo/ui'
import { createItemAction, type MenuActionState } from '../actions'

const idle: MenuActionState = { status: 'idle' }

export function CreateItemDialog({
  categoryId,
  allergens,
  onClose,
}: {
  categoryId: string
  allergens: Allergen[]
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(createItemAction, idle)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (state.status === 'success') onClose()
  }, [state.status, onClose])

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuovo item</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="category_id" value={categoryId} />
          <input type="hidden" name="is_active" value={isActive.toString()} />
          <div className="space-y-1">
            <Label htmlFor="create-item-name">Nome</Label>
            <Input id="create-item-name" name="name" required autoFocus />
          </div>
          <div className="space-y-1">
            <Label htmlFor="create-item-price">Prezzo (€)</Label>
            <Input
              id="create-item-price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
            />
            <p className="text-xs text-muted-foreground">
              Usa il punto per i decimali, es. <strong>8.50</strong>.
            </p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="create-item-description">Descrizione</Label>
            <Textarea id="create-item-description" name="description" rows={3} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="create-item-image">URL immagine</Label>
            <Input id="create-item-image" name="image_url" type="url" placeholder="https://…" />
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Allergeni</legend>
            <div className="grid grid-cols-2 gap-2">
              {allergens.map((a) => (
                <Label key={a.id} className="flex items-center gap-2 font-normal">
                  <Checkbox name="allergen_ids" value={a.id} />
                  {a.name}
                </Label>
              ))}
            </div>
          </fieldset>
          <div className="flex items-center gap-2">
            <Switch id="create-item-active" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="create-item-active">Visibile sul sito</Label>
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
