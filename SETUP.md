# EduTrack Setup Guide

This guide will help you set up EduTrack with Clerk authentication and Prisma database integration.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Clerk account (free tier available)

## 1. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/edutrack"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
CLERK_WEBHOOK_SECRET=whsec_xxxxx
```

## 2. Database Setup

### Install Dependencies

```bash
npm install
```

### Set up the Database

1. Create a PostgreSQL database named `edutrack`
2. Run Prisma migrations:

```bash
npm run db:push
```

3. Generate Prisma client:

```bash
npm run db:generate
```

4. Seed the database with sample data:

```bash
npm run db:seed
```

## 3. Clerk Setup

### Create Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Choose "Next.js" as the framework
4. Copy your publishable key and secret key to `.env.local`

### Configure Webhooks

1. In Clerk Dashboard, go to "Webhooks"
2. Create a new webhook endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy the webhook secret to `.env.local` as `CLERK_WEBHOOK_SECRET`

### Configure Authentication

1. In Clerk Dashboard, go to "User & Authentication"
2. Configure sign-in and sign-up settings
3. Set up email verification if desired
4. Configure social providers if needed

## 4. Development

Start the development server:

```bash
npm run dev
```

## 5. Usage Flow

### For Principals (First Users)

1. **Sign Up**: Register as a Principal
2. **Select School**: Choose existing school or skip
3. **Create School**: If no school exists, create one via `/setup-school`
4. **Manage Users**: Invite teachers, students, and parents

### For Other Users

1. **Sign Up**: Register with selected role (Student, Teacher, Parent)
2. **Select School**: Choose from existing schools
3. **Complete Profile**: Fill in role-specific information
4. **Access Dashboard**: Role-based dashboard with appropriate features

## 6. Database Schema

The application uses the following main entities:

- **School**: Educational institutions
- **User**: All system users (students, teachers, parents, principals)
- **Class**: Academic classes/grades
- **Subject**: Academic subjects
- **Enrollment**: Student-class relationships
- **Assignment**: Academic assignments
- **Term**: Academic periods

## 7. API Endpoints

### Schools
- `GET /api/schools` - List all schools
- `POST /api/schools` - Create new school (principals only)

### Users
- `GET /api/users` - List users in school (principals/teachers only)
- `POST /api/users` - Create new user (principals only)
- `GET /api/users/me` - Get current user profile

### Webhooks
- `POST /api/webhooks/clerk` - Clerk webhook for user sync

## 8. Role Permissions

### Principal
- Create and manage school profile
- Create and manage users
- Access to all school data
- System administration

### Teacher
- View assigned classes and students
- Create and grade assignments
- Communicate with parents
- Access to teaching tools

### Student
- View assignments and grades
- Submit assignments
- Access learning materials
- View progress reports

### Parent
- View children's progress
- Communicate with teachers
- Access school calendar
- View reports and assignments

## 9. Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and DATABASE_URL is correct
2. **Clerk Keys**: Verify all Clerk environment variables are set correctly
3. **Webhook Issues**: Check webhook URL is accessible and secret matches
4. **User Not Found**: Ensure user completed registration process

### Development Commands

```bash
# Reset database
npm run db:push

# View database
npm run db:studio

# Check linting
npm run lint

# Build for production
npm run build
```

## 10. Production Deployment

1. Set up production database (PostgreSQL)
2. Configure production Clerk application
3. Set environment variables in production
4. Run database migrations
5. Deploy application

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Clerk and Prisma documentation
3. Check application logs for detailed error messages

