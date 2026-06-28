import { createClient } from '@supabase/supabase-js'

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const supabaseUrl = typeof rawSupabaseUrl === 'string' ? rawSupabaseUrl.trim() : ''
const supabaseAnonKey = typeof rawSupabaseAnonKey === 'string' ? rawSupabaseAnonKey.trim() : ''

const isValidUrl = (() => {
  try {
    if (!supabaseUrl) return false
    const parsed = new URL(supabaseUrl)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch (error) {
    return false
  }
})()

const hasSupabaseConfig = Boolean(isValidUrl && supabaseAnonKey)

if (!hasSupabaseConfig) {
  console.warn('Supabase env vars are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY).')
}

const createMissingConfigClient = () => ({
  from: () => {
    throw new Error('Supabase не настроен: проверьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY (без пробелов, для нужного окружения).')
  },
})

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMissingConfigClient()

export const isSupabaseConfigured = hasSupabaseConfig
