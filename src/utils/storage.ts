import type { ChatMessage, Item } from '../types'
import { seedItems } from '../data/seed'

const ITEMS_KEY = 'findu-items-v1'
const CHATS_KEY = 'findu-chats-v1'

export function getItems(): Item[] {
  try {
    const stored = localStorage.getItem(ITEMS_KEY)
    if (stored) return JSON.parse(stored) as Item[]
  } catch { /* gunakan data awal bila penyimpanan tidak tersedia */ }
  return seedItems
}

export function saveItems(items: Item[]) {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
}

export function getChats(): ChatMessage[] {
  try { return JSON.parse(localStorage.getItem(CHATS_KEY) || '[]') as ChatMessage[] }
  catch { return [] }
}

export function saveChats(chats: ChatMessage[]) {
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats))
}
