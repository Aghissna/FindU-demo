import {
  ChevronsUpDown,
  Compass,
  LogOut,
  MessageCircle,
  PackagePlus,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import type { UserProfile } from '../types'

type Props = {
  page: string
  onNavigate: (page: string) => void
  chatCount: number
  user: UserProfile
  onLogout: () => void // BARU: dipakai tombol "Keluar"
}

export default function Sidebar({ page, onNavigate, chatCount, user, onLogout }: Props) {
  const links = [
    { id: 'home', label: 'Beranda', icon: Compass },
    { id: 'search', label: 'Cari barang', icon: Search },
    { id: 'chat', label: 'Pesan', icon: MessageCircle, count: chatCount },
    { id: 'report', label: 'Lapor barang', icon: PackagePlus },
  ]

  return (
    <aside className="sidebar">
      {/* tiga titik jendela seperti di referensi */}
      <div className="glass-dots" aria-hidden="true"><i /><i /><i /></div>

      <button className="brand" onClick={() => onNavigate('home')} aria-label="Ke beranda FindU">
        <span className="brand-mark"><Search size={21} strokeWidth={2.7} /></span>
        <span>FIND<span className="brand-u">U</span></span>
      </button>

      {/* kartu pengguna */}
      <button className="user-card" onClick={() => onNavigate('profile')}>
      <div className="avatar avatar-me">
          {user.photo ? <img className="avatar-img" src={user.photo} alt="" /> : (user.avatar || 'U')}
      </div>
        <span className="profile-text">
          <b>{user.name}</b>
          <small>{user.major || 'Mahasiswa'}</small>
        </span>
        <ChevronsUpDown size={15} className="user-chevron" />
      </button>

      <div className="nav-label">MENU</div>
      <nav className="nav-links">
        {links.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            className={`nav-link ${page === id ? 'active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={19} />
            <span>{label}</span>
            {count ? <span className="nav-count">{count}</span> : null}
          </button>
        ))}

        <div className="nav-divider" />

        <button
          className={`nav-link ${page === 'profile' ? 'active' : ''}`}
          onClick={() => onNavigate('profile')}
        >
          <UserRound size={19} />
          <span>Profil saya</span>
        </button>
        <button
          className="nav-link"
          onClick={() =>
            alert(
              'Tips aman: verifikasi ciri barang melalui chat, pilih tempat umum untuk serah terima, dan jangan bagikan kata sandi atau kode OTP.',
            )
          }
        >
          <ShieldCheck size={19} />
          <span>Tips keamanan</span>
        </button>
      </nav>

      <div className="sidebar-bottom">
        <div className="nav-divider" />
        <button className="nav-link logout" onClick={onLogout}>
          <LogOut size={19} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  )
}
