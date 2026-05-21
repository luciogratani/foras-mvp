'use client'
import { useEffect, useState } from 'react'
import { useActionState } from 'react'
import type { Allergen, MenuItem } from '@repo/supabase'
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
import { updateItemAction, type MenuActionState } from '../actions'

const idle: MenuActionState = { status: 'idle' }

export function EditItemDialog({
  item,
  allergens,
  onClose,
}: {
  item: MenuItem
  allergens: Allergen[]
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(updateItemAction, idle)
  const [isActive, setIsActive] = useState(item.is_active)
  const selected = new Set(item.allergen_ids)

  useEffect(() => {
    if (state.status === 'success') onClose()
  }, [state.status, onClose])

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica item</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="is_active" value={isActive.toString()} />
          <div className="space-y-1">
            <Label htmlFor="edit-item-name">Nome</Label>
            <Input id="edit-item-name" name="name" defaultValue={item.name} required autoFocus />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-item-price">Prezzo (€)</Label>
            <Input
              id="edit-item-price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={item.price}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-item-description">Descrizione</Label>
            <Textarea
              id="edit-item-description"
              name="description"
              rows={3}
              defaultValue={item.description ?? ''}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-item-image">URL immagine</Label>
            <Input
              id="edit-item-image"
              name="image_url"
              type="url"
              placeholder="https://…"
              defaultValue={item.image_url ?? ''}
            />
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Allergeni</legend>
            <div className="grid grid-cols-2 gap-2">
              {allergens.map((a) => (
                <Label key={a.id} className="flex items-center gap-2 font-normal">
                  <Checkbox name="allergen_ids" value={a.id} defaultChecked={selected.has(a.id)} />
                  {a.name}
                </Label>
              ))}
            </div>
          </fieldset>
          <div className="flex items-center gap-2">
            <Switch id="edit-item-active" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="edit-item-active">Attivo</Label>
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
