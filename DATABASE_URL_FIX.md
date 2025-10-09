# Database URL Configuration Fix

## Problem
You're getting this error: `Error validating datasource 'db': the URL must start with the protocol 'prisma://' or 'prisma+postgres://'`

## Root Cause
The project had `@prisma/extension-accelerate` installed, which changes Prisma's behavior to expect Accelerate URLs instead of standard PostgreSQL URLs.

## Solution Applied

### 1. Updated Prisma Client Configuration
- Removed the custom `datasources` configuration from `src/lib/prisma.ts`
- Prisma will now use the standard `DATABASE_URL` from environment variables

### 2. Removed Prisma Accelerate Extension
- Removed `@prisma/extension-accelerate` from `package.json`

## Next Steps (You Need to Complete)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Your Database URL
Check your `.env.local` file and ensure it has the correct format:

**For Local PostgreSQL:**
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/edutrack"
```

**For Local Development (if you don't have PostgreSQL installed):**
You can use a cloud database like Neon, Supabase, or Railway:

**Neon (Free tier):**
```bash
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb"
```

**Supabase:**
```bash
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

### Step 3: Generate Prisma Client
```bash
npm run db:generate
```

### Step 4: Push Database Schema
```bash
npm run db:push
```

### Step 5: Test Connection
```bash
node test-db-connection.js
```

## Alternative: If You Want to Use Prisma Accelerate

If you specifically want to use Prisma Accelerate (for performance), you need:

1. **Reinstall Accelerate:**
```bash
npm install @prisma/extension-accelerate
```

2. **Get Accelerate URL:**
- Go to https://console.prisma.io/
- Create a project and get your Accelerate URL
- It will look like: `prisma://accelerate.prisma-data.net/?api_key=your_api_key`

3. **Update your `.env.local`:**
```bash
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=your_api_key"
```

4. **Update Prisma client to use Accelerate:**
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

export const prisma = new PrismaClient().$extends(withAccelerate())
```

## Recommended for Development
For local development, use the standard PostgreSQL setup (first solution) as it's simpler and doesn't require external services.

## Files Modified
- ✅ `src/lib/prisma.ts` - Removed custom datasources config
- ✅ `package.json` - Removed Accelerate extension

## Status
Ready for testing after you complete the steps above.
