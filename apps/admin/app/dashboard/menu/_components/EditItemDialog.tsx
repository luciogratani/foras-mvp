'use client'
import { useEffect, useState } from 'react'
import { useActionState } from 'react'
import type { Allergen, MenuCategory, MenuItem } from '@repo/supabase'
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
  toast,
} from '@repo/ui'
import { updateItemAction, moveItemToCategoryAction, type MenuActionState } from '../actions'

const idle: MenuActionState = { status: 'idle' }

export function EditItemDialog({
  item,
  allergens,
  categories,
  onClose,
}: {
  item: MenuItem
  allergens: Allergen[]
  categories: MenuCategory[]
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(updateItemAction, idle)
  const [isActive, setIsActive] = useState(item.is_active)
  const selected = new Set(item.allergen_ids)

  const [moveState, moveFormAction, isMoving] = useActionState(moveItemToCategoryAction, idle)
  const [selectedCategoryId, setSelectedCategoryId] = useState(item.category_id)

  // Toast + close on edit success/error
  useEffect(() => {
    if (state.status === 'success') {
      toast.success('Voce salvata')
      onClose()
    } else if (state.status === 'error') {
      toast.error(state.message ?? 'Operazione non riuscita')
    }
  }, [state.status, state, onClose])

  // Toast + close on move success/error
  useEffect(() => {
    if (moveState.status === 'success') {
      toast.success('Voce spostata')
      onClose()
    } else if (moveState.status === 'error') {
      toast.error(moveState.message ?? 'Spostamento non riuscito')
    }
  }, [moveState.status, moveState, onClose])

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica voce</DialogTitle>
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
            <p className="text-xs text-muted-foreground">
              Usa il punto per i decimali, es. <strong>8.50</strong>.
            </p>
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
            <Label htmlFor="edit-item-active">Visibile sul sito</Label>
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

        {/* Selettore "Sposta in categoria" — separato dal form di modifica */}
        {categories.length > 1 && (
          <div className="mt-2 border-t pt-4">
            <p className="mb-2 text-sm font-medium">Sposta in un'altra categoria (stessa sezione)</p>
            <form action={moveFormAction} className="flex items-center gap-2">
              <input type="hidden" name="id" value={item.id} />
              <select
                name="new_category_id"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={isMoving || selectedCategoryId === item.category_id}
              >
                {isMoving ? 'Spostamento…' : 'Sposta'}
              </Button>
            </form>
            {moveState.status === 'error' && (
              <p className="mt-1 text-sm text-destructive">{moveState.message}</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
