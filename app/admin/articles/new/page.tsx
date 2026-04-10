import { ArticleForm } from '@/components/ArticleForm'

export const metadata = { title: 'เพิ่มบทความใหม่' }

export default function NewArticlePage() {
  return <ArticleForm mode="new" />
}
