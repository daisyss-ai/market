# MarketU Backend - Getting Started in 5 Minutes

## 1️⃣ Create Supabase Project (2 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create account
3. Click **New Project**
4. Fill in details:
   - Name: `MarketU`
   - Password: Create strong password
   - Region: Choose closest to you
5. Wait for initialization (2-3 minutes)
6. Go to **Settings → API**
7. Copy and save:
   - **Project URL** → `SUPABASE_URL`
   - **anon key** → `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_KEY`

## 2️⃣ Set Up Database (1 minute)

In Supabase dashboard:

1. Click **SQL Editor** → **New Query**
2. Open `backend/database/schema.sql`
3. Copy entire contents into editor
4. Click **Run**
5. Repeat with `backend/database/rls-policies.sql`

✅ Database is ready!

## 3️⃣ Install & Configure Backend (1 minute)

```bash
cd backend
npm install

# Copy environment template
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
SUPABASE_URL=<paste Project URL>
SUPABASE_ANON_KEY=<paste anon key>
SUPABASE_SERVICE_KEY=<paste service_role key>
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-min-32-chars-123456789
FRONTEND_URL=http://localhost:5173
```

## 4️⃣ Start Server (immediate)

```bash
npm run dev
```

Should see: `Server running on http://localhost:3000`

## 5️⃣ Test It Works (instant)

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-03-02T..."}
```

---

## ✨ You're Done!

Backend is now running with:
- ✅ 28 API endpoints
- ✅ Student authentication
- ✅ Product management
- ✅ Messaging system
- ✅ Row Level Security
- ✅ Type-safe TypeScript

---

## 📚 Next Steps

### Test API Endpoints

```bash
# Create test student in Supabase first
# Then sign up:
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "password": "Test123456",
    "full_name": "Test Student",
    "student_id": "TEST001"
  }'
```

### Connect Frontend

See `README.md` for frontend integration examples.

### Deploy to Production

See `SETUP_GUIDE.md` → Deployment section.

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find SUPABASE_URL" | Check `.env.local` exists |
| "RLS policy violation" | Re-run `rls-policies.sql` |
| "Cannot connect to Supabase" | Verify URL and keys are correct |
| "Port 3000 in use" | Change PORT in `.env.local` |

---

## 📖 Full Documentation

- **API Endpoints** → Read `README.md`
- **Complete Setup** → Read `SETUP_GUIDE.md`  
- **Implementation Details** → Read `IMPLEMENTATION_SUMMARY.md`
- **Quick API Ref** → See `API_REFERENCE.js`

---

**Server URL:** http://localhost:3000
**API Endpoint:** http://localhost:3000/api

🎉 Happy coding!
