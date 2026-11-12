
import { FormEvent, useState } from 'react'
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import type { UserProfile } from '../types'

type Props = {
  onSuccess: (user: UserProfile) => void
}

type StoredUser = UserProfile & {
  password: string
}

const USERS_KEY = 'findu-demo-users-v1'

export default function AuthPage({ onSuccess }: Props) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [remember, setRemember] = useState(true) // tampilan saja (sesi demo selalu tersimpan)

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)

    try {
      const users: StoredUser[] = JSON.parse(
        localStorage.getItem(USERS_KEY) || '[]'
      )

      const cleanEmail = email.trim().toLowerCase()

      if (mode === 'forgot') {
        const idx = users.findIndex((u) => u.email === cleanEmail)

        if (idx === -1) {
          setError('Email ini belum terdaftar. Silakan buat akun dulu.')
          return
        }

        if (password.length < 6) {
          setError('Kata sandi baru minimal 6 karakter.')
          return
        }

        if (password !== confirm) {
          setError('Konfirmasi kata sandi belum sama.')
          return
        }

        users[idx] = { ...users[idx], password }
        localStorage.setItem(USERS_KEY, JSON.stringify(users))

        setPassword('')
        setConfirm('')
        setMode('login')
        setNotice('Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru.')
        return
      }

      if (mode === 'register') {
        if (name.trim().length < 2) {
          setError('Masukkan nama lengkap kamu.')
          return
        }

        if (password.length < 6) {
          setError('Kata sandi minimal 6 karakter.')
          return
        }

        if (password !== confirm) {
          setError('Konfirmasi kata sandi belum sama.')
          return
        }

        if (users.some((u) => u.email === cleanEmail)) {
          setError('Email ini sudah terdaftar. Silakan masuk.')
          return
        }

        const user: StoredUser = {
          id: `user-${Date.now()}`,
          name: name.trim(),
          email: cleanEmail,
          studentId: '',
          major: '',
          campus: '',
          bio: '',
          avatar: name
            .trim()
            .split(/\s+/)
            .map((x) => x[0])
            .slice(0, 2)
            .join('')
            .toUpperCase(),
          password,
        }

        localStorage.setItem(
          USERS_KEY,
          JSON.stringify([...users, user])
        )

        const { password: _password, ...profile } = user
        onSuccess(profile)
      } else {
        const user = users.find(
          (u) =>
            u.email === cleanEmail &&
            u.password === password
        )

        if (!user) {
          setError(
            'Email atau kata sandi tidak cocok. Jika baru pertama kali, buat akun dulu.'
          )
          return
        }

        const { password: _password, ...profile } = user
        onSuccess(profile)
      }
    } catch {
      setError(
        'Penyimpanan browser tidak tersedia. Coba gunakan browser biasa.'
      )
    } finally {
      setBusy(false)
    }
  }

  // Simulasi login Google (tanpa akun Google sungguhan)
  const loginGoogle = () => {
    const mail = window.prompt('Simulasi login Google. Masukkan email Gmail kamu:')
    if (!mail || !mail.includes('@')) return

    const nama = mail
      .split('@')[0]
      .replace(/[._]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())

    onSuccess({
      id: `google-${mail.toLowerCase()}`,
      name: nama,
      email: mail.toLowerCase(),
      studentId: '',
      major: '',
      campus: '',
      bio: '',
      avatar: nama.split(/\s+/).map((x) => x[0]).slice(0, 2).join('').toUpperCase(),
    })
  }

  return (
    <div className="auth-screen">
      <div className="auth-stage">
        <div className="auth-corner auth-corner-tl" />
        <div className="auth-corner auth-corner-br" />

        <div className="auth-glass">
          <div className="auth-form-wrap">
            <div className="auth-logo">
              <span className="brand-mark"><Search size={18} /></span>
              FINDU
            </div>

            <div className="auth-form-heading">
              <h2>
                {mode === 'login' && (
                  <>Selamat Datang <span className="auth-accent">Kembali</span></>
                )}
                {mode === 'register' && (
                  <>Buat Akun <span className="auth-accent">FindU</span></>
                )}
                {mode === 'forgot' && (
                  <>Atur Ulang <span className="auth-accent">Kata Sandi</span></>
                )}
              </h2>
              <p>
                {mode === 'login' && 'Masukkan data akunmu untuk melanjutkan.'}
                {mode === 'register' && 'Gabung komunitas kampus dan mulai saling membantu.'}
                {mode === 'forgot' && 'Masukkan email akunmu dan kata sandi baru.'}
              </p>
            </div>

            <form className="auth-form" onSubmit={submit}>
              {mode === 'register' && (
                <label>
                  Nama lengkap
                  <div className="auth-input">
                    <UserRound size={17} />
                    <input
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama sesuai identitas"
                      required
                    />
                  </div>
                </label>
              )}

              <label>
                Alamat email
                <div className="auth-input">
                  <Mail size={17} />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </label>

              <label>
                {mode === 'forgot' ? 'Kata sandi baru' : 'Kata sandi'}
                <div className="auth-input">
                  <LockKeyhole size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Tampilkan atau sembunyikan kata sandi"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>

              {(mode === 'register' || mode === 'forgot') && (
                <label>
                  {mode === 'forgot' ? 'Konfirmasi kata sandi baru' : 'Konfirmasi kata sandi'}
                  <div className="auth-input">
                    <LockKeyhole size={17} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Ulangi kata sandi"
                      required
                    />
                  </div>
                </label>
              )}

              {mode === 'login' && (
                <div className="auth-row">
                  <label className="auth-check">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    Ingat saya
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot')
                      setError('')
                      setNotice('')
                      setPassword('')
                      setConfirm('')
                    }}
                  >
                    Lupa kata sandi?
                  </button>
                </div>
              )}

              {notice && <div className="auth-notice" role="status">{notice}</div>}
              {error && <div className="auth-error" role="alert">{error}</div>}

              <button className="auth-submit" type="submit" disabled={busy}>
                {mode === 'login' && 'Masuk'}
                {mode === 'register' && 'Buat akun gratis'}
                {mode === 'forgot' && 'Simpan kata sandi baru'}
                <ArrowRight size={17} />
              </button>
            </form>

            {mode !== 'forgot' && (
              <>
                <div className="auth-divider">ATAU LANJUTKAN DENGAN</div>
                <div className="auth-social">
                  <button type="button" onClick={loginGoogle}><span className="g-letter">G</span> Google</button>
                </div>
              </>
            )}

            <p className="auth-privacy">
              <ShieldCheck size={15} />
              Data akun demo disimpan di browser ini saja.
            </p>

            <p className="auth-switch">
              {mode === 'login' && 'Belum punya akun? '}
              {mode === 'register' && 'Sudah punya akun? '}
              {mode === 'forgot' && 'Sudah ingat kata sandi? '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login')
                  setError('')
                  setNotice('')
                  setPassword('')
                  setConfirm('')
                }}
              >
                {mode === 'login' ? 'Daftar' : 'Masuk'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
