'use client'
import { useState, useEffect } from 'react'

import type { Article, Category } from '@/lib/schema'
import { CoverImageUpload } from './CoverImageUpload'
import { RichEditor } from './RichEditor'
import { GenerateModal, type GeneratedOption } from './GenerateModal'
import { PreviewModal, type Platform as PreviewPlatform } from './PreviewModal'
import { GoogleDrivePicker } from './GoogleDrivePicker'

interface FAQ { q: string; a: string }

interface Props {
  article?: Article
  mode: 'new' | 'edit'
}

const STATUS_OPTIONS = [
  { value: 'draft',     label: 'Draft — ร่าง' },
  { value: 'review',    label: 'Review — รอตรวจ' },
  { value: 'published', label: 'Published — เผยแพร่' },
]

export function ArticleForm({ article, mode }: Props) {

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [msg, setMsg] = useState('')
  const [geoScore, setGeoScore] = useState(article?.geoScore ?? 0)
  const [showModal, setShowModal] = useState(false)
  const [generatingCover, setGeneratingCover] = useState(false)
  const [coverPrompt, setCoverPrompt] = useState(() => {
    // Auto-populate from article content on first load
    const parts: string[] = []
    if (article?.excerpt) parts.push(article.excerpt.slice(0, 120))
    if (article?.keyPoints?.length) parts.push(article.keyPoints.slice(0, 2).join(', '))
    if (article?.aiSummaryA) parts.push(article.aiSummaryA.slice(0, 80))
    return parts.join('. ')
  })
  const [previewPlatform, setPreviewPlatform] = useState<PreviewPlatform | null>(null)
  const [categoryList, setCategoryList] = useState<Category[]>([])

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setCategoryList(d)
    })
  }, [])

  const [form, setForm] = useState({
    title:           article?.title ?? '',
    slug:            article?.slug ?? '',
    excerpt:         article?.excerpt ?? '',
    content:         article?.content ?? '',
    coverImage:      article?.coverImage ?? '',
    category:        article?.category ?? '',
    tags:            article?.tags?.join(', ') ?? '',
    status:          article?.status ?? 'draft',
    featured:        article?.featured ?? false,
    readTime:        article?.readTime ?? 5,
    // GEO
    aiSummaryQ:      article?.aiSummaryQ ?? '',
    aiSummaryA:      article?.aiSummaryA ?? '',
    keyPoints:       article?.keyPoints?.join('\n') ?? '',
    // LINE
    lineBroadcastMsg: article?.lineBroadcastMsg ?? '',
    // Schedule
    publishScheduledAt: article?.publishScheduledAt
      ? new Date(article.publishScheduledAt).toISOString().slice(0, 16)
      : '',
    // Social Media
    fbCaption:  article?.fbCaption  ?? '',
    fbHashtags: article?.fbHashtags ?? '',
    ttCaption:  article?.ttCaption  ?? '',
    ttHashtags: article?.ttHashtags ?? '',
    ttVideoUrl: article?.ttVideoUrl ?? '',
    igCaption:  article?.igCaption  ?? '',
    igHashtags: article?.igHashtags ?? '',
  })

  const [faq, setFaq] = useState<FAQ[]>(
    (article?.faqJson as FAQ[] | null) ?? []
  )

  // Auto-generate slug from title (new mode only)
  useEffect(() => {
    if (mode === 'new' && form.title) {
      const slug = form.title
        .toLowerCase()
        .replace(/[^\u0E00-\u0E7Fa-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      setForm(f => ({ ...f, slug }))
    }
  }, [form.title, mode])

  // Live GEO score preview
  useEffect(() => {
    let score = 0
    if (form.aiSummaryQ && form.aiSummaryA)         score += 15
    if (form.keyPoints.trim().split('\n').filter(Boolean).length >= 3) score += 10
    if (faq.length >= 2)                            score += 15
    const questionHeadings = (form.content.match(/<h[123][^>]*>[^<]*\?[^<]*<\/h[123]>/gi)?.length ?? 0)
      + (form.content.match(/##\s+.+\?/g)?.length ?? 0)
    if (questionHeadings >= 2)                                 score += 10
    if ((form.content.match(/\d+[%,]/g)?.length ?? 0) >= 2)   score += 5
    if (form.excerpt.length >= 120)                            score += 10
    if (form.tags.split(',').filter(Boolean).length >= 3)      score += 10
    const textLength = form.content.replace(/<[^>]+>/g, '').length
    if (textLength >= 1500)                                    score += 5
    // Schema always generated
    score += 20
    setGeoScore(Math.min(score, 100))
  }, [form, faq])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  const addFaq = () => setFaq(f => [...f, { q: '', a: '' }])
  const updateFaq = (i: number, k: 'q' | 'a', v: string) =>
    setFaq(f => f.map((item, idx) => idx === i ? { ...item, [k]: v } : item))
  const removeFaq = (i: number) => setFaq(f => f.filter((_, idx) => idx !== i))

  // Auto-generate LINE broadcast from title + excerpt
  const autoLineBroadcast = () => {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thinkbizlab.com'
    const slug = form.slug || 'article'
    const msg = `📊 ${form.title}\n\n${form.excerpt ? form.excerpt.slice(0, 100) + '...' : ''}\n\nอ่านเพิ่มเติม → ${base}/articles/${slug}`
    setForm(f => ({ ...f, lineBroadcastMsg: msg }))
  }

  // Auto-generate social captions
  const autoSocial = (platform: 'fb' | 'tt' | 'ig') => {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thinkbizlab.com'
    const url = `${base}/articles/${form.slug || 'article'}`
    const pts = form.keyPoints.split('\n').filter(Boolean).slice(0, 5)
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)

    if (platform === 'fb') {
      const caption = [
        `📊 ${form.title}`,
        '',
        form.excerpt || '',
        '',
        pts.length ? pts.map(p => `▸ ${p}`).join('\n') : '',
        '',
        `อ่านบทความเต็ม → ${url}`,
      ].filter(Boolean).join('\n')
      const hashtags = ['#ThinkBizLab', '#ธุรกิจ', '#BusinessInsight',
        ...(form.category ? [`#${form.category.replace(/\s/g,'')}`] : []),
        ...tags.slice(0,5).map(t => `#${t.replace(/\s/g,'')}`),
      ].join(' ')
      setForm(f => ({ ...f, fbCaption: caption, fbHashtags: hashtags }))
    }

    if (platform === 'tt') {
      const hook = form.excerpt ? form.excerpt.slice(0, 80) : form.title
      const caption = [
        `${form.title} 🔥`,
        '',
        hook,
        '',
        pts.slice(0,3).map((p,i) => `${['1️⃣','2️⃣','3️⃣'][i]} ${p}`).join('\n'),
        '',
        'Link in bio 🔗',
      ].filter(Boolean).join('\n')
      const hashtags = ['#ThinkBizLab', '#ธุรกิจ', '#SME', '#BusinessTips', '#เรียนรู้',
        ...(form.category ? [`#${form.category.replace(/\s/g,'')}`] : []),
        ...tags.slice(0,3).map(t => `#${t.replace(/\s/g,'')}`),
      ].join(' ')
      setForm(f => ({ ...f, ttCaption: caption, ttHashtags: hashtags }))
    }

    if (platform === 'ig') {
      const caption = [
        `✨ ${form.title}`,
        '',
        form.excerpt || '',
        '',
        pts.length ? pts.map(p => `• ${p}`).join('\n') : '',
        '',
        '.',
        '.',
        '.',
        `🔗 อ่านบทความเต็ม → Link in bio`,
      ].filter(Boolean).join('\n')
      const hashtags = [
        '#ThinkBizLab','#ธุรกิจ','#SME','#BusinessInsight','#นักธุรกิจ',
        '#เจ้าของธุรกิจ','#Startup','#การลงทุน','#ความรู้ธุรกิจ','#ThaiBusinessDev',
        ...(form.category ? [`#${form.category.replace(/\s/g,'')}`] : []),
        ...tags.slice(0,8).map(t => `#${t.replace(/\s/g,'')}`),
      ].join(' ')
      setForm(f => ({ ...f, igCaption: caption, igHashtags: hashtags }))
    }
  }

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text)

  const generateCover = async () => {
    if (!form.title.trim()) return
    setGeneratingCover(true)
    try {
      const params = new URLSearchParams({
        title: form.title,
        category: form.category,
        excerpt: form.excerpt.slice(0, 150),
        keyPoints: form.keyPoints.split('\n').filter(Boolean).slice(0, 3).join(', '),
        prompt: coverPrompt,
      })
      const res = await fetch(`/api/generate-cover?${params}`)
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(errData.error ?? `HTTP ${res.status}`)
      }
      const blob = await res.blob()
      const uploadRes = await fetch(`/api/upload?filename=cover-${Date.now()}.png`, {
        method: 'POST',
        body: blob,
        headers: { 'content-type': 'image/png' },
      })
      if (!uploadRes.ok) {
        const errData = await uploadRes.json().catch(() => ({ error: `HTTP ${uploadRes.status}` }))
        throw new Error(errData.error ?? 'Upload failed')
      }
      const { url } = await uploadRes.json()
      setForm(f => ({ ...f, coverImage: url }))
    } catch (e) {
      setMsg(`สร้างภาพปกไม่สำเร็จ: ${String(e)}`)
    } finally {
      setGeneratingCover(false)
    }
  }

  const onSelectGenerated = (opt: GeneratedOption) => {
    setForm(f => ({
      ...f,
      title:           opt.title,
      excerpt:         opt.excerpt,
      content:         opt.content,
      category:        opt.category,
      tags:            opt.tags.join(', '),
      readTime:        opt.readTime,
      aiSummaryQ:      opt.aiSummaryQ,
      aiSummaryA:      opt.aiSummaryA,
      keyPoints:       opt.keyPoints.join('\n'),
      lineBroadcastMsg: opt.lineBroadcastMsg,
      fbCaption:       opt.fbCaption,
      fbHashtags:      opt.fbHashtags,
      ttCaption:       opt.ttCaption,
      ttHashtags:      opt.ttHashtags,
      igCaption:       opt.igCaption,
      igHashtags:      opt.igHashtags,
    }))
    setFaq(opt.faq)
  }

  const save = async (statusOverride?: string) => {
    if (!form.title.trim()) { setMsg('กรุณากรอกชื่อบทความ'); return }
    setSaving(true); setMsg('')
    try {
      const effectiveStatus = statusOverride ?? form.status
      const payload = {
        ...form,
        status: effectiveStatus,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        keyPoints: form.keyPoints.split('\n').map(t => t.trim()).filter(Boolean),
        faqJson: faq,
        geoScore,
        readTime: Number(form.readTime),
        featured: Boolean(form.featured),
        schemaJson: { auto: true },
        publishScheduledAt: form.publishScheduledAt ? new Date(form.publishScheduledAt).toISOString() : null,
      }
      const url = mode === 'edit' ? `/api/articles/${article!.id}` : '/api/articles'
      const method = mode === 'edit' ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      if (statusOverride) setForm(f => ({ ...f, status: statusOverride }))
      setMsg(`✓ บันทึกสำเร็จ${statusOverride === 'draft' ? ' (Draft)' : statusOverride === 'published' ? ' (เผยแพร่แล้ว)' : ''}`)
      if (mode === 'new') window.location.href = '/admin/articles'
    } catch (e) {
      setMsg(`เกิดข้อผิดพลาด: ${String(e)}`)
    } finally {
      setSaving(false)
    }
  }

  const deleteArticle = async () => {
    if (!confirm('ต้องการลบบทความนี้?')) return
    setDeleting(true)
    await fetch(`/api/articles/${article!.id}`, { method: 'DELETE' })
    window.location.href = '/admin/articles'
  }

  const geoColor = geoScore >= 80 ? '#10B981' : geoScore >= 60 ? '#F59E0B' : geoScore >= 40 ? '#F97316' : '#EF4444'
  const geoLabel = geoScore >= 80 ? 'Excellent' : geoScore >= 60 ? 'Good' : geoScore >= 40 ? 'Fair' : 'Poor'

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white mb-1">
            {mode === 'new' ? 'เพิ่มบทความใหม่' : 'แก้ไขบทความ'}
          </h1>
          {mode === 'edit' && (
            <p className="font-mono text-xs" style={{ color: 'rgba(155,142,196,.5)' }}>/{article?.slug}</p>
          )}
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {/* AI Generate button */}
          <button
            onClick={() => setShowModal(true)}
            disabled={!form.title.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            style={{
              background: form.title.trim() ? 'linear-gradient(135deg, #7C3AED, #A855F7)' : 'rgba(124,58,237,.15)',
              color: form.title.trim() ? '#fff' : 'rgba(167,139,250,.4)',
              border: '1px solid rgba(124,58,237,.3)',
              cursor: form.title.trim() ? 'pointer' : 'not-allowed',
            }}
            title={form.title.trim() ? 'สร้างเนื้อหาด้วย Claude AI' : 'กรอกชื่อบทความก่อน'}
          >
            ✨ สร้างด้วย AI
          </button>

          {/* GEO Score badge */}
          <div className="flex flex-col items-end gap-1">
            <div className="font-mono text-xs" style={{ color: 'rgba(155,142,196,.6)' }}>GEO Score</div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${geoScore}%`, background: geoColor }} />
              </div>
              <span className="font-mono text-sm font-bold" style={{ color: geoColor }}>{geoScore} — {geoLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">

        {/* Schedule — top of form */}
        <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(124,58,237,.22)', background: 'rgba(30,16,48,.4)' }}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="font-mono text-xs font-bold text-purple uppercase tracking-widest shrink-0">📅 ตั้งเวลาเผยแพร่</div>
            <input
              type="datetime-local"
              value={form.publishScheduledAt}
              onChange={set('publishScheduledAt')}
              className={`${inputCls} flex-1 min-w-[200px]`}
              style={{ colorScheme: 'dark' }}
            />
            {form.publishScheduledAt && (
              <span className="font-mono text-xs shrink-0" style={{ color: '#A78BFA' }}>
                {new Date(form.publishScheduledAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            )}
            {form.publishScheduledAt && (
              <button onClick={() => setForm(f => ({ ...f, publishScheduledAt: '' }))}
                className="font-mono text-[10px] text-red-400 hover:text-red-300 shrink-0">✕ ล้าง</button>
            )}
          </div>

          {/* Status + schedule logic hint */}
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(124,58,237,.12)' }}>
            <div className="flex flex-wrap gap-2 items-center">
              {[
                {
                  condition: form.status === 'draft' && !!form.publishScheduledAt,
                  color: '#A78BFA',
                  bg: 'rgba(124,58,237,.1)',
                  border: 'rgba(124,58,237,.25)',
                  icon: '⏰',
                  text: 'Scheduled — Cron จะเผยแพร่อัตโนมัติตามเวลาที่กำหนด',
                },
                {
                  condition: form.status === 'draft' && !form.publishScheduledAt,
                  color: 'rgba(155,142,196,.6)',
                  bg: 'rgba(124,58,237,.06)',
                  border: 'rgba(124,58,237,.15)',
                  icon: '📝',
                  text: 'Draft — ยังไม่เผยแพร่ (ตั้งเวลาหรือกด "เผยแพร่ทันที")',
                },
                {
                  condition: form.status === 'published',
                  color: '#10B981',
                  bg: 'rgba(16,185,129,.08)',
                  border: 'rgba(16,185,129,.2)',
                  icon: '✓',
                  text: 'Published — เผยแพร่แล้ว (publish time จะถูกละเว้น)',
                },
                {
                  condition: form.status === 'review',
                  color: '#F59E0B',
                  bg: 'rgba(245,158,11,.08)',
                  border: 'rgba(245,158,11,.2)',
                  icon: '👀',
                  text: 'Review — รอตรวจสอบ (Cron จะไม่เผยแพร่จนกว่าจะเปลี่ยนเป็น Draft)',
                },
              ].filter(s => s.condition).map(s => (
                <div key={s.text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[11px]"
                  style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                  {s.icon} {s.text}
                </div>
              ))}
            </div>
          </div>
          {mode === 'edit' && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'rgba(124,58,237,.12)' }}>
              {[
                { label: 'LINE', sent: article?.lineBroadcastSent, at: article?.lineBroadcastAt },
                { label: 'Facebook', sent: article?.fbSent, at: article?.fbSentAt },
                { label: 'Instagram', sent: article?.igSent, at: article?.igSentAt },
                { label: 'TikTok', sent: article?.ttSent, at: article?.ttSentAt },
              ].map(p => (
                <div key={p.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px]" style={{
                  background: p.sent ? 'rgba(16,185,129,.1)' : 'rgba(124,58,237,.08)',
                  color: p.sent ? '#10B981' : 'rgba(155,142,196,.5)',
                  border: `1px solid ${p.sent ? 'rgba(16,185,129,.25)' : 'rgba(124,58,237,.15)'}`,
                }}>
                  {p.sent ? '✓' : '○'} {p.label}
                  {p.sent && p.at && <span style={{ color: 'rgba(155,142,196,.4)' }}> · {new Date(p.at).toLocaleDateString('th-TH')}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Basic info */}
        <Section title="ข้อมูลพื้นฐาน">
          <Field label="ชื่อบทความ *">
            <input value={form.title} onChange={set('title')} placeholder="ชื่อบทความที่ชัดเจน ตอบคำถาม..." className={inputCls} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Slug (URL)">
              <input value={form.slug} onChange={set('slug')} placeholder="url-slug-here" className={inputCls} />
            </Field>
            <Field label="หมวดหมู่">
              <select value={form.category} onChange={set('category')} className={inputCls}>
                <option value="">เลือกหมวดหมู่...</option>
                {categoryList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Excerpt / Meta Description (แนะนำ 120-160 ตัวอักษร)">
            <textarea value={form.excerpt} onChange={set('excerpt')} rows={2}
              placeholder="สรุปบทความ — AI search engines ใช้ข้อความนี้ในการตอบคำถาม..."
              className={inputCls} />
            <div className="font-mono text-[10px] mt-1" style={{ color: form.excerpt.length >= 120 ? '#10B981' : '#9B8EC4' }}>
              {form.excerpt.length} ตัวอักษร {form.excerpt.length < 120 ? `(ต้องการอีก ${120 - form.excerpt.length})` : '✓'}
            </div>
          </Field>
          <Field label="Cover Image">
            <CoverImageUpload
              value={form.coverImage}
              onChange={url => setForm(f => ({ ...f, coverImage: url }))}
            />
            <div className="mt-3 space-y-2">
              <textarea
                value={coverPrompt}
                onChange={e => setCoverPrompt(e.target.value)}
                placeholder="ระบุรายละเอียดเพิ่มเติมสำหรับภาพปก เช่น Thai business woman at desk, warm lighting, Bangkok skyline background..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border font-mono text-xs resize-none outline-none"
                style={{ background: 'rgba(15,13,26,.7)', borderColor: 'rgba(124,58,237,.25)', color: '#C4B5FD' }}
              />
              <button
                type="button"
                onClick={generateCover}
                disabled={generatingCover || !form.title.trim()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs border transition-all hover:bg-purple/10 disabled:opacity-40"
                style={{ borderColor: 'rgba(124,58,237,.3)', color: '#A78BFA' }}
                title={form.title.trim() ? 'สร้างภาพปกขนาด 1200×630 อัตโนมัติ' : 'กรอกชื่อบทความก่อน'}
              >
                {generatingCover
                  ? <><span className="w-3 h-3 rounded-full border border-purple/30 border-t-purple animate-spin" />กำลังสร้างภาพปก...</>
                  : <>🎨 สร้างภาพปก AI (1200×630)</>}
              </button>
            </div>
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Tags (คั่นด้วย ,)">
              <input value={form.tags} onChange={set('tags')} placeholder="SME, กลยุทธ์, Finance" className={inputCls} />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={set('status')} className={inputCls}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="เวลาอ่าน (นาที)">
              <input type="number" min={1} value={form.readTime} onChange={set('readTime')} className={inputCls} />
            </Field>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
              className="w-4 h-4 rounded" style={{ accentColor: '#7C3AED' }} />
            <span className="text-sm" style={{ color: '#9B8EC4' }}>แสดงในส่วน Featured บนหน้าหลัก</span>
          </label>
        </Section>

        {/* Content */}
        <Section title="เนื้อหาบทความ">
          <Field label="เนื้อหา" hint="ใช้ Heading 2 สำหรับหัวข้อที่เป็นคำถาม เช่น 'X คืออะไร?' เพื่อ GEO score">
            <RichEditor
              value={form.content}
              onChange={html => setForm(f => ({ ...f, content: html }))}
            />
          </Field>
        </Section>

        {/* GEO Fields */}
        <Section title="GEO Optimization" accent>
          <div className="font-mono text-xs mb-4" style={{ color: '#9B8EC4' }}>
            ข้อมูลเหล่านี้ถูกอ่านโดย AI search engines (ChatGPT, Perplexity, Gemini, Claude) ก่อนเนื้อหาอื่น
          </div>

          <div className="rounded-lg border p-4 mb-4" style={{ borderColor: 'rgba(124,58,237,.25)', background: 'rgba(124,58,237,.06)' }}>
            <div className="font-mono text-xs font-bold text-purple uppercase tracking-widest mb-3">AI Summary Box</div>
            <Field label="คำถามหลักของบทความ" hint="เขียนเหมือน AI กำลังถามผู้ใช้ เช่น 'Blue Ocean Strategy คืออะไร?'">
              <input value={form.aiSummaryQ} onChange={set('aiSummaryQ')}
                placeholder="Blue Ocean Strategy คืออะไร และทำไมธุรกิจถึงต้องรู้?"
                className={inputCls} />
            </Field>
            <Field label="คำตอบสั้น (1-2 ประโยค)" hint="AI จะอ้างอิงประโยคนี้เมื่อตอบคำถาม">
              <textarea value={form.aiSummaryA} onChange={set('aiSummaryA')} rows={2}
                placeholder="Blue Ocean Strategy คือกลยุทธ์ที่สร้างตลาดใหม่โดยไม่แข่งขันในตลาดเดิม..."
                className={inputCls} />
            </Field>
            <Field label="Key Points (1 ข้อต่อบรรทัด)" hint="สรุป 3-5 ประเด็นสำคัญ — AI ดึง list ได้ง่าย">
              <textarea value={form.keyPoints} onChange={set('keyPoints')} rows={4}
                placeholder="ไม่แข่งกับคู่แข่งในตลาดเดิม&#10;สร้าง Value Innovation ใหม่&#10;ลดต้นทุนและเพิ่มคุณค่าพร้อมกัน"
                className={`${inputCls} font-mono text-sm`} />
            </Field>
          </div>

          <div className="rounded-lg border p-4" style={{ borderColor: 'rgba(124,58,237,.25)', background: 'rgba(124,58,237,.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-xs font-bold text-purple uppercase tracking-widest">FAQ Section</div>
              <button onClick={addFaq} className="font-mono text-xs text-accent hover:underline">+ เพิ่มคำถาม</button>
            </div>
            {faq.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: 'rgba(155,142,196,.5)' }}>ยังไม่มี FAQ — กด &quot;+ เพิ่มคำถาม&quot;</p>
            ) : (
              <div className="space-y-3">
                {faq.map((item, i) => (
                  <div key={i} className="rounded-lg p-3 border" style={{ borderColor: 'rgba(124,58,237,.18)', background: 'rgba(15,13,26,.4)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] text-purple">Q{i+1}</span>
                      <button onClick={() => removeFaq(i)} className="font-mono text-[10px] text-red-400 hover:text-red-300">ลบ</button>
                    </div>
                    <input value={item.q} onChange={e => updateFaq(i,'q',e.target.value)}
                      placeholder="คำถาม..." className={`${inputCls} mb-2 text-sm`} />
                    <textarea value={item.a} onChange={e => updateFaq(i,'a',e.target.value)}
                      rows={2} placeholder="คำตอบ..." className={`${inputCls} text-sm`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* LINE Broadcast */}
        <Section title="LINE Broadcast">
          <div className="font-mono text-xs mb-3" style={{ color: '#9B8EC4' }}>
            ข้อความที่จะ broadcast ไปยัง Line OA เมื่อเผยแพร่บทความ
          </div>
          <Field label="ข้อความ LINE Broadcast">
            <textarea
              value={form.lineBroadcastMsg}
              onChange={set('lineBroadcastMsg')}
              rows={5}
              placeholder="📊 ชื่อบทความ&#10;&#10;สรุปสั้นๆ...&#10;&#10;อ่านเพิ่มเติม → https://thinkbizlab.com/articles/slug"
              className={`${inputCls} font-mono text-sm`}
            />
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-[10px]" style={{ color: form.lineBroadcastMsg.length > 0 ? '#A78BFA' : 'rgba(155,142,196,.4)' }}>
                {form.lineBroadcastMsg.length} ตัวอักษร
              </span>
              <button
                onClick={autoLineBroadcast}
                className="font-mono text-[10px] text-accent hover:underline"
              >
                ✨ สร้างอัตโนมัติจากชื่อ + excerpt
              </button>
            </div>
          </Field>
          {article?.lineBroadcastSent && (
            <div className="mt-2 flex items-center gap-2 font-mono text-xs" style={{ color: '#10B981' }}>
              <span>✓</span>
              <span>ส่ง LINE Broadcast แล้ว {article.lineBroadcastAt ? new Date(article.lineBroadcastAt).toLocaleString('th-TH') : ''}</span>
            </div>
          )}
        </Section>

        {/* Social Media */}
        <Section title="Social Media">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="font-mono text-xs" style={{ color: '#9B8EC4' }}>
              เตรียม caption สำหรับแต่ละ platform — กด ✨ เพื่อสร้างอัตโนมัติ แล้วแก้ไขก่อน post
            </div>
            {/* Quick preview buttons */}
            <div className="flex flex-wrap gap-1.5">
              {([
                { id: 'web' as PreviewPlatform,       icon: '🌐', label: 'Web' },
                { id: 'facebook' as PreviewPlatform,  icon: '🔵', label: 'FB' },
                { id: 'instagram' as PreviewPlatform, icon: '📸', label: 'IG' },
                { id: 'tiktok' as PreviewPlatform,    icon: '🎵', label: 'TT' },
                { id: 'ai' as PreviewPlatform,        icon: '🤖', label: 'AI' },
              ] as const).map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPreviewPlatform(p.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono text-[10px] border transition-all hover:bg-purple/10"
                  style={{ borderColor: 'rgba(124,58,237,.3)', color: '#A78BFA' }}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Facebook */}
          <SocialBlock
            icon="🔵" platform="Facebook" limit={500} ideal={500}
            caption={form.fbCaption} hashtags={form.fbHashtags}
            onCaption={v => setForm(f => ({ ...f, fbCaption: v }))}
            onHashtags={v => setForm(f => ({ ...f, fbHashtags: v }))}
            onAuto={() => autoSocial('fb')}
            onCopy={() => copyToClipboard(`${form.fbCaption}\n\n${form.fbHashtags}`)}
            onPreview={() => setPreviewPlatform('facebook')}
          />

          {/* TikTok */}
          <SocialBlock
            icon="🎵" platform="TikTok" limit={2200} ideal={150}
            caption={form.ttCaption} hashtags={form.ttHashtags}
            onCaption={v => setForm(f => ({ ...f, ttCaption: v }))}
            onHashtags={v => setForm(f => ({ ...f, ttHashtags: v }))}
            onAuto={() => autoSocial('tt')}
            onCopy={() => copyToClipboard(`${form.ttCaption}\n\n${form.ttHashtags}`)}
            onPreview={() => setPreviewPlatform('tiktok')}
          >
            <Field label="Video (Google Drive)" hint="ถ้าไม่มีไฟล์วิดีโอจะข้ามการโพสต์ TikTok อัตโนมัติ">
              <GoogleDrivePicker
                value={form.ttVideoUrl}
                onChange={(url) => setForm(f => ({ ...f, ttVideoUrl: url }))}
              />
            </Field>
          </SocialBlock>

          {/* Instagram */}
          <SocialBlock
            icon="📸" platform="Instagram" limit={2200} ideal={300}
            caption={form.igCaption} hashtags={form.igHashtags}
            onCaption={v => setForm(f => ({ ...f, igCaption: v }))}
            onHashtags={v => setForm(f => ({ ...f, igHashtags: v }))}
            onAuto={() => autoSocial('ig')}
            onCopy={() => copyToClipboard(`${form.igCaption}\n\n${form.igHashtags}`)}
            onPreview={() => setPreviewPlatform('instagram')}
            hashtagHint="Instagram รองรับ hashtag สูงสุด 30 อัน"
          />
        </Section>

        {/* Actions */}
        {msg && (
          <div className="px-4 py-3 rounded-lg font-mono text-sm" style={{
            background: msg.startsWith('✓') ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)',
            color: msg.startsWith('✓') ? '#10B981' : '#F87171',
            border: `1px solid ${msg.startsWith('✓') ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'}`,
          }}>
            {msg}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap gap-3">
            <button onClick={() => save()} disabled={saving}
              className="bg-purple text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
              {saving ? 'กำลังบันทึก...' : mode === 'new' ? 'สร้างบทความ' : 'บันทึกการแก้ไข'}
            </button>
            <button
              onClick={() => save('draft')}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg font-semibold text-sm border hover:opacity-90 disabled:opacity-50 transition-opacity"
              style={{ borderColor: 'rgba(124,58,237,.35)', color: '#A78BFA', background: 'rgba(124,58,237,.08)' }}>
              บันทึกเป็น Draft
            </button>
            {mode === 'edit' && form.status !== 'published' && (
              <button onClick={() => save('published')}
                className="text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ background: '#10B981' }}>
                เผยแพร่ทันที
              </button>
            )}
            {mode === 'edit' && form.status === 'published' && (
              <a href={`/articles/${article?.slug}`} target="_blank" rel="noopener"
                className="font-mono text-xs text-accent hover:underline self-center">
                ดูบทความจริง ↗
              </a>
            )}
          </div>
          {mode === 'edit' && (
            <button onClick={deleteArticle} disabled={deleting}
              className="font-mono text-xs text-red-400 hover:text-red-300 transition-colors">
              {deleting ? 'กำลังลบ...' : 'ลบบทความ'}
            </button>
          )}
        </div>
      </div>

      {/* AI Generation Modal */}
      {showModal && (
        <GenerateModal
          title={form.title}
          category={form.category}
          tags={form.tags}
          onSelect={onSelectGenerated}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Platform Preview Modal */}
      {previewPlatform && (
        <PreviewModal
          platform={previewPlatform}
          data={{
            title: form.title,
            excerpt: form.excerpt,
            coverImage: form.coverImage,
            category: form.category,
            tags: form.tags,
            slug: form.slug,
            fbCaption: form.fbCaption,
            fbHashtags: form.fbHashtags,
            igCaption: form.igCaption,
            igHashtags: form.igHashtags,
            ttCaption: form.ttCaption,
            ttHashtags: form.ttHashtags,
            ttVideoUrl: form.ttVideoUrl,
            aiSummaryQ: form.aiSummaryQ,
            aiSummaryA: form.aiSummaryA,
            keyPoints: form.keyPoints,
            readTime: form.readTime,
          }}
          onClose={() => setPreviewPlatform(null)}
          onChangePlatform={setPreviewPlatform}
        />
      )}
    </div>
  )
}

function Section({ title, children, accent }: { title: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-xl border p-5 space-y-4" style={{
      borderColor: accent ? 'rgba(124,58,237,.3)' : 'rgba(124,58,237,.18)',
      background: accent ? 'rgba(45,27,94,.2)' : 'rgba(30,16,48,.4)',
    }}>
      <div className={`font-mono text-xs font-bold uppercase tracking-widest ${accent ? 'text-accent' : 'text-purple'}`}>
        {accent ? '🎯 ' : ''}{title}
      </div>
      {children}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-white">{label}</label>
      {hint && <p className="font-mono text-[10px]" style={{ color: 'rgba(155,142,196,.6)' }}>{hint}</p>}
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 rounded-lg border text-white text-sm outline-none transition-colors focus:border-purple/60'
  + ' [&]:bg-[rgba(15,13,26,.7)] [&]:border-[rgba(124,58,237,.25)] [&]:placeholder-[rgba(167,139,250,.3)]'

interface SocialBlockProps {
  icon: string
  platform: string
  limit: number
  ideal: number
  caption: string
  hashtags: string
  onCaption: (v: string) => void
  onHashtags: (v: string) => void
  onAuto: () => void
  onCopy: () => void
  onPreview?: () => void
  hashtagHint?: string
  children?: React.ReactNode
}

function SocialBlock({ icon, platform, limit, ideal, caption, hashtags, onCaption, onHashtags, onAuto, onCopy, onPreview, hashtagHint, children }: SocialBlockProps) {
  const len = caption.length + (hashtags ? hashtags.length + 2 : 0)
  const color = len > limit ? '#EF4444' : len > ideal ? '#F59E0B' : '#10B981'
  return (
    <div className="rounded-lg border p-4 mb-4" style={{ borderColor: 'rgba(124,58,237,.2)', background: 'rgba(15,13,26,.4)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: '#A78BFA' }}>
          {icon} {platform}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onAuto} className="font-mono text-[10px] text-accent hover:underline">✨ สร้างอัตโนมัติ</button>
          <button onClick={onCopy} className="font-mono text-[10px] text-purple hover:underline">📋 คัดลอก</button>
          {onPreview && (
            <button onClick={onPreview} className="font-mono text-[10px] hover:underline" style={{ color: '#9B8EC4' }}>👁 Preview</button>
          )}
        </div>
      </div>
      <textarea
        value={caption}
        onChange={e => onCaption(e.target.value)}
        rows={5}
        placeholder={`${platform} caption...`}
        className={`${inputCls} font-mono text-sm mb-2`}
        style={{ resize: 'vertical' }}
      />
      <input
        value={hashtags}
        onChange={e => onHashtags(e.target.value)}
        placeholder="#hashtag1 #hashtag2 ..."
        className={`${inputCls} font-mono text-xs`}
      />
      <div className="flex items-center justify-between mt-1.5">
        <span className="font-mono text-[10px]" style={{ color: 'rgba(155,142,196,.45)' }}>
          {hashtagHint ?? `max ${limit.toLocaleString()} / ideal ${ideal} chars`}
        </span>
        <span className="font-mono text-[10px]" style={{ color }}>
          {len} ตัวอักษร {len > limit ? '⚠ เกินขีดจำกัด' : len > ideal ? '↑ ค่อนข้างยาว' : '✓'}
        </span>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}
