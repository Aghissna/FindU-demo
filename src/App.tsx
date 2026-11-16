import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  Check,
  MapPin,
  MessageCircle,
  ShieldCheck,
  X,
  House,
  Search,
  Plus,
  UserRound,
} from 'lucide-react'

import { supabase } from './lib/supabase'
import { getUserProfile } from './lib/profileService'
import {
  createItem,
  fetchItems,
  migrateLegacyItems,
} from './lib/itemService'

import Sidebar from './components/Sidebar'
import Modal from './components/Modal'

import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import ReportPage from './pages/ReportPage'
import ChatPage from './pages/ChatPage'
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage'

import type { ChatMessage, Item, UserProfile } from './types'

import { seedItems } from './data/seed'
import {
  getChats,
  getItems,
  getStoredItems,
  hasItemsMigrationCompleted,
  markItemsMigrationCompleted,
  saveChats,
} from './utils/storage'

function getAvatarStoragePath(url?: string): string | null {
  if (!url) return null

  const marker = '/storage/v1/object/public/avatars/'
  const markerIndex = url.indexOf(marker)

  if (markerIndex === -1) return null

  const path = url.slice(markerIndex + marker.length).split('?')[0]

  try {
    return decodeURIComponent(path)
  } catch {
    return path
  }
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [page, setPage] = useState('home')

  const [items, setItems] = useState<Item[]>(() => getItems())
  const [chats, setChats] = useState<ChatMessage[]>([])
  const skipNextChatSaveRef = useRef(false)

  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [toast, setToast] = useState('')

  const profileRequestRef = useRef(0)

  // ==========================================
  // SUPABASE AUTH SESSION
  // ==========================================
  useEffect(() => {
    let active = true

    const loadProfile = async (authUser: { id: string }) => {
      const requestId = ++profileRequestRef.current

      setAuthLoading(true)

      try {
        const { data, error } = await supabase.auth.getUser()

        if (error) throw error

        if (!data.user || data.user.id !== authUser.id) {
          throw new Error('Sesi pengguna tidak valid.')
        }

        const profile = await getUserProfile(data.user)

        if (active && requestId === profileRequestRef.current) {
          setUser(profile)
          setAuthLoading(false)
        }
      } catch (error) {
        console.error('Gagal memuat profil:', error)

        if (active && requestId === profileRequestRef.current) {
          setUser(null)
          setAuthLoading(false)
          setToast('Gagal memuat profil. Silakan masuk kembali.')
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return

      if (session?.user) {
        window.setTimeout(() => {
          if (active) {
            void loadProfile(session.user)
          }
        }, 0)
      } else {
        profileRequestRef.current += 1
        setUser(null)
        setAuthLoading(false)
      }
    })

    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) throw error
        if (!active) return

        if (data.session?.user) {
          await loadProfile(data.session.user)
        } else {
          setUser(null)
          setAuthLoading(false)
        }
      } catch (error) {
        console.error('Gagal memeriksa session:', error)

        if (active) {
          setUser(null)
          setAuthLoading(false)
        }
      }
    }

    void checkSession()

    return () => {
      active = false
      profileRequestRef.current += 1
      subscription.unsubscribe()
    }
  }, [])

  // ==========================================
  // MIGRASI DATA LAMA DAN AMBIL DATA SUPABASE
  // ==========================================
  useEffect(() => {
    if (!user) return

    let active = true

    const loadItems = async () => {
      try {
        // Ambil data laporan lama dari localStorage.
        const storedItems = getStoredItems() ?? []

        // Kenali ID enam data contoh bawaan aplikasi.
        const seedIds = new Set(
          seedItems.map((item) => item.id),
        )

        // Hanya ambil laporan lama buatan pengguna.
        const legacyItems = storedItems.filter(
          (item) => !seedIds.has(item.id),
        )

        // Periksa status migrasi untuk akun yang sedang login.
        const migrationCompleted =
          hasItemsMigrationCompleted(user.id)

        if (!migrationCompleted) {
          // Jika belum ada laporan lama, tidak perlu mengimpor.
          if (legacyItems.length === 0) {
            markItemsMigrationCompleted(user.id)
          } else {
            // Pastikan sesi Supabase masih sesuai dengan akun aktif.
            const { data, error } = await supabase.auth.getUser()

            if (error) throw error

            if (!data.user || data.user.id !== user.id) {
              throw new Error('Sesi pengguna tidak valid untuk migrasi.')
            }

            // Impor laporan lama ke Supabase.
            const migrationResult = await migrateLegacyItems(
              legacyItems,
              data.user,
              user.name || 'Mahasiswa FindU',
            )

            if (!active) return

            // Jika ada yang gagal, jangan tandai migrasi selesai.
            // Data lama tetap tersedia di localStorage.
            if (migrationResult.failed.length > 0) {
              console.error(
                'Laporan gagal dimigrasikan:',
                migrationResult.failed,
              )

              setToast(
                `${migrationResult.imported} laporan berhasil diimpor, ${migrationResult.failed.length} gagal. Silakan coba lagi nanti.`,   
              )

              return
            }

            // Tandai selesai hanya jika seluruh laporan berhasil
            // diimpor atau sudah pernah ada di database.
            markItemsMigrationCompleted(user.id)

            if (migrationResult.imported > 0) {
              setToast(
                `${migrationResult.imported} laporan lama berhasil dipindahkan ke Supabase.`,
              )
            }
          }
        }

        // Ambil ulang data setelah migrasi selesai.
        const databaseItems = await fetchItems()

        if (!active) return

        // Gabungkan laporan database dan data contoh.
        // Laporan lokal lama tidak digabung lagi karena sudah
        // diimpor ke Supabase.
        const combinedItems = [
          ...databaseItems,
          ...seedItems,
        ]

        // Hindari ID yang sama tampil lebih dari sekali.
        const uniqueItems = Array.from(
          new Map(
            combinedItems.map((item) => [item.id, item]),
          ).values(),
        )

        setItems(uniqueItems)
      } catch (error) {
        console.error(
          'Gagal memuat atau memigrasikan laporan:',
          error,
        )

        if (active) {
          setToast(
            error instanceof Error
              ? `Gagal memuat laporan: ${error.message}`
              : 'Gagal memuat laporan dari database.',
          )
        }
      }
    }

    void loadItems()

    return () => {
      active = false
    }
  }, [user?.id])

  // ==========================================
  // MUAT CHAT SESUAI AKUN LOGIN
  // ==========================================
  useEffect(() => {
    if (!user?.id) {
      setChats([])
      return
    }

    // Cegah chat akun sebelumnya tersimpan ke akun baru.
    skipNextChatSaveRef.current = true
    setChats(getChats(user.id))
  }, [user?.id])

  // ==========================================
  // SIMPAN CHAT SESUAI AKUN LOGIN
  // ==========================================
  useEffect(() => {
    if (!user?.id) return

    // Lewati penyimpanan pertama setelah pergantian akun.
    if (skipNextChatSaveRef.current) {
      skipNextChatSaveRef.current = false
      return
    }

    saveChats(chats, user.id)
  }, [chats, user?.id])

  // ==========================================
  // NOTIFIKASI
  // ==========================================
  useEffect(() => {
    if (!toast) return

    const timer = window.setTimeout(() => {
      setToast('')
    }, 2800)

    return () => window.clearTimeout(timer)
  }, [toast])

  // ==========================================
  // NAVIGASI
  // ==========================================
  const navigate = (next: string) => {
    setPage(next)
    setSelectedItem(null)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // ==========================================
  // SETELAH LOGIN BERHASIL
  // ==========================================
  const handleAuth = (nextUser: UserProfile) => {
    setUser(nextUser)
    setPage('home')

    setToast(`Selamat datang, ${nextUser.name.split(' ')[0]}!`)
  }

  // ==========================================
  // UPDATE PROFIL DAN FOTO KE SUPABASE
  // ==========================================
  const updateProfile = async (
    nextUser: UserProfile,
  ): Promise<UserProfile> => {
    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError) throw authError

    if (!authData.user) {
      throw new Error('Sesi login tidak ditemukan.')
    }

    if (authData.user.id !== nextUser.id) {
      throw new Error('Akun pengguna tidak sesuai.')
    }

    const userId = authData.user.id
    const oldPhotoUrl = user?.photo || null

    let photoUrl = nextUser.photo || null
    let uploadedPath: string | null = null

    // Jika foto berupa Data URL, unggah ke Supabase Storage.
    if (photoUrl?.startsWith('data:image/')) {
      const response = await fetch(photoUrl)
      const photoBlob = await response.blob()

      const filePath = `${userId}/${Date.now()}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, photoBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      uploadedPath = filePath

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      photoUrl = publicUrlData.publicUrl
    }

    const savedUser: UserProfile = {
      ...nextUser,
      photo: photoUrl || undefined,
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: savedUser.name,
          student_id: savedUser.studentId,
          major: savedUser.major,
          campus: savedUser.campus,
          bio: savedUser.bio,
          avatar_url: photoUrl,
        })
        .eq('id', userId)
        .select('id')
        .single()

      if (error) throw error

      if (!data) {
        throw new Error('Data profil tidak ditemukan di database.')
      }
    } catch (error) {
      // Hapus foto baru jika penyimpanan database gagal.
      if (uploadedPath) {
        await supabase.storage
          .from('avatars')
          .remove([uploadedPath])
      }

      throw error
    }

    // Hapus foto lama setelah URL foto baru berhasil disimpan.
    if (oldPhotoUrl && oldPhotoUrl !== photoUrl) {
      const oldPath = getAvatarStoragePath(oldPhotoUrl)

      if (oldPath) {
        const { error: removeError } = await supabase.storage
          .from('avatars')
          .remove([oldPath])

        if (removeError) {
          console.warn('Foto lama gagal dihapus:', removeError.message)
        }
      }
    }

    setUser(savedUser)
    setToast('Profil berhasil diperbarui')

    return savedUser
  }

  // ==========================================
  // LOGOUT SUPABASE
  // ==========================================
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      setUser(null)
      setPage('home')
      setSelectedItem(null)
      setToast('Kamu sudah keluar dari akun')
    } catch (error) {
      console.error('Gagal logout:', error)

      setToast(
        error instanceof Error
          ? error.message
          : 'Gagal keluar dari akun.',
      )
    }
  }

  // ==========================================
  // PENCARIAN
  // ==========================================
  const openSearch = (value: string) => {
    setSearchQuery(value)
  }

  // ==========================================
  // TAMBAH LAPORAN BARANG KE SUPABASE
  // ==========================================
  const addItem = async (item: Item): Promise<void> => {
    const { data, error } = await supabase.auth.getUser()

    if (error) throw error

    if (!data.user) {
      throw new Error('Sesi login tidak ditemukan. Silakan login kembali.')
    }

    if (!user) {
      throw new Error('Profil pengguna belum tersedia.')
    }

    const savedItem = await createItem(
      item,
      data.user,
      user.name || 'Mahasiswa FindU',
    )

    setItems((prev) => [
      savedItem,
      ...prev.filter((existing) => existing.id !== savedItem.id),
    ])

    setToast('Laporan berhasil dipublikasikan')
  }

  // ==========================================
  // SIMPAN / HAPUS BARANG
  // ==========================================
  const toggleSave = (id: string) => {
    const isSaved = savedIds.includes(id)

    setSavedIds((prev) =>
      isSaved
        ? prev.filter((x) => x !== id)
        : [...prev, id],
    )

    setToast(isSaved ? 'Dihapus dari simpanan' : 'Barang disimpan')
  }

  // ==========================================
  // KIRIM PESAN
  // ==========================================
  const sendMessage = (message: ChatMessage) => {
    setChats((prev) => [...prev, message])
    setToast('Pesan tersimpan di percakapan demo')
  }

  // ==========================================
  // HITUNG JUMLAH CHAT
  // ==========================================
  const chatCount = useMemo(() => {
    return new Set(chats.map((chat) => chat.itemId)).size
  }, [chats])

  // ==========================================
  // PROSES KLAIM BARANG
  // ==========================================
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

  // ==========================================
  // LOADING SESSION
  // ==========================================
  if (authLoading) {
    return (
      <div className="auth-screen">
        <div className="auth-stage">
          <div className="auth-glass">
            <div className="auth-form-wrap">
              <div className="auth-logo">
                <span className="brand-mark">
                  <MessageCircle size={18} />
                </span>
                FINDU
              </div>

              <div className="auth-form-heading">
                <h2>
                  Memuat <span className="auth-accent">FindU</span>
                </h2>

                <p>Sedang memeriksa sesi akun kamu...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================
  // JIKA BELUM LOGIN
  // ==========================================
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

  // ==========================================
  // TAMPILAN UTAMA FINDU
  // ==========================================
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

      {/* MODAL DETAIL BARANG */}
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
                  Dilaporkan oleh <b>{selectedItem.reporter}</b>
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
                disabled={selectedItem.status === 'Dikembalikan'}
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

      {/* NOTIFIKASI */}
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

      
      {/* NAVIGASI MOBILE */}
      <div className="mobile-bottom-nav">
        <button
          className={page === 'home' ? 'active' : ''}
          onClick={() => navigate('home')}
        >
          <House size={21} strokeWidth={2} />
          Beranda
        </button>

        <button
          className={page === 'search' ? 'active' : ''}
          onClick={() => navigate('search')}
        >
          <Search size={21} strokeWidth={2} />
          Cari
        </button>

        <button
          className="mobile-add"
          onClick={() => navigate('report')}
          aria-label="Laporkan barang"
        >
          <Plus size={25} strokeWidth={2.5} />
        </button>

        <button
          className={page === 'chat' ? 'active' : ''}
          onClick={() => navigate('chat')}
        >
          <MessageCircle size={21} strokeWidth={2} />
          Pesan
        </button>

        <button
          className={page === 'profile' ? 'active' : ''}
          onClick={() => navigate('profile')}
        >
          <UserRound size={21} strokeWidth={2} />
          Profil
        </button>
      </div>
    </div>
  )
}
