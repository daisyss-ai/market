# MarketU Backend - Complete Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Local Development Setup](#local-development-setup)
4. [Database Migration](#database-migration)
5. [Testing the API](#testing-the-api)
6. [Connecting Frontend](#connecting-frontend)
7. [Deployment](#deployment)

---

## Prerequisites

### Required
- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Supabase** account (free tier is fine for development)
- **Git** (optional, for version control)

### Recommended
- **Postman** or **VS Code REST Client** for API testing
- **pgAdmin** or **DBeaver** for database inspection

### Check Versions
```bash
node --version  # Should be v18+
npm --version   # Should be v9+
```

---

## Supabase Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in the details:
   - **Name:** MarketU (or your project name)
   - **Database Password:** Create a strong password
   - **Region:** Choose closest to your location
5. Click "Create new project"
6. Wait for the project to initialize (2-5 minutes)

### Step 2: Get API Keys

1. In your Supabase dashboard, go to **Settings → API**
2. You'll see:
   - **Project URL** (SUPABASE_URL)
   - **anon key** (SUPABASE_ANON_KEY)
   - **service_role key** (SUPABASE_SERVICE_KEY)

Keep these keys safe! Never commit them to git.

### Step 3: Enable Row Level Security (Optional, done by schema)

The RLS is automatically enabled in our schema.sql file, but you can verify:

1. Go to **Authentication → Policies**
2. You should see policies for each table

---

## Local Development Setup

### Step 1: Install Node Dependencies

```bash
cd backend
npm install
```

This will install:
- `express` - Web framework
- `@supabase/supabase-js` - Supabase client
- `cors` - CORS middleware
- `jsonwebtoken` - JWT handling
- `joi` - Request validation

### Step 2: Create Environment File

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
# Get these from Supabase Settings → API
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# These can be any values for local development
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-1234567890

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Step 3: Verify Setup

```bash
npm run dev
```

You should see:
```
Server running on http://localhost:3000
```

Test the health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-03-02T..."}
```

---

## Database Migration

### Step 1: Run Schema SQL

The easiest way is through Supabase dashboard:

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `database/schema.sql` from the backend folder
5. Copy the entire contents
6. Paste into the SQL editor
7. Click **Run**

You should see:
```
Success. No rows returned
```

### Step 2: Run RLS Policies SQL

1. Click **New Query** again
2. Open `database/rls-policies.sql`
3. Copy and paste into SQL editor
4. Click **Run**

### Step 3: Verify Schema

In Supabase dashboard:
1. Go to **Explore** in left sidebar
2. You should see these tables:
   - students
   - users
   - products
   - reviews
   - messages
   - favorites
   - cart_items

### Step 4: Create Test Student (Optional)

```sql
INSERT INTO students (student_id, full_name, email, course, classroom, school, verified)
VALUES (
  'TEST001',
  'Test Student',
  'test@university.edu',
  'Computer Science',
  'CS-2024',
  'Technical University',
  true
);
```

---

## Testing the API

### Using cURL

#### 1. Verify Student
```bash
curl -X POST http://localhost:3000/api/auth/verify-student \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "TEST001",
    "email": "test@university.edu",
    "full_name": "Test Student"
  }'
```

#### 2. Sign Up
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "password": "TestPassword123",
    "full_name": "Test Student",
    "student_id": "TEST001"
  }'
```

Response will include a `token` - save this for other requests.

#### 3. Get Products
```bash
curl http://localhost:3000/api/products
```

#### 4. Authenticated Request
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Create a **New Collection** called "MarketU API"
2. Set **Collection Variables:**
   - `base_url`: `http://localhost:3000/api`
   - `token`: (leave empty, will fill after signup)

3. Create requests for each endpoint
4. In headers, add: `Authorization: Bearer {{token}}`

---

## Connecting Frontend

### Update Frontend API URL

In your React frontend, update the API base URL:

1. Create or update `frontend/src/config.ts`:
```typescript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

2. Update `.env.local` in frontend:
```env
VITE_API_URL=http://localhost:3000/api
```

3. Create API client `frontend/src/services/api.ts`:
```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Example Frontend Integration

```typescript
// Login example
import api from './services/api';

async function login(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', response.data.data.token);
  return response.data.data.user;
}

// Get products example
async function getProducts() {
  const response = await api.get('/products?limit=20');
  return response.data.data.products;
}
```

---

## Deployment

### Prerequisites for Production

- [ ] Environment variables set in hosting platform
- [ ] JWT_SECRET is strong (min 32 characters)
- [ ] CORS configured for production domain
- [ ] HTTPS enabled
- [ ] Database backups configured
- [ ] Error logging set up

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# In backend directory
vercel
```

Follow the prompts to:
1. Link to git repository
2. Set environment variables
3. Deploy

### Deploy to Heroku

```bash
# Install Heroku CLI
npm i -g heroku

# Login
heroku login

# Create app
heroku create marketubackend

# Set environment variables
heroku config:set SUPABASE_URL=...
heroku config:set SUPABASE_ANON_KEY=...
# ... set all other variables

# Deploy
git push heroku main
```

### Deploy to Railway, Render, or Fly.io

Each platform has similar processes. Use their documentation to:
1. Connect your GitHub repo
2. Set environment variables
3. Configure build command: `npm run build`
4. Configure start command: `npm start`

---

## API Base URLs Summary

| Environment | URL |
|-------------|-----|
| Local Development | `http://localhost:3000/api` |
| Production | `https://yourdomain.com/api` |

---

## Troubleshooting

### Issue: "Cannot find SUPABASE_URL"
**Solution:** Check `.env.local` exists and has correct Supabase values

### Issue: "RLS policy violation"
**Solution:** Run the RLS SQL again from `database/rls-policies.sql`

### Issue: "JWT verification failed"
**Solution:** Ensure JWT_SECRET is same on backend and frontend

### Issue: "CORS errors"
**Solution:** Update FRONTEND_URL env variable to match your frontend domain

### Issue: "Cannot connect to Supabase"
**Solution:** 
- Check internet connection
- Verify SUPABASE_URL is correct
- Check Supabase project is running

---

## Security Checklist

### Before Going to Production

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Set up proper CORS
- [ ] Enable RLS on all tables
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring/logging
- [ ] Review security policies
- [ ] Test all authentication flows

---

## Next Steps

1. ✅ Database schema created
2. ✅ API endpoints built
3. ✅ Authentication implemented
4. 🔄 Connect frontend application
5. 🔄 Set up payment processing (if needed)
6. 🔄 Deploy to production
7. 🔄 Monitor and maintain

---

## Support

For issues:
1. Check the main [README.md](./README.md)
2. Review Supabase documentation
3. Check backend logs: `npm run dev`
4. Test with cURL or Postman

---

## Quick Reference Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build TypeScript
npm start                      # Start production server

# Database
npm run migrate               # Run migrations

# Debugging
npm run dev -- --inspect     # Node debugging
```

---

Good luck! 🚀
