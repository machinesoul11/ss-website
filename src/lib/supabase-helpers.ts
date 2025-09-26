import { supabaseAdmin } from './supabase'
import type { Database } from '@/types/database'

/**
 * Ensures supabaseAdmin is available and properly typed
 * Throws error if not available (client-side or not configured)
 */
export function ensureAdminClient() {
    if (!supabaseAdmin) {
        throw new Error('supabaseAdmin not available - ensure you are on server-side with proper configuration')
    }
    return supabaseAdmin
}

/**
 * Type-safe database table helpers
 */
export type Tables = Database['public']['Tables']
export type TableName = keyof Tables
export type TableRow<T extends TableName> = Tables[T]['Row']
export type TableInsert<T extends TableName> = Tables[T]['Insert']
export type TableUpdate<T extends TableName> = Tables[T]['Update']

/**
 * Helper to get typed data from Supabase response
 */
export function getTypedData<T>(response: { data: T[] | null; error: any }): T[] {
    if (response.error) {
        throw new Error(`Database error: ${response.error.message}`)
    }
    return response.data || []
}

/**
 * Helper to get single typed row from Supabase response
 */
export function getTypedSingleRow<T>(response: { data: T | null; error: any }): T {
    if (response.error) {
        throw new Error(`Database error: ${response.error.message}`)
    }
    if (!response.data) {
        throw new Error('No data returned from query')
    }
    return response.data
}
