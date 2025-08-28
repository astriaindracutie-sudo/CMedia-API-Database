# CMedia Application Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- MariaDB/MySQL database
- npm or yarn package manager

## Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT secret
   ```

3. **Database Setup**
   ```bash
   # Import the database schema
   mysql -u your_username -p cmedia_db < db/database.sql
   
   # Optional: Seed the database with sample data
   npm run seed-db
   ```

4. **Start Backend Server**
   ```bash
   npm run dev
   # Server will start on http://localhost:3000
   ```

## Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Frontend Development Server**
   ```bash
   npm run dev
   # Frontend will start on http://localhost:5173
   ```

## Testing the Application

1. **Health Check**
   ```bash
   # From project root
   node health-check.js
   ```

2. **Access the Application**
   - Landing Page: http://localhost:5173
   - Customer Registration: http://localhost:5173/register
   - Customer Login: http://localhost:5173/login
   - Customer Dashboard: http://localhost:5173/dashboard (requires login)
   - Admin Panel: http://localhost:5173/admin (requires staff login)

## Key Features Implemented

### Customer Experience
- ✅ Landing page with service showcase
- ✅ Customer registration and login
- ✅ Customer dashboard with account management
- ✅ Service catalog browsing
- ✅ Password reset functionality
- ✅ Responsive design for all devices

### Backend API
- ✅ Customer and staff authentication (JWT)
- ✅ Service plans management
- ✅ Customer subscriptions
- ✅ Protected routes with role-based access
- ✅ Comprehensive error handling

## API Endpoints

### Authentication
- `POST /auth/register` - Customer registration
- `POST /auth/login` - Customer/Staff login
- `POST /auth/staff/register` - Staff registration
- `GET /auth/profile` - Get authenticated user profile

### Services
- `GET /service-plans` - Get all service plans
- `GET /service-plans/types` - Get service types

### Subscriptions (Customer)
- `GET /subscriptions` - Get current user's subscriptions (authenticated)
- `GET /subscriptions/customer/:customerId` - Get customer subscriptions

## Default Credentials

After running the database setup, you may need to create initial staff accounts through the database or use the staff registration endpoint.

## Troubleshooting

1. **Database Connection Issues**
   - Verify database credentials in `.env`
   - Ensure MariaDB/MySQL is running
   - Check database name exists

2. **CORS Issues**
   - Backend is configured for frontend on `http://localhost:5173`
   - If using different ports, update CORS settings in `backend/src/index.js`

3. **Port Conflicts**
   - Backend default: 3000
   - Frontend default: 5173
   - Change ports in respective configuration files if needed

## Next Steps (Phase 2)
- Billing and payment integration
- Enhanced support ticket system
- Service availability checker
- Advanced analytics and reporting