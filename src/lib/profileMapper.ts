
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '../types'

type SupabaseProfile = {
  id: string
  name: string | null
  email: string | null
  student_id: string | null
  major: string | null
  campus: string | null
  bio: string | null
  avatar_url: string | null
}

export function mapSupabaseProfile(
  authUser: User,
  profile: SupabaseProfile | null,
): UserProfile {
  const name =
    profile?.name ||
    authUser.user_metadata?.name ||
    authUser.email?.split('@')[0] ||
    'Pengguna FindU'

  const initials = name
    .split(/\s+/)
    .map((part: string) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return {
    id: authUser.id,
    name,
    email: profile?.email || authUser.email || '',
    studentId: profile?.student_id || '',
    major: profile?.major || '',
    campus: profile?.campus || '',
    bio: profile?.bio || '',
    avatar: initials,
    photo: profile?.avatar_url || undefined,
  }
}
