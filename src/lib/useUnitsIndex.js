import { useEffect, useState } from 'react'
import { buildingsApi } from './api.js'

/**
 * The API has no global "list units" endpoint — units are listed per
 * building (backend/internal/api/api.go: GET /buildings/{id}/units) and a
 * job only carries `unit_id`, not a label (backend/internal/api/jobs.go).
 * To show a unit's label anywhere a job list spans multiple buildings, this
 * fetches units for every building referenced and indexes them by id.
 */
export function useUnitsIndex(buildingIds) {
  const key = [...new Set(buildingIds || [])].sort().join(',')
  const [index, setIndex] = useState(new Map())

  useEffect(() => {
    let cancelled = false
    const ids = key ? key.split(',') : []
    if (ids.length === 0) {
      setIndex(new Map())
      return
    }
    Promise.all(ids.map((id) => buildingsApi.units(id).catch(() => [])))
      .then((lists) => {
        if (cancelled) return
        const map = new Map()
        for (const list of lists) {
          for (const u of list) map.set(u.id, u)
        }
        setIndex(map)
      })
      .catch(() => {
        if (!cancelled) setIndex(new Map())
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return index
}
