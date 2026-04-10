import Link from 'next/link'
import type { Article } from '@/lib/schema'

interface Props {
  article: Article
  featured?: boolean
}

export function ArticleCard({ article, featured }: Props) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className={`group flex flex-col rounded-2xl border border-purple/20 bg-dim/40 overflow-hidden hover:border-accent/40 hover:shadow-lg hover:shadow-purple/10 transition-all duration-300 ${featured ? 'md:col-span-2' : ''}`}
    >
      {article.coverImage ? (
        <div className={`w-full overflow-hidden ${featured ? 'aspect-[16/7]' : 'aspect-video'}`}>
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className={`w-full bg-gradient-to-br from-dim to-dark flex items-center justify-center ${featured ? 'aspect-[16/7]' : 'aspect-video'}`}>
          <span className="font-mono text-xs text-accent/30 tracking-widest">COVER</span>
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        {article.category && (
          <span className="font-mono text-xs font-bold text-purple uppercase tracking-widest mb-2">{article.category}</span>
        )}
        <h3 className={`font-heading font-700 text-white leading-snug mb-2 group-hover:text-accent transition-colors ${featured ? 'text-xl md:text-2xl' : 'text-base md:text-lg'}`}>
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-muted line-clamp-2 flex-1 mb-3">{article.excerpt}</p>
        )}
        <div className="flex items-center justify-between text-xs font-mono text-muted/60 mt-auto pt-3 border-t border-purple/10">
          <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : 'Draft'}</span>
          <span>{article.readTime} นาที</span>
        </div>
      </div>
    </Link>
  )
}
