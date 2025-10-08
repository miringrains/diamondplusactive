# Diamond District Course Platform

A minimal, secure web application for delivering video-based courses with user authentication, progress tracking, and admin management.

## Features

- 🔐 **User Authentication** - Email/password registration and login with NextAuth.js
- 🎥 **Video Lessons** - Secure video streaming with player controls
- 📊 **Progress Tracking** - Track lesson completion and resume where you left off
- 👨‍💼 **Admin Interface** - Manage courses and lessons (in development)
- 🔗 **GoHighLevel Integration** - Automatic contact creation and tagging
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS + shadcn/ui
- **Video Player**: Plyr (ready to integrate)
- **File Upload**: Local storage (Uploadthing ready)
- **Form Handling**: React Hook Form + Zod

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL database
- GoHighLevel API credentials (optional)

## Quick Start

1. **Clone and install dependencies**:
   ```bash
   cd diamond-district
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database and API credentials.

3. **Set up the database**:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open** [http://165.227.78.164:3000](http://165.227.78.164:3000)

## Project Structure

```
src/
├── app/                  # Next.js app router pages
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Protected dashboard pages
│   ├── admin/           # Admin-only pages
│   └── api/             # API routes
├── components/          # Reusable React components
├── lib/                 # Utility functions and configs
│   ├── auth.ts         # NextAuth configuration
│   ├── db.ts           # Prisma client
│   └── gohighlevel.ts  # GoHighLevel API service
└── middleware.ts        # Authentication middleware
```

## Environment Variables

See `.env.example` for all required environment variables:
- Database connection string
- NextAuth configuration
- GoHighLevel API credentials
- Email SMTP settings (optional)

## Security Features

- Password hashing with bcrypt
- JWT-based session management
- CSRF protection
- Protected API routes
- Video access control
- Input validation with Zod

## Development Status

✅ **Completed**:
- User authentication system
- GoHighLevel integration
- Protected video serving
- Basic dashboard
- Database schema

🚧 **In Progress**:
- Course and lesson pages
- Video player integration
- Admin interface

## Production Deployment

For production deployment, consider:
- Using a managed PostgreSQL database
- Moving video storage to S3 or CDN
- Setting up proper SSL certificates
- Configuring email verification
- Adding monitoring and error tracking

## License

Private project - All rights reserved