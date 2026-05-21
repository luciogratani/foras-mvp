'use client'
import { useActionState } from 'react'
import type { SiteSettings } from '@repo/supabase'
import { Button, Input, Label, Textarea } from '@repo/ui'
import { updateSiteSettingsAction, type SettingsActionState } from '../actions'

const idle: SettingsActionState = { status: 'idle' }

export function SiteSettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [state, formAction, isPending] = useActionState(updateSiteSettingsAction, idle)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="settings-title">Titolo sito</Label>
        <Input
          id="settings-title"
          name="title"
          defaultValue={settings?.title ?? ''}
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="settings-description">Descrizione</Label>
        <Textarea
          id="settings-description"
          name="description"
          rows={3}
          defaultValue={settings?.description ?? ''}
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="settings-og-image">URL immagine Open Graph</Label>
        <Input
          id="settings-og-image"
          name="og_image"
          type="url"
          placeholder="https://…"
          defaultValue={settings?.og_image ?? ''}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="settings-slogan">Slogan</Label>
        <Input
          id="settings-slogan"
          name="slogan"
          defaultValue={settings?.slogan ?? ''}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="settings-bio">Bio</Label>
        <Textarea
          id="settings-bio"
          name="bio"
          rows={4}
          defaultValue={settings?.bio ?? ''}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="settings-address">Indirizzo</Label>
        <Input
          id="settings-address"
          name="address"
          defaultValue={settings?.address ?? ''}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="settings-phone">Telefono</Label>
        <Input
          id="settings-phone"
          name="phone"
          type="tel"
          defaultValue={settings?.phone ?? ''}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="settings-email">Email</Label>
        <Input
          id="settings-email"
          name="email"
          type="email"
          defaultValue={settings?.email ?? ''}
        />
      </div>
      {state.status === 'error' && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      {state.status === 'success' && (
        <p className="text-sm text-green-600">Impostazioni salvate.</p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvataggio…' : 'Salva'}
      </Button>
    </form>
  )
}
