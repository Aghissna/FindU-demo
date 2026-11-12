import type { Item } from '../types'

export const seedItems: Item[] = [
  {
    id: 'item-1', title: 'Dompet kulit cokelat', category: 'Aksesori',
    location: 'Perpustakaan Pusat', date: '14 Okt 2026',
    description: 'Dompet kulit warna cokelat ditemukan di area meja baca lantai 2. Ada beberapa kartu di dalamnya.',
    status: 'Ditemukan', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85',
    reporter: 'Budi Santoso', kind: 'found'
  },
  {
    id: 'item-2', title: 'Headphone wireless', category: 'Elektronik',
    location: 'Gedung Fakultas A', date: '14 Okt 2026',
    description: 'Headphone warna hitam tertinggal di ruang kelas setelah perkuliahan siang.',
    status: 'Ditemukan', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85',
    reporter: 'Nadia Putri', kind: 'found'
  },
  {
    id: 'item-3', title: 'Tumbler warna sage', category: 'Botol & Bekal',
    location: 'Kantin Utama', date: '13 Okt 2026',
    description: 'Tumbler hijau sage tertinggal di meja dekat jendela kantin.',
    status: 'Hilang', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85',
    reporter: 'Alya Rahma', kind: 'lost'
  },
  {
    id: 'item-4', title: 'Buku catatan hitam', category: 'Alat Tulis',
    location: 'Ruang Diskusi B', date: '12 Okt 2026',
    description: 'Notebook hitam polos dengan beberapa sticky notes di bagian depan.',
    status: 'Ditemukan', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=85',
    reporter: 'Raka Pratama', kind: 'found'
  },
  {
    id: 'item-5', title: 'Kunci motor dengan gantungan', category: 'Lainnya',
    location: 'Parkiran Timur', date: '12 Okt 2026',
    description: 'Satu set kunci dengan gantungan kecil warna biru ditemukan dekat parkiran motor.',
    status: 'Ditemukan', image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=900&q=85',
    reporter: 'Dimas Akbar', kind: 'found'
  },
  {
    id: 'item-6', title: 'Kartu mahasiswa', category: 'Dokumen',
    location: 'Gedung Student Center', date: '11 Okt 2026',
    description: 'Kartu mahasiswa ditemukan di dekat pintu masuk Student Center.',
    status: 'Ditemukan', image: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=900&q=85',
    reporter: 'Salsa Maharani', kind: 'found'
  }
]
