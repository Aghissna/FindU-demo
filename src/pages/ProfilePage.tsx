import { ChangeEvent, FormEvent, useRef, useState } from 'react'
import { ArrowLeft, Camera, LogOut, Save, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import type { UserProfile } from '../types'
import { resizeImage } from '../utils/image.ts'

type Props = { user: UserProfile; onSave: (user: UserProfile) => void; onBack: () => void; onLogout: () => void }
export default function ProfilePage({ user, onSave, onBack, onLogout }: Props) {
 const [form, setForm] = useState(user); const [saved, setSaved] = useState(false)
 const fileRef = useRef<HTMLInputElement>(null)
 const [photoError, setPhotoError] = useState('')
 // Pilih foto -> crop persegi 256px -> langsung disimpan ke profil
 const pickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  setPhotoError('')
  if (!file.type.startsWith('image/')) { setPhotoError('Pilih file gambar (JPG, PNG, atau WEBP).'); return }
  if (file.size > 8 * 1024 * 1024) { setPhotoError('Ukuran foto maksimal 8 MB.'); return }
  try {
   const photo = await resizeImage(file)
   onSave({ ...user, photo })
   setForm(p => ({ ...p, photo }))
  } catch { setPhotoError('Foto gagal diproses. Coba gambar lain.') }
 }
 const removePhoto = () => { setPhotoError(''); onSave({ ...user, photo: '' }); setForm(p => ({ ...p, photo: '' })) }
 const change = (key: keyof UserProfile, value: string) => { setForm(p => ({...p,[key]:value})); setSaved(false) }
 const submit = (e: FormEvent) => { e.preventDefault(); const next={...form,name:form.name.trim(),avatar:form.name.trim().split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase()}; onSave(next); setForm(next); setSaved(true) }
 return <div className="page-content"><header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>Profil saya</b></div><div className="topbar-actions"><span className="campus-tag"><span/> Campus community</span><div className="top-avatar">{user.photo ? <img className="avatar-img" src={user.photo} alt="" /> : (user.avatar || 'U')}</div></div></header><main className="main-inner profile-main"><div className="profile-page-heading"><button className="profile-back" onClick={onBack}><ArrowLeft size={16}/> Kembali</button><div className="eyebrow"><UserRound size={14}/> AKUN KAMU</div><h1>Profil saya</h1><p>Kelola informasi yang tampil di komunitas FindU.</p></div>
 <div className="profile-layout"><section className="profile-summary-card"><div className="profile-cover"><span>find<span>u</span></span></div><div className="profile-avatar-large">{user.photo ? <img className="avatar-img" src={user.photo} alt={`Foto profil ${user.name}`} /> : (user.avatar || 'U')}<button type="button" className="avatar-camera" onClick={() => fileRef.current?.click()} aria-label="Ganti foto profil"><Camera size={13}/></button><input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} /></div>{photoError && <p className="photo-error" role="alert">{photoError}</p>}<h2>{user.name}</h2><p>{user.major || 'Mahasiswa'}{user.campus ? ` · ${user.campus}` : ''}</p><span className="profile-verified"><ShieldCheck size={14}/> Anggota FindU</span><div className="photo-actions"><button type="button" onClick={() => fileRef.current?.click()}><Camera size={14}/> {user.photo ? 'Ganti foto' : 'Tambah foto'}</button>{user.photo && <button type="button" className="danger" onClick={removePhoto}><Trash2 size={14}/> Hapus</button>}</div><div className="profile-summary-divider"/><div className="profile-summary-row"><span>Email</span><b>{user.email}</b></div><div className="profile-summary-row"><span>NIM</span><b>{user.studentId || 'Belum diisi'}</b></div><button className="profile-logout" onClick={onLogout}><LogOut size={16}/> Keluar dari akun</button></section>
 <section className="profile-edit-card"><div className="profile-edit-heading"><div><h2>Informasi pribadi</h2><p>Pastikan informasi kamu tetap terbaru.</p></div><span className="profile-edit-icon"><UserRound size={18}/></span></div><form onSubmit={submit} className="profile-form"><label>Nama lengkap<input value={form.name} onChange={e=>change('name',e.target.value)} required minLength={2}/></label><label>Email<input type="email" value={form.email} disabled/><small>Email akun demo tidak bisa diubah.</small></label><div className="profile-form-grid"><label>NIM / NPM<input value={form.studentId} onChange={e=>change('studentId',e.target.value)} placeholder="Contoh: 23123456"/></label><label>Program studi<input value={form.major} onChange={e=>change('major',e.target.value)} placeholder="Contoh: Sistem Informasi"/></label></div><label>Nama kampus<input value={form.campus} onChange={e=>change('campus',e.target.value)} placeholder="Nama universitas"/></label><label>Tentang saya<textarea value={form.bio} onChange={e=>change('bio',e.target.value)} placeholder="Ceritakan sedikit tentang kamu..." rows={4}/></label><div className="profile-form-footer">{saved && <span className="profile-saved">✓ Profil berhasil disimpan</span>}<button className="primary-button" type="submit"><Save size={16}/> Simpan perubahan</button></div></form></section></div><p className="profile-safety-note"><ShieldCheck size={16}/> Demi keamanan, jangan cantumkan kata sandi, kode OTP, atau informasi sensitif di bio publik.</p></main></div>
}