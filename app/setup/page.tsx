'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

export default function SetupPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Running database migration...')

  useEffect(() => {
    // Auto-run migration on page load
    runMigration()
  }, [])

  const runMigration = async () => {
    setStatus('loading')
    setMessage('Running database migration...')

    try {
      const response = await fetch('/api/setup/migrate', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Migration completed successfully! All tables created.')
        // Auto-redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/admin/users'
        }, 2000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Migration failed')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to run migration')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Database Setup</CardTitle>
          <CardDescription>
            Initializing messaging system tables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground text-center">{message}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <p className="text-sm text-green-600 text-center font-medium">{message}</p>
                <p className="text-xs text-muted-foreground text-center">Redirecting to admin dashboard...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive text-center font-medium">{message}</p>
              </>
            )}
          </div>

          {status === 'error' && (
            <div className="flex gap-2">
              <Button 
                onClick={runMigration}
                className="w-full"
              >
                Retry
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/admin/users'}
                className="w-full"
              >
                Skip
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
