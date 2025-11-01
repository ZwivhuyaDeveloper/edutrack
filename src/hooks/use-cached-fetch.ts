import { useState, useEffect, useCallback, useRef } from 'react'

interface UseCachedFetchOptions {
  cacheKey: string
  cacheTime?: number // Time in milliseconds to cache (default: 5 minutes)
  enabled?: boolean // Whether to fetch (default: true)
}

// Client-side cache using Map (in-memory)
const clientCache = new Map<string, { data: any; timestamp: number; expiry: number }>()

// Cleanup expired entries periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of clientCache.entries()) {
      if (now > entry.expiry) {
        clientCache.delete(key)
      }
    }
  }, 60 * 1000) // Cleanup every minute
}

export function useCachedFetch<T = any>(
  url: string | null,
  options: UseCachedFetchOptions
) {
  const { cacheKey, cacheTime = 5 * 60 * 1000, enabled = true } = options
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async (force = false) => {
    if (!url || !enabled) {
      setIsLoading(false)
      return
    }

    // Check cache first
    const cached = clientCache.get(cacheKey)
    const now = Date.now()

    if (cached && !force) {
      const isExpired = now > cached.expiry

      if (!isExpired) {
        setData(cached.data)
        setIsLoading(false)
        setError(null)
        
        // Background refresh for stale data (refresh if cache is older than 70% of cacheTime)
        if (now > (cached.timestamp + (cacheTime * 0.7))) {
          fetchData(true).catch(() => {
            // Silent fail for background refresh
          })
        }
        return
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      setIsLoading(force || !cached) // Only show loading if forcing or no cache
      setError(null)

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      // Store in cache
      clientCache.set(cacheKey, {
        data: result,
        timestamp: now,
        expiry: now + cacheTime
      })

      setData(result)
      setError(null)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // Request was aborted, ignore
      }

      // If we have stale data, use it
      if (cached?.data) {
        setData(cached.data)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
        setData(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [url, cacheKey, cacheTime, enabled])

  useEffect(() => {
    fetchData(false)

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchData])

  const revalidate = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  return { data, isLoading, error, revalidate }
}

// Utility to clear specific cache entry
export function clearCache(cacheKey: string) {
  clientCache.delete(cacheKey)
}

// Utility to clear all cache
export function clearAllCache() {
  clientCache.clear()
}

// Utility to get cache key for dashboard endpoints
export function getDashboardCacheKey(endpoint: string, userId?: string) {
  return userId ? `dashboard:${userId}:${endpoint}` : `dashboard:${endpoint}`
}
