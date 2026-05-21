'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseBrowserClient } from '../../lib/supabaseBrowser'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@repo/ui'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = getSupabaseBrowserClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Accedi</CardTitle>
      </CardHeader>
      <CardContent>
        {reason === 'unauthenticated' && (
          <p className="mb-4 text-sm text-amber-600">Sessione scaduta — accedi di nuovo</p>
        )}
        {reason === 'tenant-mismatch' && (
          <p className="mb-4 text-sm text-amber-600">Schema tenant non autorizzato</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Accesso…' : 'Accedi'}
          </Button>
        </form>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
