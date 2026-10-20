# StoreRank — Production Store Rating Web Application

A complete, production-ready full-stack Store Rating Web Application built with **Next.js (App Router)**, **NestJS**, **MongoDB (Mongoose)**, and **Tailwind CSS**.

The platform provides a transparent, secure environment where registered shoppers can discover stores, view community ratings, submit 1–5 star reviews, and update their ratings. Store owners can log in to a dedicated dashboard to monitor store performance, average ratings, and review detailed lists of customers who rated their store.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture & Design](#architecture--design)
4. [Folder Structure](#folder-structure)
5. [Database Design](#database-design)
6. [API Endpoints](#api-endpoints)
7. [Environment Variables](#environment-variables)
8. [Installation & Setup](#installation--setup)
9. [Running the Application](#running-the-application)
10. [Automated Testing](#automated-testing)
11. [Pre-configured Test Credentials](#pre-configured-test-credentials)
12. [Deployment Guide](#deployment-guide)
13. [Screenshots](#screenshots)

---

## 1. Features

### For Normal Users (`USER`)
- **Secure Registration & Login**: Validated registration with strict password policies and bcrypt hashing.
- **Store Directory & Live Search**: Case-insensitive instant search by store name or address.
- **Star Rating System**: Intuitive 1–5 star interactive rating UI.
- **One Rating Per Store**: Automatic enforcement of single rating per user/store with conflict prevention.
- **Update Existing Ratings**: Edit previously submitted ratings at any time.
- **Personal Shopper Dashboard**: View profile details, review history, and update ratings directly.

### For Store Owners (`OWNER`)
- **Role-based Security**: Strict backend RBAC enforcement preventing unauthorized user access.
- **Store Performance Metrics**: Real-time average rating calculation and total review counts.
- **Customer Feedback Breakdown**: Detailed table displaying customer name, email, rating, and submission timestamp.
- **Owner Data Isolation**: Owners can only view data and customer ratings for stores they own.

### General & Architecture Highlights
- **Zero-config Local Dev**: Built-in support for `mongodb-memory-server` for instant local testing, along with native support for MongoDB Atlas and local MongoDB instances.
- **Clean NestJS Modular Architecture**: Independent modules for Auth, Users, Stores, Ratings, and Seed data.
- **Strict Validation**: DTO validations using `class-validator` and `class-transformer`.
- **Responsive & Modern UI**: Built with Tailwind CSS, dark mode support, and micro-animations.

---

## 2. Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | NestJS 12, TypeScript, REST API, Mongoose, Passport JWT, Bcrypt |
| **Database** | MongoDB / MongoDB Atlas (with in-memory fallback for local dev) |
| **Testing** | Vitest, Supertest, MongoMemoryServer |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |

---

## 3. Architecture & Design

The application follows a clean separation of concerns between client and server:

```text
[ Next.js Frontend (Client/SSR) ]
             |
             | HTTP / REST (JWT Bearer Token)
             v
[ NestJS Backend (Controllers -> Services -> Repositories) ]
             |
             | Mongoose ODM
             v
[ MongoDB Database (Atlas / In-Memory) ]
```

- **Authentication**: Stateless JWT tokens containing `{ sub, email, role }`.
- **Authorization**: `@Roles('USER' | 'OWNER')` decorator combined with `RolesGuard` verifies permissions before controller actions execute.
- **Aggregations**: Store average ratings are calculated via MongoDB aggregation pipelines (`$group` with `$avg` and `$sum`), avoiding in-memory arithmetic over large datasets.

---

## 4. Folder Structure

```text
shop-rating-platform/
├── .gitignore
├── README.md
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   └── strategies/
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.module.ts
│   │   │   ├── dto/
│   │   │   └── schemas/
│   │   ├── stores/
│   │   │   ├── stores.controller.ts
│   │   │   ├── owner.controller.ts
│   │   │   ├── stores.service.ts
│   │   │   ├── stores.module.ts
│   │   │   ├── dto/
│   │   │   └── schemas/
│   │   ├── ratings/
│   │   │   ├── ratings.controller.ts
│   │   │   ├── ratings.service.ts
│   │   │   ├── ratings.module.ts
│   │   │   ├── dto/
│   │   │   └── schemas/
│   │   ├── seed/
│   │   │   ├── seed.service.ts
│   │   │   └── seed.module.ts
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   ├── guards/
│   │   │   └── interfaces/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   │   └── platform.spec.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx          # Store listing & search
    │   ├── login/page.tsx    # Login page
    │   ├── register/page.tsx # Register page
    │   ├── dashboard/page.tsx# User ratings dashboard
    │   └── owner/page.tsx    # Owner management portal
    ├── components/
    │   ├── Navbar.tsx
    │   ├── StarRating.tsx
    │   ├── StoreCard.tsx
    │   └── RatingModal.tsx
    ├── context/
    │   └── AuthContext.tsx
    ├── lib/
    │   └── api.ts
    ├── types/
    │   └── index.ts
    ├── .env.example
    ├── package.json
    └── tsconfig.json
```

---

## 5. Database Design

### User Collection (`users`)
```typescript
{
  _id: ObjectId,
  name: string,         // 5–60 characters
  email: string,        // unique, lowercase, trimmed
  address: string,      // max 400 characters
  passwordHash: string, // bcrypt hash
  role: 'USER' | 'OWNER',
  createdAt: Date,
  updatedAt: Date
}
```

### Store Collection (`stores`)
```typescript
{
  _id: ObjectId,
  name: string,         // 2–100 characters
  address: string,      // max 400 characters
  ownerId: ObjectId,    // References User (_id)
  createdAt: Date,
  updatedAt: Date
}
```

### Rating Collection (`ratings`)
```typescript
{
  _id: ObjectId,
  userId: ObjectId,     // References User (_id)
  storeId: ObjectId,    // References Store (_id)
  rating: number,       // Integer from 1 to 5
  createdAt: Date,
  updatedAt: Date
}
```
**Compound Index**: Unique index on `{ userId: 1, storeId: 1 }` guarantees that a user cannot submit duplicate ratings for the same store.

---

## 6. API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/auth/register` | Register new user or owner | Public |
| `POST` | `/auth/login` | Login with credentials and receive JWT | Public |
| `GET` | `/auth/me` | Fetch authenticated user profile | Authenticated |
| `POST` | `/auth/logout` | Invalidate / clear session | Authenticated |

### Stores
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/stores?search=query` | List stores with average rating & search | Public / Optional Auth |
| `GET` | `/stores/:id` | Get store details and rating | Public / Optional Auth |
| `POST` | `/stores` | Create store | `OWNER` only |

### Ratings
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/stores/:storeId/ratings` | Submit 1–5 star rating | `USER` only |
| `PATCH` | `/stores/:storeId/ratings` | Update previously submitted rating | `USER` only (Owner of rating) |
| `GET` | `/stores/:storeId/ratings/me` | Get current user's rating for store | `USER` only |
| `GET` | `/ratings/my-ratings` | Get all ratings submitted by user | `USER` only |

### Owner Portal
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/owner/dashboard` | Stores, average rating, reviews with user details | `OWNER` only |

---

## 7. Environment Variables

### Backend (`backend/.env`)
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shop-rating-platform
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```
> **Note**: If `MONGODB_URI` is omitted during local development, the backend will automatically launch an in-memory MongoDB server so you can test immediately with zero external dependencies!

### Frontend (`frontend/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 8. Installation & Setup

### Prerequisites
- Node.js >= 18.x (v20+ recommended)
- npm >= 9.x

### 1. Clone Repository
```bash
git clone https://github.com/your-username/shop-rating-platform.git
cd shop-rating-platform
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env.local
```

---

## 9. Running the Application

### Start Backend Development Server
```bash
cd backend
npm run start:dev
```
Backend runs on `http://localhost:5000`. Demonstrative seed data will be populated automatically on the first boot.

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3000`.

---

## 10. Automated Testing

The backend includes a comprehensive Vitest & Supertest suite covering all 24 acceptance criteria:
- User registration & duplicate email rejection
- Strict name, address, and password validation checks
- Login validation & token generation
- Store listing and case-insensitive search
- Rating creation, updates, and conflict checks (409)
- Integer rating constraints (1–5)
- Owner dashboard metrics and RBAC role protections (403 for non-owners)

Run tests:
```bash
cd backend
npm test
```

---

## 11. Pre-configured Test Credentials

On initial boot, the database automatically seeds demonstration accounts:

| Role | Email | Password | Details |
|---|---|---|---|
| **OWNER** | `owner@example.com` | `Password@123` | Store Owner Master User (owns 3 stores) |
| **USER** | `alice@example.com` | `Password@123` | Alice Verified Shopper One |
| **USER** | `bob@example.com` | `Password@123` | Bob Enthusiast Reviewer Two |

*Password requirements satisfy all validation rules: 8–16 chars, at least 1 uppercase, at least 1 special character.*

---

## 12. Deployment Guide

### Backend on Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
4. Add Environment Variables in Render:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (`mongodb+srv://...`)
   - `JWT_SECRET`: A secure random secret string
   - `JWT_EXPIRES_IN`: `7d`
   - `FRONTEND_URL`: URL of your deployed Next.js frontend (e.g. `https://your-app.vercel.app`)
   - `PORT`: `5000`

### Frontend on Vercel
1. Import your repository into [Vercel](https://vercel.com).
2. Configure settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: URL of your deployed Render backend (e.g. `https://your-api.onrender.com`)
4. Deploy!

### MongoDB Atlas Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. In **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere) or specific Render IPs.
3. In **Database Access**, create a user with read/write privileges.
4. Copy the connection string into the backend `MONGODB_URI` environment variable.

---

## 13. Screenshots

*(Screenshots will be captured and displayed below showcasing the landing page, rating modal, user dashboard, and owner analytics portal.)*

---

## License
MIT License.
