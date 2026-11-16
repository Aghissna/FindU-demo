
import { supabase } from './supabase'

export async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)

  if (error) {
    console.error('Supabase connection error:', error.message)
    return false
  }

  console.log('Supabase berhasil terhubung!', data)
  return true
}
