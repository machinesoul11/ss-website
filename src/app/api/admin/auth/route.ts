import { NextRequest, NextResponse } from 'next/server'

/**
 * Admin Authentication API
 * Handles admin login with password validation and JWT token generation
 */
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password is required',
        },
        { status: 400 }
      )
    }

    // Check admin password (from environment variable)
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable not set')
      return NextResponse.json(
        {
          success: false,
          error: 'Admin authentication not configured',
        },
        { status: 500 }
      )
    }

    if (password !== adminPassword) {
      // Log failed authentication attempts for security monitoring
      const clientIP =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown IP'
      console.warn('Failed admin login attempt from:', clientIP)

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid password',
        },
        { status: 401 }
      )
    }

    // Generate a simple session token (in production, use proper JWT)
    const token = Buffer.from(`admin:${Date.now()}:${Math.random()}`).toString(
      'base64'
    )

    // Set secure HTTP-only cookie (additional security layer)
    // Remove unused cookieStore declaration for now
    const response = NextResponse.json({
      success: true,
      token,
      message: 'Authentication successful',
      expiresIn: '24h',
    })

    // Set secure cookie with 24-hour expiry
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/admin',
    })

    console.log('Successful admin login at:', new Date().toISOString())
    return response
  } catch (error) {
    console.error('Admin authentication error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication service unavailable',
      },
      { status: 500 }
    )
  }
}

/**
 * Validate admin session
 */
export async function GET(request: NextRequest) {
  try {
    const authToken = request.headers
      .get('authorization')
      ?.replace('Bearer ', '')
    const cookieToken = request.cookies.get('admin_session')?.value

    // Check either header token or cookie token
    if (!authToken && !cookieToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'No authentication token provided',
        },
        { status: 401 }
      )
    }

    // In production, validate JWT token here
    // For now, we'll do basic validation
    const token = authToken || cookieToken

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid authentication token',
        },
        { status: 401 }
      )
    }

    // Decode and validate token timestamp (24-hour expiry)
    try {
      const decoded = Buffer.from(token, 'base64').toString()
      const [prefix, timestamp] = decoded.split(':')

      if (prefix !== 'admin' || !timestamp) {
        throw new Error('Invalid token format')
      }

      const tokenTime = parseInt(timestamp)
      const now = Date.now()
      const twentyFourHours = 24 * 60 * 60 * 1000

      if (now - tokenTime > twentyFourHours) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication token expired',
          },
          { status: 401 }
        )
      }

      return NextResponse.json({
        success: true,
        valid: true,
        expiresAt: new Date(tokenTime + twentyFourHours).toISOString(),
      })
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid authentication token format',
        },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Admin session validation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Session validation failed',
      },
      { status: 500 }
    )
  }
}

/**
 * Admin logout
 */
export async function DELETE(_request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

    // Clear the admin session cookie
    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/admin',
    })

    console.log('Admin logout at:', new Date().toISOString())
    return response
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Logout failed',
      },
      { status: 500 }
    )
  }
}
