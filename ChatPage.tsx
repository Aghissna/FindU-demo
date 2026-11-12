
import { useEffect, useRef, useState } from 'react'

import {
  ArrowUpRight,
  CheckCheck,
  ChevronLeft,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  ShieldCheck,
  Smile,
} from 'lucide-react'

import type { FormEvent } from 'react'
import type { ChatMessage, Item } from '../types'

type Props = {
  items: Item[]
  chats: ChatMessage[]
  onSend: (message: ChatMessage) => void
  onOpenItem: (item: Item) => void
}

export default function ChatPage({
  items,
  chats,
  onSend,
  onOpenItem,
}: Props) {
  // State percakapan aktif
  const [activeId, setActiveId] = useState(
    items[0]?.id || ''
  )

  // State tampilan chat khusus mobile
  const [isChatOpen, setIsChatOpen] = useState(false)

  // State input pesan
  const [draft, setDraft] = useState('')

  // Referensi pesan terakhir
  const bottomRef = useRef<HTMLDivElement>(null)

  // Data percakapan aktif
  const activeItem = items.find(
    (item) => item.id === activeId
  )

  // Riwayat pesan berdasarkan barang
  const messages = chats.filter(
    (chat) => chat.itemId === activeId
  )

  // Scroll otomatis ke pesan terakhir
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages.length, activeId])

  // Jika item aktif dihapus, pilih item lain
  useEffect(() => {
    if (!items.some((item) => item.id === activeId)) {
      setActiveId(items[0]?.id || '')
      setIsChatOpen(false)
    }
  }, [items, activeId])

  // Membuka percakapan
  const openChat = (itemId: string) => {
    setActiveId(itemId)
    setIsChatOpen(true)
  }

  // Kembali ke daftar percakapan
  const backToChatList = () => {
    setIsChatOpen(false)
  }

  // Mengirim pesan
  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!draft.trim() || !activeId) return

    onSend({
      id: `msg-${Date.now()}`,
      itemId: activeId,
      sender: 'me',
      text: draft.trim(),
      time: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    })

    setDraft('')
  }

  return (
    <div
      className={`page-content chat-page ${
        isChatOpen ? 'mobile-chat-open' : ''
      }`}
    >
      {/* Header */}
      <header className="topbar">
        <div className="breadcrumb">
          Workspace
          <span>/</span>
          <b>Pesan</b>
        </div>

        <div className="topbar-actions">
          <span className="campus-tag">
            <span />
            Campus community
          </span>
        </div>
      </header>

      <main className="main-inner chat-main">

        {/* Judul halaman */}
        <div className="page-intro chat-intro">
          <div className="eyebrow">
            <MessageCircle size={14} />
            RUANG KOMUNIKASI
          </div>

          <h1>
            Obrolkan, lalu{' '}
            <span>temukan barangmu.</span>
          </h1>

          <p>
            Diskusikan ciri barang dan atur pengembalian
            dengan aman.
          </p>
        </div>

        {/* Kontainer chat */}
        <section className="chat-shell">

          {/* DAFTAR PERCAKAPAN */}
          <aside className="chat-list">

            <div className="chat-list-head">
              <h2>Pesan</h2>
              <span>{items.length}</span>
            </div>

            <div className="chat-list-search">
              <Search size={15} />

              <input
                placeholder="Cari percakapan..."
              />
            </div>

            {items.map((item, i) => {
              const lastMessage = chats
                .filter(
                  (chat) => chat.itemId === item.id
                )
                .slice(-1)[0]

              const initials = item.reporter
                .split(' ')
                .map((s) => s[0])
                .slice(0, 2)
                .join('')

              return (
                <button
                  key={item.id}
                  className={`chat-contact ${
                    activeId === item.id
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() => openChat(item.id)}
                >
                  <div
                    className={`contact-avatar contact-${i % 5}`}
                  >
                    {initials}
                  </div>

                  <div className="contact-info">
                    <b>{item.reporter}</b>

                    <span>
                      {lastMessage?.text ||
                        `Tentang: ${item.title}`}
                    </span>
                  </div>

                  <small>
                    {lastMessage?.time || ''}
                  </small>
                </button>
              )
            })}

            {items.length === 0 && (
              <div className="chat-empty">
                <MessageCircle size={30} />
                <b>Belum ada percakapan</b>
                <p>
                  Pilih laporan barang untuk memulai.
                </p>
              </div>
            )}

          </aside>

          {/* RUANG PERCAKAPAN */}
          <section className="chat-conversation">

            {activeItem ? (
              <>

                {/* Header percakapan */}
                <div className="conversation-head">

                  {/* Tombol kembali khusus HP */}
                  <button
                    type="button"
                    className="mobile-back-button"
                    onClick={backToChatList}
                    aria-label="Kembali ke daftar pesan"
                    title="Kembali"
                  >
                    <ChevronLeft size={24} />
                  </button>

                  <div className="contact-avatar contact-active">
                    {activeItem.reporter
                      .split(' ')
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join('')}
                  </div>

                  <div className="conversation-person">
                    <b>{activeItem.reporter}</b>

                    <span>
                      <i />
                      Percakapan FindU
                    </span>
                  </div>

                  <button
                    className="icon-button"
                    onClick={() => onOpenItem(activeItem)}
                    title="Lihat barang"
                    aria-label="Lihat barang"
                  >
                    <ArrowUpRight size={19} />
                  </button>

                  <button
                    className="icon-button"
                    onClick={() =>
                      alert(
                        'Jaga komunikasi di dalam FindU dan lakukan serah terima di tempat umum.'
                      )
                    }
                    title="Info keamanan"
                    aria-label="Info keamanan"
                  >
                    <MoreHorizontal size={20} />
                  </button>

                </div>

                {/* Informasi barang */}
                <button
                  className="chat-item-context"
                  onClick={() => onOpenItem(activeItem)}
                >
                  <img
                    src={activeItem.image}
                    alt={activeItem.title}
                  />

                  <div>
                    <small>MEMBAHAS BARANG</small>

                    <b>{activeItem.title}</b>

                    <span>
                      {activeItem.location} ·{' '}
                      {activeItem.status}
                    </span>
                  </div>

                  <ArrowUpRight size={16} />
                </button>

                {/* Riwayat pesan */}
                <div className="message-area">

                  <div className="date-divider">
                    <span>Hari ini</span>
                  </div>

                  <div className="system-note">
                    <ShieldCheck size={14} />
                    Pastikan ciri barang sebelum menentukan klaim.
                  </div>

                  {messages.length === 0 ? (

                    /* Tampilan chat kosong */
                    <div className="chat-empty">
                      <div className="chat-empty-icon">
                        <MessageCircle size={23} />
                      </div>

                      <b>Mulai percakapan</b>

                      <p>
                        Tanyakan ciri barang dan sepakati
                        tempat pengambilan yang aman.
                      </p>

                      <button
                        onClick={() =>
                          setDraft(
                            `Halo, saya ingin bertanya tentang ${activeItem.title}. Apakah bisa kita cocokkan ciri-cirinya?`
                          )
                        }
                      >
                        Gunakan pesan pembuka
                      </button>
                    </div>

                  ) : (

                    /* Daftar pesan */
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`message-row ${
                          m.sender === 'me' ? 'mine' : ''
                        }`}
                      >
                        <div className="message-bubble">
                          {m.text}

                          <div className="message-time">
                            {m.time}{' '}

                            {m.sender === 'me' && (
                              <CheckCheck size={13} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))

                  )}

                  <div ref={bottomRef} />

                </div>

                {/* Form pengiriman pesan */}
                <form
                  className="chat-composer"
                  onSubmit={send}
                >
                  <button
                    type="button"
                    className="composer-icon"
                    onClick={() =>
                      alert(
                        'Lampiran belum tersedia pada versi demo.'
                      )
                    }
                    aria-label="Lampiran"
                  >
                    <Paperclip size={18} />
                  </button>

                  <input
                    value={draft}
                    onChange={(e) =>
                      setDraft(e.target.value)
                    }
                    placeholder="Tulis pesan dengan sopan..."
                    aria-label="Pesan"
                  />

                  <button
                    type="button"
                    className="composer-icon"
                    onClick={() =>
                      setDraft((current) => current + ' 😊')
                    }
                    aria-label="Emoji"
                  >
                    <Smile size={18} />
                  </button>

                  <button
                    className="send-button"
                    type="submit"
                    disabled={!draft.trim()}
                    aria-label="Kirim pesan"
                  >
                    <Send size={17} />
                  </button>
                </form>

              </>

            ) : (

              /* Tampilan tanpa percakapan */
              <div className="chat-empty">
                <MessageCircle size={30} />

                <b>Belum ada percakapan</b>

                <p>
                  Pilih laporan barang untuk memulai.
                </p>
              </div>

            )}

          </section>

        </section>

        {/* Footer */}
        <footer className="footer">
          <span>© 2026 FindU Campus</span>

          <span>
            <ShieldCheck size={13} />
            Jaga komunikasi tetap aman.
          </span>
        </footer>

      </main>
    </div>
  )
}
