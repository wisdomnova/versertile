# 🚀 VERSERTILE Phase 1 - Quick Start Guide

## What's Running

Your VERSERTILE MVP is **live at http://localhost:3000** with:
- ✅ Landing page
- ✅ Auth flows (UI only, backend pending)
- ✅ P.O.E.M. Engine interface
- ✅ Full component library
- ✅ Responsive design
- ✅ Zero errors in build

---

## First 3 Things to Do

### 1️⃣ Get Supabase Keys (5 minutes)
Go to [supabase.com](https://supabase.com):
- Create new project (or use existing)
- Copy `Project URL` → paste in `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
- Copy `Anon Key` → paste in `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2️⃣ Get OpenAI API Key (3 minutes)
Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys):
- Create new secret key
- Copy → paste in `.env.local` as `OPENAI_API_KEY`

### 3️⃣ Create `.env.local` File
In `/Users/user/versertile/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-proj-...
```

Done! Your app will pick up these keys automatically.

---

## Test the UI

**Landing Page**
- http://localhost:3000
- Click "Try P.O.E.M. Engine" or "Start Creating"

**Sign Up**
- http://localhost:3000/auth/signup
- Two methods: Email or Wallet (UI only, not wired yet)

**Sign In**
- http://localhost:3000/auth/login
- Email/password form (UI only, not wired yet)

**P.O.E.M. Engine**
- http://localhost:3000/poem
- Paste text (50+ words)
- Click "Analyze with P.O.E.M."
- Shows mock score (will be real once API is built)

---

## Next Build Phase: API Integration

### Priority 1: P.O.E.M. Analysis API
**File**: `/app/api/poem/analyze`
```typescript
// POST /api/poem/analyze
// Body: { text: string }
// Response: { originality, quality, expression, overall, feedback }

export async function POST(req: Request) {
  const { text } = await req.json();
  
  // Call OpenAI GPT-4o mini
  // Analyze for: originality, quality, expression
  // Return scores (0-100)
}
```

### Priority 2: Authentication API
**File**: `/app/api/auth/signup` & `/app/api/auth/login`
- Wire [app/auth/signup/page.tsx](app/auth/signup/page.tsx) to Supabase Auth
- Wire [app/auth/login/page.tsx](app/auth/login/page.tsx) to Supabase Auth
- Add middleware for protected routes

### Priority 3: Database Setup
Supabase → SQL Editor → Create tables:
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT,
  wallet_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analysis history
CREATE TABLE analyses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  text TEXT,
  originality INT,
  quality INT,
  expression INT,
  overall INT,
  feedback TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Architecture Ready

- **Frontend**: Next.js + React (fully built)
- **Styling**: Tailwind + Framer Motion (fully implemented)
- **UI Components**: 7 reusable components (ready to use)
- **State**: React hooks (useState, useEffect ready)
- **Auth**: Supabase client imported (need: configuration + logic)
- **API Routes**: Next.js `/app/api` structure ready (need: endpoints)

---

## Quick Wins (Easy Wins First)

1. **Add env keys** (3 minutes) → Keep server running
2. **Create Supabase tables** (10 minutes) → SQL in Supabase UI
3. **Wire email signup** (30 minutes) → Call Supabase Auth
4. **Create P.O.E.M. endpoint** (45 minutes) → Call OpenAI API
5. **Display user data on dashboard** (30 minutes) → Fetch from Supabase

---

## Commands

```bash
# Dev server (already running)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type check
pnpm tsc --noEmit

# Check for errors
pnpm run dev  # Errors show in terminal
```

---

## Questions?

- **"Where do I add the auth logic?"** → `/app/api/auth/` directory
- **"How do I call the P.O.E.M. API from the frontend?"** → Already set up in [app/poem/page.tsx](app/poem/page.tsx), just update the TODO comment
- **"How do I protect routes?"** → Create `middleware.ts` in root with Supabase session check
- **"Where are the logo files?"** → `/public/VERSERTILE/` (LOGO PNG.PNG, LOGO BLACK PNG.PNG, etc.)

---

## Key Files Reference

| File | Purpose |
|------|---------|
| [app/page.tsx](app/page.tsx) | Landing page |
| [app/auth/signup/page.tsx](app/auth/signup/page.tsx) | Signup form |
| [app/auth/login/page.tsx](app/auth/login/page.tsx) | Login form |
| [app/poem/page.tsx](app/poem/page.tsx) | P.O.E.M. interface |
| [lib/supabase.ts](lib/supabase.ts) | Supabase client |
| [components/Button.tsx](components/Button.tsx) | Button component |
| [app/globals.css](app/globals.css) | Global styles + fonts |

---

## Design Specs (Already Applied)

✅ Montserrat font everywhere  
✅ White background, black text  
✅ No gradients, no emojis  
✅ Simple borders (1px #e5e5e5)  
✅ Smooth Framer animations  
✅ Responsive on mobile  
✅ Real PNG logos (not text)  

---

**Status**: Ready for API integration  
**Next Step**: Add environment variables → Start building authentication  
**Estimated Time**: 2-3 days for Phase 1 completion

Let's go! 🚀
