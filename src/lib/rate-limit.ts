import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (use Redis in production for distributed systems)
const rateLimitStore = new Map<string, RateLimitStore>()

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number
  
  /**
   * Time window in seconds
   */
  windowSeconds: number
  
  /**
   * Custom identifier function (defaults to IP address)
   */
  identifier?: (request: NextRequest) => string | Promise<string>
}

/**
 * Rate limiting middleware to prevent database overload
 * 
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const rateLimitResult = await rateLimit(request, {
 *     maxRequests: 10,
 *     windowSeconds: 60
 *   })
 *   
 *   if (!rateLimitResult.success) {
 *     return rateLimitResult.response
 *   }
 *   
 *   // Continue with your logic
 * }
 * ```
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<{ success: boolean; response?: NextResponse }> {
  const { maxRequests, windowSeconds, identifier } = config
  
  // Get identifier (IP address or custom)
  const key = identifier 
    ? await identifier(request)
    : getClientIdentifier(request)
  
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(key)
  
  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired one
    entry = {
      count: 1,
      resetTime: now + windowMs
    }
    rateLimitStore.set(key, entry)
    
    return { success: true }
  }
  
  // Increment count
  entry.count++
  
  // Check if limit exceeded
  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString()
          }
        }
      )
    }
  }
  
  return { success: true }
}

/**
 * Get client identifier from request (IP address or user ID)
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp
  }
  
  // Fallback to a default identifier
  return 'unknown'
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const RateLimiters = {
  /**
   * Strict rate limit for authentication endpoints
   * 5 requests per minute
   */
  auth: (request: NextRequest) => rateLimit(request, {
    maxRequests: 5,
    windowSeconds: 60
  }),
  
  /**
   * Standard rate limit for API endpoints
   * 30 requests per minute
   */
  api: (request: NextRequest) => rateLimit(request, {
    maxRequests: 30,
    windowSeconds: 60
  }),
  
  /**
   * Relaxed rate limit for read-only endpoints
   * 60 requests per minute
   */
  readOnly: (request: NextRequest) => rateLimit(request, {
    maxRequests: 60,
    windowSeconds: 60
  }),
  
  /**
   * Very strict rate limit for write operations
   * 10 requests per minute
   */
  write: (request: NextRequest) => rateLimit(request, {
    maxRequests: 10,
    windowSeconds: 60
  }),
  
  /**
   * Search endpoint rate limit
   * 20 requests per minute
   */
  search: (request: NextRequest) => rateLimit(request, {
    maxRequests: 20,
    windowSeconds: 60
  })
}
