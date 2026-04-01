# ✦ Evara AI — Events Organizer (Vercel Edition)

A full-stack AI-powered event management platform.  
**React 18 + TypeScript + Vite** frontend · **Vercel Serverless Functions** backend · **MongoDB Atlas** database · **Claude AI** assistant.

---

## 🚀 One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Or follow the step-by-step guide below.

---

## 📁 Project Structure

```
evara-ai-vercel/
├── api/                        ← Vercel Serverless Functions (Node.js ESM)
│   ├── _lib/
│   │   ├── db.js               ← Cached Mongoose connection
│   │   ├── models.js           ← User, Event, Guest schemas
│   │   ├── auth.js             ← JWT verify helper + signToken
│   │   └── cors.js             ← CORS headers + preflight handler
│   ├── health.js               ← GET  /api/health
│   ├── auth/
│   │   ├── register.js         ← POST /api/auth/register
│   │   ├── login.js            ← POST /api/auth/login
│   │   └── me.js               ← GET  /api/auth/me
│   ├── events/
│   │   ├── index.js            ← GET/POST  /api/events
│   │   ├── stats.js            ← GET       /api/events/stats
│   │   ├── [id].js             ← GET/PUT/DELETE /api/events/:id
│   │   └── agenda.js           ← POST      /api/events/:id/agenda
│   ├── guests/
│   │   ├── index.js            ← GET/POST  /api/guests
│   │   ├── [id].js             ← PUT/DELETE /api/guests/:id
│   │   └── bulk.js             ← POST      /api/guests/bulk
│   └── ai/
│       ├── chat.js             ← POST /api/ai/chat
│       ├── generate-event.js   ← POST /api/ai/generate-event
│       ├── generate-agenda.js  ← POST /api/ai/generate-agenda
│       ├── suggest-venues.js   ← POST /api/ai/suggest-venues
│       └── analyze.js          ← POST /api/ai/analyze
│
├── client/                     ← React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── api/index.ts        ← Axios client (relative /api/* paths)
│   │   ├── store/index.ts      ← Zustand: auth, events, guests, AI chat
│   │   ├── components/
│   │   │   ├── Layout.tsx      ← Sidebar + topbar shell
│   │   │   └── AIPanel.tsx     ← Persistent Claude chat panel
│   │   └── pages/
│   │       ├── Dashboard.tsx   ← Stats cards + upcoming events
│   │       ├── Events.tsx      ← List + create (with AI generation)
│   │       ├── EventDetail.tsx ← Detail view + AI agenda builder
│   │       ├── Guests.tsx      ← Guest directory + RSVP management
│   │       ├── Calendar.tsx    ← Month grid calendar
│   │       ├── Analytics.tsx   ← Recharts: pie, bar, progress charts
│   │       ├── Login.tsx
│   │       └── Register.tsx
│   └── vite.config.ts
│
├── vercel.json                 ← Build config + URL rewrites
├── package.json                ← Root deps for serverless functions
└── .env.example                ← Environment variable template
```

---

## ⚡ Deploy to Vercel

### Step 1 — MongoDB Atlas (free tier)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → **Create a free cluster**
2. Create a database user (username + password)
3. Add `0.0.0.0/0` to the IP Allow List (or restrict to Vercel's IPs)
4. Click **Connect → Drivers** and copy the connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/evara-ai?retryWrites=true&w=majority
   ```

### Step 2 — Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key — copy it

### Step 3 — Deploy via Vercel CLI

```bash
npm i -g vercel          # install Vercel CLI once

cd evara-ai-vercel
vercel                   # follow the prompts (link to your account)
```

When prompted, set these **environment variables** (or add them in the Vercel dashboard):

| Variable            | Value                                      |
|---------------------|--------------------------------------------|
| `MONGODB_URI`       | Your Atlas connection string               |
| `JWT_SECRET`        | A long random string (32+ chars)           |
| `JWT_EXPIRES_IN`    | `7d`                                       |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...`                         |

### Step 4 — Deploy to production

```bash
vercel --prod
```

Your app is now live at `https://your-project.vercel.app` 🎉

---

## 💻 Local Development

### Option A — Vercel CLI (recommended, matches production exactly)

```bash
npm i -g vercel

# Create a .env.local at the project root with your secrets:
cp .env.example .env.local
# Fill in MONGODB_URI, JWT_SECRET, ANTHROPIC_API_KEY

cd client && npm install && cd ..
npm install

vercel dev               # runs frontend + serverless functions together on http://localhost:3000
```

### Option B — Separate servers (frontend only, no serverless)

```bash
# 1. Start the client
cd client
npm install
npm run dev              # http://localhost:5173

# 2. To call real APIs you still need `vercel dev` or a deployed backend.
#    Uncomment the proxy in client/vite.config.ts and point it at your backend.
```

---

## 🔑 Environment Variables Reference

All variables go in **Vercel Dashboard → Project → Settings → Environment Variables**.  
For local dev, put them in a `.env.local` file at the project root.

| Variable            | Required | Description                              |
|---------------------|----------|------------------------------------------|
| `MONGODB_URI`       | ✅        | MongoDB Atlas connection string           |
| `JWT_SECRET`        | ✅        | Secret key for signing JWTs              |
| `JWT_EXPIRES_IN`    | —        | Token lifetime, default `7d`             |
| `ANTHROPIC_API_KEY` | ✅        | Claude API key for all AI features       |

---

## 🛠️ API Reference

All endpoints require `Authorization: Bearer <token>` except `/auth/register` and `/auth/login`.

### Auth
| Method | Path                  | Body                                  |
|--------|-----------------------|---------------------------------------|
| POST   | `/api/auth/register`  | `{ name, email, password, org? }`     |
| POST   | `/api/auth/login`     | `{ email, password }`                 |
| GET    | `/api/auth/me`        | —                                     |

### Events
| Method | Path                        | Notes                         |
|--------|-----------------------------|-------------------------------|
| GET    | `/api/events`               | `?status=&category=&search=`  |
| GET    | `/api/events/stats`         | Portfolio statistics          |
| GET    | `/api/events/:id`           | Includes populated guests     |
| POST   | `/api/events`               | Create event                  |
| PUT    | `/api/events/:id`           | Update any field              |
| DELETE | `/api/events/:id`           | Permanent delete              |
| POST   | `/api/events/:id/agenda`    | Append agenda item            |

### Guests
| Method | Path                | Notes                    |
|--------|---------------------|--------------------------|
| GET    | `/api/guests`       | `?rsvp=&role=&search=`   |
| POST   | `/api/guests`       | `{ ...guest, eventId? }` |
| PUT    | `/api/guests/:id`   | Update RSVP, role, etc.  |
| DELETE | `/api/guests/:id`   | Remove guest             |
| POST   | `/api/guests/bulk`  | `{ guests[], eventId? }` |

### AI
| Method | Path                      | Body                                          |
|--------|---------------------------|-----------------------------------------------|
| POST   | `/api/ai/chat`            | `{ messages[], eventContext? }`               |
| POST   | `/api/ai/generate-event`  | `{ prompt }`                                  |
| POST   | `/api/ai/generate-agenda` | `{ eventId, duration?, focus? }`              |
| POST   | `/api/ai/suggest-venues`  | `{ city, guests, category, budget }`          |
| POST   | `/api/ai/analyze`         | — (reads user's events automatically)         |

---

## ✨ Features

- **🤖 AI Event Generation** — Describe an event in plain English; Claude fills all details
- **📋 AI Agenda Builder** — One click generates a professional programme for any event
- **🏛️ Venue Suggestions** — AI recommends venues by city, category, guest count, and budget
- **💬 Persistent AI Chat** — Context-aware assistant knows your live event data
- **📊 Analytics Dashboard** — Recharts: category breakdown, status distribution, budget vs. spent, RSVP rates
- **📅 Calendar View** — Month grid with click-through to event detail
- **👥 Guest Directory** — Full RSVP management, role assignment, bulk import
- **🔐 JWT Auth** — Secure register/login, bcrypt password hashing, protected routes
- **🌐 Serverless** — Scales to zero, no server to manage, cold starts < 1s on Vercel

---

*Built with ✦ Evara AI — Claude claude-sonnet-4 · React 18 · Vercel Serverless · MongoDB Atlas*
