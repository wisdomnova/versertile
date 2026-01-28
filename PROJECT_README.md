# VERSERTILE - Phase 1 MVP

An AI-powered creative ecosystem where originality is verified, creativity is rewarded, and audiences earn for engaging with exceptional work.

## Project Status: Phase 1 - Foundation Ready

### ✅ Completed
- [x] Landing page with hero section and feature highlights
- [x] Authentication pages (Email signup & Wallet connection)
- [x] P.O.E.M. Engine UI (text analysis interface)
- [x] Component library (Button, Input, Textarea, Card, Logo, Loading)
- [x] Design system (Montserrat font, clean white theme, no gradients)
- [x] Framer Motion animations (subtle, smooth transitions)
- [x] Supabase integration setup
- [x] Development environment ready

### 🚀 Next Steps

#### 1. Authentication API Integration
- [ ] Connect email signup/login to Supabase Auth
- [ ] Implement wallet connection (MetaMask, WalletConnect, Base Wallet)
- [ ] Create protected routes middleware
- [ ] Add user session management

**Files to update:**
- `/app/auth/signup/page.tsx` - Wire signup API call
- `/app/auth/login/page.tsx` - Wire login API call
- Create `/lib/auth.ts` - Auth utility functions

#### 2. P.O.E.M. Engine API
- [ ] Create `/app/api/poem/analyze` endpoint
- [ ] Integrate OpenAI GPT-4o mini for text analysis
- [ ] Implement originality scoring algorithm
- [ ] Add plagiarism detection
- [ ] Cache analysis results in Supabase

**Key metrics:**
- Originality (0-100): Uniqueness detection
- Quality (0-100): Grammar, structure, clarity
- Expression (0-100): Emotional resonance, creativity
- Overall (0-100): Weighted average

#### 3. Database Schema
- [ ] Users table (email, wallet_address, created_at)
- [ ] Analysis history (user_id, text, scores, created_at)
- [ ] Published works (user_id, title, content, poem_score)
- [ ] User engagement stats (reads, shares, ratings)

#### 4. User Dashboard
- [ ] Create `/app/dashboard` protected page
- [ ] Show user profile (email/wallet)
- [ ] Display analysis history
- [ ] Track basic stats (works submitted, total score)
- [ ] Link to publish workflow

#### 5. Smart Contracts (Deferred to Phase 2)
- [ ] $VERSE token (ERC-20 on Base)
- [ ] Rewards distribution contract
- [ ] NFT minting contract (Phase 3)

---

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Auth**: Supabase Auth (email + social/wallet)
- **Database**: Supabase PostgreSQL
- **AI**: OpenAI GPT-4o mini (via API)
- **Blockchain**: Base network (Phase 2+)

### File Structure
```
/app
  /auth
    /login - Sign in page
    /signup - Create account page
  /poem - P.O.E.M. Engine interface
  /api
    /poem/analyze - Analysis endpoint (TODO)
  layout.tsx - Root layout with navigation
  page.tsx - Landing page

/components
  Button.tsx - Reusable button component
  Input.tsx - Form input with validation
  Textarea.tsx - Multi-line text input
  Card.tsx - Container component
  Logo.tsx - VERSERTILE logo
  Loading.tsx - Spinner animation

/lib
  supabase.ts - Supabase client
  (auth.ts - TODO)
  (api.ts - TODO)

/public/VERSERTILE
  - Logo files (PNG, various colors)
```

---

## Environment Setup

Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
OPENAI_API_KEY=your_api_key
```

---

## Running Locally

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Open http://localhost:3000
```

---

## Design Philosophy

- **Clean & Simple**: White background, black text, minimal borders
- **No Excess**: No gradients, no emojis, no decorative elements
- **Readable**: Montserrat font family across all UI
- **Accessible**: High contrast, clear hierarchy, keyboard navigation
- **Fast**: Smooth animations with Framer Motion (performance-first)

---

## Phase 1 Success Criteria

- [ ] Users can sign up via email or wallet
- [ ] Users can analyze text with P.O.E.M. Engine
- [ ] P.O.E.M. returns originality, quality, expression scores
- [ ] Analysis history is saved per user
- [ ] Clean, professional design on desktop & mobile

---

## Contact & Notes

- Client approval needed for: Token economics, NFT marketplace scope
- AI model confirmed: GPT-4o mini (cost-effective for MVP)
- Testnet mode: All features open, no subscription restrictions for Phase 1
- Next phase: Creator Dashboard, publish workflow, token rewards system

---

Generated: January 2026
