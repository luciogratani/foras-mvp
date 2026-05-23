'use client'
import { useActionState, useState } from 'react'
import type { SiteSettings } from '@repo/supabase'
import { Button, Input, Label, Textarea, Switch } from '@repo/ui'
import {
  updateSiteSettingsAction,
  updateExtraDataAction,
  updateMaintenanceModeAction,
  type SettingsActionState,
} from '../actions'

const idle: SettingsActionState = { status: 'idle' }

function MaintenancePanel({ settings }: { settings: SiteSettings | null }) {
  const [state, formAction, isPending] = useActionState(updateMaintenanceModeAction, idle)
  const [isOn, setIsOn] = useState(settings?.maintenance_mode ?? false)

  function handleToggle(checked: boolean) {
    setIsOn(checked)
    const fd = new FormData()
    fd.set('maintenance_mode', String(checked))
    formAction(fd)
  }

  return (
    <div
      className={[
        'rounded-lg border p-4 space-y-2 transition-colors',
        isOn
          ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/30'
          : 'border-border bg-card',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-sm">
            Modalità manutenzione
            {isOn && (
              <span className="ml-2 text-xs font-medium text-orange-600 uppercase tracking-wide">
                Attiva — sito offline
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quando attiva, il sito pubblico mostra solo la pagina di manutenzione. Le prenotazioni e tutti i contenuti sono nascosti.
          </p>
        </div>
        <Switch
          checked={isOn}
          onCheckedChange={handleToggle}
          disabled={isPending}
          aria-label="Attiva/disattiva modalità manutenzione"
        />
      </div>
      {state.status === 'error' && (
        <p className="text-xs text-destructive">{state.message}</p>
      )}
    </div>
  )
}

function ExtraDataEditor({ settings }: { settings: SiteSettings | null }) {
  const [open, setOpen] = useState(false)
  const initialJson = JSON.stringify(settings?.extra_data ?? {}, null, 2)
  const [jsonText, setJsonText] = useState(initialJson)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [state, formAction, isPending] = useActionState(updateExtraDataAction, idle)

  function handleBlur() {
    try {
      JSON.parse(jsonText)
      setJsonError(null)
    } catch {
      setJsonError('JSON non valido. Correggi prima di salvare.')
    }
  }

  function handleSubmit(fd: FormData) {
    try {
      JSON.parse(jsonText)
      setJsonError(null)
    } catch {
      setJsonError('JSON non valido. Correggi prima di salvare.')
      return
    }
    fd.set('extra_data', jsonText)
    formAction(fd)
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium bg-muted/40 hover:bg-muted/60 transition-colors"
      >
        <span>Dati avanzati (JSON)</span>
        <span className="text-muted-foreground text-xs">{open ? '▲ Chiudi' : '▼ Espandi'}</span>
      </button>

      {open && (
        <div className="p-4 space-y-3">
          <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded px-3 py-2">
            ⚠ Modifica solo se sai cosa stai facendo. Un JSON non valido viene rifiutato.
          </p>
          <Textarea
            name="extra_data_display"
            rows={8}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            onBlur={handleBlur}
            className="font-mono text-xs"
            spellCheck={false}
          />
          {jsonError && (
            <p className="text-sm text-destructive">{jsonError}</p>
          )}
          <form action={handleSubmit}>
            {state.status === 'error' && (
              <p className="text-sm text-destructive mb-2">{state.message}</p>
            )}
            {state.status === 'success' && (
              <p className="text-sm text-green-600 mb-2">Dati avanzati salvati.</p>
            )}
            <Button type="submit" disabled={isPending || jsonError !== null}>
              {isPending ? 'Salvataggio…' : 'Salva dati avanzati'}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}

export function SiteSettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [state, formAction, isPending] = useActionState(updateSiteSettingsAction, idle)

  return (
    <div className="space-y-6">
      {/* C — Toggle manutenzione (massima visibilità, in cima) */}
      <MaintenancePanel settings={settings} />

      {/* A + Campi principali */}
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

        {/* A — Sezione Social */}
        <div className="pt-2 border-t border-border space-y-4">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Social</p>
          <div className="space-y-1">
            <Label htmlFor="settings-whatsapp">WhatsApp</Label>
            <Input
              id="settings-whatsapp"
              name="social_whatsapp"
              type="text"
              placeholder="+39 347 1234567 oppure https://wa.me/393471234567"
              defaultValue={settings?.social_whatsapp ?? ''}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="settings-instagram">Instagram</Label>
            <Input
              id="settings-instagram"
              name="social_instagram"
              type="url"
              placeholder="https://instagram.com/nomeprofilo"
              defaultValue={settings?.social_instagram ?? ''}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="settings-facebook">Facebook</Label>
            <Input
              id="settings-facebook"
              name="social_facebook"
              type="url"
              placeholder="https://facebook.com/nomeprofilo"
              defaultValue={settings?.social_facebook ?? ''}
            />
          </div>
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

      {/* B — Editor JSONB extra_data */}
      <ExtraDataEditor settings={settings} />
    </div>
  )
}
