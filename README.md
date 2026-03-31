# ✦ Evara AI — Events Organizer

A full-stack AI-powered event management application built with React, Node.js/Express, MongoDB, and the Anthropic Claude API.

---

## 🚀 Tech Stack

| Layer       | Technologies                                              |
|-------------|-----------------------------------------------------------|
| **Frontend**  | React 18, TypeScript, Vite, React Router v6, Zustand      |
| **UI/Charts** | Recharts, Google Fonts, Custom CSS Design System          |
| **Backend**   | Node.js, Express 4, MongoDB, Mongoose                     |
| **Auth**      | JWT (jsonwebtoken + bcryptjs)                             |
| **AI**        | Anthropic Claude (claude-sonnet-4) via SDK               |
| **Security**  | Helmet, CORS, express-rate-limit                          |

---

## 📁 Project Structure

```
evara-ai/
├── client/                  # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── api/             # Axios API client + endpoint wrappers
│   │   ├── components/      # Layout, AIPanel, shared components
│   │   ├── pages/           # Dashboard, Events, EventDetail, Guests, Calendar, Analytics
│   │   ├── store/           # Zustand global state (auth, events, guests, AI)
│   │   ├── App.tsx          # Router with public/private routes
│   │   └── index.css        # Design system CSS variables
│   ├── index.html
│   └── vite.config.ts       # Proxy /api → localhost:5000
│
├── server/                  # Express backend
│   ├── config/db.js         # MongoDB connection
│   ├── middleware/auth.js   # JWT protection middleware
│   ├── models/              # Mongoose schemas (User, Event, Guest)
│   ├── routes/
│   │   ├── auth.js          # Register / Login / Me
│   │   ├── events.js        # Full CRUD + agenda
│   │   ├── guests.js        # Guest CRUD + bulk import
│   │   └── ai.js            # AI chat, generate event, agenda, venues, analysis
│   └── index.js             # Express app entry point
│
└── package.json             # Root monorepo scripts
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Anthropic API key

### 1. Clone & Install

```bash
git clone <your-repo-url> evara-ai
cd evara-ai
npm run install:all
```

### 2. Configure Environment Variables

**Server** — copy and fill in `server/.env`:
```bash
cp server/.env.example server/.env
```

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/evara-ai
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
ANTHROPIC_API_KEY=sk-ant-...
CLIENT_URL=http://localhost:5173
```

**Client** — copy and fill in `client/.env`:
```bash
cp client/.env.example client/.env
```

```env
VITE_API_URL=http://localhost:5000/api
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run Development Servers

```bash
npm run dev
```

This starts:
- **Frontend** → http://localhost:5173
- **Backend**  → http://localhost:5000

---

## 🛠️ API Reference

### Auth
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| POST   | `/api/auth/register`  | Create account      |
| POST   | `/api/auth/login`     | Login + get JWT     |
| GET    | `/api/auth/me`        | Get current user    |

### Events
| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| GET    | `/api/events`                 | List events (filterable) |
| GET    | `/api/events/stats`           | Portfolio statistics     |
| GET    | `/api/events/:id`             | Get event + guests       |
| POST   | `/api/events`                 | Create event             |
| PUT    | `/api/events/:id`             | Update event             |
| DELETE | `/api/events/:id`             | Delete event             |
| POST   | `/api/events/:id/agenda`      | Add agenda item          |

### Guests
| Method | Endpoint           | Description          |
|--------|--------------------|----------------------|
| GET    | `/api/guests`      | List guests          |
| POST   | `/api/guests`      | Add guest            |
| PUT    | `/api/guests/:id`  | Update guest/RSVP    |
| DELETE | `/api/guests/:id`  | Remove guest         |
| POST   | `/api/guests/bulk` | Bulk import guests   |

### AI Endpoints
| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| POST   | `/api/ai/chat`              | AI assistant conversation          |
| POST   | `/api/ai/generate-event`    | Generate full event details        |
| POST   | `/api/ai/generate-agenda`   | Generate event agenda              |
| POST   | `/api/ai/suggest-venues`    | Suggest venues by city/category    |
| POST   | `/api/ai/analyze`           | Analyze event portfolio            |

---

## ✨ Key Features

- **🤖 AI Event Generation** — Describe any event in plain English; AI fills in all details (venue, date, agenda, budget)
- **📋 AI Agenda Builder** — One click generates a professional agenda for any event
- **🏛️ Venue Suggestions** — AI recommends venues by city, category, and guest count
- **💬 AI Chat Panel** — Persistent assistant with event context awareness
- **📊 Analytics Dashboard** — Recharts visualizations: categories, statuses, budgets, RSVP rates
- **📅 Calendar View** — Month-by-month event calendar with click-to-view
- **👥 Guest Management** — Full guest directory with RSVP tracking and event assignment
- **🔐 JWT Auth** — Secure registration/login with bcrypt password hashing
- **🛡️ Security** — Helmet, CORS, rate limiting on all routes

---

## 🗄️ MongoDB Schema Overview

**User**: name, email (unique), password (hashed), role, organization  
**Event**: name, description, date, time, venue{}, category, status, expectedGuests, budget{}, agenda[], tags[], color  
**Guest**: name, email (unique), phone, company, role, rsvp, events[]  

---

## 📦 Production Build

```bash
npm run build          # builds client/dist/
# Then serve client/dist/ with nginx or a CDN
# Set NODE_ENV=production in server/.env
```

---

## 🔧 Configuration Tips

- Use **MongoDB Atlas** for a cloud database (replace `MONGODB_URI`)
- Set `JWT_SECRET` to a long random string in production
- Add your Anthropic API key to unlock all AI features
- Rate limits: 100 req/15min globally, 20 AI req/min

---

*Built with ✦ Evara AI — Claude claude-sonnet-4 + React + Express + MongoDB*
