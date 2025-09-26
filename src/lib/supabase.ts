import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for browser-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client for server-side operations with elevated privileges
// Only create this on the server side where the service key is available
let supabaseAdmin: ReturnType<typeof createClient> | null = null

if (typeof window === 'undefined') {
  // Server-side only
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
  }
}

export { supabaseAdmin }
