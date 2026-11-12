export type ItemStatus = 'Hilang' | 'Ditemukan' | 'Dikembalikan'

export type Item = {
  id: string
  title: string
  category: string
  location: string
  date: string
  description: string
  status: ItemStatus
  image: string
  reporter: string
  kind: 'lost' | 'found'
}

export type ChatMessage = {
  id: string
  itemId: string
  sender: 'me' | 'them'
  text: string
  time: string
}

export type UserProfile = {
  id: string
  name: string
  email: string
  studentId: string
  major: string
  campus: string
  bio: string
  avatar: string
  photo?: string   // ← BARU
}