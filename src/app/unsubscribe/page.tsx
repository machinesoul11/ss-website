'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function UnsubscribePage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Get email from URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const emailParam = urlParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [])

  const handleUnsubscribe = async () => {
    if (!email) {
      setStatus('error')
      setMessage('Please enter a valid email address')
      return
    }

    setStatus('loading')
    
    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setStatus('success')
        setMessage('You have been successfully unsubscribed from all marketing communications.')
      } else {
        throw new Error('Failed to unsubscribe')
      }
    } catch {
      setStatus('error')
      setMessage('Failed to unsubscribe. Please try again or contact support.')
    }
  }

  return (
    <div className="min-h-screen bg-parchment-white flex items-center justify-center py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-h2 font-medium text-ink-black mb-4">
            Unsubscribe from Silent Scribe
          </h1>
          
          {status === 'idle' && (
            <>
              <p className="text-body text-muted-gray mb-6">
                We&apos;re sorry to see you go. Enter your email address below to unsubscribe from all marketing communications.
              </p>
              
              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@company.com"
                  className="w-full rounded-card border border-border-gray bg-parchment-white px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-focus-purple focus:ring-offset-2"
                />
                
                <Button 
                  onClick={handleUnsubscribe}
                  className="w-full"
                  variant="primary"
                >
                  Unsubscribe
                </Button>
              </div>
            </>
          )}

          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quill-blue mx-auto mb-4"></div>
              <p className="text-body text-muted-gray">Processing your request...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-suggestion-green rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-parchment-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-body text-suggestion-green mb-6">{message}</p>
              <Button href="/" className="w-full">
                Return to Homepage
              </Button>
            </div>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-error-crimson rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-parchment-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-body text-error-crimson mb-6">{message}</p>
              <div className="space-y-3">
                <Button 
                  onClick={() => setStatus('idle')}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button 
                  href="mailto:support@silentscribe.dev"
                  variant="secondary"
                  className="w-full"
                >
                  Contact Support
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
