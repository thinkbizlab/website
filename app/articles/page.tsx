import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { articles } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import { Navbar } from '@/components/Navbar'
import { ArticleCard } from '@/components/ArticleCard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'บทความ | ThinkBiz Lab',
  description: 'รวมบทความธุรกิจ กลยุทธ์ การเงิน การตลาด Startup SME และ AI สำหรับผู้ประกอบการไทย',
}

const CATEGORIES = [
  { icon: '📊', name: 'Strategy' },
  { icon: '💰', name: 'Finance' },
  { icon: '📣', name: 'Marketing' },
  { icon: '🚀', name: 'Startup' },
  { icon: '🏪', name: 'SME' },
  { icon: '📈', name: 'Investment' },
  { icon: '🤖', name: 'AI & Tech' },
  { icon: '🌏', name: 'Global Case' },
]

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { category?: string; tag?: string; q?: string }
}) {
  const { category, tag, q } = searchParams

  let rows: (typeof articles.$inferSelect)[] = []
  try {
      rows = await db.select().from(articles)
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.publishedAt))
  } catch { /* DB not connected */ }

  // Client-side filters (simpler than complex Drizzle conditions)
  let filtered = rows
  if (category) filtered = filtered.filter(a => a.category === category)
  if (tag) filtered = filtered.filter(a => a.tags?.includes(tag))
  if (q) {
    const ql = q.toLowerCase()
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(ql) ||
      (a.excerpt ?? '').toLowerCase().includes(ql)
    )
  }

  const activeCategory = category ?? ''

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20">

        {/* Header */}
        <div className="mb-10">
          <div className="font-mono text-xs font-bold text-purple uppercase tracking-widest mb-2">บทความทั้งหมด</div>
          <h1 className="font-heading text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
            ธุรกิจ กลยุทธ์ และการเติบโต
          </h1>
          <p className="text-muted text-sm max-w-xl">
            ความรู้ธุรกิจเชิงลึกสำหรับผู้ประกอบการและนักธุรกิจไทย อ่านจบแล้วนำไปใช้ได้จริง
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/articles"
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold border transition-all ${
              !activeCategory
                ? 'bg-purple text-white border-purple'
                : 'border-purple/25 text-muted hover:border-purple/50 hover:text-white'
            }`}
          >
            ทั้งหมด ({rows.length})
          </Link>
          {CATEGORIES.map(c => {
            const count = rows.filter(a => a.category === c.name).length
            if (count === 0) return null
            return (
              <Link
                key={c.name}
                href={activeCategory === c.name ? '/articles' : `/articles?category=${encodeURIComponent(c.name)}`}
                className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold border transition-all ${
                  activeCategory === c.name
                    ? 'bg-purple text-white border-purple'
                    : 'border-purple/25 text-muted hover:border-purple/50 hover:text-white'
                }`}
              >
                {c.icon} {c.name} ({count})
              </Link>
            )
          })}
        </div>

        {/* Active filter label */}
        {(tag || q) && (
          <div className="flex items-center gap-3 mb-6 font-mono text-xs text-muted">
            {tag && <span>แท็ก: <span className="text-accent">#{tag}</span></span>}
            {q && <span>ค้นหา: <span className="text-accent">&quot;{q}&quot;</span></span>}
            <Link href="/articles" className="text-red-400 hover:underline">✕ ล้างตัวกรอง</Link>
          </div>
        )}

        {/* Article grid */}
        {filtered.length === 0 ? (
          <div className="py-24 text-center border border-purple/10 rounded-2xl" style={{ background: 'rgba(45,27,94,.15)' }}>
            <div className="text-4xl mb-3">📭</div>
            <p className="text-white font-semibold mb-1">ยังไม่มีบทความ</p>
            <p className="text-muted text-sm">
              {activeCategory || tag || q ? 'ลองเปลี่ยนตัวกรอง' : 'กำลังเตรียมเนื้อหา'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
