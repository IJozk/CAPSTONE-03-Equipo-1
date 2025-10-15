import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Cliente para operaciones públicas (con RLS activo)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Cliente admin para operaciones que necesitan bypassear RLS
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null