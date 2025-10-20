# Database Configuration for Rate Limiting Prevention

## Connection Pooling Setup

To prevent database rate limiting, add these parameters to your `DATABASE_URL` in `.env`:

```env
# Example for PostgreSQL (adjust based on your provider)
DATABASE_URL="postgresql://user:password@host:port/database?connection_limit=10&pool_timeout=20"

# For Prisma Accelerate or connection pooling
DATABASE_URL="postgresql://user:password@host:port/database?connection_limit=10&pool_timeout=20&connect_timeout=10"
```

## Recommended Connection Pool Settings

### For Development
```
connection_limit=5
pool_timeout=20
connect_timeout=10
```

### For Production
```
connection_limit=10
pool_timeout=20
connect_timeout=10
```

## Connection Pool Parameters Explained

- **connection_limit**: Maximum number of database connections (default: 10)
  - Lower for development (5)
  - Higher for production (10-20 depending on your database plan)
  
- **pool_timeout**: Time in seconds to wait for an available connection (default: 10)
  - Set to 20 seconds to handle spikes
  
- **connect_timeout**: Time in seconds to wait for initial connection (default: 5)
  - Set to 10 seconds for reliability

## Database Provider Specific Settings

### Neon (Serverless Postgres)
```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require&connection_limit=5&pool_timeout=20"
```

### Supabase
```env
DATABASE_URL="postgresql://postgres:password@host:5432/postgres?pgbouncer=true&connection_limit=10"
```

### PlanetScale
```env
DATABASE_URL="mysql://user:password@host/database?sslaccept=strict&connection_limit=10"
```

### Railway
```env
DATABASE_URL="postgresql://user:password@host:port/database?connection_limit=10&pool_timeout=20"
```

## Monitoring Connection Usage

Check your database provider's dashboard for:
- Active connections
- Connection pool utilization
- Query performance
- Rate limit warnings

## Rate Limiting Implementation

This project now includes:

1. **API Rate Limiting** - Prevents excessive requests
   - Auth endpoints: 5 req/min
   - Write endpoints: 10 req/min
   - Read endpoints: 60 req/min
   - Search endpoints: 20 req/min

2. **Request Caching** - Reduces database queries
   - User data cached for 1 minute
   - School data cached for 5 minutes

3. **Connection Pooling** - Reuses database connections
   - Configured in `src/lib/prisma.ts`

4. **Pagination** - Limits query result sizes
   - Default: 50 records per page
   - Maximum: 100 records per page

## Troubleshooting

### "Too many connections" error
- Reduce `connection_limit` in DATABASE_URL
- Check for connection leaks in your code
- Ensure proper connection cleanup

### "Rate limit exceeded" from database
- Upgrade your database plan
- Implement caching (already done)
- Reduce query frequency
- Use read replicas if available

### Slow queries
- Add database indexes
- Optimize Prisma queries
- Use `select` to limit returned fields
- Implement pagination (already done)

## Best Practices

1. **Always use connection pooling** - Never create new Prisma clients per request
2. **Implement caching** - Cache frequently accessed data
3. **Use pagination** - Never fetch all records at once
4. **Monitor usage** - Track database metrics
5. **Graceful degradation** - Handle rate limits gracefully
6. **Clean up connections** - Ensure proper disconnection on shutdown
