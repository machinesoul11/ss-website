import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for browser-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create admin client - will be null on client side
let _supabaseAdmin: ReturnType<typeof createClient> | null = null

if (typeof window === 'undefined') {
  // Server-side only
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supabaseServiceKey) {
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
  } else {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not set - admin operations will fail')
  }
}

// Export the admin client - will be null on client side
export const supabaseAdmin = _supabaseAdmin
