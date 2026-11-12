
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  CircleHelp,
  PackageSearch,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

import { useState } from 'react'
import type { Item, UserProfile } from '../types'
import ItemCard from '../components/ItemCard'

type Props = {
  items: Item[]
  onNavigate: (page: string) => void
  onOpen: (item: Item) => void
  savedIds: string[]
  onSave: (id: string) => void
  onSearch: (value: string) => void
  user: UserProfile
  onProfile: () => void
  chatsCount: number
}

export default function HomePage({
  items,
  onNavigate,
  onOpen,
  savedIds,
  onSave,
  onSearch,
  user,
  onProfile,
  chatsCount,
}: Props) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [readNotifications, setReadNotifications] = useState(false)

  // Data Notifikasi
  const notifications = [
    ...items.slice(0, 2).map((item) => ({
      id: item.id,
      title:
        item.status === 'Hilang'
          ? 'Laporan barang hilang baru'
          : 'Barang baru ditemukan',
      detail: `${item.title} · ${item.location}`,
      time: item.date || 'Baru saja',
    })),

    ...(chatsCount
      ? [
          {
            id: 'chat-notification',
            title: 'Percakapan kamu diperbarui',
            detail: `${chatsCount} pesan tersimpan di demo ini`,
            time: 'Terbaru',
          },
        ]
      : []),
  ].slice(0, 4)

  // Data Barang Terbaru
  const latest = items
    .filter((item) => item.status !== 'Dikembalikan')
    .slice(0, 3)

  // Statistik Barang
  const activeCount = items.filter(
    (item) => item.status !== 'Dikembalikan'
  ).length

  const foundCount = items.filter(
    (item) => item.status === 'Ditemukan'
  ).length

  const returnedCount = items.filter(
    (item) => item.status === 'Dikembalikan'
  ).length

  return (
    <div className="page-content">
      {/* Header */}
      <header className="topbar">
        <div className="breadcrumb">
          Workspace
          <span>/</span>
          <b>Beranda</b>
        </div>

        <div className="topbar-actions">
          <span className="campus-tag">
            <span />
            Campus community
          </span>

          {/* Notifikasi */}
          <div className="notification-wrap">
            <button
              className="icon-button notification-button"
              onClick={() => {
                setNotificationsOpen((v) => !v)
                setReadNotifications(true)
              }}
              aria-label="Notifikasi"
              aria-expanded={notificationsOpen}
            >
              <Bell size={19} />

              {!readNotifications && <i />}
            </button>

            {notificationsOpen && (
              <div className="notifications-popover">
                <div className="notifications-head">
                  <div>
                    <b>Notifikasi</b>
                    <small>Aktivitas terbaru di FindU</small>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    aria-label="Tutup notifikasi"
                  >
                    ×
                  </button>
                </div>

                {notifications.length ? (
                  notifications.map((n) => (
                    <div
                      className="notification-item"
                      key={n.id}
                    >
                      <span className="notification-dot" />

                      <div>
                        <b>{n.title}</b>
                        <p>{n.detail}</p>
                        <small>{n.time}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="notification-empty">
                    Belum ada notifikasi baru.
                  </div>
                )}

                <button
                  className="notifications-footer"
                  onClick={() => {
                    setNotificationsOpen(false)
                    onNavigate('search')
                  }}
                >
                  Jelajahi laporan
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Avatar Profil */}
          <button
            className="top-avatar top-avatar-button"
            onClick={onProfile}
            aria-label="Buka profil"
          >
            {user.photo ? (
              <img className="avatar-img" src={user.photo} alt="" />
            ) : (
              user.avatar || 'U'
            )}
          </button>
        </div>
      </header>

      <main className="main-inner">
        {/* Bagian Sambutan */}
        <section className="welcome-row">
          <div>
            <div className="eyebrow">
              <Sparkles size={14} />
              RUANG AMAN UNTUK BARANGMU
            </div>

            <h1>
              Barang Hilang?
              <br />
              <span>Santai, ada FindU.</span>
            </h1>

            <p>
              Platform untuk menemukan yang hilang
              <br className="desktop-break" />
              dan mengembalikan yang bukan milikmu.
            </p>
          </div>

          {/* Ilustrasi FindU */}
          <div
            className="welcome-art"
            aria-hidden="true"
          >
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />

            <div className="art-star">✳</div>

            <div className="art-card art-card-back">
              <span>FINDU ID</span>
              <div className="art-card-line" />
              <div className="art-card-line short" />
            </div>

            <div className="art-card art-card-front">
              <div className="art-card-icon">
                <Search size={21} />
              </div>

              <span>LOST SOMETHING?</span>

              <b>
                It's closer
                <br />
                than you think.
              </b>

              <div className="art-card-dots">
                •••• ••••
              </div>
            </div>

            <div className="art-floating">
              <CheckCircle2 size={17} />
              <span>One step closer!</span>
            </div>
          </div>
        </section>

        {/* Panel Pencarian */}
        <section className="search-panel">
          <div className="search-panel-title">
            <div className="search-title-icon">
              <Search size={18} />
            </div>

            <div>
              <b>Temukan barangmu</b>
              <small>Coba cari nama atau jenis barang</small>
            </div>
          </div>

          <form
            className="hero-search"
            onSubmit={(e) => {
              e.preventDefault()

              const value =
                new FormData(e.currentTarget)
                  .get('q')
                  ?.toString() || ''

              onSearch(value)
              onNavigate('search')
            }}
          >
            <Search size={19} />

            <input
              name="q"
              placeholder="Contoh: dompet, tumbler, kartu mahasiswa..."
            />

            <button type="submit">
              Cari barang
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="popular-search">
            <span>Sering dicari</span>

            {['Dompet', 'Elektronik', 'Kartu mahasiswa'].map(
              (t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => {
                    onSearch(t)
                    onNavigate('search')
                  }}
                >
                  {t}
                </button>
              )
            )}
          </div>
        </section>

        {/* Statistik */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-purple">
              <PackageSearch size={19} />
            </div>

            <div className="stat-label">
              Laporan aktif
            </div>

            <div className="stat-bottom">
              <strong>
                {activeCount.toString().padStart(2, '0')}
              </strong>

              <span className="stat-note">
                <TrendingUp size={13} />
                di kampus
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-green">
              <CheckCircle2 size={19} />
            </div>

            <div className="stat-label">
              Barang ditemukan
            </div>

            <div className="stat-bottom">
              <strong>
                {foundCount.toString().padStart(2, '0')}
              </strong>

              <span className="stat-note">
                siap diklaim
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-orange">
              <HeartIcon />
            </div>

            <div className="stat-label">
              Berhasil kembali
            </div>

            <div className="stat-bottom">
              <strong>
                {returnedCount.toString().padStart(2, '0')}
              </strong>

              <span className="stat-note">
                ke pemiliknya
              </span>
            </div>
          </div>
        </section>

        {/* Daftar Barang Terbaru */}
        <section className="section-heading">
          <div>
            <div className="section-kicker">
              DARI KOMUNITAS KAMPUS
            </div>

            <h2>
              Baru saja dilaporkan
              <span className="heading-spark">✳</span>
            </h2>

            <p>
              Mungkin salah satunya adalah yang sedang kamu cari.
            </p>
          </div>

          <button
            className="text-link"
            onClick={() => onNavigate('search')}
          >
            Lihat semua
            <ArrowUpRight size={16} />
          </button>
        </section>

        <section className="items-grid">
          {latest.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onOpen={onOpen}
              saved={savedIds.includes(item.id)}
              onSave={onSave}
            />
          ))}
        </section>

        {/* Banner Laporan Barang */}
        <section className="bottom-banner">
          <div className="banner-icon">
            <ShieldCheck size={22} />
          </div>

          <div>
            <b>
              Menemukan sesuatu yang bukan milikmu?
            </b>

            <p>
              Satu laporan kecil bisa berarti besar bagi orang lain.
            </p>
          </div>

          <button onClick={() => onNavigate('report')}>
            Laporkan temuan
            <ArrowRight size={16} />
          </button>

          <div className="banner-decoration">✳</div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <span>© 2026 FindU Campus</span>

          <span>
            <CircleHelp size={13} />
            Dibuat untuk saling membantu.
          </span>
        </footer>
      </main>
    </div>
  )
}

// Ikon Statistik Barang Kembali
function HeartIcon() {
  return (
    <span className="heart-stat">
      ♥
    </span>
  )
}
