import type { Article } from './schema'

export function calculateGEOScore(article: Partial<Article>): number {
  let score = 0
  const c = article.content ?? ''

  if (article.schemaJson)                               score += 20  // Schema markup
  if (article.aiSummaryQ && article.aiSummaryA)         score += 15  // AI summary box
  if ((article.keyPoints?.length ?? 0) >= 3)            score += 10  // Key points
  if ((article.faqJson as unknown[])?.length >= 2)       score += 15  // FAQ section
  // Support both HTML (<h2>...?</h2>) and Markdown (## ...?) headings
  const questionHeadings = (c.match(/<h[123][^>]*>[^<]*\?[^<]*<\/h[123]>/gi)?.length ?? 0)
    + (c.match(/##\s+.+\?/g)?.length ?? 0)
  if (questionHeadings >= 2)                            score += 10  // Question headings
  if (c.match(/\d+[%,]/g)?.length ?? 0 >= 2)           score += 5   // Statistics
  if ((article.excerpt?.length ?? 0) >= 120)            score += 10  // Meta description
  if ((article.tags?.length ?? 0) >= 3)                 score += 10  // Tags
  // Strip HTML tags for length check
  const textLength = c.replace(/<[^>]+>/g, '').length
  if (textLength >= 1500)                               score += 5   // Min length

  return Math.min(score, 100)
}

export function geoScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excellent', color: '#10B981' }
  if (score >= 60) return { label: 'Good',      color: '#F59E0B' }
  if (score >= 40) return { label: 'Fair',       color: '#F97316' }
  return           { label: 'Poor',              color: '#EF4444' }
}
