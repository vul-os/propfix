// Mirrors the enums in backend/internal/domain/domain.go. Kept in one place
// so a status pill and a filter dropdown never drift apart.

export const JOB_STATUSES = [
  'reported',
  'triaged',
  'assigned',
  'in_progress',
  'on_hold',
  'resolved',
  'closed',
  'cancelled',
]

export const OPEN_STATUSES = JOB_STATUSES.filter((s) => s !== 'closed' && s !== 'cancelled')

// Kanban-style columns for the board view — a deliberately smaller set than
// the full status graph (on_hold/resolved fold into neighbours visually via
// a badge rather than their own column, so the board stays scannable).
export const BOARD_COLUMNS = [
  { status: 'reported', label: 'Reported' },
  { status: 'triaged', label: 'Triaged' },
  { status: 'assigned', label: 'Assigned' },
  { status: 'in_progress', label: 'In progress' },
  { status: 'resolved', label: 'Resolved' },
  { status: 'closed', label: 'Closed' },
]

// Mirrors jobTransitions in backend/internal/domain/domain.go — used only to
// hint which next statuses make sense in the UI. The server re-validates
// every transition independently; this is a UX nicety, not the authority.
export const JOB_TRANSITIONS = {
  reported: ['triaged', 'assigned', 'in_progress', 'on_hold', 'cancelled'],
  triaged: ['assigned', 'in_progress', 'on_hold', 'cancelled'],
  assigned: ['in_progress', 'on_hold', 'triaged', 'resolved', 'cancelled'],
  in_progress: ['on_hold', 'resolved', 'assigned', 'cancelled'],
  on_hold: ['in_progress', 'assigned', 'triaged', 'cancelled'],
  resolved: ['closed', 'in_progress'],
  closed: ['in_progress'],
  cancelled: ['reported'],
}

export function nextStatuses(status) {
  return JOB_TRANSITIONS[status] || []
}

export const JOB_PRIORITIES = ['low', 'normal', 'high', 'emergency']

export const COST_KINDS = ['labour', 'material', 'callout', 'contractor', 'other']

export const PARTY_KINDS = ['staff', 'contractor', 'tenant']

export const INSPECTION_KINDS = ['ingoing', 'outgoing', 'routine', 'snag']

export const INSPECTION_STATUSES = ['scheduled', 'in_progress', 'complete']

export const FINDING_CONDITIONS = ['ok', 'wear', 'damage', 'missing', 'na']

export const UNIT_SCHEMES = [
  { value: '', label: 'Default — "Flat 3A" and "3A" are the same unit' },
  { value: 'mixed-use', label: 'Mixed use — "Shop 1" and "Flat 1" stay separate' },
  { value: 'verbatim', label: 'Verbatim — only case/whitespace normalised' },
]

export const EVENT_VISIBILITIES = ['internal', 'public']

// status → { label, tone } for pills. tone keys map to the CSS variables in
// src/index.css (good/warning/serious/critical/neutral/info).
export const STATUS_TONE = {
  reported: 'info',
  triaged: 'neutral',
  assigned: 'neutral',
  in_progress: 'info',
  on_hold: 'warning',
  resolved: 'good',
  closed: 'neutral-muted',
  cancelled: 'neutral-muted',
}

export const PRIORITY_TONE = {
  low: 'neutral',
  normal: 'info',
  high: 'warning',
  emergency: 'critical',
}

export const CONDITION_TONE = {
  ok: 'good',
  wear: 'warning',
  damage: 'serious',
  missing: 'critical',
  na: 'neutral-muted',
}

// Mirrors domain.Deteriorated (backend/internal/domain/domain.go) — used to
// flag a worse condition between an ingoing and outgoing inspection finding
// on the same template item. `na` is deliberately unranked: "not applicable"
// is not a point on the scale.
const CONDITION_RANK = { ok: 0, wear: 1, damage: 2, missing: 3 }

export function deteriorated(from, to) {
  const a = CONDITION_RANK[from]
  const b = CONDITION_RANK[to]
  if (a === undefined || b === undefined) return { worse: false, comparable: false }
  return { worse: b > a, comparable: true }
}

export function label(s) {
  if (!s) return '—'
  return s
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}
