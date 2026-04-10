'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const CLIENT_KEY = 'sbaw40li8y2qsgtgf6'
const REDIRECT_URI = 'https://www.thinkbizlab.com/api/auth/tiktok/callback'
const SCOPE = 'video.publish,video.upload'

function TikTokAuthContent() {
  const params = useSearchParams()
  const success = params.get('success')
  const error = params.get('error')

  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${CLIENT_KEY}&scope=${SCOPE}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=thinkbiz`

  if (success) {
    return (
      <div className="max-w-lg">
        <div className="rounded-xl border p-8 text-center" style={{ borderColor: 'rgba(16,185,129,.3)', background: 'rgba(16,185,129,.07)' }}>
          <div className="text-4xl mb-4">🎵</div>
          <h1 className="font-heading text-2xl font-bold text-white mb-2">TikTok Connected!</h1>
          <p className="font-mono text-sm" style={{ color: '#10B981' }}>✓ บันทึก Token ลงฐานข้อมูลแล้ว — ระบบจะ refresh อัตโนมัติ</p>
        </div>
        <p className="mt-6 font-mono text-xs text-center" style={{ color: 'rgba(155,142,196,.5)' }}>
          หากต้องการ re-authorize กด login อีกครั้งด้านล่าง
        </p>
        <div className="mt-4 text-center">
          <a href={authUrl} className="font-mono text-xs text-accent hover:underline">เชื่อมต่อใหม่</a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-heading text-2xl font-bold text-white mb-2">เชื่อมต่อ TikTok</h1>
      <p className="font-mono text-sm mb-8" style={{ color: '#9B8EC4' }}>
        กดปุ่มด้านล่างเพื่ออนุญาตให้ ThinkBiz Lab โพสต์วิดีโอบน TikTok ของคุณ
      </p>

      {error && (
        <div className="mb-6 rounded-lg px-4 py-3 font-mono text-sm" style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', color: '#F87171' }}>
          เกิดข้อผิดพลาด: {error}
        </div>
      )}

      <a href={authUrl}
        className="inline-flex items-center gap-3 bg-black text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity border border-white/10">
        <span className="text-xl">🎵</span>
        เข้าสู่ระบบด้วย TikTok
      </a>

      <p className="mt-4 font-mono text-xs" style={{ color: 'rgba(155,142,196,.4)' }}>
        จะขอสิทธิ์: video.publish, video.upload
      </p>
    </div>
  )
}

export default function TikTokPage() {
  return (
    <Suspense fallback={<div className="text-white font-mono text-sm">กำลังโหลด...</div>}>
      <TikTokAuthContent />
    </Suspense>
  )
}
