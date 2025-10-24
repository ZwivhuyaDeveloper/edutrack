# How to Populate Dashboard Data

## Problem
The dashboard is showing empty states because there's no data in the database for school ID `cmh2izv8q00005kedyof0ud33`.

## Solution
Run the seed scripts to populate the database with sample data.

## Steps

### 1. Run the Base Seed Script
This will create the school, users, classes, subjects, and basic data:

```bash
npm run db:seed
```

### 2. (Optional) Run the Extended Seed Script
This will add additional data like assignments, grades, attendance records, etc.:

```bash
npm run db:seed-extended
```

### 3. Refresh the Dashboard
After seeding, refresh your browser to see the populated data.

## What Gets Created

### Base Seed (seed.ts)
- ✅ School (ID: cmh2izv8q00005kedyof0ud33)
- ✅ 1 Principal
- ✅ 5 Teachers
- ✅ 50 Students
- ✅ 30 Parents
- ✅ 1 Clerk
- ✅ 5 Subjects (Math, English, Biology, History, PE)
- ✅ 5 Classes (Grade 9A, 9B, 10A, 11A, 12A)
- ✅ Class-Subject assignments
- ✅ Student enrollments
- ✅ 2 Terms (Fall 2024, Spring 2025)
- ✅ 20 Rooms
- ✅ 6 Periods
- ✅ Attendance sessions
- ✅ Fee records
- ✅ Events
- ✅ Conversations and messages

### Extended Seed (seed-extended.ts)
- ✅ Class meetings (timetable)
- ✅ Assignments
- ✅ Assignment submissions
- ✅ Grade categories and items
- ✅ Grades for students
- ✅ More attendance records (30 days)
- ✅ Student accounts and invoices
- ✅ Payments
- ✅ More events
- ✅ Notifications
- ✅ Announcements

## Troubleshooting

### If seed fails with "School not found"
Make sure to run `npm run db:seed` first before `npm run db:seed-extended`.

### If you see duplicate data errors
The seed scripts are now optimized to check for existing data, so you can safely run them multiple times.

### If dashboard still shows empty
1. Check browser console for errors
2. Verify you're logged in as a Principal
3. Clear browser cache and refresh
4. Check that the API endpoints are returning data (Network tab in DevTools)

## Verification

After seeding, you should see:
- ✅ Student count in stats cards
- ✅ Teacher count in stats cards
- ✅ Classes in the classes overview
- ✅ Events in upcoming events
- ✅ Messages in unread messages
- ✅ Charts with data
- ✅ Recent activity feed
