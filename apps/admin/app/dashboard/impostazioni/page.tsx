import { requireTenantClient } from '../../../lib/auth'
import { getSiteSettings } from '@repo/supabase'
import { SiteSettingsForm } from './_components/SiteSettingsForm'

export const dynamic = 'force-dynamic'

export default async function ImpostazioniPage() {
  const { tenant } = await requireTenantClient()
  const settings = await getSiteSettings(tenant)

  return (
    <div className="space-y-6 p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">Impostazioni sito</h1>
      <SiteSettingsForm settings={settings} />
    </div>
  )
}
