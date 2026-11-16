
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
  onSubmit: (item: Item) => Promise<void>
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
  const [kind, setKind] = useState<'lost' | 'found'>('lost')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Elektronik')
  const [location, setLocation] = useState('Perpustakaan Pusat')
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10),
  )
  const [description, setDescription] = useState('')
  const [reporter, setReporter] = useState('Alexandra R.')
  const [image, setImage] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Memproses foto yang dipilih
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

  // Mengirim laporan ke Supabase melalui App.tsx
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (submitting) return

    setError('')

    if (!title.trim() || !description.trim()) {
      setError(
        'Isi nama barang dan deskripsi terlebih dahulu.',
      )
      return
    }

    if (!date) {
      setError('Pilih tanggal kejadian terlebih dahulu.')
      return
    }

    const newItem: Item = {
      id: crypto.randomUUID(),
      title: title.trim(),
      category,
      location,

      // Simpan dalam format DATE: YYYY-MM-DD
      date,

      description: description.trim(),

      status: kind === 'lost' ? 'Hilang' : 'Ditemukan',

      image: image || DEFAULT_IMAGE,

      reporter: reporter.trim() || 'Mahasiswa FindU',

      kind,
    }

    try {
      setSubmitting(true)

      await onSubmit(newItem)

      // Halaman berhasil hanya muncul setelah penyimpanan sukses.
      setDone(true)
    } catch (err) {
      console.error('Gagal mempublikasikan laporan:', err)

      setError(
        err instanceof Error
          ? err.message
          : 'Laporan gagal disimpan. Silakan coba lagi.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Halaman berhasil
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
              Laporanmu berhasil disimpan ke database FindU.
              Semoga barangnya segera bertemu dengan pemiliknya!
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
      <header className="topbar">
        <button
          className="back-link"
          onClick={onBack}
          disabled={submitting}
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

        <form
          className="report-layout"
          onSubmit={submit}
        >
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

            <div className="kind-switch">
              <button
                type="button"
                className={kind === 'lost' ? 'selected' : ''}
                onClick={() => setKind('lost')}
                disabled={submitting}
              >
                <span className="kind-dot lost-dot" />
                Saya kehilangan
              </button>

              <button
                type="button"
                className={kind === 'found' ? 'selected' : ''}
                onClick={() => setKind('found')}
                disabled={submitting}
              >
                <span className="kind-dot found-dot" />
                Saya menemukan
              </button>
            </div>

            <label className="field-label">
              Nama barang <span>*</span>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Tumbler hijau sage"
                required
                maxLength={70}
                disabled={submitting}
              />
            </label>

            <div className="form-two-col">
              <label className="field-label">
                Kategori

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={submitting}
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
                  disabled={submitting}
                />
              </label>
            </div>

            <label className="field-label">
              Lokasi

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={submitting}
              >
                {places.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Deskripsi barang <span>*</span>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Warna, merek, lokasi detail, atau ciri umum lainnya..."
                rows={4}
                maxLength={600}
                required
                disabled={submitting}
              />

              <small className="field-hint">
                Hindari menulis informasi rahasia yang hanya
                diketahui pemilik.
              </small>
            </label>

            <label className="field-label">
              Nama pelapor

              <input
                value={reporter}
                onChange={(e) => setReporter(e.target.value)}
                placeholder="Nama panggilanmu"
                disabled={submitting}
              />
            </label>
          </section>

          <aside className="form-side">
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
                  accept="image/jpeg,image/png,image/webp"
                  disabled={submitting}
                  onChange={(e) => {
                    handleFile(e.target.files?.[0])
                    e.currentTarget.value = ''
                  }}
                />
              </label>

              {image && (
                <button
                  type="button"
                  className="remove-image"
                  disabled={submitting}
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

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <button
              className="primary-button submit-report"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? 'Menyimpan laporan...'
                : 'Publikasikan laporan'}

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
