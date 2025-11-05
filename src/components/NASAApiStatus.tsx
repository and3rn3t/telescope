import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { testNASAConnection } from '@/lib/nasa-api'
import { CheckCircle, Globe, Key, Rocket, Warning } from '@phosphor-icons/react'
import { useState } from 'react'

interface APIStatus {
  success: boolean
  message: string
  apiKeyActive: boolean
  rateLimit?: {
    limit: string
    remaining: string
  }
}

export function NASAApiStatus() {
  const [status, setStatus] = useState<APIStatus | null>(null)
  const [testing, setTesting] = useState(false)

  const handleTest = async () => {
    setTesting(true)
    try {
      const result = await testNASAConnection()
      setStatus(result)
    } catch (error) {
      console.error('NASA API test failed:', error)
      setStatus({
        success: false,
        message: 'Failed to test NASA API connection',
        apiKeyActive: false,
      })
    } finally {
      setTesting(false)
    }
  }

  const apiKeyConfigured =
    import.meta.env.VITE_NASA_API_KEY &&
    import.meta.env.VITE_NASA_API_KEY !== 'your_nasa_api_key_here'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe size={20} className="text-primary" />
          <CardTitle>NASA API Configuration</CardTitle>
        </div>
        <CardDescription>Monitor NASA API connectivity and rate limits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Key size={16} />
              <span className="text-sm font-medium">API Key Status</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={apiKeyConfigured ? 'default' : 'secondary'}>
                {apiKeyConfigured ? 'Configured' : 'Using Default'}
              </Badge>
              {apiKeyConfigured && (
                <span className="text-xs text-muted-foreground">Enhanced rate limits active</span>
              )}
            </div>
          </div>

          <Button onClick={handleTest} disabled={testing} size="sm" className="gap-2">
            <Rocket size={14} />
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>

        {status && (
          <Alert variant={status.success ? 'default' : 'destructive'}>
            <div className="flex items-start gap-2">
              {status.success ? (
                <CheckCircle size={16} className="text-green-500 mt-0.5" />
              ) : (
                <Warning size={16} className="text-destructive mt-0.5" />
              )}
              <div className="flex-1">
                <AlertDescription>{status.message}</AlertDescription>
                {status.rateLimit && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Rate Limit: {status.rateLimit.remaining}/{status.rateLimit.limit} remaining
                  </div>
                )}
              </div>
            </div>
          </Alert>
        )}

        <Alert>
          <Key size={16} />
          <AlertDescription>
            <div className="space-y-2">
              {apiKeyConfigured ? (
                <>
                  <p>
                    <strong>✅ NASA API Key Configured!</strong>
                  </p>
                  <p className="text-sm">
                    Your API key is ready for use with NASA APIs like APOD (Astronomy Picture of the
                    Day), Mars Rover Photos, and more.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Note: The NASA Images API for JWST photos doesn't require an API key.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>NASA API Key Setup (Optional):</strong>
                  </p>
                  <p className="text-sm">
                    The NASA Images API used for JWST imagery is free and doesn't require an API
                    key. However, you can configure one for other NASA APIs (APOD, etc.):
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>
                      Visit{' '}
                      <a
                        href="https://api.nasa.gov/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        api.nasa.gov
                      </a>
                    </li>
                    <li>Sign up for a free API key</li>
                    <li>
                      Add your key to <code className="bg-muted px-1 rounded">.env</code>:
                    </li>
                  </ol>
                  <code className="block bg-muted p-2 rounded text-xs mt-2">
                    VITE_NASA_API_KEY=your_actual_api_key_here
                  </code>
                </>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
