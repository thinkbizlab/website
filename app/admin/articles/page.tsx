import Link from 'next/link'
import { db } from '@/lib/db'
import { articles } from '@/lib/schema'
import { desc } from 'drizzle-orm'
import { geoScoreLabel } from '@/lib/geo-score'

export const dynamic = 'force-dynamic'

export default async function AdminArticlesPage() {
  let rows: (typeof articles.$inferSelect)[] = []
  try {
    rows = await db.select().from(articles).orderBy(desc(articles.updatedAt))
  } catch { /* DB not connected */ }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white mb-1">บทความทั้งหมด</h1>
          <p className="text-sm" style={{ color: '#9B8EC4' }}>{rows.length} บทความ</p>
        </div>
        <Link href="/admin/articles/new"
          className="inline-flex items-center gap-2 bg-purple text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
          + เพิ่มบทความใหม่
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border py-20 text-center" style={{ borderColor: 'rgba(124,58,237,.15)', background: 'rgba(45,27,94,.15)' }}>
          <div className="text-4xl mb-3">📝</div>
          <p className="text-white font-semibold mb-2">ยังไม่มีบทความ</p>
          <p className="text-sm mb-5" style={{ color: '#9B8EC4' }}>เริ่มเขียนบทความแรกของคุณได้เลย</p>
          <Link href="/admin/articles/new" className="bg-purple text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
            เพิ่มบทความแรก
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(124,58,237,.18)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(124,58,237,.15)', background: 'rgba(45,27,94,.3)' }}>
                <th className="text-left px-4 py-3 font-mono text-xs text-purple uppercase tracking-widest">ชื่อบทความ</th>
                <th className="text-left px-4 py-3 font-mono text-xs text-purple uppercase tracking-widest hidden sm:table-cell">หมวดหมู่</th>
                <th className="text-left px-4 py-3 font-mono text-xs text-purple uppercase tracking-widest hidden md:table-cell">GEO</th>
                <th className="text-left px-4 py-3 font-mono text-xs text-purple uppercase tracking-widest">Status</th>
                <th className="text-left px-4 py-3 font-mono text-xs text-purple uppercase tracking-widest hidden lg:table-cell">LINE</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'rgba(124,58,237,.08)' }}>
              {rows.map(a => {
                const geo = geoScoreLabel(a.geoScore ?? 0)
                return (
                  <tr key={a.id} className="transition-colors hover:bg-purple/5">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white line-clamp-1 max-w-xs">{a.title}</div>
                      <div className="font-mono text-[10px] mt-0.5" style={{ color: 'rgba(155,142,196,.5)' }}>{a.slug}</div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {a.category && (
                        <span className="font-mono text-[10px] text-purple uppercase tracking-wider">{a.category}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${a.geoScore ?? 0}%`, background: geo.color }} />
                        </div>
                        <span className="font-mono text-[10px]" style={{ color: geo.color }}>{a.geoScore ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status ?? 'draft'} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {a.lineBroadcastSent ? (
                        <span className="font-mono text-[10px]" style={{ color: '#10B981' }}>✓ ส่งแล้ว</span>
                      ) : a.lineBroadcastMsg ? (
                        <span className="font-mono text-[10px]" style={{ color: '#F59E0B' }}>⏳ รอส่ง</span>
                      ) : (
                        <span className="font-mono text-[10px]" style={{ color: 'rgba(155,142,196,.35)' }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/articles/${a.id}`}
                        className="font-mono text-xs text-accent hover:underline whitespace-nowrap">
                        แก้ไข →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    published: { label: 'เผยแพร่',  color: '#10B981', bg: 'rgba(16,185,129,.12)' },
    review:    { label: 'Review',    color: '#F97316', bg: 'rgba(249,115,22,.12)' },
    draft:     { label: 'Draft',     color: '#9B8EC4', bg: 'rgba(155,142,196,.12)' },
  }
  const s = map[status] ?? map.draft
  return (
    <span className="font-mono text-[10px] font-bold px-2 py-1 rounded" style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  )
}
