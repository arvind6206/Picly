# Picly - Event Photo Gallery Management System

A comprehensive web application for event photographers to manage photo galleries, assign team members, and share private galleries with clients via secure PIN access.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Demo Credentials](#demo-credentials)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

- **User Authentication**: Secure login/logout with JWT tokens
- **Role-Based Access Control**: Admin and Team Member roles
- **Event Management**: Create, edit, and manage photo events
- **Team Collaboration**: Assign team members to events
- **Photo Upload**: Upload and manage event photos
- **Gallery Creation**: Create private galleries with selected photos
- **PIN Protection**: Secure gallery access via PIN authentication
- **Gallery Publishing**: Publish/unpublish galleries for client access
- **Responsive Design**: Mobile-friendly interface

## 🛠 Tech Stack

- **Frontend**: Next.js 16.3.4, React 19.2.8, TypeScript
- **Styling**: Tailwind CSS 4, Lucide React icons
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM 7.10.0
- **Authentication**: JWT (jsonwebtoken)
- **HTTP Client**: Axios 1.20.0
- **Password Hashing**: bcryptjs

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/arvind6206/Picly.git
cd picly
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

4. Configure your `.env` file with your database credentials and JWT secret:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/picly"
JWT_SECRET="your-super-secret-jwt-key"
```

5. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
picly/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── events/       # Event management endpoints
│   │   ├── gallery/      # Public gallery endpoints
│   │   ├── photos/       # Photo management endpoints
│   │   └── users/        # User management endpoints
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard pages
│   └── gallery/          # Public gallery pages
├── components/
│   ├── dashboard-layout.tsx
│   └── ui/               # Reusable UI components
├── lib/
│   └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
└── public/               # Static assets
```

## 🔌 API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Events

- `GET /api/events` - List all events
- `POST /api/events` - Create new event (Admin only)
- `GET /api/events/[eventId]` - Get event details
- `PATCH /api/events/[eventId]` - Update event (Admin only)
- `POST /api/events/[eventId]/photos` - Upload photos to event
- `GET /api/events/[eventId]/members` - Get event team members
- `POST /api/events/[eventId]/members` - Add team member to event
- `DELETE /api/events/[eventId]/members/[userId]` - Remove team member

### Gallery Management

- `POST /api/events/[eventId]/gallery` - Create gallery (Admin only)
- `GET /api/events/[eventId]/gallery` - Get event gallery
- `POST /api/events/[eventId]/gallery/photos` - Add photos to gallery
- `DELETE /api/events/[eventId]/gallery/photos/[photoId]` - Remove photo from gallery
- `POST /api/events/[eventId]/gallery/publish` - Publish gallery
- `POST /api/events/[eventId]/gallery/unpublish` - Unpublish gallery

### Public Gallery

- `POST /api/gallery/[token]/verify` - Verify PIN and get session token
- `GET /api/gallery/[token]/photos` - Get gallery photos (requires authentication)

### Users

- `GET /api/users/team-members` - Get all team members

## 🗄 Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Admin and Team Members with authentication credentials
- **Events**: Photo events created by admins
- **Photos**: Uploaded photos associated with events and users
- **Galleries**: Private galleries with PIN protection
- **GalleryPhotos**: Many-to-many relationship between galleries and photos

For detailed schema information, see [ARCHITECTURE.md](ARCHITECTURE.md)

## 🔐 Demo Credentials

For testing purposes, you can use these demo credentials:

**Admin Account:**
- Email: arvind@gmail.com
- Password: 000000
- Role: Can create events, manage galleries, assign team members

**Team Member Account:**
- Email: mohan@gmail.com
- Password: 000000
- Role: Can upload photos to assigned events

*Note: You'll need to create these accounts manually via the registration page first, or use the Prisma seed script.*

## 🧪 Testing

Currently, the project uses manual testing. To run the development server:

```bash
npm run dev
```

Test the application by:
1. Registering a new admin account
2. Creating events and assigning team members
3. Uploading photos to events
4. Creating galleries and selecting photos
5. Publishing galleries and testing PIN access

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Import your project in [Vercel](https://vercel.com/new)
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
4. Deploy

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## 📖 Additional Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed architecture and database design
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- [AGENTS.md](AGENTS.md) - Development guidelines and agent configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
