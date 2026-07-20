import Pill from './ui/Pill'
import { STATUS_TONE, PRIORITY_TONE, CONDITION_TONE, label } from '../lib/domain'

export function StatusPill({ status, className }) {
  return (
    <Pill tone={STATUS_TONE[status] || 'neutral'} className={className}>
      {label(status)}
    </Pill>
  )
}

export function PriorityPill({ priority, className }) {
  return (
    <Pill tone={PRIORITY_TONE[priority] || 'neutral'} dot className={className}>
      {label(priority)}
    </Pill>
  )
}

export function ConditionPill({ condition, className }) {
  return (
    <Pill tone={CONDITION_TONE[condition] || 'neutral'} className={className}>
      {condition === 'na' ? 'N/A' : label(condition)}
    </Pill>
  )
}

export function CategoryTag({ category }) {
  if (!category) return null
  return (
    <span className="inline-flex items-center rounded-xs border border-line bg-surface-sunk px-1.5 py-0.5 text-2xs font-medium text-ink-muted">
      #{category}
    </span>
  )
}
