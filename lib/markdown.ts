import { marked } from 'marked'

marked.setOptions({ gfm: true, breaks: true })

export function renderMarkdown(md: string): string {
  return marked.parse(md) as string
}

export function estimateReadTime(text: string): number {
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\u0E00-\u0E7Fa-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || `article-${Date.now()}`
}
