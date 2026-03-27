# BetCard

> A full-stack betting game with a casino-style UI, wallet system, admin panel, and cookie-based authentication.

BetCard is a two-part app:

- `frontend` built with React + Vite
- `backend` built with Express + MongoDB

Players can register, manage wallet balance, play the card-matching betting game, and update their profile. Admin users can monitor platform stats and manage user balances.

## Why This Project Feels Good

- Fast React frontend with a custom themed interface
- Express API with MongoDB persistence
- JWT auth stored in HTTP-only cookies
- Wallet, transactions, and admin tools
- Deployment-ready for `Vercel + Render`

## Core User Flow

1. Create an account or log in
2. Add money to the wallet
3. Start a game with a bet
4. Match cards across both rows
5. Win a payout or lose the stake

## Feature Highlights

### Player Features

- User registration and login
- Persistent session using cookies
- Wallet deposit and withdraw flow
- Transaction history
- Profile editing for:
  `name`, `gamer ID`, `email`, and `phone`
- Card-matching betting game

### Admin Features

- View all users
- View total user count
- View total balance across the system
- View total deposited amount
- Adjust any user's balance

## Tech Stack

### Frontend

- React
- Vite
- Axios
- Plain CSS

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- Cookie-based sessions
- bcryptjs

## Project Structure

```text
BetCard/
  backend/
    src/
      config/        # Environment and MongoDB connection
      controllers/   # Request handlers
      middleware/    # Auth, admin, and error middleware
      models/        # Mongoose schemas
      routes/        # API route definitions
      services/      # Game logic helpers
      utils/         # JWT cookie helpers
      app.js         # Express app setup
      server.js      # Server bootstrap
  frontend/
    public/          # Static assets
    src/
      api/           # Axios instance
      components/    # Reusable UI parts
      context/       # Auth state management
      pages/         # Auth, game, wallet, profile, admin
      routes/        # Top-level app flow
      styles/        # Global styling
```

## Game Rules

The main game logic lives in `backend/src/services/gameService.js`.

- Each game contains `5` hidden numbers in two rows
- Row 2 is shuffled so it does not match Row 1 visually
- The player places a bet before starting
- The player picks one card in Row 1 and one in Row 2
- Matching cards stay revealed
- Wrong picks increase the attempt counter and reshuffle unmatched cards
- Maximum attempts: `15`
- Maximum bet: `5000`
- Win multiplier: `3x`
- Matching all pairs wins the game

## Authentication

Authentication uses a JWT stored in an HTTP-only cookie named `token`.

- Login and register both issue a token
- Protected routes read the token from cookies
- Admin routes require `role === "admin"`
- Session duration is `7 days`
- Cross-site production cookies are supported for Render + Vercel deployment

## Wallet and Transactions

Wallet behavior:

- Deposits increase balance immediately
- Withdrawals reduce balance and create a `pending` transaction
- Bets create a `bet` transaction
- Wins create a `win` transaction
- Admin edits create an `adjustment` transaction

Supported transaction types:

- `deposit`
- `withdraw`
- `bet`
- `win`
- `adjustment`

## API Overview

Base route prefix: `/api`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `POST /api/auth/logout`

### Wallet

- `GET /api/wallet`
- `POST /api/wallet/deposit`
- `POST /api/wallet/withdraw`

### Game

- `POST /api/game/start`
- `POST /api/game/select-row1`
- `POST /api/game/select-row2`
- `GET /api/game/:gameId`

### Admin

- `GET /api/admin/users`
- `GET /api/admin/stats`
- `PATCH /api/admin/user/:id`

### Health

- `GET /api/health`

## Local Setup

### 1. Install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

### 2. Configure environment variables

Backend `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
```

Frontend `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start the backend

```bash
cd backend
npm run dev
```

### 4. Start the frontend

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Database Persistence

User registrations, profile changes, wallet activity, games, and transactions are stored in MongoDB through the `MONGO_URI` value used by the backend.

That means:

- local development writes to the database in `backend/.env`
- deployed production writes to the database configured in Render

## Deployment

Recommended production setup:

- `frontend` on Vercel
- `backend` on Render

This repo already includes a root-level `render.yaml` for the backend service.

## Deploy Backend to Render

If you are using the dashboard manually:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

Set these environment variables in Render:

```env
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=https://your-frontend-project.vercel.app
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
```

After deploy, test:

```text
https://your-render-backend.onrender.com/api/health
```

## Deploy Frontend to Vercel

In Vercel:

- import the same GitHub repository
- set Root Directory to `frontend`
- keep the detected Vite settings

Add this environment variable:

```env
VITE_API_URL=https://your-render-backend.onrender.com/api
```

## Production URL Pairing

Use the final production URLs like this:

```env
# Render backend
CLIENT_URL=https://betcard-frontend.vercel.app

# Vercel frontend
VITE_API_URL=https://betcard-backend.onrender.com/api
```

## Important Cookie Notes

- `SameSite=None` is required because Vercel and Render run on different domains
- `Secure=true` is required when using `SameSite=None`
- `CLIENT_URL` must exactly match your Vercel frontend domain
- if `CLIENT_URL` is wrong, login may fail even though the API is live

For the most reliable production auth, use your main Vercel production domain instead of a temporary preview URL.

## Data Models

### User

- `name`
- `username`
- `email`
- `phone`
- `password`
- `balance`
- `role`
- `totalDeposited`
- `totalWithdrawn`

### Game

- `user`
- `bet`
- `multiplier`
- `row1`
- `row2`
- `matchedCount`
- `attempts`
- `maxAttempts`
- `status`
- `selectedRow1Index`

### Transaction

- `user`
- `type`
- `amount`
- `status`
- `note`

## Frontend App Flow

The frontend uses a small app-shell flow instead of a full URL-driven page system.

- unauthenticated users see the auth page
- regular users can switch between `Game`, `Wallet`, and `Profile`
- admin users are taken to the admin page
- `AuthContext` restores the session from `/auth/me`

## Scripts

### Backend

- `npm run dev` - start backend with nodemon
- `npm start` - start backend with Node.js

### Frontend

- `npm run dev` - start Vite dev server
- `npm run build` - create production build
- `npm run preview` - preview the production build
- `npm run lint` - run ESLint

## Notes

- CORS is enabled for the configured frontend URL
- frontend API calls use `withCredentials: true`
- the UI styling lives in `frontend/src/styles/global.css`
- the backend exposes a health endpoint at `/api/health`
