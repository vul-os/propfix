import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Runs an async fetcher on mount and whenever `deps` changes. Returns
 * { data, error, loading, reload }. Every list/detail page in the app uses
 * this so "loading / error / empty / data" is handled the same way
 * everywhere rather than once per page.
 */
export function useAsync(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const seq = useRef(0)

  const run = useCallback(() => {
    const id = ++seq.current
    setLoading(true)
    setError(null)
    fetcher()
      .then((result) => {
        if (id === seq.current) {
          setData(result)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (id === seq.current) {
          setError(err)
          setLoading(false)
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run])

  return { data, error, loading, reload: run, setData }
}
