import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // SECURITY: Only log errors in production, never queries or warnings
    log: process.env.NODE_ENV === 'production' 
      ? ['error'] // Production: Only critical errors
      : process.env.PRISMA_QUERY_LOG === 'true'
        ? ['query', 'error', 'warn'] // Development with explicit query logging
        : ['error', 'warn'], // Development default: No query logging
    // Connection pooling configuration to prevent rate limiting
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Graceful shutdown - only in Node.js environment
if (typeof process !== 'undefined' && process.on) {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
  
  process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  
  process.on('SIGTERM', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}


