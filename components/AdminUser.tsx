'use client'
import { signOut } from 'next-auth/react'

interface Props { compact?: boolean }

export function AdminUser({ compact }: Props) {
  if (compact) {
    return (
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="font-mono text-[10px] px-2 py-1 rounded transition-colors hover:text-white"
        style={{ color: 'rgba(155,142,196,.5)', background: 'rgba(239,68,68,.08)' }}
        title="Sign out">
        ออก
      </button>
    )
  }

  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="w-full text-left font-mono text-[10px] transition-colors hover:text-red-400"
      style={{ color: 'rgba(155,142,196,.4)' }}>
      ออกจากระบบ
    </button>
  )
}
