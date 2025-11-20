import { NextResponse } from 'next/server'

/**
 * Cache configuration for different types of dashboard data
 */
export const CacheConfig = {
  // Frequently changing data (1 minute)
  REALTIME: {
    revalidate: 30,
    cacheControl: 'private, max-age=30, stale-while-revalidate=60'
  },
  // Moderately changing data (2-3 minutes)
  MODERATE: {
    revalidate: 120,
    cacheControl: 'private, max-age=120, stale-while-revalidate=180'
  },
  // Slowly changing data (5 minutes)
  SLOW: {
    revalidate: 300,
    cacheControl: 'private, max-age=300, stale-while-revalidate=600'
  },
  // Static-like data (10 minutes)
  STATIC: {
    revalidate: 600,
    cacheControl: 'private, max-age=600, stale-while-revalidate=1200'
  }
} as const

/**
 * Add cache headers to a NextResponse
 */
export function addCacheHeaders(
  response: NextResponse,
  config: typeof CacheConfig[keyof typeof CacheConfig]
): NextResponse {
  response.headers.set('Cache-Control', config.cacheControl)
  return response
}

/**
 * Create a cached JSON response
 */
export function cachedJsonResponse(
  data: unknown,
  config: typeof CacheConfig[keyof typeof CacheConfig]
): NextResponse {
  const response = NextResponse.json(data)
  return addCacheHeaders(response, config)
}
