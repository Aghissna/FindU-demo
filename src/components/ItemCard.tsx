import { MapPin, CalendarDays, ArrowUpRight, Heart } from 'lucide-react'
import type { Item } from '../types'

type Props = { item: Item; onOpen: (item: Item) => void; saved: boolean; onSave: (id: string) => void }

export default function ItemCard({ item, onOpen, saved, onSave }: Props) {
  return (
    <article className="item-card">
      <button className="item-image-button" onClick={() => onOpen(item)} aria-label={`Lihat ${item.title}`}>
        <img className="item-image" src={item.image} alt={item.title} loading="lazy" />
        <span className={`status-pill ${item.status === 'Hilang' ? 'status-lost' : item.status === 'Dikembalikan' ? 'status-done' : 'status-found'}`}>
          <span />{item.status}
        </span>
      </button>
      <button className={`save-button ${saved ? 'saved' : ''}`} onClick={() => onSave(item.id)} aria-label="Simpan barang">
        <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
      </button>
      <div className="item-card-body">
        <div className="item-category">{item.category}</div>
        <button className="item-title" onClick={() => onOpen(item)}>{item.title}</button>
        <div className="item-meta"><MapPin size={14} /><span>{item.location}</span></div>
        <div className="item-meta"><CalendarDays size={14} /><span>{item.date}</span></div>
        <div className="item-card-footer">
          <div className="reporter-avatar">{item.reporter.split(' ').map(s => s[0]).slice(0,2).join('')}</div>
          <span className="reporter-name">{item.reporter}</span>
          <button className="card-arrow" onClick={() => onOpen(item)} aria-label="Buka detail"><ArrowUpRight size={17} /></button>
        </div>
      </div>
    </article>
  )
}
