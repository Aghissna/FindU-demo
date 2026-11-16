
import type { ChatMessage, Item } from '../types'
import { seedItems } from '../data/seed'

const ITEMS_KEY = 'findu-items-v1'
const CHATS_KEY = 'findu-chats-v1'
const ITEMS_MIGRATION_KEY = 'findu-items-migrated-v1'

/**
 * Mengambil data barang yang benar-benar tersimpan
 * di localStorage.
 */
export function getStoredItems(): Item[] | null {
  try {
    const stored = localStorage.getItem(ITEMS_KEY)

    if (stored === null) {
      return null
    }

    const parsed = JSON.parse(stored)

    return Array.isArray(parsed) ? (parsed as Item[]) : null
  } catch {
    return null
  }
}

/**
 * Mengambil data barang lokal.
 * Seed digunakan sebagai data awal jika belum ada data lokal.
 */
export function getItems(): Item[] {
  return getStoredItems() ?? seedItems
}

/**
 * Menyimpan data barang lokal sebagai cadangan.
 */
export function saveItems(items: Item[]) {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
}

/**
 * Memeriksa apakah migrasi data lokal sudah dilakukan
 * untuk akun tertentu.
 */
export function hasItemsMigrationCompleted(userId: string): boolean {
  return localStorage.getItem(
    `${ITEMS_MIGRATION_KEY}-${userId}`,
  ) === 'true'
}

/**
 * Menandai migrasi berhasil.
 */
export function markItemsMigrationCompleted(userId: string) {
  localStorage.setItem(
    `${ITEMS_MIGRATION_KEY}-${userId}`,
    'true',
  )
}

/**
 * Mengambil chat khusus akun tertentu.
 */
export function getChats(userId: string): ChatMessage[] {
  if (!userId) return []

  try {
    const stored = localStorage.getItem(
      `${CHATS_KEY}-${userId}`,
    )

    if (!stored) return []

    const parsed = JSON.parse(stored)

    return Array.isArray(parsed) ? (parsed as ChatMessage[]) : []
  } catch {
    return []
  }
}

/**
 * Menyimpan chat khusus akun tertentu.
 */
export function saveChats(
  chats: ChatMessage[],
  userId: string,
) {
  if (!userId) return

  localStorage.setItem(
    `${CHATS_KEY}-${userId}`,
    JSON.stringify(chats),
  )
}
