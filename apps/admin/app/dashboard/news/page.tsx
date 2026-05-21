import { requireTenantClient } from '../../../lib/auth'
import { getNewsSlidesAdmin } from '@repo/supabase'
import { SlideList } from './_components/SlideList'
import { CreateSlideButton } from './_components/CreateSlideButton'

export const dynamic = 'force-dynamic'

export default async function NewsPage() {
  const { tenant } = await requireTenantClient()
  const slides = await getNewsSlidesAdmin(tenant)
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Novità</h1>
        <CreateSlideButton />
      </div>
      <SlideList slides={slides} />
    </div>
  )
}
