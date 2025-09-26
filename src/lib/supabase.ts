import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for browser-side operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Create a properly typed admin client
let _supabaseAdmin: SupabaseClient<Database> | null = null

if (typeof window === 'undefined') {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supabaseServiceKey) {
    _supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)
  } else {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not configured - admin operations may fail')
  }
}

// Export admin client with guaranteed typing (non-null assertion for server-side)
export const supabaseAdmin = _supabaseAdmin!

// Type exports for convenience
export type { Database }
export type Tables = Database['public']['Tables']
