interface Props {
  question: string
  answer: string
  keyPoints?: string[]
}

export function AISummaryBox({ question, answer, keyPoints }: Props) {
  return (
    <div
      className="rounded-xl border border-purple/30 bg-dim/40 p-5 mb-8"
      data-ai-summary="true"
      itemScope
      itemType="https://schema.org/Article"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-xs font-bold tracking-widest text-purple uppercase">{'// AI Summary'}</span>
        <span className="h-px flex-1 bg-purple/20" />
      </div>
      <h2 className="font-heading text-base font-700 text-white mb-2 leading-snug">{question}</h2>
      <p className="text-[#C4B5FD] text-sm leading-relaxed mb-3" itemProp="description">{answer}</p>
      {keyPoints && keyPoints.length > 0 && (
        <ul className="space-y-1.5">
          {keyPoints.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted">
              <span className="text-accent mt-0.5 shrink-0">▸</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
