/**
 * Simple in-memory cache for frequently accessed data
 * Reduces database load by caching common queries
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class RequestCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private defaultTTL = 60 * 1000 // 1 minute default

  /**
   * Get cached data or execute function and cache result
   */
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    const cached = this.get<T>(key)
    
    if (cached !== null) {
      return cached
    }
    
    const data = await fn()
    this.set(key, data, ttlMs)
    return data
  }

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTTL
    
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl
    })
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Invalidate all cache entries matching pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }
}

// Singleton instance
export const cache = new RequestCache()

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cache.cleanup()
  }, 5 * 60 * 1000)
}

/**
 * Cache key generators for common patterns
 */
export const CacheKeys = {
  user: (clerkId: string) => `user:${clerkId}`,
  userById: (id: string) => `user:id:${id}`,
  school: (id: string) => `school:${id}`,
  schoolByOrg: (orgId: string) => `school:org:${orgId}`,
  userPermissions: (userId: string) => `permissions:${userId}`,
  userProfile: (userId: string) => `profile:${userId}`,
  
  // Pattern matchers for invalidation
  patterns: {
    allUsers: 'user:.*',
    allSchools: 'school:.*',
    userRelated: (userId: string) => `(user|profile|permissions):.*${userId}.*`
  }
}

/**
 * Cache TTL constants (in milliseconds)
 */
export const CacheTTL = {
  SHORT: 30 * 1000,      // 30 seconds
  MEDIUM: 60 * 1000,     // 1 minute
  LONG: 5 * 60 * 1000,   // 5 minutes
  VERY_LONG: 15 * 60 * 1000  // 15 minutes
}
