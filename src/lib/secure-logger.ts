/**
 * Secure Logging Utility
 * 
 * NEVER log sensitive data in production!
 * This utility sanitizes logs to prevent data exposure.
 */

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'

/**
 * Mask sensitive strings (emails, IDs, etc.)
 */
export function maskSensitive(value: string | null | undefined): string {
  if (!value) return '[empty]'
  
  // In production, completely mask
  if (IS_PRODUCTION) {
    return '[REDACTED]'
  }
  
  // In development, show partial for debugging
  if (value.length <= 8) {
    return `${value.substring(0, 2)}***`
  }
  
  return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
}

/**
 * Mask email addresses
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return '[empty]'
  
  if (IS_PRODUCTION) {
    return '[REDACTED]'
  }
  
  const [local, domain] = email.split('@')
  if (!domain) return '[invalid-email]'
  
  const maskedLocal = local.length > 2 
    ? `${local[0]}***${local[local.length - 1]}`
    : `${local[0]}***`
  
  return `${maskedLocal}@${domain}`
}

/**
 * Secure console.log - only logs in development
 */
export const secureLog = {
  /**
   * Log general information (development only)
   */
  info: (...args: any[]) => {
    if (IS_DEVELOPMENT) {
      console.log('[INFO]', ...args)
    }
  },
  
  /**
   * Log warnings (always logged)
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args)
  },
  
  /**
   * Log errors (always logged, but sanitized)
   */
  error: (message: string, error?: any) => {
    console.error('[ERROR]', message)
    
    if (IS_DEVELOPMENT && error) {
      console.error('[ERROR Details]', error)
    } else if (IS_PRODUCTION && error) {
      // In production, only log error type and message, not full stack
      console.error('[ERROR Type]', error?.name || 'Unknown')
      console.error('[ERROR Message]', error?.message || 'No message')
    }
  },
  
  /**
   * Log with user ID (masked in production)
   */
  user: (action: string, userId: string | null | undefined, details?: any) => {
    if (IS_DEVELOPMENT) {
      console.log(`[USER] ${action}`, {
        userId: maskSensitive(userId),
        ...details
      })
    } else {
      // In production, only log the action, not user details
      console.log(`[USER] ${action}`)
    }
  },
  
  /**
   * Log API route access (sanitized)
   */
  api: (method: string, path: string, userId?: string | null, status?: number) => {
    if (IS_DEVELOPMENT) {
      console.log(`[API] ${method} ${path}`, {
        userId: maskSensitive(userId),
        status
      })
    } else {
      // In production, only log method, path, and status
      console.log(`[API] ${method} ${path} ${status || ''}`)
    }
  },
  
  /**
   * Log database operations (development only)
   */
  db: (operation: string, details?: any) => {
    if (IS_DEVELOPMENT) {
      console.log(`[DB] ${operation}`, details)
    }
  },
  
  /**
   * Log authentication events (sanitized)
   */
  auth: (event: string, userId?: string | null, details?: any) => {
    if (IS_DEVELOPMENT) {
      console.log(`[AUTH] ${event}`, {
        userId: maskSensitive(userId),
        ...details
      })
    } else {
      // In production, only log the event type
      console.log(`[AUTH] ${event}`)
    }
  }
}

/**
 * Sanitize object for logging (remove sensitive fields)
 */
export function sanitizeForLog(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj
  
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'apiKey',
    'clerkId',
    'userId',
    'email',
    'phone',
    'ssn',
    'salary',
    'medicalInfo',
    'emergencyContact',
    'address'
  ]
  
  const sanitized: any = Array.isArray(obj) ? [] : {}
  
  for (const key in obj) {
    const lowerKey = key.toLowerCase()
    
    if (sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = IS_PRODUCTION ? '[REDACTED]' : maskSensitive(String(obj[key]))
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitized[key] = sanitizeForLog(obj[key])
    } else {
      sanitized[key] = obj[key]
    }
  }
  
  return sanitized
}

/**
 * Create a request logger for API routes
 */
export function createApiLogger(route: string) {
  return {
    start: (method: string, userId?: string | null) => {
      secureLog.api(method, route, userId, undefined)
    },
    
    success: (method: string, userId?: string | null, message?: string) => {
      if (IS_DEVELOPMENT && message) {
        console.log(`[API] ${method} ${route} - ${message}`)
      }
      secureLog.api(method, route, userId, 200)
    },
    
    error: (method: string, status: number, error: any) => {
      secureLog.error(`${method} ${route} failed with status ${status}`, error)
      secureLog.api(method, route, undefined, status)
    }
  }
}
