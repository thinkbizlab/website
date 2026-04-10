'use client'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const [cronEnabled, setCronEnabled] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  // Anthropic key
  const [anthropicKey, setAnthropicKey] = useState('')
  const [anthropicMasked, setAnthropicMasked] = useState('')
  const [anthropicSet, setAnthropicSet] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [savingKey, setSavingKey] = useState(false)
  const [keyMsg, setKeyMsg] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)

  // Timezone
  const [timezone, setTimezone] = useState('Asia/Bangkok')
  const [savingTz, setSavingTz] = useState(false)
  const [tzMsg, setTzMsg] = useState('')

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      setCronEnabled(d.cron_enabled)
      setAnthropicSet(d.anthropic_key_set)
      setAnthropicMasked(d.anthropic_key_masked ?? '')
      setTimezone(d.timezone ?? 'Asia/Bangkok')
    })
  }, [])

  const saveTimezone = async () => {
    setSavingTz(true)
    setTzMsg('')
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timezone }),
    })
    const data = await res.json()
    setTzMsg(data.ok ? '✓ บันทึก Timezone แล้ว' : `Error: ${data.error}`)
    setSavingTz(false)
  }

  const toggle = async () => {
    setSaving(true)
    setMsg('')
    const next = !cronEnabled
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cron_enabled: next }),
    })
    const data = await res.json()
    setCronEnabled(data.cron_enabled)
    setMsg(data.cron_enabled ? '✓ เปิดใช้งาน Cron แล้ว' : '✓ ปิด Cron แล้ว')
    setSaving(false)
  }

  const testAnthropicKey = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/ai/test', { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        setTestResult({ ok: true, msg: `✓ เชื่อมต่อสำเร็จ — ${data.model}` })
      } else {
        setTestResult({ ok: false, msg: data.error ?? 'ไม่สามารถเชื่อมต่อได้' })
      }
    } catch (e) {
      setTestResult({ ok: false, msg: String(e) })
    }
    setTesting(false)
  }

  const saveAnthropicKey = async () => {
    if (!anthropicKey.trim()) return
    setSavingKey(true)
    setKeyMsg('')
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anthropic_api_key: anthropicKey.trim() }),
    })
    const data = await res.json()
    if (data.ok) {
      setKeyMsg('✓ บันทึก API Key แล้ว')
      setAnthropicSet(true)
      setAnthropicKey('')
      setShowKey(false)
      // Refresh masked key
      fetch('/api/settings').then(r => r.json()).then(d => setAnthropicMasked(d.anthropic_key_masked ?? ''))
    } else {
      setKeyMsg(`เกิดข้อผิดพลาด: ${data.error}`)
    }
    setSavingKey(false)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-white mb-1">Settings</h1>
      <p className="font-mono text-xs mb-8" style={{ color: 'rgba(155,142,196,.5)' }}>ตั้งค่าระบบ Automation</p>

      {/* Anthropic API Key */}
      <div className="rounded-xl border p-6 space-y-4 mb-6" style={{ borderColor: 'rgba(124,58,237,.18)', background: 'rgba(30,16,48,.4)' }}>
        <div className="flex items-center gap-2">
          <div className="font-mono text-xs font-bold text-purple uppercase tracking-widest">✨ Claude AI (Anthropic)</div>
          {anthropicSet && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,.12)', color: '#10B981' }}>
              ✓ ตั้งค่าแล้ว
            </span>
          )}
        </div>

        {anthropicSet && anthropicMasked && !showKey && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.2)' }}>
              <span className="font-mono text-sm" style={{ color: '#A78BFA' }}>{anthropicMasked}</span>
              <button onClick={() => setShowKey(true)} className="font-mono text-[10px] text-accent hover:underline ml-4">
                เปลี่ยน Key
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={testAnthropicKey}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs border transition-all hover:bg-white/5 disabled:opacity-50"
                style={{ borderColor: 'rgba(124,58,237,.3)', color: '#A78BFA' }}
              >
                {testing ? (
                  <><span className="w-3 h-3 rounded-full border border-purple/30 border-t-purple animate-spin" />ทดสอบ...</>
                ) : (
                  <>⚡ ทดสอบ API Key</>
                )}
              </button>
              {testResult && (
                <span className="font-mono text-xs" style={{ color: testResult.ok ? '#10B981' : '#F87171' }}>
                  {testResult.msg}
                </span>
              )}
            </div>
          </div>
        )}

        {(!anthropicSet || showKey) && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-white">Anthropic API Key</label>
              <p className="font-mono text-[10px]" style={{ color: 'rgba(155,142,196,.6)' }}>
                ขึ้นต้นด้วย sk-ant-... — ดูได้ที่ console.anthropic.com
              </p>
              <input
                type="password"
                value={anthropicKey}
                onChange={e => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="w-full px-3 py-2.5 rounded-lg border text-white text-sm outline-none font-mono"
                style={{
                  background: 'rgba(15,13,26,.7)',
                  borderColor: 'rgba(124,58,237,.25)',
                  color: '#fff',
                }}
                onKeyDown={e => e.key === 'Enter' && saveAnthropicKey()}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={saveAnthropicKey}
                disabled={savingKey || !anthropicKey.trim()}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', color: '#fff' }}
              >
                {savingKey ? 'กำลังบันทึก...' : 'บันทึก API Key'}
              </button>
              {showKey && (
                <button
                  onClick={() => { setShowKey(false); setAnthropicKey('') }}
                  className="font-mono text-xs text-purple hover:underline"
                >
                  ยกเลิก
                </button>
              )}
            </div>
            {keyMsg && (
              <div className="font-mono text-xs" style={{ color: keyMsg.startsWith('✓') ? '#10B981' : '#F87171' }}>
                {keyMsg}
              </div>
            )}
          </div>
        )}

        {keyMsg && !showKey && (
          <div className="font-mono text-xs" style={{ color: '#10B981' }}>{keyMsg}</div>
        )}

        <div className="font-mono text-[10px] pt-1" style={{ color: 'rgba(155,142,196,.45)' }}>
          Key ที่บันทึกใน DB จะมีความสำคัญกว่า Environment Variable
        </div>
      </div>

      {/* Timezone */}
      <div className="rounded-xl border p-6 space-y-4 mb-6" style={{ borderColor: 'rgba(124,58,237,.18)', background: 'rgba(30,16,48,.4)' }}>
        <div className="font-mono text-xs font-bold text-purple uppercase tracking-widest">🌏 Timezone</div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-white">Timezone ของเว็บไซต์</label>
            <p className="font-mono text-[10px]" style={{ color: 'rgba(155,142,196,.6)' }}>
              ใช้สำหรับแสดงวันที่เวลาในบทความและ Cron job schedule
            </p>
            <select
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border text-white text-sm outline-none"
              style={{ background: 'rgba(15,13,26,.7)', borderColor: 'rgba(124,58,237,.25)', colorScheme: 'dark' }}
            >
              <optgroup label="เอเชีย">
                <option value="Asia/Bangkok">Asia/Bangkok (UTC+7) — ไทย</option>
                <option value="Asia/Singapore">Asia/Singapore (UTC+8) — สิงคโปร์</option>
                <option value="Asia/Tokyo">Asia/Tokyo (UTC+9) — ญี่ปุ่น</option>
                <option value="Asia/Shanghai">Asia/Shanghai (UTC+8) — จีน</option>
                <option value="Asia/Kolkata">Asia/Kolkata (UTC+5:30) — อินเดีย</option>
                <option value="Asia/Dubai">Asia/Dubai (UTC+4) — UAE</option>
              </optgroup>
              <optgroup label="ยุโรป">
                <option value="Europe/London">Europe/London (UTC+0/+1)</option>
                <option value="Europe/Paris">Europe/Paris (UTC+1/+2)</option>
              </optgroup>
              <optgroup label="อเมริกา">
                <option value="America/New_York">America/New_York (UTC-5/-4)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (UTC-8/-7)</option>
              </optgroup>
              <optgroup label="อื่นๆ">
                <option value="UTC">UTC (UTC+0)</option>
              </optgroup>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={saveTimezone}
              disabled={savingTz}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'rgba(124,58,237,.3)', color: '#C4B5FD', border: '1px solid rgba(124,58,237,.4)' }}
            >
              {savingTz ? 'กำลังบันทึก...' : 'บันทึก Timezone'}
            </button>
            {tzMsg && (
              <span className="font-mono text-xs" style={{ color: tzMsg.startsWith('✓') ? '#10B981' : '#F87171' }}>
                {tzMsg}
              </span>
            )}
          </div>
          <div className="font-mono text-[10px] pt-1" style={{ color: 'rgba(155,142,196,.4)' }}>
            ปัจจุบัน: {new Date().toLocaleString('th-TH', { timeZone: timezone, dateStyle: 'full', timeStyle: 'medium' })}
          </div>
        </div>
      </div>

      {/* Cron Job */}
      <div className="rounded-xl border p-6 space-y-6" style={{ borderColor: 'rgba(124,58,237,.18)', background: 'rgba(30,16,48,.4)' }}>
        <div className="font-mono text-xs font-bold text-purple uppercase tracking-widest">Cron Job</div>

        <div className="flex items-center justify-between gap-6">
          <div>
            <div className="text-sm font-semibold text-white mb-1">Auto-publish &amp; Broadcast</div>
            <div className="font-mono text-xs" style={{ color: 'rgba(155,142,196,.6)' }}>
              รันทุกวัน 08:00 น. — เผยแพร่บทความ → LINE → Facebook → TikTok
            </div>
          </div>

          {cronEnabled === null ? (
            <div className="w-12 h-6 rounded-full bg-white/10 animate-pulse" />
          ) : (
            <button
              onClick={toggle}
              disabled={saving}
              className="relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0"
              style={{ background: cronEnabled ? '#7C3AED' : 'rgba(255,255,255,.15)' }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
                style={{ transform: cronEnabled ? 'translateX(24px)' : 'translateX(0)' }}
              />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: 'rgba(124,58,237,.12)' }}>
          <div className="w-2 h-2 rounded-full" style={{
            background: cronEnabled ? '#10B981' : '#EF4444',
            boxShadow: cronEnabled ? '0 0 6px #10B981' : 'none',
          }} />
          <span className="font-mono text-xs" style={{ color: cronEnabled ? '#10B981' : '#F87171' }}>
            {cronEnabled === null ? 'กำลังโหลด...' : cronEnabled ? 'เปิดใช้งาน — ทำงานอัตโนมัติทุกวัน 08:00 น.' : 'ปิดอยู่ — ไม่มีการโพสต์อัตโนมัติ'}
          </span>
        </div>

        {msg && (
          <div className="font-mono text-xs" style={{ color: '#10B981' }}>{msg}</div>
        )}
      </div>

      {/* Platform status */}
      <div className="mt-6 rounded-xl border p-6" style={{ borderColor: 'rgba(124,58,237,.18)', background: 'rgba(30,16,48,.4)' }}>
        <div className="font-mono text-xs font-bold text-purple uppercase tracking-widest mb-4">Platform Connections</div>
        <div className="space-y-3">
          {[
            { icon: '💬', name: 'LINE Broadcast', env: 'LINE_CHANNEL_ACCESS_TOKEN' },
            { icon: '🔵', name: 'Facebook', env: 'FB_PAGE_ACCESS_TOKEN' },
            { icon: '📸', name: 'Instagram', env: 'IG_USER_ID' },
            { icon: '🎵', name: 'TikTok', env: 'DB' },
          ].map(p => (
            <div key={p.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm" style={{ color: '#9B8EC4' }}>
                <span>{p.icon}</span>
                <span>{p.name}</span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: p.name === 'Instagram' ? 'rgba(245,158,11,.1)' : 'rgba(16,185,129,.1)',
                  color: p.name === 'Instagram' ? '#F59E0B' : '#10B981',
                }}>
                {p.name === 'Instagram' ? 'ยังไม่ได้ตั้งค่า' : 'เชื่อมต่อแล้ว'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
