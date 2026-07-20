import { useEffect, useRef, useState } from 'react'
import { CameraIcon, XIcon } from './icons.jsx'

/**
 * Client-side photo staging. The API has no upload/attachment endpoint yet —
 * `domain.Attachment` exists in the Go domain model (backend/internal/
 * domain/domain.go) but no route serves it (see api.go's route table). So
 * this stages files locally with previews and is explicit that nothing is
 * uploaded, rather than pretending to save them (docs/ARCHITECTURE.md §13:
 * "a feature that silently does nothing is not" an acceptable state).
 */
export default function PhotoPicker({ files, onChange }) {
  const inputRef = useRef(null)
  const [previews, setPreviews] = useState([])

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [files])

  function addFiles(fileList) {
    const next = [...files, ...Array.from(fileList).filter((f) => f.type.startsWith('image/'))]
    onChange(next)
  }

  function removeAt(i) {
    onChange(files.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          addFiles(e.dataTransfer.files)
        }}
        className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-line px-4 py-6 text-center hover:border-line-strong hover:bg-surface-sunk"
      >
        <CameraIcon width={22} height={22} className="text-ink-faint" />
        <p className="text-xs font-medium text-ink">Add photos</p>
        <p className="text-2xs text-ink-faint">Click or drop image files</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-2.5 grid grid-cols-4 gap-2">
          {previews.map((src, i) => (
            <div key={src} className="group relative aspect-square overflow-hidden rounded-sm border border-line">
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Remove photo"
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <XIcon width={12} height={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="mt-2 text-2xs text-ink-faint">
        {files.length > 0
          ? `${files.length} photo${files.length === 1 ? '' : 's'} staged on this device only — `
          : ''}
        photo upload isn&rsquo;t wired up on the backend yet, so nothing here is saved to the job.
      </p>
    </div>
  )
}
