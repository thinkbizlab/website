import Link from 'next/link'
import { Navbar } from '@/components/Navbar'

export const metadata = {
  title: 'ข้อกำหนดการใช้งาน | ThinkBiz Lab',
  description: 'ข้อกำหนดและเงื่อนไขการใช้บริการเว็บไซต์ ThinkBiz Lab',
}

const sections = [
  {
    title: '1. การยอมรับข้อกำหนด',
    content: [
      'การเข้าถึงและใช้งานเว็บไซต์ thinkbizlab.com ถือว่าคุณยอมรับข้อกำหนดและเงื่อนไขเหล่านี้',
      'หากคุณไม่ยอมรับข้อกำหนดใดๆ กรุณาหยุดใช้งานเว็บไซต์',
      'เราสงวนสิทธิ์ปรับปรุงข้อกำหนดนี้ได้ตลอดเวลา การใช้งานต่อเนื่องถือเป็นการยอมรับข้อกำหนดที่เปลี่ยนแปลง',
    ],
  },
  {
    title: '2. ลักษณะบริการ',
    content: [
      'ThinkBiz Lab เป็นแพลตฟอร์มเนื้อหาออนไลน์ที่ให้บริการบทความ บทวิเคราะห์ และ Business Insight เกี่ยวกับธุรกิจ การลงทุน และกลยุทธ์',
      'เนื้อหาทั้งหมดมีวัตถุประสงค์เพื่อให้ข้อมูลและการศึกษาเท่านั้น ไม่ถือเป็นคำแนะนำทางการเงิน การลงทุน หรือกฎหมาย',
      'เราสงวนสิทธิ์เปลี่ยนแปลง ระงับ หรือยุติบริการใดๆ ได้โดยไม่ต้องแจ้งล่วงหน้า',
    ],
  },
  {
    title: '3. ข้อจำกัดการใช้งาน',
    content: [
      'ห้ามคัดลอก ทำซ้ำ แจกจ่าย หรือเผยแพร่เนื้อหาจากเว็บไซต์นี้โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร',
      'ห้ามใช้เนื้อหาเพื่อวัตถุประสงค์เชิงพาณิชย์โดยไม่ได้รับอนุญาต',
      'ห้ามดำเนินการใดๆ ที่อาจเป็นอันตราย ขัดขวาง หรือทำให้เว็บไซต์ทำงานผิดปกติ',
      'ห้ามใช้ข้อมูลที่ได้รับจากเว็บไซต์เพื่อสร้างผลิตภัณฑ์หรือบริการที่แข่งขันกับ ThinkBiz Lab',
    ],
  },
  {
    title: '4. ทรัพย์สินทางปัญญา',
    content: [
      'เนื้อหา บทความ กราฟิก โลโก้ และองค์ประกอบทั้งหมดบนเว็บไซต์นี้เป็นทรัพย์สินของ ThinkBiz Lab และได้รับความคุ้มครองภายใต้กฎหมายลิขสิทธิ์',
      'คุณอาจแชร์ลิงก์บทความและอ้างอิงเนื้อหาได้ โดยต้องระบุแหล่งที่มาว่า "ThinkBiz Lab (thinkbizlab.com)" ทุกครั้ง',
      'การละเมิดลิขสิทธิ์อาจมีผลทางกฎหมาย',
    ],
  },
  {
    title: '5. ข้อจำกัดความรับผิด',
    content: [
      'เนื้อหาบนเว็บไซต์นี้จัดทำขึ้นตามความรู้และความเชื่อที่ดีที่สุดของเรา แต่เราไม่รับประกันความถูกต้องสมบูรณ์',
      '**ThinkBiz Lab ไม่รับผิดชอบต่อความสูญเสียหรือความเสียหายใดๆ** ที่เกิดจากการตัดสินใจทางธุรกิจหรือการลงทุนโดยอิงจากเนื้อหาในเว็บไซต์นี้',
      'ผู้ใช้ควรตรวจสอบข้อมูลและปรึกษาผู้เชี่ยวชาญก่อนตัดสินใจสำคัญ',
    ],
  },
  {
    title: '6. นโยบายจดหมายข่าว',
    content: [
      'เมื่อสมัครรับจดหมายข่าว คุณยินยอมรับอีเมลเกี่ยวกับบทความและเนื้อหาใหม่จาก ThinkBiz Lab',
      'คุณสามารถยกเลิกการสมัครได้ตลอดเวลาผ่านลิงก์ยกเลิกในอีเมล หรือติดต่อ thinkbizlab@gmail.com',
      'เราจะไม่ส่งสแปมหรือขายอีเมลของคุณให้บุคคลที่สาม',
    ],
  },
  {
    title: '7. ลิงก์ภายนอก',
    content: [
      'เว็บไซต์ของเราอาจมีลิงก์ไปยังเว็บไซต์ภายนอก เราไม่รับผิดชอบต่อเนื้อหา ความถูกต้อง หรือแนวทางปฏิบัติของเว็บไซต์เหล่านั้น',
    ],
  },
  {
    title: '8. กฎหมายที่ใช้บังคับ',
    content: [
      'ข้อกำหนดนี้อยู่ภายใต้บังคับและตีความตามกฎหมายไทย',
      'ข้อพิพาทใดๆ ที่เกิดจากการใช้เว็บไซต์นี้จะอยู่ภายใต้เขตอำนาจศาลไทย',
    ],
  },
  {
    title: '9. ติดต่อเรา',
    content: [
      'หากคุณมีคำถามเกี่ยวกับข้อกำหนดการใช้งานนี้ กรุณาติดต่อ:',
      '**ThinkBiz Lab**\nอีเมล: thinkbizlab@gmail.com\nเว็บไซต์: thinkbizlab.com',
    ],
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-12">
          <div className="font-mono text-xs font-bold text-purple uppercase tracking-widest mb-3">Legal</div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">ข้อกำหนดการใช้งาน</h1>
          <p className="font-mono text-sm" style={{ color: 'rgba(155,142,196,.6)' }}>
            อัปเดตล่าสุด: มกราคม 2568 (2025)
          </p>
          <p className="mt-4 text-base leading-relaxed" style={{ color: '#9B8EC4' }}>
            กรุณาอ่านข้อกำหนดและเงื่อนไขการใช้บริการเหล่านี้อย่างละเอียดก่อนใช้งานเว็บไซต์ thinkbizlab.com ข้อกำหนดนี้เป็นสัญญาระหว่าง ThinkBiz Lab และผู้ใช้บริการ
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
          <Link href="/privacy" className="font-mono text-sm text-accent hover:underline">
            นโยบายความเป็นส่วนตัว →
          </Link>
          <Link href="/" className="font-mono text-sm hover:text-accent transition-colors" style={{ color: 'rgba(155,142,196,.5)' }}>
            ← กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  )
}
