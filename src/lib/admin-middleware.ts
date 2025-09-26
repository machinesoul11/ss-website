import { NextRequest, NextResponse } from 'next/server'

/**
 * Admin API Middleware
 * Validates authentication for all admin API endpoints
 */
export async function adminApiMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl

  // Skip authentication for the auth endpoint itself
  if (pathname === '/api/admin/auth') {
    return null // Continue to the handler
  }

  // Check for authentication
  const authHeader = request.headers.get('authorization')
  const adminApiKey = process.env.ADMIN_API_KEY

  if (!authHeader && !adminApiKey) {
    return NextResponse.json(
      {
        error: 'Admin API authentication not configured',
      },
      { status: 500 }
    )
  }

  // Check API key authentication
  if (authHeader === `Bearer ${adminApiKey}`) {
    return null // Continue to the handler
  }

  // Check session token from Authorization header
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '')
    try {
      // Validate session token - token is already base64 encoded
      const decoded = Buffer.from(token, 'base64').toString()
      const [prefix, timestamp] = decoded.split(':')

      console.log('Validating token:', {
        prefix,
        timestamp,
        decoded: decoded.substring(0, 20) + '...',
      })

      if (prefix === 'admin' && timestamp) {
        const tokenTime = parseInt(timestamp)
        const now = Date.now()
        const twentyFourHours = 24 * 60 * 60 * 1000

        if (now - tokenTime <= twentyFourHours) {
          console.log('Token validation successful')
          return null // Continue to the handler
        } else {
          console.log('Token expired')
        }
      } else {
        console.log('Invalid token format')
      }
    } catch (error) {
      console.error('Token validation error:', error)
    }
  }

  // Check session-based authentication via cookies
  const sessionCookie = request.cookies.get('admin_session')?.value
  if (sessionCookie) {
    try {
      // Validate session token - token is already base64 encoded
      const decoded = Buffer.from(sessionCookie, 'base64').toString()
      const [prefix, timestamp] = decoded.split(':')

      if (prefix === 'admin' && timestamp) {
        const tokenTime = parseInt(timestamp)
        const now = Date.now()
        const twentyFourHours = 24 * 60 * 60 * 1000

        if (now - tokenTime <= twentyFourHours) {
          return null // Continue to the handler
        }
      }
    } catch (error) {
      console.error('Session validation error:', error)
    }
  }

  // Authentication failed
  return NextResponse.json(
    {
      error: 'Unauthorized - Admin access required',
    },
    { status: 401 }
  )
}

/**
 * Utility function to check if a request is authenticated
 */
export function isAdminAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const adminApiKey = process.env.ADMIN_API_KEY

  // Check API key authentication
  if (authHeader === `Bearer ${adminApiKey}`) {
    return true
  }

  // Check session token from Authorization header
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '')
    try {
      if (token.startsWith('YWRtaW4:')) {
        const decoded = Buffer.from(token, 'base64').toString()
        const [prefix, timestamp] = decoded.split(':')

        if (prefix === 'admin' && timestamp) {
          const tokenTime = parseInt(timestamp)
          const now = Date.now()
          const twentyFourHours = 24 * 60 * 60 * 1000

          return now - tokenTime <= twentyFourHours
        }
      }
    } catch (error) {
      console.error('Token validation error:', error)
    }
  }

  // Check session-based authentication via cookies
  const sessionCookie = request.cookies.get('admin_session')?.value
  if (sessionCookie) {
    try {
      if (sessionCookie.startsWith('YWRtaW4:')) {
        const decoded = Buffer.from(sessionCookie, 'base64').toString()
        const [prefix, timestamp] = decoded.split(':')

        if (prefix === 'admin' && timestamp) {
          const tokenTime = parseInt(timestamp)
          const now = Date.now()
          const twentyFourHours = 24 * 60 * 60 * 1000

          return now - tokenTime <= twentyFourHours
        }
      }
    } catch (error) {
      console.error('Session validation error:', error)
    }
  }

  return false
}
