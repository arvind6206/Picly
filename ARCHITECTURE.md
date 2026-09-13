# Picly Architecture & Database Design

## 🏗 System Architecture

Picly is built as a modern full-stack web application using the Next.js framework with a client-server architecture.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                          │
│  (React Components, Next.js Pages, Axios HTTP Client)        │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/HTTPS
┌────────────────────┴────────────────────────────────────────┐
│                    API Layer (Next.js)                        │
│  (Route Handlers, Authentication Middleware, Validation)     │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│                  Business Logic Layer                        │
│  (Prisma ORM, JWT Authentication, File Upload Logic)         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│                    Data Layer                                │
│  (PostgreSQL Database, File Storage)                        │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend Framework**: Next.js 16.3.4 (App Router)
- **UI Library**: React 19.2.8 with TypeScript
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios 1.20.0
- **Backend**: Next.js API Routes
- **ORM**: Prisma 7.10.0
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs

## 🗄 Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │───────│    Event    │───────│    Photo    │
└─────────────┘       └─────────────┘       └─────────────┘
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ name        │       │ name        │       │ eventId (FK)│
│ email       │       │ description │       │ uploadedById │
│ password    │       │ eventDate   │       │ filename    │
│ role        │       │ createdById │       │ storageKey  │
│ createdAt   │       │ createdAt   │       │ storageUrl  │
│ updatedAt   │       │ updatedAt   │       │ fileSize    │
└─────────────┘       └─────────────┘       │ createdAt   │
       │                    │              └─────────────┘
       │                    │                       │
       │                    │                       │
       │                    │                       │
       │                    │                       │
       │                    │                       │
       │            ┌───────┴───────┐               │
       │            │   Gallery    │◄──────────────┘
       │            └──────────────┘
       │            │ id (PK)      │
       │            │ eventId (FK) │
       │            │ token        │
       │            │ pinHash      │
       │            │ isPublished  │
       │            │ createdAt    │
       │            └──────────────┘
       │                    │
       │                    │
       │            ┌───────┴───────┐
       │            │ GalleryPhoto │
       │            └──────────────┘
       │            │ id (PK)      │
       │            │ galleryId(FK)│
       │            │ photoId (FK) │
       │            │ createdAt    │
       │            └──────────────┘
       │
       └──────────────────────────┐
                                   │
                            ┌──────┴──────┐
                            │ EventMember │
                            └─────────────┘
```

### Detailed Schema Explanation

#### 1. User Model
Stores user authentication and profile information.

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   // bcrypt hashed password
  role      Role     @default(TEAM_MEMBER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  createdEvents Event[] @relation("EventCreator")
  events        Event[] @relation("EventMembers")
  photos        Photo[]
  createdGalleries Gallery[] @relation("GalleryCreator")
}
```

**Purpose**: 
- Authentication and authorization
- Role-based access control (ADMIN vs TEAM_MEMBER)
- Tracking user activity (created events, uploaded photos)

**Key Features**:
- Unique email constraint for registration
- Bcrypt password hashing for security
- CUID for primary keys (better for distributed systems)
- Timestamps for audit trail

#### 2. Event Model
Represents photo events created by administrators.

```prisma
model Event {
  id          String   @id @default(cuid())
  name        String
  description String?
  eventDate   String?
  createdById String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  createdBy User @relation("EventCreator", fields: [createdById], references: [id])
  members   User[] @relation("EventMembers")
  photos    Photo[]
  gallery   Gallery?
}
```

**Purpose**:
- Organize photos by event (weddings, parties, corporate events)
- Assign team members to collaborate on events
- Link to galleries for client delivery

**Key Features**:
- Admin-only creation (enforced at API level)
- Many-to-many relationship with users (team members)
- One-to-one relationship with gallery
- Cascade delete for related photos

#### 3. Photo Model
Stores individual photo metadata and storage information.

```prisma
model Photo {
  id           String   @id @default(cuid())
  eventId      String
  uploadedById String
  filename     String
  storageKey   String
  storageUrl   String?
  fileSize     Int
  createdAt    DateTime @default(now())
  
  // Relations
  event     Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  uploadedBy User @relation(fields: [uploadedById], references: [id])
  galleryPhotos GalleryPhoto[]
}
```

**Purpose**:
- Store photo metadata and file storage references
- Track which user uploaded which photo
- Enable gallery selection

**Key Features**:
- Separate storage key from URL (flexible storage backends)
- File size tracking for storage management
- Cascade delete when event is deleted
- Can belong to multiple galleries via GalleryPhoto

#### 4. Gallery Model
Represents private galleries shared with clients via PIN.

```prisma
model Gallery {
  id          String   @id @default(cuid())
  eventId     String   @unique
  createdById String
  token       String   @unique  // Public access token
  pinHash     String            // bcrypt hashed PIN
  isPublished Boolean   @default(false)
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  event  Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  createdBy User @relation("GalleryCreator", fields: [createdById], references: [id])
  photos GalleryPhoto[]
}
```

**Purpose**:
- Create curated photo selections for clients
- Secure access via PIN authentication
- Control publication status

**Key Features**:
- Unique token for gallery URL
- Hashed PIN for security (never stored in plain text)
- Publication workflow (draft → published)
- One-to-one with event (one gallery per event)

#### 5. GalleryPhoto Model
Many-to-many relationship between galleries and photos.

```prisma
model GalleryPhoto {
  id        String   @id @default(cuid())
  galleryId String
  photoId   String
  createdAt DateTime @default(now())
  
  gallery Gallery @relation(fields: [galleryId], references: [id], onDelete: Cascade)
  photo   Photo   @relation(fields: [photoId], references: [id], onDelete: Cascade)
  
  @@unique([galleryId, photoId])  // Prevent duplicates
}
```

**Purpose**:
- Enable selective photo inclusion in galleries
- Track when photos were added to galleries
- Prevent duplicate photo additions

**Key Features**:
- Unique constraint prevents same photo twice
- Cascade delete on both sides
- Timestamp for ordering/audit

#### 6. Role Enum
Defines user roles for access control.

```prisma
enum Role {
  ADMIN
  TEAM_MEMBER
}
```

**Purpose**:
- Enforce role-based permissions
- ADMIN: Full access (create events, manage galleries, assign members)
- TEAM_MEMBER: Limited access (upload photos to assigned events)

## 🔐 Security Architecture

### Authentication Flow

1. **Registration**: User submits email/password → Password hashed with bcrypt → User stored in database
2. **Login**: Credentials verified → JWT token generated → Token stored in HTTP-only cookie
3. **API Access**: Token extracted from cookie → JWT validated → User context attached to request
4. **Logout**: Cookie cleared → Token invalidated

### Authorization

- **Role-based access control** enforced at API route level
- **Admin-only operations**: Create events, manage galleries, assign team members
- **Team member operations**: Upload photos to assigned events
- **Resource ownership**: Users can only modify their own resources

### Data Protection

- **Passwords**: Bcrypt hashing with salt rounds
- **PINs**: Bcrypt hashing (never stored in plain text)
- **JWT**: Secret key from environment variables
- **SQL Injection**: Prevented by Prisma ORM parameterized queries
- **XSS**: React's built-in escaping and Content Security Policy

## 📊 Data Flow Examples

### Photo Upload Flow

```
User selects file → Client validates → 
POST /api/events/[eventId]/photos → 
Server authenticates → 
File uploaded to storage → 
Photo metadata stored in database → 
Response with photo details → 
UI updates with new photo
```

### Gallery Access Flow

```
Client opens gallery/[token] → 
User enters PIN → 
POST /api/gallery/[token]/verify → 
Server validates PIN → 
Generates session token → 
Client stores session token → 
GET /api/gallery/[token]/photos (with Authorization header) → 
Server validates session → 
Returns gallery photos → 
Client displays photos
```

## 🚀 Performance Considerations

### Database Optimization
- **Indexes**: Primary keys automatically indexed, unique constraints create indexes
- **Cascade Deletes**: Automatic cleanup of related records
- **Connection Pooling**: Prisma manages database connections efficiently

### Caching Strategy
- **JWT Tokens**: Stateless authentication (no database lookup per request)
- **Gallery Sessions**: Session tokens stored in client sessionStorage
- **Static Assets**: Next.js automatic optimization and caching

### Scalability
- **Horizontal Scaling**: Stateless API design enables multiple instances
- **Database Scaling**: PostgreSQL supports read replicas and sharding
- **Storage**: Decoupled file storage enables CDN integration

## 🔧 API Design Principles

### RESTful Conventions
- **GET**: Retrieve resources
- **POST**: Create resources
- **PATCH**: Update resources (partial updates)
- **DELETE**: Remove resources

### Error Handling
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error (unexpected errors)

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

## 📈 Future Enhancements

### Database Extensions
- **Photo tags/keywords**: Enable search and filtering
- **Photo ratings**: Client feedback system
- **Download tracking**: Analytics for popular photos
- **Watermarking**: Branded photo delivery

### Architecture Improvements
- **Redis caching**: Session management and API response caching
- **CDN integration**: Global photo delivery
- **WebSocket**: Real-time collaboration features
- **Microservices**: Separate file upload service for better scalability