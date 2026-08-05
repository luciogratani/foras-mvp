import type { SiteSettings } from '@repo/supabase'

type DayRange = { open: string; close: string }
type DayHours = { closed: boolean; ranges: DayRange[] }
type OpeningHoursMap = Record<
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
  DayHours
>

const DAYS: Array<{ key: keyof OpeningHoursMap; label: string }> = [
  { key: 'monday', label: 'Lunedì' },
  { key: 'tuesday', label: 'Martedì' },
  { key: 'wednesday', label: 'Mercoledì' },
  { key: 'thursday', label: 'Giovedì' },
  { key: 'friday', label: 'Venerdì' },
  { key: 'saturday', label: 'Sabato' },
  { key: 'sunday', label: 'Domenica' },
]

function parseHours(raw: SiteSettings['opening_hours'] | null | undefined): OpeningHoursMap | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return raw as unknown as OpeningHoursMap
}

export function OpeningHours({ settings }: { settings: SiteSettings | null }) {
  const hours = parseHours(settings?.opening_hours)
  if (!hours) return null
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl md:text-3xl font-semibold mb-4">Orari</h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {DAYS.map(({ key, label }) => {
          const day = hours[key]
          const value =
            !day || day.closed || day.ranges.length === 0
              ? 'Chiuso'
              : day.ranges.map((r) => `${r.open} – ${r.close}`).join(' · ')
          return (
            <div key={key} className="flex justify-between border-b border-border py-2">
              <dt>{label}</dt>
              <dd className="text-muted-foreground">{value}</dd>
            </div>
          )
        })}
      </dl>
    </section>
  )
}
