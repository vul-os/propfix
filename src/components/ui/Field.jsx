// Field primitives: Label + Input/Select/Textarea, sharing one visual
// language so a form never mixes two input heights or radii.
import { forwardRef } from 'react'

export function Label({ children, htmlFor, hint, required }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between text-xs font-medium text-ink-muted">
      <span>
        {children}
        {required && <span className="ml-0.5 text-critical">*</span>}
      </span>
      {hint && <span className="text-2xs font-normal text-ink-faint">{hint}</span>}
    </label>
  )
}

const inputBase =
  'w-full rounded-sm border border-line bg-surface-raised px-3 text-sm text-ink placeholder:text-ink-faint ' +
  'transition-colors duration-150 outline-none ' +
  'focus:border-accent focus:shadow-focus ' +
  'disabled:opacity-50 disabled:cursor-not-allowed'

export const Input = forwardRef(function Input({ className = '', ...props }, ref) {
  return <input ref={ref} className={`${inputBase} h-9 ${className}`} {...props} />
})

export const Textarea = forwardRef(function Textarea({ className = '', ...props }, ref) {
  return <textarea ref={ref} className={`${inputBase} min-h-20 py-2 ${className}`} {...props} />
})

export const Select = forwardRef(function Select({ className = '', children, ...props }, ref) {
  return (
    <select ref={ref} className={`${inputBase} h-9 pr-8 ${className}`} {...props}>
      {children}
    </select>
  )
})

export function FieldError({ children }) {
  if (!children) return null
  return <p className="mt-1.5 text-xs text-critical">{children}</p>
}

export function FormRow({ label: text, htmlFor, hint, required, error, children }) {
  return (
    <div>
      <Label htmlFor={htmlFor} hint={hint} required={required}>
        {text}
      </Label>
      {children}
      <FieldError>{error}</FieldError>
    </div>
  )
}
