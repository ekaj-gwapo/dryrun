# Transaction Management System

A simple two-user transaction management system with data entry and viewing roles using pure SQLite.

## Quick Start - 3 Simple Commands!

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed Demo Users
```bash
npm run db:seed
```

This will:
- Create the SQLite database file at `data.db`
- Create all required tables automatically
- Insert two demo users with sample transaction data

### 3. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` and login!

## Demo Credentials

**Data Entry User:**
- Email: `entry@demo.com`
- Password: `Demo123456!`

**Viewer User:**
- Email: `viewer@demo.com`
- Password: `Demo123456!`

## Features

- **Entry User Dashboard** - Input transaction data (bank name, payee, amount, etc.)
- **Viewer Dashboard** - View assigned transactions with sorting by date, code, amount
- **Print Reports** - Generate professional transaction reports
- **Logo Upload** - Add company branding to your system
- **Role-Based Access** - Secure separation between entry users and viewers

## Project Structure

```
├── app/
│   ├── auth/
│   │   └── login/page.tsx        # Login page
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts     # Auth endpoint
│   │   │   └── logout/route.ts    # Logout endpoint
│   │   ├── transactions/route.ts  # Transaction CRUD
│   │   └── viewer-assignments/    # Viewer access management
│   ├── entry-dashboard/           # Data entry interface
│   └── viewer-dashboard/          # Data viewing interface
├── lib/
│   └── db.ts                       # SQLite database utility
├── scripts/
│   ├── init-db.js                 # Create tables
│   └── seed.js                     # Seed demo users
├── data.db                         # SQLite database (auto-created)
└── .env.local                      # Configuration
```

## Database

The SQLite database (`data.db`) is automatically created in your project root on first run. It contains:
- **users** - Stores login credentials and user roles
- **transactions** - Stores all transaction data
- **viewer_access** - Maps which viewers can see which entry users' data

## Troubleshooting

**"SQLITE_ERROR: no such table" error?**
- Run `npm run db:init` to create tables, then `npm run db:seed` to add demo data

**Port 3000 already in use?**
- Run on a different port: `PORT=3001 npm run dev`

**Want to reset everything?**
- Delete `data.db` and run `npm run db:seed` again

That's it! No Docker, no PostgreSQL, no Prisma - just pure SQLite with npm install and you're ready to go.
