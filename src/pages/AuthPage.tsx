
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
import { supabase } from '../lib/supabase'
import { getUserProfile } from '../lib/profileService'

type Props = {
  onSuccess: (user: UserProfile) => void
}

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
  const [remember, setRemember] = useState(true)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setError('')
    setNotice('')
    setBusy(true)

    const cleanEmail = email.trim().toLowerCase()

    try {
      // ==================================
      // LUPA KATA SANDI
      // ==================================
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo: window.location.origin,
          },
        )

        if (error) throw error

        setNotice(
          'Permintaan berhasil diproses. Jika email terdaftar, tautan reset akan dikirim. Silakan periksa kotak masuk email kamu.',
        )

        return
      }

      // ==================================
      // REGISTRASI
      // ==================================
      if (mode === 'register') {
        if (name.trim().length < 2) {
          throw new Error('Masukkan nama lengkap kamu.')
        }

        if (password.length < 6) {
          throw new Error('Kata sandi minimal 6 karakter.')
        }

        if (password !== confirm) {
          throw new Error('Konfirmasi kata sandi belum sama.')
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: name.trim(),
              full_name: name.trim(),
            },
            emailRedirectTo: window.location.origin,
          },
        })

        if (error) throw error

        setPassword('')
        setConfirm('')

        // Jika konfirmasi email tidak diperlukan,
        // pengguna bisa langsung masuk.
        if (data.session && data.user) {
          const profile = await getUserProfile(data.user)
          onSuccess(profile)
        } else {
          setMode('login')
          setNotice(
            'Registrasi berhasil! Silakan periksa email dan klik tautan verifikasi sebelum masuk ke FindU.',
          )
        }

        return
      }

      // ==================================
      // LOGIN
      // ==================================
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })

      if (error) throw error

      if (!data.user) {
        throw new Error('Data pengguna tidak ditemukan.')
      }

      const profile = await getUserProfile(data.user)

      onSuccess(profile)

    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan. Silakan coba kembali.'

      setError(message)
    } finally {
      setBusy(false)
    }
  }

  // ==================================
  // LOGIN GOOGLE
  // ==================================
  const loginGoogle = async () => {
    setError('')
    setNotice('')
    setBusy(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      })

      if (error) throw error

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Login Google gagal.',
      )

      setBusy(false)
    }
  }

  // ==================================
  // GANTI MODE LOGIN / REGISTER
  // ==================================
  const changeMode = (nextMode: 'login' | 'register' | 'forgot') => {
    setMode(nextMode)
    setError('')
    setNotice('')
    setPassword('')
    setConfirm('')
    setShowPassword(false)
  }

  return (
    <div className="auth-screen">
      <div className="auth-stage">
        <div className="auth-corner auth-corner-tl" />
        <div className="auth-corner auth-corner-br" />

        <div className="auth-glass">
          <div className="auth-form-wrap">

            <div className="auth-logo">
              <span className="brand-mark">
                <Search size={18} />
              </span>
              FINDU
            </div>

            <div className="auth-form-heading">
              <h2>
                {mode === 'login' && (
                  <>
                    Selamat Datang{' '}
                    <span className="auth-accent">Kembali</span>
                  </>
                )}

                {mode === 'register' && (
                  <>
                    Buat Akun{' '}
                    <span className="auth-accent">FindU</span>
                  </>
                )}

                {mode === 'forgot' && (
                  <>
                    Atur Ulang{' '}
                    <span className="auth-accent">Kata Sandi</span>
                  </>
                )}
              </h2>

              <p>
                {mode === 'login' &&
                  'Masukkan data akunmu untuk melanjutkan.'}

                {mode === 'register' &&
                  'Gabung komunitas kampus dan mulai saling membantu.'}

                {mode === 'forgot' &&
                  'Masukkan email akunmu untuk menerima tautan pengaturan ulang kata sandi.'}
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

              {mode !== 'forgot' && (
                <label>
                  Kata sandi

                  <div className="auth-input">
                    <LockKeyhole size={17} />

                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={
                        mode === 'login'
                          ? 'current-password'
                          : 'new-password'
                      }
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
                      {showPassword
                        ? <EyeOff size={17} />
                        : <Eye size={17} />}
                    </button>
                  </div>
                </label>
              )}

              {mode === 'register' && (
                <label>
                  Konfirmasi kata sandi

                  <div className="auth-input">
                    <LockKeyhole size={17} />

                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Ulangi kata sandi"
                      minLength={6}
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
                    onClick={() => changeMode('forgot')}
                  >
                    Lupa kata sandi?
                  </button>
                </div>
              )}

              {notice && (
                <div className="auth-notice" role="status">
                  {notice}
                </div>
              )}

              {error && (
                <div className="auth-error" role="alert">
                  {error}
                </div>
              )}

              <button
                className="auth-submit"
                type="submit"
                disabled={busy}
              >
                {busy
                  ? 'Memproses...'
                  : mode === 'login'
                    ? 'Masuk'
                    : mode === 'register'
                      ? 'Buat akun gratis'
                      : 'Kirim tautan reset'}

                <ArrowRight size={17} />
              </button>
            </form>

            {mode !== 'forgot' && (
              <>
                <div className="auth-divider">
                  ATAU LANJUTKAN DENGAN
                </div>

                <div className="auth-social">
                  <button
                    type="button"
                    onClick={loginGoogle}
                    disabled={busy}
                  >
                    <span className="g-letter">G</span>
                    Google
                  </button>
                </div>
              </>
            )}

            <p className="auth-privacy">
              <ShieldCheck size={15} />
              Data akun dikelola dengan aman melalui Supabase.
            </p>

            <p className="auth-switch">
              {mode === 'login' && 'Belum punya akun? '}
              {mode === 'register' && 'Sudah punya akun? '}
              {mode === 'forgot' && 'Sudah ingat kata sandi? '}

              <button
                type="button"
                onClick={() =>
                  changeMode(
                    mode === 'login' ? 'register' : 'login',
                  )
                }
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
