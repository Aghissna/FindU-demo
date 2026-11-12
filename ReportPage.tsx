
import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  ImagePlus,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react'

import type { FormEvent } from 'react'
import type { Item } from '../types'

type Props = {
  onBack: () => void
  onSubmit: (item: Item) => void
}

const categories = [
  'Elektronik',
  'Aksesori',
  'Botol & Bekal',
  'Alat Tulis',
  'Dokumen',
  'Lainnya',
]

const places = [
  'Perpustakaan Pusat',
  'Gedung Fakultas A',
  'Kantin Utama',
  'Ruang Diskusi B',
  'Parkiran Timur',
  'Gedung Student Center',
  'Lainnya',
]

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=900&q=85'

export default function ReportPage({
  onBack,
  onSubmit,
}: Props) {
  // State Formulir
  const [kind, setKind] = useState<'lost' | 'found'>('lost')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Elektronik')
  const [location, setLocation] = useState('Perpustakaan Pusat')
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [description, setDescription] = useState('')
  const [reporter, setReporter] = useState('Alexandra R.')
  const [image, setImage] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  // Memproses Foto yang Dipilih
  const handleFile = (file?: File) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Pilih file gambar, seperti JPG atau PNG.')
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      setError('Ukuran foto maksimal 3 MB.')
      return
    }

    setError('')

    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result)
      }
    }

    reader.onerror = () => {
      setError('Foto gagal dibaca. Silakan coba lagi.')
    }

    reader.readAsDataURL(file)
  }

  // Mengirim Laporan
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !description.trim()) {
      setError(
        'Isi nama barang dan deskripsi terlebih dahulu.'
      )
      return
    }

    const newItem: Item = {
      id: `item-${Date.now()}`,
      title: title.trim(),
      category,
      location,

      date: new Date(
        `${date}T12:00:00`
      ).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),

      description: description.trim(),

      status: kind === 'lost' ? 'Hilang' : 'Ditemukan',

      image: image || DEFAULT_IMAGE,

      reporter: reporter.trim() || 'Mahasiswa FindU',

      kind,
    }

    onSubmit(newItem)
    setDone(true)
  }

  // Halaman Berhasil
  if (done) {
    return (
      <div className="page-content">
        <main className="main-inner">
          <div className="success-screen">
            <div className="success-icon">
              <CheckCircle2 size={36} />
            </div>

            <div className="eyebrow">
              LAPORAN TERSIMPAN
            </div>

            <h1>
              Terima kasih sudah{' '}
              <span>berbagi.</span>
            </h1>

            <p>
              Laporanmu sudah ditambahkan ke daftar barang
              FindU. Semoga cepat bertemu pemiliknya!
            </p>

            <button
              className="primary-button"
              onClick={onBack}
            >
              Kembali ke beranda
              <ArrowRight size={17} />
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="page-content">
      {/* Header */}
      <header className="topbar">
        <button
          className="back-link"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          Kembali
        </button>

        <div className="topbar-actions">
          <span className="campus-tag">
            <span />
            Campus community
          </span>
        </div>
      </header>

      <main className="main-inner report-main">
        {/* Judul Halaman */}
        <div className="page-intro">
          <div className="eyebrow">
            <Camera size={14} />
            LAPORAN BARU
          </div>

          <h1>
            Buat laporan baru{' '}
            <span>dengan lengkap dan jelas.</span>
          </h1>

          <p>
            Semakin jelas informasinya, semakin besar peluang
            barang kembali.
          </p>
        </div>

        {/* Formulir Laporan */}
        <form
          className="report-layout"
          onSubmit={submit}
        >
          {/* Informasi Barang */}
          <section className="form-card">
            <div className="form-section-heading">
              <span className="form-step">01</span>

              <div>
                <h2>Informasi barang</h2>
                <p>
                  Mulai dari hal-hal yang paling mudah dikenali.
                </p>
              </div>
            </div>

            {/* Jenis Laporan */}
            <div className="kind-switch">
              <button
                type="button"
                className={
                  kind === 'lost' ? 'selected' : ''
                }
                onClick={() => setKind('lost')}
              >
                <span className="kind-dot lost-dot" />
                Saya kehilangan
              </button>

              <button
                type="button"
                className={
                  kind === 'found' ? 'selected' : ''
                }
                onClick={() => setKind('found')}
              >
                <span className="kind-dot found-dot" />
                Saya menemukan
              </button>
            </div>

            {/* Nama Barang */}
            <label className="field-label">
              Nama barang <span>*</span>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Tumbler hijau sage"
                required
                maxLength={70}
              />
            </label>

            {/* Kategori dan Tanggal */}
            <div className="form-two-col">
              <label className="field-label">
                Kategori

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field-label">
                Tanggal kejadian

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </label>
            </div>

            {/* Lokasi */}
            <label className="field-label">
              Lokasi

              <select
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
              >
                {places.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            {/* Deskripsi Barang */}
            <label className="field-label">
              Deskripsi barang <span>*</span>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Warna, merek, lokasi detail, atau ciri umum lainnya..."
                rows={4}
                maxLength={600}
                required
              />

              <small className="field-hint">
                Hindari menulis informasi rahasia yang hanya
                diketahui pemilik.
              </small>
            </label>

            {/* Nama Pelapor */}
            <label className="field-label">
              Nama pelapor

              <input
                value={reporter}
                onChange={(e) =>
                  setReporter(e.target.value)
                }
                placeholder="Nama panggilanmu"
              />
            </label>
          </section>

          {/* Panel Samping */}
          <aside className="form-side">
            {/* Upload Foto */}
            <div className="form-card upload-card">
              <div className="form-section-heading">
                <span className="form-step">02</span>

                <div>
                  <h2>Foto barang</h2>
                  <p>
                    Foto membantu orang mengenali barang.
                  </p>
                </div>
              </div>

              <label
                className={`upload-zone ${
                  image ? 'has-image' : ''
                }`}
              >
                {image ? (
                  <>
                    <img
                      src={image}
                      alt="Pratinjau barang"
                    />

                    <span className="replace-image">
                      <Upload size={15} />
                      Ganti foto
                    </span>
                  </>
                ) : (
                  <>
                    <div className="upload-graphic">
                      <ImagePlus size={25} />
                    </div>

                    <b>Taruh foto di sini</b>

                    <span>
                      atau klik untuk memilih file
                    </span>

                    <small>JPG, PNG · Maks. 3 MB</small>
                  </>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFile(e.target.files?.[0])
                  }
                />
              </label>

              {image && (
                <button
                  type="button"
                  className="remove-image"
                  onClick={() => {
                    setImage('')
                    setError('')
                  }}
                >
                  <X size={14} />
                  Hapus foto
                </button>
              )}
            </div>

            {/* Informasi Privasi */}
            <div className="privacy-note">
              <ShieldCheck size={19} />

              <div>
                <b>Privasi tetap terjaga</b>

                <p>
                  Detail sensitif sebaiknya disimpan untuk
                  proses verifikasi lewat chat.
                </p>
              </div>
            </div>

            {/* Pesan Kesalahan */}
            {error && (
              <p
                className="form-error"
                role="alert"
              >
                {error}
              </p>
            )}

            {/* Tombol Publikasi */}
            <button
              className="primary-button submit-report"
              type="submit"
            >
              Publikasikan laporan
              <ArrowRight size={17} />
            </button>

            <p className="terms-note">
              Dengan melanjutkan, kamu setuju untuk memberikan
              informasi yang jujur dan akurat.
            </p>
          </aside>
        </form>
      </main>
    </div>
  )
}
