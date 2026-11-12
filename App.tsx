
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Check,
  MapPin,
  MessageCircle,
  ShieldCheck,
  X,
} from 'lucide-react'

import Sidebar from './components/Sidebar'
import Modal from './components/Modal'

import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import ReportPage from './pages/ReportPage'
import ChatPage from './pages/ChatPage'
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage'

import type { ChatMessage, Item, UserProfile } from './types'

import {
  getChats,
  getItems,
  saveChats,
  saveItems,
} from './utils/storage'

const SESSION_KEY = 'findu-current-user-v1'

function getCurrentUser(): UserProfile | null {
  try {
    return JSON.parse(
      localStorage.getItem(SESSION_KEY) || 'null',
    ) as UserProfile | null
  } catch {
    return null
  }
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(
    () => getCurrentUser(),
  )

  const [page, setPage] = useState('home')

  const [items, setItems] = useState<Item[]>(
    () => getItems(),
  )

  const [chats, setChats] = useState<ChatMessage[]>(
    () => getChats(),
  )

  const [selectedItem, setSelectedItem] = useState<Item | null>(
    null,
  )

  const [searchQuery, setSearchQuery] = useState('')
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [toast, setToast] = useState('')

  // Simpan data barang setiap kali terjadi perubahan.
  useEffect(() => {
    saveItems(items)
  }, [items])

  // Simpan data percakapan setiap kali terjadi perubahan.
  useEffect(() => {
    saveChats(chats)
  }, [chats])

  // Hilangkan notifikasi setelah beberapa detik.
  useEffect(() => {
    if (!toast) return

    const timer = window.setTimeout(() => {
      setToast('')
    }, 2800)

    return () => window.clearTimeout(timer)
  }, [toast])

  // Navigasi antarhalaman.
  const navigate = (next: string) => {
    setPage(next)
    setSelectedItem(null)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // Proses setelah pengguna berhasil login atau mendaftar.
  const handleAuth = (nextUser: UserProfile) => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(nextUser),
    )

    setUser(nextUser)
    setPage('home')

    setToast(
      `Selamat datang, ${nextUser.name.split(' ')[0]}!`,
    )
  }

  // Perbarui profil pengguna.
  const updateProfile = (nextUser: UserProfile) => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(nextUser),
    )

    setUser(nextUser)

    try {
      const key = 'findu-demo-users-v1'

      const users = JSON.parse(
        localStorage.getItem(key) || '[]',
      )

      const updated = users.map(
        (u: UserProfile & { password: string }) =>
          u.id === nextUser.id
            ? { ...u, ...nextUser }
            : u,
      )

      localStorage.setItem(
        key,
        JSON.stringify(updated),
      )
    } catch {
      // Abaikan kesalahan pembaruan data demo.
    }

    setToast('Profil berhasil diperbarui')
  }

  // Keluar dari akun.
  const logout = () => {
    localStorage.removeItem(SESSION_KEY)

    setUser(null)
    setPage('home')
    setToast('Kamu sudah keluar dari akun')
  }

  // Simpan kata kunci pencarian.
  const openSearch = (value: string) => {
    setSearchQuery(value)
  }

  // Tambahkan laporan barang baru.
  const addItem = (item: Item) => {
    setItems((prev) => [item, ...prev])
    setToast('Laporan berhasil dipublikasikan')
  }

  // Tambahkan atau hapus barang dari daftar simpanan.
  const toggleSave = (id: string) => {
    const isSaved = savedIds.includes(id)

    setSavedIds((prev) =>
      isSaved
        ? prev.filter((x) => x !== id)
        : [...prev, id],
    )

    setToast(
      isSaved
        ? 'Dihapus dari simpanan'
        : 'Barang disimpan',
    )
  }

  // Tambahkan pesan ke percakapan.
  const sendMessage = (message: ChatMessage) => {
    setChats((prev) => [...prev, message])
    setToast('Pesan tersimpan di percakapan demo')
  }

  // Hitung jumlah barang yang memiliki percakapan.
  const chatCount = useMemo(() => {
    return new Set(
      chats.map((chat) => chat.itemId),
    ).size
  }, [chats])

  // Mulai proses klaim melalui percakapan.
  const claim = (item: Item) => {
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      itemId: item.id,
      sender: 'me',
      text: `Halo, saya ingin mengklaim "${item.title}". Saya bisa menjelaskan ciri khususnya untuk verifikasi. Apakah kita bisa mencocokkannya?`,
      time: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    setChats((prev) => [...prev, message])
    setSelectedItem(null)
    setPage('chat')

    setToast('Permintaan klaim dimulai melalui chat')
  }

  // Jika belum login, tampilkan halaman autentikasi.
  if (!user) {
    return (
      <>
        <AuthPage onSuccess={handleAuth} />

        {toast && (
          <div className="toast">
            <span>
              <Check size={15} />
            </span>

            {toast}

            <button
              onClick={() => setToast('')}
              aria-label="Tutup notifikasi"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        onNavigate={navigate}
        chatCount={chatCount}
        user={user}
        onLogout={logout}
      />

      <div className="mobile-brand">
        <span className="brand-mark">
          <MessageCircle size={19} />
        </span>

        <b>
          find<span>u</span>
        </b>

        <button onClick={() => navigate('report')}>
          + Lapor
        </button>
      </div>

      <div className="workspace">
        {page === 'home' && (
          <HomePage
            items={items}
            onNavigate={navigate}
            onOpen={setSelectedItem}
            savedIds={savedIds}
            onSave={toggleSave}
            onSearch={openSearch}
            user={user}
            onProfile={() => navigate('profile')}
            chatsCount={chats.length}
          />
        )}

        {page === 'search' && (
          <SearchPage
            items={items}
            initialQuery={searchQuery}
            onOpen={setSelectedItem}
            savedIds={savedIds}
            onSave={toggleSave}
          />
        )}

        {page === 'report' && (
          <ReportPage
            onBack={() => navigate('home')}
            onSubmit={addItem}
          />
        )}

        {page === 'chat' && (
          <ChatPage
            items={items.filter(
              (item) => item.status !== 'Dikembalikan',
            )}
            chats={chats}
            onSend={sendMessage}
            onOpenItem={setSelectedItem}
          />
        )}

        {page === 'profile' && (
          <ProfilePage
            user={user}
            onSave={updateProfile}
            onBack={() => navigate('home')}
            onLogout={logout}
          />
        )}
      </div>

      {/* Modal detail barang */}
      {selectedItem && (
        <Modal
          title="Detail barang"
          onClose={() => setSelectedItem(null)}
        >
          <div className="detail-modal-content">
            <img
              className="detail-image"
              src={selectedItem.image}
              alt={selectedItem.title}
            />

            <div className="detail-info">
              <span
                className={`status-pill ${
                  selectedItem.status === 'Hilang'
                    ? 'status-lost'
                    : selectedItem.status === 'Dikembalikan'
                      ? 'status-done'
                      : 'status-found'
                }`}
              >
                <span />
                {selectedItem.status}
              </span>

              <div className="item-category">
                {selectedItem.category}
              </div>

              <h2>{selectedItem.title}</h2>

              <p>{selectedItem.description}</p>

              <div className="detail-meta">
                <MapPin size={15} />
                {selectedItem.location}
              </div>

              <div className="detail-meta">
                <span className="reporter-avatar">
                  {selectedItem.reporter
                    .split(' ')
                    .map((name) => name[0])
                    .slice(0, 2)
                    .join('')}
                </span>

                <span>
                  Dilaporkan oleh{' '}
                  <b>{selectedItem.reporter}</b>
                </span>
              </div>
            </div>

            <div className="claim-safety">
              <ShieldCheck size={18} />

              <p>
                Untuk keamanan, simpan ciri unik barang
                untuk proses verifikasi. Jangan membagikan
                data sensitif di ruang publik.
              </p>
            </div>

            <div className="detail-actions">
              <button
                className="secondary-button"
                onClick={() => {
                  setSelectedItem(null)
                  setPage('chat')
                }}
              >
                <MessageCircle size={16} />
                Buka chat
              </button>

              <button
                className="primary-button"
                onClick={() => claim(selectedItem)}
                disabled={
                  selectedItem.status === 'Dikembalikan'
                }
              >
                {selectedItem.status === 'Hilang'
                  ? 'Saya punya informasi'
                  : 'Klaim kepemilikan'}

                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Notifikasi */}
      {toast && (
        <div className="toast">
          <span>
            <Check size={15} />
          </span>

          {toast}

          <button
            onClick={() => setToast('')}
            aria-label="Tutup notifikasi"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Navigasi versi mobile */}
      <div className="mobile-bottom-nav">
        <button
          className={page === 'home' ? 'active' : ''}
          onClick={() => navigate('home')}
        >
          <span>⌂</span>
          Beranda
        </button>

        <button
          className={page === 'search' ? 'active' : ''}
          onClick={() => navigate('search')}
        >
          <span>⌕</span>
          Cari
        </button>

        <button
          className="mobile-add"
          onClick={() => navigate('report')}
        >
          <span>＋</span>
        </button>

        <button
          className={page === 'chat' ? 'active' : ''}
          onClick={() => navigate('chat')}
        >
          <span>▤</span>
          Pesan
        </button>

        <button
          className={page === 'profile' ? 'active' : ''}
          onClick={() => navigate('profile')}
        >
          <span>◉</span>
          Profil
        </button>
      </div>
    </div>
  )
}
