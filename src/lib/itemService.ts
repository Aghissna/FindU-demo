
import type { User } from '@supabase/supabase-js'

import { supabase } from './supabase'
import type { Item } from '../types'

type ItemRow = {
  id: string
  title: string
  category: string
  location: string
  date: string
  description: string
  status: string
  image: string | null
  reporter_id: string
  kind: string
  created_at: string
  reporter_profile?: {
    name: string | null
  } | {
    name: string | null
  }[] | null
}

type MigrationResult = {
  imported: number
  failed: {
    item: Item
    error: string
  }[]
}

const ITEM_SELECT = `
  id,
  title,
  category,
  location,
  date,
  description,
  status,
  image,
  reporter_id,
  kind,
  created_at,
  reporter_profile:profiles!items_reporter_id_fkey(name)
`

function mapItem(row: ItemRow): Item {
  const profile = Array.isArray(row.reporter_profile)
    ? row.reporter_profile[0]
    : row.reporter_profile

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    location: row.location,
    date: row.date,
    description: row.description,
    status: row.status as Item['status'],
    image: row.image || '',
    reporter: profile?.name || 'Mahasiswa FindU',
    kind: row.kind as Item['kind'],
  }
}

async function uploadItemImage(
  image: string,
  userId: string,
  itemId: string,
): Promise<string> {
  // URL foto yang sudah tersimpan tidak perlu diunggah ulang.
  if (!image || !image.startsWith('data:')) {
    return image
  }

  const response = await fetch(image)

  if (!response.ok) {
    throw new Error('Gagal membaca file foto.')
  }

  const blob = await response.blob()

  const extension =
    blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'

  const filePath = `${userId}/${itemId}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from('items')
    .upload(filePath, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: true,
    })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage
    .from('items')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function fetchItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select(ITEM_SELECT)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Gagal mengambil data barang:', error)
    throw error
  }

  return (data || []).map((row) =>
    mapItem(row as unknown as ItemRow),
  )
}

export async function createItem(
  item: Item,
  authUser: User,
  reporterName: string,
): Promise<Item> {
  if (!authUser?.id) {
    throw new Error('Pengguna belum login.')
  }

  const itemId = item.id || crypto.randomUUID()

  // Upload foto ke Supabase Storage jika berupa Base64.
  const imageUrl = await uploadItemImage(
    item.image || '',
    authUser.id,
    itemId,
  )

  const { data, error } = await supabase
    .from('items')
    .insert({
      id: itemId,
      title: item.title,
      category: item.category,
      location: item.location,
      date: item.date,
      description: item.description,
      status: item.status,
      image: imageUrl || null,
      reporter_id: authUser.id,
      kind: item.kind,
    })
    .select(ITEM_SELECT)
    .single()

  if (error) {
    console.error('Gagal menyimpan barang:', error)
    throw error
  }

  const result = mapItem(data as unknown as ItemRow)

  return {
    ...result,
    reporter: result.reporter || reporterName || 'Mahasiswa FindU',
  }
}

/**
 * Memindahkan laporan lama dari localStorage ke Supabase.
 * Laporan yang sudah pernah masuk tidak akan diimpor ulang.
 */
export async function migrateLegacyItems(
  legacyItems: Item[],
  authUser: User,
  reporterName: string,
): Promise<MigrationResult> {
  if (!authUser?.id) {
    throw new Error('Pengguna belum login.')
  }

  let imported = 0

  const failed: MigrationResult['failed'] = []

  for (const item of legacyItems) {
    try {
      // Periksa apakah laporan yang sama sudah ada untuk akun ini.
      // Ini mencegah duplikasi jika migrasi sebelumnya hanya berhasil sebagian.
      const { data: existingItems, error: checkError } = await supabase
        .from('items')
        .select('id')
        .eq('reporter_id', authUser.id)
        .eq('title', item.title)
        .eq('category', item.category)
        .eq('location', item.location)
        .eq('date', item.date)
        .eq('description', item.description)
        .eq('kind', item.kind)
        .limit(1)

      if (checkError) {
        throw checkError
      }

      // Jika sudah ada, lewati tanpa membuat laporan baru.
      if (existingItems && existingItems.length > 0) {
        continue
      }

      // Gunakan UUID baru agar ID lokal lama yang bukan UUID
      // tidak menyebabkan kegagalan saat insert ke Supabase.
      const itemToImport: Item = {
        ...item,
        id: crypto.randomUUID(),
        reporter: reporterName || item.reporter || 'Mahasiswa FindU',
      }

      await createItem(
        itemToImport,
        authUser,
        reporterName,
      )

      imported += 1
    } catch (error) {
      console.error(
        `Gagal memigrasikan laporan "${item.title}":`,
        error,
      )

      failed.push({
        item,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      })
    }
  }

  return {
    imported,
    failed,
  }
}
