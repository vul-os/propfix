export default function Card({ children, className = '', as: Comp = 'div', ...props }) {
  return (
    <Comp
      className={`rounded-md border border-line bg-surface-raised shadow-e1 ${className}`}
      {...props}
    >
      {children}
    </Comp>
  )
}

export function CardHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-4 py-3">
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
