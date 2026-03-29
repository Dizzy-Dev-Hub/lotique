# Lotique - Luxury Auction Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/NestJS-10-red?style=for-the-badge&logo=nestjs" alt="NestJS">
  <img src="https://img.shields.io/badge/MongoDB-6-green?style=for-the-badge&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Socket.io-4-black?style=for-the-badge&logo=socket.io" alt="Socket.io">
</p>

<p align="center">
  <strong>A bespoke digital auction house engineered for high-value luxury assets.</strong>
</p>

<p align="center">
  Jewelry • Watches • Fine Art • Antiques • Collectibles • Automobiles
</p>

---

## 🎯 Overview

**Lotique** is a production-ready, single-seller luxury auction platform designed to command authority and extract maximum value from every lot. Built with modern web technologies, it provides a secure, elegant, and feature-rich environment for high-stakes bidding.

Whether you're auctioning a $25,000 Rolex or a $500,000 vintage Ferrari, Lotique delivers the trust, exclusivity, and control that luxury markets demand.

## ✨ Features

### 🎨 Elite Buyer Experience

| Feature | Description |
|---------|-------------|
| **Real-time Bidding** | WebSocket-powered instant updates - see bids as they happen |
| **Anti-Snipe Protection** | Clock extends when bids placed in final minutes - deepest pockets win |
| **Buy Now Option** | Skip the auction with instant purchase at a fixed price |
| **Wallet System** | Deposit funds to unlock premium high-value auctions |
| **Bidder Reputation** | Track record of wins, payments, and reliability scores |
| **Anonymous Bidding** | Privacy-first - bidders shown only as "Bidder #XXX" |
| **Watchlist** | Save favorite lots and get notifications before they close |

### 🛡️ Admin Power Suite

| Feature | Description |
|---------|-------------|
| **Full Dashboard** | Complete auction and user management at your fingertips |
| **Reserve Pricing** | Hidden minimum prices - "Reserve Not Met" if threshold isn't reached |
| **Private Auctions** | Password-protected rooms for your most exclusive clientele |
| **Dynamic Scheduling** | Drip-feed inventory in waves to keep bidders returning daily |
| **Financial Gatekeeping** | Require deposits for high-value lots to filter serious buyers |
| **One-Strike Blacklist** | Ban non-paying winners instantly by email and IP |

### 🔐 Security & Trust

- **Bidder Identity Shielding** - Protect wealthy clients' privacy
- **Deposit Requirements** - Prove bidders are serious before they bid
- **JWT Authentication** - Industry-standard secure auth
- **Admin-Only Endpoints** - Protected routes for sensitive operations

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS, Zustand |
| **Backend** | NestJS 10, TypeScript, Mongoose ODM |
| **Database** | MongoDB 6+ |
| **Real-time** | Socket.io WebSockets |
| **Auth** | JWT + bcrypt password hashing |
| **API Docs** | Swagger/OpenAPI |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/lotique.git
cd lotique
```

2. Install backend dependencies

```bash
cd backend
npm install
```

3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

4. Configure environment variables

Backend `.env`:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/lotique
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

Frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

5. Start the development servers

Backend:

```bash
cd backend
npm run start:dev
```

Frontend:

```bash
cd frontend
npm run dev
```

6. Open http://localhost:3000

### Default Accounts

- **Admin**: admin@lotique.com / Admin123!
- **Bidder**: bidder@test.com / Bidder123!

## Project Structure

```
lotique/
├── backend/           # NestJS API server
│   ├── src/
│   │   ├── common/    # Guards, decorators, filters
│   │   ├── modules/   # Feature modules (auth, users, auctions, bids)
│   │   └── schemas/   # Mongoose schemas
│   └── package.json
│
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/# React components
│   │   ├── hooks/     # Custom hooks
│   │   ├── services/  # API services
│   │   ├── store/     # Zustand state
│   │   └── types/     # TypeScript types
│   └── package.json
│
└── README.md
```

## API Documentation

When running, visit http://localhost:3001/api/docs for Swagger documentation.

## 🗺️ Roadmap

- [ ] Stripe/PayPal payment integration
- [ ] Email & SMS notifications (Twilio/SendGrid)
- [ ] Condition report PDF generation
- [ ] AR "In-Room" preview for mobile
- [ ] Live "Gavel Room" video streaming
- [ ] Automated retargeting emails
- [ ] Multi-language support

## 📄 License

MIT License - feel free to use this for your own auction platform.

---

<p align="center">
  <strong>Built with ❤️ for the luxury market</strong>
</p>
