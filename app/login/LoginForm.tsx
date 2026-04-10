'use client'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function LoginForm() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    if (status === 'authenticated') router.replace('/admin')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="w-6 h-6 border-2 border-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%,rgba(124,58,237,.2) 0%,transparent 65%)' }} />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-3">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect x="14" y="2" width="8" height="2.5" rx="1.2" fill="#2D1B5E" stroke="#6D28D9" strokeWidth=".8"/>
              <rect x="15" y="4.5" width="6" height="8" rx="1" fill="#1E1030" stroke="#6D28D9" strokeWidth=".9"/>
              <polygon points="11,12.5 25,12.5 29.5,30 6.5,30" fill="#1E1030" stroke="#6D28D9" strokeWidth="1.1"/>
              <polygon points="11,20.5 25,20.5 29.5,30 6.5,30" fill="#5B21B6" opacity=".85"/>
              <circle cx="13.5" cy="24.5" r="2.2" fill="#A78BFA" opacity=".7"/>
              <circle cx="19.5" cy="22.5" r="1.6" fill="#C4B5FD" opacity=".65"/>
              <circle cx="24" cy="26" r="1.6" fill="#A78BFA" opacity=".6"/>
            </svg>
            <span className="font-heading text-2xl font-bold text-white">Think<span className="text-accent">Biz</span></span>
            <span className="font-mono text-[10px] text-accent border border-purple/40 px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(45,27,94,.5)' }}>ADMIN</span>
          </div>
          <p className="font-mono text-xs text-center" style={{ color: 'rgba(155,142,196,.6)' }}>
            ล็อกอินเพื่อจัดการเนื้อหา
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border p-8"
          style={{ borderColor: 'rgba(124,58,237,.2)', background: 'rgba(30,16,48,.6)', backdropFilter: 'blur(12px)' }}>
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg text-sm font-mono text-center"
              style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', color: '#F87171' }}>
              {error === 'AccessDenied'
                ? 'Gmail นี้ไม่มีสิทธิ์เข้าใช้งาน — ติดต่อผู้ดูแล'
                : 'เกิดข้อผิดพลาด กรุณาลองใหม่'}
            </div>
          )}

          <button
            onClick={() => signIn('google', { callbackUrl: '/admin' })}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'rgba(255,255,255,.06)', borderColor: 'rgba(255,255,255,.15)' }}>
            <GoogleIcon />
            เข้าสู่ระบบด้วย Gmail
          </button>

          <p className="text-center font-mono text-[10px] mt-5" style={{ color: 'rgba(155,142,196,.4)' }}>
            เฉพาะ Gmail ที่ได้รับอนุญาตเท่านั้น
          </p>
        </div>

        <p className="text-center mt-6 font-mono text-[11px]" style={{ color: 'rgba(155,142,196,.3)' }}>
          ThinkBiz Lab Admin Panel
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
