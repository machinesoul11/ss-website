import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for browser-side operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Admin client - prefer importing from supabase-admin.ts
// This is kept for backward compatibility but may be null
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null

if (typeof window === 'undefined') {
  // Server-side only
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supabaseServiceKey) {
    _supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)
  } else {
    console.warn(
      'SUPABASE_SERVICE_ROLE_KEY is not set - admin operations will fail'
    )
  }
}

// Export the admin client - will be null on client side but properly typed when not null
export const supabaseAdmin = _supabaseAdmin
