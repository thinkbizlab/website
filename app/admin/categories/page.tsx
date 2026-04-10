'use client'
import { useEffect, useState } from 'react'
import type { Category } from '@/lib/schema'

const PRESET_COLORS = [
  '#7C3AED', '#A855F7', '#2563EB', '#0891B2',
  '#059669', '#D97706', '#DC2626', '#9333EA', '#EC4899',
]

interface FormState {
  name: string
  slug: string
  description: string
  color: string
  order: string
}

const blank: FormState = { name: '', slug: '', description: '', color: '#7C3AED', order: '0' }

function autoSlug(name: string) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(blank)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/categories').then(r => r.json()).then(d => {
      setCats(Array.isArray(d) ? d : [])
      setLoading(false)
    })
  }
  useEffect(() => { load() }, [])

  const setField = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value
    setForm(f => ({
      ...f,
      [k]: v,
      ...(k === 'name' && editId === null ? { slug: autoSlug(v) } : {}),
    }))
  }

  const startEdit = (cat: Category) => {
    setEditId(cat.id)
    setShowAdd(false)
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
      color: cat.color ?? '#7C3AED',
      order: String(cat.order ?? 0),
    })
    setMsg('')
  }

  const cancelEdit = () => {
    setEditId(null)
    setShowAdd(false)
    setForm(blank)
    setMsg('')
  }

  const save = async () => {
    if (!form.name.trim()) { setMsg('กรุณากรอกชื่อหมวดหมู่'); return }
    setSaving(true)
    setMsg('')
    try {
      const payload = { ...form, order: Number(form.order) || 0 }
      const res = editId
        ? await fetch(`/api/categories/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) { setMsg(data.error ?? 'เกิดข้อผิดพลาด'); return }
      setMsg(editId ? '✓ อัปเดตแล้ว' : '✓ เพิ่มหมวดหมู่แล้ว')
      cancelEdit()
      load()
    } catch (e) {
      setMsg(String(e))
    } finally {
      setSaving(false)
    }
  }

  const deleteCategory = async (cat: Category) => {
    if (!confirm(`ลบหมวดหมู่ "${cat.name}"?`)) return
    setDeletingId(cat.id)
    setMsg('')
    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) { setMsg(data.error ?? 'ลบไม่สำเร็จ'); return }
      setMsg(`✓ ลบ "${cat.name}" แล้ว`)
      load()
    } catch (e) {
      setMsg(String(e))
    } finally {
      setDeletingId(null)
    }
  }

  const isEditing = (id: string) => editId === id

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white mb-1">Categories</h1>
          <p className="font-mono text-xs" style={{ color: 'rgba(155,142,196,.5)' }}>จัดการหมวดหมู่บทความ</p>
        </div>
        {!showAdd && !editId && (
          <button
            onClick={() => { setShowAdd(true); setEditId(null); setForm(blank); setMsg('') }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', color: '#fff' }}
          >
            + เพิ่มหมวดหมู่
          </button>
        )}
      </div>

      {/* Add / Edit form */}
      {(showAdd || editId) && (
        <div className="rounded-xl border p-5 space-y-4 mb-6" style={{ borderColor: 'rgba(124,58,237,.3)', background: 'rgba(30,16,48,.6)' }}>
          <div className="font-mono text-xs font-bold text-purple uppercase tracking-widest">
            {editId ? '✏️ แก้ไขหมวดหมู่' : '+ เพิ่มหมวดหมู่ใหม่'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-white">ชื่อหมวดหมู่ *</label>
              <input value={form.name} onChange={setField('name')} placeholder="เช่น Strategy" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-white">Slug (URL)</label>
              <input value={form.slug} onChange={setField('slug')} placeholder="strategy" className={inputCls} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-white">คำอธิบาย (ไม่บังคับ)</label>
            <input value={form.description} onChange={setField('description')} placeholder="อธิบายหมวดหมู่สั้นๆ..." className={inputCls} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-white">สี</label>
              <div className="flex flex-wrap gap-2 items-center">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    className="w-7 h-7 rounded-full transition-transform hover:scale-110 shrink-0"
                    style={{
                      background: c,
                      outline: form.color === c ? `3px solid #fff` : '3px solid transparent',
                      outlineOffset: '1px',
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                  title="เลือกสีเอง"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-white">ลำดับ</label>
              <input type="number" min={0} value={form.order} onChange={setField('order')} className={inputCls} />
            </div>
          </div>

          {/* Preview badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">Preview:</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: form.color + '22', color: form.color, border: `1px solid ${form.color}55` }}>
              {form.name || 'ชื่อหมวดหมู่'}
            </span>
          </div>

          {msg && (
            <div className="font-mono text-xs" style={{ color: msg.startsWith('✓') ? '#10B981' : '#F87171' }}>{msg}</div>
          )}

          <div className="flex items-center gap-3">
            <button onClick={save} disabled={saving}
              className="px-5 py-2 rounded-lg font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', color: '#fff' }}>
              {saving ? 'กำลังบันทึก...' : editId ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}
            </button>
            <button onClick={cancelEdit} className="font-mono text-xs text-purple hover:underline">
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Global message (outside form) */}
      {msg && !showAdd && !editId && (
        <div className="mb-4 px-4 py-3 rounded-lg font-mono text-sm" style={{
          background: msg.startsWith('✓') ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)',
          color: msg.startsWith('✓') ? '#10B981' : '#F87171',
          border: `1px solid ${msg.startsWith('✓') ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'}`,
        }}>
          {msg}
        </div>
      )}

      {/* Category list */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(124,58,237,.18)', background: 'rgba(30,16,48,.4)' }}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(124,58,237,.12)' }}>
          <div className="font-mono text-xs font-bold text-purple uppercase tracking-widest">
            หมวดหมู่ทั้งหมด ({cats.length})
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center font-mono text-sm" style={{ color: 'rgba(155,142,196,.4)' }}>
            กำลังโหลด...
          </div>
        ) : cats.length === 0 ? (
          <div className="py-12 text-center font-mono text-sm" style={{ color: 'rgba(155,142,196,.4)' }}>
            ยังไม่มีหมวดหมู่ — กด &quot;+ เพิ่มหมวดหมู่&quot;
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(124,58,237,.08)' }}>
            {cats.map(cat => (
              <div key={cat.id}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-purple/5"
                style={{ borderColor: 'rgba(124,58,237,.08)' }}
              >
                {/* Color dot */}
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.color ?? '#7C3AED' }} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{cat.name}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(124,58,237,.12)', color: '#A78BFA' }}>
                      /{cat.slug}
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: 'rgba(155,142,196,.4)' }}>
                      ลำดับ {cat.order}
                    </span>
                  </div>
                  {cat.description && (
                    <p className="font-mono text-[11px] mt-0.5 truncate" style={{ color: 'rgba(155,142,196,.5)' }}>
                      {cat.description}
                    </p>
                  )}
                </div>

                {/* Badge preview */}
                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0"
                  style={{ background: (cat.color ?? '#7C3AED') + '22', color: cat.color ?? '#7C3AED', border: `1px solid ${(cat.color ?? '#7C3AED')}44` }}>
                  {cat.name}
                </span>

                {/* Actions */}
                {!isEditing(cat.id) && (
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => startEdit(cat)}
                      className="font-mono text-[11px] text-accent hover:underline">แก้ไข</button>
                    <button
                      onClick={() => deleteCategory(cat)}
                      disabled={deletingId === cat.id}
                      className="font-mono text-[11px] text-red-400 hover:text-red-300 disabled:opacity-40">
                      {deletingId === cat.id ? 'กำลังลบ...' : 'ลบ'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-4 font-mono text-[10px]" style={{ color: 'rgba(155,142,196,.35)' }}>
        หมายเหตุ: ไม่สามารถลบหมวดหมู่ที่มีบทความอยู่ได้ — ต้องย้ายบทความออกก่อน
      </p>
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 rounded-lg border text-white text-sm outline-none transition-colors focus:border-purple/60'
  + ' bg-[rgba(15,13,26,.7)] border-[rgba(124,58,237,.25)] placeholder-[rgba(167,139,250,.3)]'
