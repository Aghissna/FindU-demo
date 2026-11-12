import { Search, SlidersHorizontal, MapPin, X, PackageOpen } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Item } from '../types'
import ItemCard from '../components/ItemCard'

type Props = { items: Item[]; initialQuery: string; onOpen: (item: Item) => void; savedIds: string[]; onSave: (id: string) => void }
const categories = ['Semua kategori', 'Elektronik', 'Aksesori', 'Botol & Bekal', 'Alat Tulis', 'Dokumen', 'Lainnya']
const locations = ['Semua lokasi', 'Perpustakaan Pusat', 'Gedung Fakultas A', 'Kantin Utama', 'Ruang Diskusi B', 'Parkiran Timur', 'Gedung Student Center']
export default function SearchPage({ items, initialQuery, onOpen, savedIds, onSave }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState('Semua kategori')
  const [location, setLocation] = useState('Semua lokasi')
  const [status, setStatus] = useState('Semua status')
  const filtered = useMemo(() => items.filter(item => {
    const haystack = `${item.title} ${item.description} ${item.reporter}`.toLowerCase()
    return (!query || haystack.includes(query.toLowerCase())) &&
      (category === 'Semua kategori' || item.category === category) &&
      (location === 'Semua lokasi' || item.location === location) &&
      (status === 'Semua status' || item.status === status)
  }), [items, query, category, location, status])
  const clear = () => { setQuery(''); setCategory('Semua kategori'); setLocation('Semua lokasi'); setStatus('Semua status') }
  return <div className="page-content">
    <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>Cari barang</b></div><div className="topbar-actions"><span className="campus-tag"><span/> Campus community</span></div></header>
    <main className="main-inner">
      <div className="page-intro"><div className="eyebrow"><Search size={14}/> PENCARIAN BARANG</div><h1>Yuk, cari <span>barangnya.</span></h1><p>Gunakan kata kunci dan filter lokasi untuk mempersempit hasil.</p></div>
      <div className="filter-panel">
        <div className="search-input-wrap"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Nama barang, deskripsi, atau pelapor..." /><button onClick={() => setQuery('')} aria-label="Hapus pencarian"><X size={16}/></button></div>
        <div className="filters-row"><div className="filter-label"><SlidersHorizontal size={16}/> Filter</div>
          <select value={category} onChange={e => setCategory(e.target.value)} aria-label="Kategori">{categories.map(c => <option key={c}>{c}</option>)}</select>
          <select value={location} onChange={e => setLocation(e.target.value)} aria-label="Lokasi">{locations.map(l => <option key={l}>{l}</option>)}</select>
          <select value={status} onChange={e => setStatus(e.target.value)} aria-label="Status"><option>Semua status</option><option>Hilang</option><option>Ditemukan</option><option>Dikembalikan</option></select>
          <button className="clear-filter" onClick={clear}>Reset</button>
        </div>
      </div>
      <div className="results-heading"><div><h2>Hasil pencarian <span>({filtered.length})</span></h2><p>Periksa detail barang sebelum mengajukan klaim.</p></div><span className="results-sort">Terbaru dahulu ↓</span></div>
      {filtered.length ? <div className="items-grid">{filtered.map(item => <ItemCard key={item.id} item={item} onOpen={onOpen} saved={savedIds.includes(item.id)} onSave={onSave}/>)}</div> :
        <div className="empty-state"><div className="empty-icon"><PackageOpen size={28}/></div><h3>Belum ada barang yang cocok</h3><p>Coba kata kunci lain atau ubah filter pencarianmu.</p><button className="primary-button" onClick={clear}>Reset pencarian</button></div>}
      <footer className="footer"><span>© 2026 FindU Campus</span><span><MapPin size={13}/> Cari dengan aman, kembalikan dengan senang.</span></footer>
    </main>
  </div>
}
