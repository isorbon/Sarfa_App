# 💰 Sarfa - Personal Expense Tracker

A modern, full-stack expense tracking web application built with React + TypeScript and Node.js + SQLite.

![Expensify Dashboard](https://img.shields.io/badge/Status-Production%20Ready-success)
![Version](https://img.shields.io/badge/Version-1.2.2-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Features

- ✅ **Secure Authentication** - JWT-based login/registration system
- 📊 **Interactive Dashboard** - Real-time statistics and data visualization
- 💶 **EUR Currency** - All amounts tracked in Euros
- 📈 **Beautiful Charts** - Monthly trends and category breakdowns
- 🎨 **Icon Customization** - 100+ icons to choose from for each expense
- 🔍 **Smart Filtering** - Search and filter by date, category, and more
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- 👨‍👩‍👧‍👦 **Family Support** - Multiple user accounts for family members
- ☁️ **Remote Hosting Ready** - Easy deployment to any cloud platform

## 🆕 What's New in v1.2.2

- **Dashboard Refinements**:
  - Aligned stat block content with Goals block for better visual harmony.
  - Removed background colors from dashboard stat icons for a cleaner look.
  - Adjusted font sizes for headers to improve responsiveness on laptop screens.
- **Goals Feature Enhancements**:
  - Integrated image cropping for Goal uploads (max 512x512px).
  - Fixed backend payload handling for goal creation/editing.
  - Improved goal images display logic.
- **UX/UI Polish**:
  - Enhanced empty states for "All Expenses" page with consistent styling.
  - Made application logo clickable, linking to the dashboard on both desktop and mobile.
  - Standardized styling of "SARFA" text in mobile header to match desktop brand identity.

## 🆕 What's New in v1.2.1

- **Localization Improvements**:
  - Extensive language support added (25+ languages).
  - Enhanced Language Switcher with country flags and native/English names.
- **Mobile-Friendly Updates**:
  - Implemented Avatar Cropping feature for profile images.
  - Improved responsive layouts for better mobile experience.
  - Fixed mobile navigation and header issues.
- **UX Enhancements**:
  - Consistent Design System applied to Settings, Cards, and Bills pages.

## 🆕 What's New in v1.2.0

- **Cards Management System**:
  - Dedicated Cards page for managing credit/debit cards
  - Add, edit, and delete cards with name and bank information
  - Link expenses to specific cards when using Credit Card payment mode
  - Card selection dropdown in expense form (visible when Credit Card is selected)
- **Enhanced UX/UI**:
  - Consistent purple gradient headers across all pages
  - Theme toggle moved to page headers for easier access
  - Removed redundant time/date display from headers
  - Floating Action Button (FAB) added to All Expenses and Cards pages
  - Cash set as default payment mode for better workflow
- **Modal Improvements**:
  - Fixed modal z-index conflicts for better layering
  - Centered modals with proper backdrop
  - Confirmation modals for destructive actions (delete cards)
  - Dark mode compatibility for all modals and components
- **Navigation Updates**:
  - Cards menu item moved before Investment in sidebar
  - Updated payment mode options (removed UPI, added Digital Wallet and Other)
- **Backend Enhancements**:
  - New cards table with user-specific card storage
  - Added card_id foreign key to expenses table
  - Complete CRUD API for cards management
  - Enhanced expense endpoints to support card linking

## 🆕 What's New in v1.1.0

- **Advanced Dashboard Analytics**:
  - Independent filters for charts: Recent, 3 Months, 6 Months, Current Month, Current Year, and Last Year.
  - Improved data visualization with separate controls for Monthly Trends and Category Breakdown.
  - Scrollable lists for Recent Expenses and Subscriptions displaying complete history.
- **Enhanced UX/UI**:
  - Sticky headers for data tables for better readability.
  - Delete confirmation modals to prevent accidental data loss.
  - Localized date formatting to ensure accurate reporting across timezones.
- **Profile Management**:
  - Support for custom avatar uploads.
  - Profile settings updates.
- **Cards Management**:
  - Dedicated view for managing credit/debit cards (if added).

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd expenses
```

2. **Install backend dependencies**
```bash
cd server
npm install
```

3. **Install frontend dependencies**
```bash
cd ..
npm install
```

### Running the Application

1. **Start the backend server** (Terminal 1)
```bash
cd server
npm start
```
Server runs on `http://localhost:3001`

2. **Start the frontend** (Terminal 2)
```bash
npm run dev
```
Application runs on `http://localhost:5173`

3. **Open your browser**
Navigate to `http://localhost:5173`

### Demo Credentials

- **Email**: `demo@expenses.com`
- **Password**: `demo123`

## 🏗️ Tech Stack

### Frontend
- ⚛️ **React 18** - UI library
- 📘 **TypeScript** - Type safety
- ⚡ **Vite** - Build tool
- 🎨 **Vanilla CSS** - Styling
- 📊 **Recharts** - Data visualization
- 🎯 **Lucide React** - Icon library
- 🛣️ **React Router** - Navigation

### Backend
- 🚀 **Express** - Web framework
- 🗄️ **SQLite3** - Database
- 🔐 **JWT** - Authentication
- 🔒 **bcryptjs** - Password hashing
- 🌐 **CORS** - Cross-origin support

## 📂 Project Structure

```
expenses/
├── server/              # Backend API
│   ├── server.js        # Express server
│   ├── database.js      # Database setup
│   └── expenses.db      # SQLite database
├── src/                 # Frontend source
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── context/         # React context
│   ├── services/        # API services
│   └── types/           # TypeScript types
├── public/              # Static assets
└── index.html           # HTML template
```

## 🎯 Key Features Explained

### 1. Dashboard
- **4 Statistics Cards**: Account Balance, Monthly Expenses, Total Investment, Goal Tracker
- **Monthly Expenses Chart**: 6-month bar chart showing spending trends
- **Category Breakdown**: Donut chart with interactive legend
- **Recent Expenses**: Table showing last 5 transactions
- **Bill & Subscription Tracker**: Recurring payment monitoring

### 2. Expense Management
- Add expenses with amount, category, sub-category, description, icon, date, and payment mode
- Edit existing expenses
- Delete expenses
- Search and filter functionality
- 6 predefined categories with custom colors

### 3. Categories
1. 🥬 Food & Grocery
2. 📈 Investment
3. 🛍️ Shopping
4. ✈️ Travelling
5. 📦 Miscellaneous
6. 💳 Bill & Subscription

## 🔐 Security

- Passwords hashed with bcryptjs (10 rounds)
- JWT tokens for stateless authentication
- Protected API routes
- Input validation on both frontend and backend
- CORS configuration for production

## 🌐 Deployment

### Backend Deployment

The application can be deployed to:
- Heroku
- DigitalOcean
- AWS (EC2, Elastic Beanstalk)
- Azure App Service

**Production Checklist:**
- [ ] Set secure `JWT_SECRET` environment variable
- [ ] Consider migrating from SQLite to PostgreSQL/MySQL
- [ ] Enable HTTPS
- [ ] Configure CORS for your domain
- [ ] Set up database backups

### Frontend Deployment

Compatible with:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

**Build for production:**
```bash
npm run build
```

## 📊 API Documentation

### Authentication

**Register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Expenses

**Get All Expenses**
```http
GET /api/expenses?startDate=2025-01-01&endDate=2025-12-31&category=Shopping
Authorization: Bearer <token>
```

**Create Expense**
```http
POST /api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50.50,
  "category": "Food & Grocery",
  "sub_category": "Restaurant",
  "description": "Dinner",
  "icon": "UtensilsCrossed",
  "date": "2025-06-15",
  "mode": "Card"
}
```

**Update Expense**
```http
PUT /api/expenses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 60.00,
  ...
}
```

**Delete Expense**
```http
DELETE /api/expenses/:id
Authorization: Bearer <token>
```

### Dashboard

**Get Statistics**
```http
GET /api/dashboard/stats?period=month
Authorization: Bearer <token>
```

Periods: `recent`, `month`, `year`

## 🛠️ Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Backend:**
- `npm start` - Start server
- `npm run dev` - Start with auto-reload (if configured)

### Environment Variables

Create `.env` file in `server/` directory:

```env
PORT=3001
JWT_SECRET=your-super-secret-key-change-in-production
NODE_ENV=development
```


## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Created with ❤️ for managing personal and family expenses.

## 🙏 Acknowledgments

- Design inspiration from modern fintech applications
- Icons by [Lucide](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)
- Font by [Google Fonts (Inter)](https://fonts.google.com/specimen/Inter)

---

**Happy Expense Tracking! 💰📊**
