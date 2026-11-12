// Memotong (crop tengah) dan mengecilkan foto menjadi persegi, lalu
// mengubahnya ke data URL JPEG agar ringan disimpan di localStorage.
export function resizeImage(file: File, size = 256): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
  
      reader.onerror = () => reject(new Error('Gagal membaca file'))
      reader.onload = () => {
        const img = new Image()
  
        img.onerror = () => reject(new Error('File bukan gambar yang valid'))
        img.onload = () => {
          const side = Math.min(img.width, img.height)
          const sx = (img.width - side) / 2
          const sy = (img.height - side) / 2
  
          const canvas = document.createElement('canvas')
          canvas.width = size
          canvas.height = size
  
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Canvas tidak tersedia'))
            return
          }
  
          ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
          resolve(canvas.toDataURL('image/jpeg', 0.85))
        }
  
        img.src = reader.result as string
      }
  
      reader.readAsDataURL(file)
    })
  }