import Link from 'next/link'
import { Navbar } from '@/components/Navbar'

export const metadata = {
  title: 'นโยบายความเป็นส่วนตัว | ThinkBiz Lab',
  description: 'นโยบายความเป็นส่วนตัวของ ThinkBiz Lab — การเก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณ',
}

const sections = [
  {
    title: '1. ข้อมูลที่เราเก็บรวบรวม',
    content: [
      'เมื่อคุณสมัครรับจดหมายข่าว เราเก็บรวบรวม **อีเมลแอดเดรส** ของคุณเท่านั้น',
      'เมื่อคุณเยี่ยมชมเว็บไซต์ เราอาจเก็บข้อมูลเทคนิคโดยอัตโนมัติ เช่น ที่อยู่ IP ประเภทเบราว์เซอร์ หน้าที่เยี่ยมชม และเวลาที่ใช้งาน เพื่อวัตถุประสงค์ด้านสถิติและการปรับปรุงเว็บไซต์',
      'เราไม่เก็บข้อมูลส่วนบุคคลที่ละเอียดอ่อน เช่น หมายเลขบัตรประชาชน ข้อมูลทางการเงิน หรือข้อมูลสุขภาพ',
    ],
  },
  {
    title: '2. วัตถุประสงค์ในการใช้ข้อมูล',
    content: [
      'ส่งจดหมายข่าวและบทความ Business Insight ให้แก่ผู้สมัครสมาชิก',
      'วิเคราะห์การใช้งานเว็บไซต์เพื่อปรับปรุงประสบการณ์ผู้ใช้',
      'ติดต่อกลับเมื่อคุณส่งคำถามหรือข้อเสนอแนะมาหาเรา',
      'เราไม่ขาย ให้เช่า หรือเปิดเผยข้อมูลส่วนบุคคลของคุณแก่บุคคลที่สาม เว้นแต่จะได้รับความยินยอมจากคุณหรือเป็นไปตามกฎหมาย',
    ],
  },
  {
    title: '3. คุกกี้และเทคโนโลยีติดตาม',
    content: [
      'เว็บไซต์ของเราอาจใช้คุกกี้เพื่อบันทึกการตั้งค่าและวิเคราะห์ปริมาณการใช้งาน',
      'คุณสามารถปฏิเสธคุกกี้ได้ผ่านการตั้งค่าเบราว์เซอร์ของคุณ อย่างไรก็ตาม อาจส่งผลต่อการใช้งานบางส่วน',
    ],
  },
  {
    title: '4. การรักษาความปลอดภัยของข้อมูล',
    content: [
      'เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลส่วนบุคคลของคุณจากการเข้าถึงโดยไม่ได้รับอนุญาต การเปลี่ยนแปลง การเปิดเผย หรือการทำลาย',
      'ข้อมูลถูกจัดเก็บบนเซิร์ฟเวอร์ที่ปลอดภัยและเข้าถึงได้เฉพาะผู้ที่ได้รับอนุญาตเท่านั้น',
    ],
  },
  {
    title: '5. สิทธิ์ของเจ้าของข้อมูล',
    content: [
      '**สิทธิ์เข้าถึง** — คุณมีสิทธิ์ขอทราบว่าเราเก็บข้อมูลอะไรเกี่ยวกับคุณ',
      '**สิทธิ์แก้ไข** — คุณมีสิทธิ์ขอแก้ไขข้อมูลที่ไม่ถูกต้อง',
      '**สิทธิ์ลบ** — คุณสามารถยกเลิกการสมัครสมาชิกและขอให้ลบข้อมูลของคุณได้ตลอดเวลา',
      '**สิทธิ์คัดค้าน** — คุณมีสิทธิ์คัดค้านการประมวลผลข้อมูลส่วนบุคคลของคุณ',
      'เพื่อใช้สิทธิ์เหล่านี้ กรุณาติดต่อเราที่ thinkbizlab@gmail.com',
    ],
  },
  {
    title: '6. การเชื่อมโยงไปยังเว็บไซต์ภายนอก',
    content: [
      'เว็บไซต์ของเราอาจมีลิงก์ไปยังเว็บไซต์ภายนอก นโยบายความเป็นส่วนตัวนี้ใช้เฉพาะกับเว็บไซต์ของ ThinkBiz Lab เท่านั้น เราไม่รับผิดชอบต่อแนวทางปฏิบัติด้านความเป็นส่วนตัวของเว็บไซต์อื่น',
    ],
  },
  {
    title: '7. การเปลี่ยนแปลงนโยบาย',
    content: [
      'เราอาจปรับปรุงนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราว การเปลี่ยนแปลงจะมีผลทันทีเมื่อเผยแพร่บนเว็บไซต์ เราแนะนำให้คุณตรวจสอบหน้านี้เป็นระยะ',
    ],
  },
  {
    title: '8. ติดต่อเรา',
    content: [
      'หากคุณมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ กรุณาติดต่อ:',
      '**ThinkBiz Lab**\nอีเมล: thinkbizlab@gmail.com\nเว็บไซต์: thinkbizlab.com',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-12">
          <div className="font-mono text-xs font-bold text-purple uppercase tracking-widest mb-3">Legal</div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">นโยบายความเป็นส่วนตัว</h1>
          <p className="font-mono text-sm" style={{ color: 'rgba(155,142,196,.6)' }}>
            อัปเดตล่าสุด: มกราคม 2568 (2025)
          </p>
          <p className="mt-4 text-base leading-relaxed" style={{ color: '#9B8EC4' }}>
            ThinkBiz Lab (&ldquo;เรา&rdquo; หรือ &ldquo;เว็บไซต์&rdquo;) ให้ความสำคัญกับความเป็นส่วนตัวของคุณ นโยบายนี้อธิบายการเก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณเมื่อคุณใช้บริการของเรา
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.title} className="rounded-xl border p-6" style={{ borderColor: 'rgba(124,58,237,.18)', background: 'rgba(30,16,48,.4)' }}>
              <h2 className="font-heading text-lg font-bold text-white mb-4">{s.title}</h2>
              <ul className="space-y-3">
                {s.content.map((line, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed" style={{ color: '#9B8EC4' }}>
                    <span className="text-purple mt-0.5 shrink-0">▸</span>
                    <span dangerouslySetInnerHTML={{
                      __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>').replace(/\n/g, '<br/>')
                    }} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-8 flex flex-wrap gap-4 items-center justify-between" style={{ borderTop: '1px solid rgba(124,58,237,.15)' }}>
          <Link href="/terms" className="font-mono text-sm text-accent hover:underline">
            ข้อกำหนดการใช้งาน →
          </Link>
          <Link href="/" className="font-mono text-sm hover:text-accent transition-colors" style={{ color: 'rgba(155,142,196,.5)' }}>
            ← กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  )
}
