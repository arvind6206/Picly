# Picly Deployment Guide

This guide covers various deployment options for the Picly application, from development to production environments.

## 📋 Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed
- PostgreSQL database (local or cloud-hosted)
- Git repository (GitHub, GitLab, etc.)
- Domain name (for production)
- SSL certificate (for production HTTPS)

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest deployment option for Next.js applications and provides excellent performance.

#### Step 1: Prepare Your Code

1. Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. Verify your `.env` variables are not committed (they should be in `.gitignore`)

#### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

#### Step 3: Add Environment Variables

In Vercel project settings → Environment Variables, add:

```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

**For PostgreSQL database**, you can use:
- **Neon** (recommended): [neon.tech](https://neon.tech) - Free tier available
- **Supabase**: [supabase.com](https://supabase.com) - Free tier available
- **Railway**: [railway.app](https://railway.app) - Easy PostgreSQL setup
- **AWS RDS**: For production workloads

#### Step 4: Deploy

Click "Deploy" and wait for the build to complete. Vercel will provide:
- Production URL: `https://your-project.vercel.app`
- Automatic HTTPS
- Continuous deployment from Git

#### Step 5: Database Setup

If using a cloud PostgreSQL provider:

1. Create a new database
2. Get the connection string
3. Add it to Vercel environment variables
4. Run database migrations:
```bash
# In your local environment with the production DATABASE_URL
DATABASE_URL="postgresql://..." npx prisma db push
```

### Option 2: Railway

Railway provides an all-in-one platform with built-in PostgreSQL.

#### Step 1: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your Picly repository
4. Railway will automatically detect Next.js

#### Step 2: Add PostgreSQL

1. In your Railway project, click "New Service"
2. Select "PostgreSQL"
3. Railway will provide a DATABASE_URL

#### Step 3: Configure Environment Variables

Railway automatically sets `DATABASE_URL`. Add:
```
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

#### Step 4: Deploy and Setup Database

1. Railway will automatically deploy
2. Access the Railway console to run migrations:
```bash
npx prisma db push
```

### Option 3: DigitalOcean App Platform

#### Step 1: Prepare Database

1. Create a DigitalOcean account
2. Create a PostgreSQL database (Managed Databases)
3. Note the connection string

#### Step 2: Deploy App

1. Go to DigitalOcean → Apps → "Create App"
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`
   - **Environment Variables**: Add DATABASE_URL and JWT_SECRET

#### Step 3: Deploy

Click "Create Resources" and wait for deployment.

### Option 4: Self-Hosted (VPS/Cloud Server)

For full control, deploy to your own server (AWS EC2, DigitalOcean Droplet, etc.).

#### Step 1: Server Setup

Connect to your server and install dependencies:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx (optional, for reverse proxy)
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### Step 2: Setup PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE picly;
CREATE USER picly_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE picly TO picly_user;
\q
```

#### Step 3: Deploy Application

```bash
# Clone repository
git clone <your-repo-url>
cd picly

# Install dependencies
npm install

# Setup environment
cp env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npx prisma generate

# Push database schema
DATABASE_URL="postgresql://picly_user:secure_password@localhost:5432/picly" npx prisma db push

# Build application
npm run build

# Start with PM2
pm2 start npm --name "picly" -- start
pm2 save
pm2 startup
```

#### Step 4: Configure Nginx (Optional)

Create `/etc/nginx/sites-available/picly`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/picly /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: SSL with Let's Encrypt (Optional)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 5: Docker Deployment

#### Step 1: Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Step 2: Create docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/picly
      - JWT_SECRET=your-super-secret-jwt-key
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=picly
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### Step 3: Build and Run

```bash
docker-compose up -d
docker-compose exec app npx prisma db push
```

## 🔒 Security Best Practices

### Environment Variables

Never commit `.env` files. Always use:
- Environment variable management in your hosting platform
- Secret management services (AWS Secrets Manager, HashiCorp Vault)
- `.env.example` for documentation only

### Database Security

- Use strong passwords
- Enable SSL connections
- Restrict database access to application server only
- Regular backups
- Use connection pooling

### JWT Security

- Use strong, random secrets (minimum 32 characters)
- Set appropriate expiration times
- Use HTTP-only cookies
- Implement token refresh mechanism

### HTTPS

Always use HTTPS in production:
- Free SSL from Let's Encrypt
- Built-in HTTPS on Vercel/Railway
- Load balancer SSL termination

## 📊 Monitoring and Logging

### Application Monitoring

- **Vercel Analytics**: Built-in for Vercel deployments
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and error tracking

### Database Monitoring

- **Query performance**: Use Prisma's query logging
- **Connection pool monitoring**: Check database connection limits
- **Backup verification**: Regular restore tests

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🐛 Troubleshooting

### Common Issues

**Build Failures:**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript errors

**Database Connection Issues:**
- Verify DATABASE_URL format
- Check database server accessibility
- Ensure SSL certificates are valid

**Environment Variable Issues:**
- Confirm variables are set in hosting platform
- Check for typos in variable names
- Verify variable values are correct

**Performance Issues:**
- Enable Next.js production mode
- Check database query performance
- Implement caching where appropriate

## 📈 Scaling Considerations

### Database Scaling

- **Read Replicas**: For read-heavy applications
- **Connection Pooling**: Use PgBouncer for high concurrency
- **Indexing**: Optimize frequently queried fields

### Application Scaling

- **Horizontal Scaling**: Deploy multiple instances behind load balancer
- **CDN**: Use for static assets and photo delivery
- **Caching**: Implement Redis for session management

### Storage Scaling

- **Object Storage**: Use AWS S3, Cloudflare R2, or similar
- **CDN Integration**: Deliver photos via CDN
- **Image Optimization**: Implement on-the-fly optimization

## 📞 Support

For deployment issues:
- Check hosting platform documentation
- Review application logs
- Test database connectivity
- Verify environment variables

## 🔄 Updates and Maintenance

### Database Migrations

When schema changes are made:

```bash
# Generate migration
npx prisma migrate dev --name description

# Apply to production
npx prisma migrate deploy
```

### Application Updates

1. Test changes in development
2. Create git commit
3. Deploy to staging environment first
4. Test thoroughly
5. Deploy to production
6. Monitor for issues

### Backup Strategy

- **Database**: Daily automated backups
- **Application**: Version control (Git)
- **Storage**: Redundant object storage
- **Disaster Recovery**: Documented restoration process