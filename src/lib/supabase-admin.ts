import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a properly typed admin client that throws an error if not configured
function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client should only be used on the server side')
  }
  
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}

export const supabaseAdmin = createAdminClient()
