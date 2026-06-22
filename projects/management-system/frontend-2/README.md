# FieldFlow360 Frontend

Modern contractor management system built with Next.js 15, React 19, and TypeScript. Features real-time collaboration, advanced data visualization, and comprehensive project management tools.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router) with Turbopack
- **UI**: React 19, Tailwind CSS 4, Radix UI, shadcn/ui
- **State Management**: TanStack Query, React Context
- **Authentication**: Auth0
- **Real-time**: WebSocket integration
- **Analytics**: PostHog
- **Payments**: Stripe
- **Data Visualization**: Recharts
- **Maps**: Google Maps API

## 📋 Prerequisites

- Node.js 22+ (Alpine 3.19 for Docker)
- npm or yarn
- Backend API running (see `/backend`)

## 🛠️ Setup

1. **Clone and navigate:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment:**

   ```bash
   cp .env.example .env.local
   ```

   Fill in required values:
   - Auth0 credentials
   - API endpoints (dev/staging/prod)
   - Optional: PostHog, Google Maps, Stripe keys

4. **Run development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 📦 Scripts

```bash
npm run dev      # Start dev server with Turbopack
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

## ✅ Linting & Formatting

### How to run lint

```bash
# From management-system/frontend
npm run lint
```

### What ESLint is responsible for vs Prettier

- **ESLint**: code-quality rules and correctness checks (TypeScript rules, React Hooks rules, unused variables/imports, Next.js recommended rules, etc). This is what `npm run lint` enforces.
- **Prettier**: code formatting only (whitespace, semicolons, line wrapping). It does **not** catch logic issues.

Notes:

- The repo uses a **Husky pre-commit hook** that runs `npm run format` (Prettier) and stages the result automatically.
- You can run Prettier manually with:

```bash
npm run format
npm run format:check
```

## 🐳 Docker

```bash
docker build --build-arg NEXT_PUBLIC_API_URL=<url> -t ff-frontend .
docker run -p 3000:3000 ff-frontend
```

## 🏗️ Project Structure

```
app/              # Next.js App Router pages
components/       # Reusable UI components
hooks/            # Custom React hooks
lib/              # Utility libraries
providers/        # App-level providers
types/            # TypeScript definitions
utils/            # Helper functions
```

## 🔑 Key Features

- **Multi-tenant Architecture**: Crew and project management
- **Real-time Chat**: WebSocket-based messaging system
- **Advanced Analytics**: Performance dashboards and reports
- **Document Management**: PDF generation and file handling
- **Booking System**: Schedule and resource management
- **Responsive Design**: Mobile-first, dark mode support

## 🔒 Security

- Auth0 integration for authentication
- Environment variables for sensitive data
- CORS configuration for API security
- Secure WebSocket connections (WSS)

## 🚢 Deployment

The app uses `output: 'standalone'` for optimized Docker deployments. Configure build args in your CI/CD pipeline matching `.env.example` structure.

## 📄 License

Private - FieldFlow360
