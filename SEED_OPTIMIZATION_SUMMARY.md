# Seed Files Optimization Summary

## Changes Made

### 1. **School ID Update**
- Both `seed.ts` and `seed-extended.ts` now use the specific school ID: `cmh2izv8q00005kedyof0ud33`
- All related data (users, classes, subjects, etc.) are now linked to this school ID

### 2. **Non-Destructive Seeding**
- **Removed all `deleteMany()` operations** from `seed.ts`
- Seed files now **never delete existing data**
- Instead, they check if data exists before creating new records

### 3. **Upsert/Check Logic**

#### seed.ts
- **School**: Uses `upsert` to create or update the school
- **Users**: Checks if user exists by `clerkId` before creating
  - Principal: Checks and creates only if not found
  - Teachers: Checks each teacher by clerkId
  - Students: Counts existing students and only creates missing ones
  - Parents: Counts existing parents and only creates missing ones
  - Clerk: Checks and creates only if not found
- **Subjects**: Uses `findFirst` to check if subject exists before creating
- **Classes**: Uses `findFirst` to check if class exists before creating
- **Other entities**: Will only create if they don't exist (preserves existing data)

#### seed-extended.ts
- Updated to use `SCHOOL_ID` constant
- Fetches existing data for the specific school only
- Adds validation to ensure school, principal, and clerk exist before proceeding
- All new data is linked to the specific school ID

## Benefits

1. **Data Preservation**: Existing data in the database is never deleted
2. **Idempotent**: Can run seed scripts multiple times safely
3. **Incremental**: Only creates missing data
4. **School-Specific**: All data is properly linked to the correct school ID
5. **Safe for Production**: No risk of data loss

## Usage

### First Time Setup
```bash
# Run base seed
npm run prisma:seed

# Run extended seed (optional)
npx tsx prisma/seed-extended.ts
```

### Subsequent Runs
- Running the seed scripts again will:
  - Update the school information
  - Skip existing users, subjects, classes
  - Only create new records that don't exist
  - Never delete or override existing data

## Important Notes

1. **Order Matters**: Always run `seed.ts` before `seed-extended.ts`
2. **School ID**: All data is now linked to `cmh2izv8q00005kedyof0ud33`
3. **No Data Loss**: The seed scripts will never delete your existing data
4. **Incremental Updates**: You can safely add more seed data without affecting existing records

## Migration from Old Seed Files

If you previously ran the old seed files that deleted data:
1. The new seed files will work with your existing data
2. They will check for existing records and only add missing ones
3. No manual migration is needed

## Testing

To verify the optimization:
1. Run `npm run prisma:seed` once
2. Check your database - data should be created
3. Run `npm run prisma:seed` again
4. Check your database - no duplicates, no data loss
5. All data should still be intact with the same IDs
