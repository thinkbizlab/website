export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { articles } from '@/lib/schema'
import { desc } from 'drizzle-orm'
import Link from 'next/link'


export default async function CalendarPage() {
  const all = await db.select({
    id: articles.id,
    title: articles.title,
    slug: articles.slug,
    status: articles.status,
    publishScheduledAt: articles.publishScheduledAt,
    publishedAt: articles.publishedAt,
    coverImage: articles.coverImage,
    category: articles.category,
    lineBroadcastSent: articles.lineBroadcastSent,
    fbSent: articles.fbSent,
    igSent: articles.igSent,
    ttSent: articles.ttSent,
    lineBroadcastMsg: articles.lineBroadcastMsg,
    fbCaption: articles.fbCaption,
    igCaption: articles.igCaption,
    ttCaption: articles.ttCaption,
  }).from(articles).orderBy(desc(articles.publishScheduledAt))

  const scheduled = all.filter(a => a.publishScheduledAt && a.status !== 'published')
  const published = all.filter(a => a.status === 'published')
  const unscheduled = all.filter(a => !a.publishScheduledAt && a.status !== 'published')

  const now = new Date()

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white mb-1">Content Calendar</h1>
          <p className="font-mono text-xs" style={{ color: 'rgba(155,142,196,.5)' }}>
            ระบบโพสต์อัตโนมัติ — ทำงานทุกชั่วโมง
          </p>
        </div>
        <Link href="/admin/articles/new"
          className="bg-purple text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
          + เพิ่มบทความ
        </Link>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {[
          { icon: '💬', label: 'LINE Broadcast' },
          { icon: '🔵', label: 'Facebook' },
          { icon: '📸', label: 'Instagram' },
          { icon: '🎵', label: 'TikTok' },
        ].map(p => (
          <div key={p.label} className="flex items-center gap-1.5 font-mono text-xs" style={{ color: 'rgba(155,142,196,.6)' }}>
            <span>{p.icon}</span><span>{p.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-3 ml-auto font-mono text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> ส่งแล้ว</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple inline-block" /> รอส่ง</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/20 inline-block" /> ไม่มี caption</span>
        </div>
      </div>

      {/* Scheduled */}
      {scheduled.length > 0 && (
        <CalSection title="📅 รอเผยแพร่ตามกำหนด" count={scheduled.length}>
          {scheduled.map(a => {
            const isPast = a.publishScheduledAt && new Date(a.publishScheduledAt) < now
            return (
              <ArticleRow key={a.id} article={a} highlight={isPast ? 'overdue' : 'scheduled'} />
            )
          })}
        </CalSection>
      )}

      {/* Unscheduled drafts */}
      {unscheduled.length > 0 && (
        <CalSection title="📝 Draft — ยังไม่ได้กำหนดเวลา" count={unscheduled.length}>
          {unscheduled.map(a => <ArticleRow key={a.id} article={a} highlight="draft" />)}
        </CalSection>
      )}

      {/* Published */}
      {published.length > 0 && (
        <CalSection title="✓ เผยแพร่แล้ว" count={published.length} collapsible>
          {published.map(a => <ArticleRow key={a.id} article={a} highlight="published" />)}
        </CalSection>
      )}

      {all.length === 0 && (
        <div className="text-center py-20 font-mono text-sm" style={{ color: 'rgba(155,142,196,.4)' }}>
          ยังไม่มีบทความ — <Link href="/admin/articles/new" className="text-accent hover:underline">เพิ่มบทความแรก</Link>
        </div>
      )}
    </div>
  )
}

function CalSection({ title, count, children, collapsible }: {
  title: string; count: number; children: React.ReactNode; collapsible?: boolean
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-xs font-bold text-white">{title}</span>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,.2)', color: '#A78BFA' }}>
          {count}
        </span>
        {collapsible && <span className="font-mono text-[10px] ml-auto" style={{ color: 'rgba(155,142,196,.4)' }}>ล่าสุด 10 รายการ</span>}
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
}

interface ArticleRow {
  id: string; title: string; slug: string; status: string | null;
  publishScheduledAt: Date | null; publishedAt: Date | null;
  coverImage: string | null; category: string | null;
  lineBroadcastSent: boolean | null; fbSent: boolean | null;
  igSent: boolean | null; ttSent: boolean | null;
  lineBroadcastMsg: string | null; fbCaption: string | null;
  igCaption: string | null; ttCaption: string | null;
}

function ArticleRow({ article: a, highlight }: { article: ArticleRow; highlight: string }) {
  const borderColor = highlight === 'overdue' ? 'rgba(239,68,68,.35)'
    : highlight === 'scheduled' ? 'rgba(124,58,237,.35)'
    : highlight === 'published' ? 'rgba(16,185,129,.2)'
    : 'rgba(124,58,237,.18)'

  const platforms = [
    { icon: '💬', sent: a.lineBroadcastSent, has: !!a.lineBroadcastMsg },
    { icon: '🔵', sent: a.fbSent, has: !!a.fbCaption },
    { icon: '📸', sent: a.igSent, has: !!a.igCaption },
    { icon: '🎵', sent: a.ttSent, has: !!a.ttCaption },
  ]

  return (
    <Link href={`/admin/articles/${a.id}`}>
      <div className="flex items-center gap-4 rounded-xl border px-4 py-3 hover:border-purple/50 transition-colors cursor-pointer"
        style={{ borderColor, background: 'rgba(15,13,26,.5)' }}>

        {/* Date/time */}
        <div className="w-20 flex-shrink-0 text-center">
          {a.publishScheduledAt ? (
            <>
              <div className="font-mono text-xs font-bold text-white">
                {new Date(a.publishScheduledAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
              </div>
              <div className="font-mono text-[10px]" style={{ color: 'rgba(155,142,196,.6)' }}>
                {new Date(a.publishScheduledAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </>
          ) : a.publishedAt ? (
            <>
              <div className="font-mono text-xs" style={{ color: '#10B981' }}>✓ โพสต์แล้ว</div>
              <div className="font-mono text-[10px]" style={{ color: 'rgba(155,142,196,.5)' }}>
                {new Date(a.publishedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
              </div>
            </>
          ) : (
            <div className="font-mono text-[10px]" style={{ color: 'rgba(155,142,196,.4)' }}>ไม่ได้กำหนด</div>
          )}
        </div>

        {/* Cover */}
        {a.coverImage ? (
          <img src={a.coverImage} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0 opacity-80" />
        ) : (
          <div className="w-12 h-12 rounded-lg flex-shrink-0" style={{ background: 'rgba(124,58,237,.15)' }} />
        )}

        {/* Title + category */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{a.title}</div>
          {a.category && (
            <div className="font-mono text-[10px] mt-0.5" style={{ color: '#A78BFA' }}>{a.category}</div>
          )}
        </div>

        {/* Platform dots */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {platforms.map((p, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="text-sm leading-none">{p.icon}</span>
              <div className="w-1.5 h-1.5 rounded-full" style={{
                background: p.sent ? '#10B981' : p.has ? '#7C3AED' : 'rgba(255,255,255,.15)',
              }} />
            </div>
          ))}
        </div>

        {/* Status badge */}
        <div className="flex-shrink-0">
          {highlight === 'overdue' && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,.15)', color: '#F87171' }}>
              เลยกำหนด
            </span>
          )}
          {highlight === 'scheduled' && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,.15)', color: '#A78BFA' }}>
              รอโพสต์
            </span>
          )}
          {highlight === 'published' && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,.1)', color: '#10B981' }}>
              เผยแพร่แล้ว
            </span>
          )}
          {highlight === 'draft' && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,.1)', color: 'rgba(155,142,196,.6)' }}>
              draft
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
