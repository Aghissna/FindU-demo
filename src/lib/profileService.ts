
import type { User } from '@supabase/supabase-js'

import { supabase } from './supabase'
import { mapSupabaseProfile } from './profileMapper'
import type { UserProfile } from '../types'

export async function getUserProfile(
  authUser: User,
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, name, email, student_id, major, campus, bio, avatar_url',
    )
    .eq('id', authUser.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('Profil pengguna belum ditemukan.')
  }

  return mapSupabaseProfile(authUser, data)
}
