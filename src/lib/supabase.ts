import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Only create clients if environment variables are present
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured')
}

// Client for browser-side operations
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : ({} as any) // Mock client for build-time

// Create a properly typed admin client
let _supabaseAdmin: SupabaseClient<Database> | null = null

if (typeof window === 'undefined' && supabaseUrl) {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supabaseServiceKey) {
    _supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)
  } else {
    console.warn(
      'SUPABASE_SERVICE_ROLE_KEY not configured - admin operations may fail'
    )
  }
}

// Export admin client - use mock for build-time safety
export const supabaseAdmin = _supabaseAdmin || ({} as any)

// Type exports for convenience
export type { Database }
export type Tables = Database['public']['Tables']
