import { requireTenantClient } from '../../lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { tenant, user } = await requireTenantClient()

  const probe = await tenant.from('menu_sections').select('id').limit(1).maybeSingle()
  const connectionStatus = probe.error ? 'fallita' : 'OK'
  const schemaName = user.user_metadata?.schema as string

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Benvenuto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Utente:{' '}
            <span className="font-medium">{user.email ?? user.id}</span>
          </p>
          <p>
            Schema verificato:{' '}
            <code className="text-xs bg-muted px-1 rounded">{schemaName}</code>
          </p>
          <p>
            Connessione schema:{' '}
            <span className={connectionStatus === 'OK' ? 'text-green-600' : 'text-destructive'}>
              {connectionStatus}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
