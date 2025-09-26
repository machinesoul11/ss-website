'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
// import { ClientOnly } from '@/components/ui/client-only'

interface AdminAuthProps {
  children: React.ReactNode
}

export function AdminAuth({ children }: AdminAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Check authentication status on component mount
  useEffect(() => {
    setIsHydrated(true)
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setIsAuthenticated(false)
      return
    }

    try {
      const authToken = localStorage.getItem('admin_auth_token')
      const authExpiry = localStorage.getItem('admin_auth_expiry')
      
      if (authToken && authExpiry) {
        const expiryTime = parseInt(authExpiry)
        if (Date.now() < expiryTime) {
          setIsAuthenticated(true)
          return
        } else {
          // Token expired, clear storage
          localStorage.removeItem('admin_auth_token')
          localStorage.removeItem('admin_auth_expiry')
        }
      }
      
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Error checking auth status:', error)
      setIsAuthenticated(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store auth token with 24-hour expiry
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        localStorage.setItem('admin_auth_token', data.token)
        localStorage.setItem('admin_auth_expiry', expiryTime.toString())
        setIsAuthenticated(true)
        setPassword('')
      } else {
        setError(data.error || 'Invalid password')
      }
    } catch (err) {
      setError('Authentication failed. Please try again.')
      console.error('Auth error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_auth_token')
    localStorage.removeItem('admin_auth_expiry')
    setIsAuthenticated(false)
    setPassword('')
    router.push('/')
  }

  // Loading state while hydrating or checking authentication
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600" suppressHydrationWarning>Loading...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              🔐 Admin Access Required
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter the admin password to access the dashboard
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="password" className="sr-only">
                  Admin Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      ❌ Authentication Failed
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </>
                ) : (
                  'Access Admin Dashboard'
                )}
              </button>
            </div>
          </form>

          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to main site
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show protected content if authenticated
  return (
    <div>
      {/* Add logout button to the authenticated content */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
      {children}
    </div>
  )
}
