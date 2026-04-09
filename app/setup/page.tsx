'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SetupPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

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
        setMessage('Migration completed successfully! Tables created.')
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
            Run this to create the necessary database tables for the messaging system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runMigration} 
            disabled={status === 'loading'}
            className="w-full"
          >
            {status === 'loading' ? 'Running Migration...' : 'Run Migration'}
          </Button>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              status === 'success' 
                ? 'bg-green-500/20 text-green-500' 
                : status === 'error' 
                  ? 'bg-red-500/20 text-red-500'
                  : 'bg-blue-500/20 text-blue-500'
            }`}>
              {message}
            </div>
          )}

          {status === 'success' && (
            <Button variant="outline" className="w-full" asChild>
              <a href="/admin/users">Go to Admin Users</a>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
