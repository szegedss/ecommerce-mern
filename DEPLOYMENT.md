# 🚀 Pet Paradise E-Commerce - Deployment Guide

## การ Deploy แยก Frontend & Backend

```
┌─────────────────────────────────────────────────────────────┐
│                    Architecture Overview                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (React + Vite)                                     │
│  ┌─────────────────────────────┐                            │
│  │   https://petparadise.vercel.app                         │
│  │   (Hosted on Vercel)                                     │
│  └────────────┬────────────────┘                            │
│               │                                               │
│               │  HTTP Requests                               │
│               │  (axios calls)                               │
│               ▼                                               │
│  ┌─────────────────────────────┐                            │
│  │   https://petparadise.onrender.com                       │
│  │   Backend API (Node.js + Express)                        │
│  │   Connected to MongoDB Atlas                             │
│  └─────────────────────────────┘                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Table of Contents

1. [Backend Deployment (Render)](#backend-deployment-render)
2. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
3. [Environment Variables Setup](#environment-variables-setup)
4. [Verification & Testing](#verification--testing)
5. [Troubleshooting](#troubleshooting)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

# Backend Deployment (Render)

## Prerequisites

- GitHub account with repo pushed
- MongoDB Atlas account (free tier)
- Render.com account (free tier)

## Step 1: Setup MongoDB Atlas (Cloud Database)

### Create Free MongoDB Atlas Account

1. **Go to MongoDB Atlas**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Click "Start Free"

2. **Create Organization**
   - Set organization name: `Pet Paradise`
   - Click "Create Organization"

3. **Create Project**
   - Project name: `ecommerce-pet-shop`
   - Click "Create Project"

4. **Create Cluster**
   - Select "M0 (Free)" tier
   - Cloud provider: AWS
   - Region: Select closest to you
   - Cluster name: `pet-shop-cluster`
   - Click "Create Deployment"

5. **Setup Security**
   ```
   a) Create Database User
      - Username: ecommerce_user
      - Password: (Auto-generate strong password)
      - Copy password! (You need this later)
   
   b) Add IP Whitelist
      - Click "Add My Current IP" or
      - Add "0.0.0.0/0" to allow all IPs (for Render)
      - Click "Confirm"
   ```

6. **Get Connection String**
   - Click "Connect" on cluster
   - Select "Drivers"
   - Copy connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `ecommerce`

   **Example:**
   ```
   mongodb+srv://ecommerce_user:YOUR_PASSWORD@pet-shop-cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
   ```

## Step 2: Prepare Backend for Deployment

### Update `backend/package.json`

Add/ensure these scripts exist:

```json
{
  "name": "ecommerce-backend",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "seed": "node seed.js"
  },
  "engines": {
    "node": "18.x"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "axios": "^1.3.0"
  }
}
```

### Update `backend/.env.example`

```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_key_min_32_characters_long
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=https://your-vercel-frontend-url.vercel.app
```

### Update `backend/src/index.js`

Ensure it exports the app for Render:

```javascript
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.log('✗ MongoDB error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Server error' 
      : err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### Push to GitHub

```bash
cd backend
git add .
git commit -m "Prepare backend for Render deployment"
git push origin develop
# or main if that's your default branch
```

## Step 3: Deploy to Render

### Create Render Account

1. Go to https://render.com
2. Click "Sign up"
3. Sign in with GitHub (recommended)

### Deploy Backend

1. **Create New Web Service**
   - Click "New +" button
   - Select "Web Service"
   - Click "Connect account" (GitHub)
   - Find your `ecommerce-mern` repo
   - Click "Connect"

2. **Configure Deployment**
   ```
   Name: ecommerce-backend (or pet-paradise-api)
   
   Environment: Node
   
   Build Command: 
   npm install
   
   Start Command: 
   npm start
   
   Plan: Free (if available, or smallest paid option)
   
   Region: Select closest to users
   ```

3. **Add Environment Variables**
   - Click "Advanced" > "Add Environment Variable"
   - Add each variable from `.env`:
   
   ```
   PORT = 5000
   NODE_ENV = production
   MONGODB_URI = mongodb+srv://ecommerce_user:PASSWORD@pet-shop-cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
   JWT_SECRET = your_super_secret_key_here_min_32_chars
   JWT_EXPIRE = 7d
   CORS_ORIGIN = https://yourfrontend.vercel.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (3-5 minutes)
   - Once live, you'll get URL like: `https://ecommerce-backend.onrender.com`

### Verify Backend Deployment

```bash
# Test health endpoint
curl https://ecommerce-backend.onrender.com/health

# Response should be:
# {"status":"OK","timestamp":"2024-01-15T10:30:00.000Z"}

# Test API
curl https://ecommerce-backend.onrender.com/api/products

# Response should be:
# {"success":true,"data":[...products...],"pagination":{...}}
```

---

# Frontend Deployment (Vercel)

## Prerequisites

- GitHub account with repo pushed
- Vercel account (free)
- Backend URL from Render (e.g., https://ecommerce-backend.onrender.com)

## Step 1: Prepare Frontend for Deployment

### Update `frontend/.env.example`

```env
# API Configuration
VITE_API_URL=https://ecommerce-backend.onrender.com/api
```

### Update `frontend/vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

### Update `frontend/src/api/index.js`

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('API URL:', API_URL); // For debugging

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Update `frontend/package.json`

Ensure `build` script exists:

```json
{
  "name": "ecommerce-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "zustand": "^4.3.2",
    "axios": "^1.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^3.1.0",
    "vite": "^4.1.0",
    "tailwindcss": "^3.2.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

### Push to GitHub

```bash
cd frontend
git add .
git commit -m "Prepare frontend for Vercel deployment"
git push origin develop
```

## Step 2: Deploy to Vercel

### Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign up"
3. Sign in with GitHub

### Deploy Frontend

1. **Import Project**
   - Click "New Project"
   - Select GitHub repository
   - Find `ecommerce-mern`
   - Click "Import"

2. **Configure Project**
   ```
   Project Name: pet-paradise-frontend
   
   Framework Preset: Vite
   
   Root Directory: ./frontend
   
   Build Command: npm run build
   
   Output Directory: dist
   
   Install Command: npm install
   ```

3. **Add Environment Variables**
   - Click "Environment Variables"
   - Add:
   
   ```
   VITE_API_URL = https://ecommerce-backend.onrender.com/api
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Once complete, you'll get URL like: `https://petparadise.vercel.app`

### Verify Frontend Deployment

1. **Visit the website**
   - Go to: `https://petparadise.vercel.app`
   - Should load home page

2. **Test functionality**
   - Click on products (should load from Render API)
   - Try login/register
   - Add items to cart
   - Go through checkout

3. **Check browser console**
   - Open DevTools (F12)
   - Go to Console tab
   - Should show: `API URL: https://ecommerce-backend.onrender.com/api`
   - No CORS errors should appear

---

# Environment Variables Setup

## Backend Environment Variables (Render)

| Variable | Value | Example |
|----------|-------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `production` |
| `MONGODB_URI` | Database URL | `mongodb+srv://user:pass@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key (min 32 chars) | `your_super_secret_key_min_32_characters_long` |
| `JWT_EXPIRE` | Token expiration | `7d` |
| `CORS_ORIGIN` | Frontend URL | `https://petparadise.vercel.app` |

## Frontend Environment Variables (Vercel)

| Variable | Value | Example |
|----------|-------|---------|
| `VITE_API_URL` | Backend API URL | `https://ecommerce-backend.onrender.com/api` |

## How to Update Environment Variables

### Render Backend
```
1. Go to Render dashboard
2. Select your service
3. Click "Environment" tab
4. Edit variables
5. Click "Save"
6. Service auto-deploys
```

### Vercel Frontend
```
1. Go to Vercel dashboard
2. Select your project
3. Go to "Settings" > "Environment Variables"
4. Edit variables
5. Redeploy by going to "Deployments" > click latest > "Redeploy"
```

---

# Verification & Testing

## Checklist After Deployment

### Backend (Render)

- [ ] Health check endpoint responds
  ```bash
  curl https://ecommerce-backend.onrender.com/health
  ```

- [ ] Products API works
  ```bash
  curl https://ecommerce-backend.onrender.com/api/products
  ```

- [ ] Categories API works
  ```bash
  curl https://ecommerce-backend.onrender.com/api/categories
  ```

- [ ] Can register user
  ```bash
  curl -X POST https://ecommerce-backend.onrender.com/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@test.com","password":"123456"}'
  ```

- [ ] Can login
  ```bash
  curl -X POST https://ecommerce-backend.onrender.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"123456"}'
  ```

### Frontend (Vercel)

- [ ] Website loads without errors
- [ ] Products display on home page
- [ ] Can register new account
- [ ] Can login with account
- [ ] Can add items to cart
- [ ] localStorage persists data
- [ ] Can proceed to checkout
- [ ] Shipping address form works
- [ ] Can reach payment page
- [ ] Order confirmation appears
- [ ] DevTools console shows no errors
- [ ] CORS errors don't appear

## Full User Journey Test

```
1. Visit: https://petparadise.vercel.app
2. Browse products (home page)
3. Add product to cart
4. Go to cart and verify item
5. Click checkout
6. Get redirected to login (if not logged in)
7. Register new account OR login
8. Checkout page: confirm order summary
9. Enter shipping address
10. Click "Next to Payment"
11. Payment page: select payment method
12. Enter card details (test data)
13. Submit order
14. See order confirmation page
15. Check order number displays
16. Go back to home page
17. Verify cart is empty
```

---

# Troubleshooting

## Common Issues & Solutions

### 1. Frontend Cannot Connect to Backend

**Error:** `CORS error` or `Failed to fetch`

**Cause:** Backend URL mismatch or CORS not configured

**Solution:**
```bash
# Check 1: Verify backend URL in frontend environment
# Vercel > Settings > Environment Variables
# VITE_API_URL should be: https://ecommerce-backend.onrender.com/api

# Check 2: Test backend directly
curl https://ecommerce-backend.onrender.com/health

# Check 3: Verify CORS_ORIGIN in Render backend
# Should match: https://petparadise.vercel.app

# If backend or frontend URL changed:
# Update environment variables and redeploy
```

### 2. Render Backend Spins Down (Free Tier)

**Issue:** Requests are slow after inactivity

**Cause:** Free tier spins down after 15 minutes of inactivity

**Solution:**
```
Option 1: Upgrade to paid plan ($7/month)
- Render dashboard > Instance Type > Select paid

Option 2: Keep it awake with pingdom
- Use external service to ping /health endpoint every 5 minutes
- Example: https://uptimerobot.com/ (free)
  - Create monitor for: https://ecommerce-backend.onrender.com/health
  - Interval: Every 5 minutes
```

### 3. MongoDB Connection Fails

**Error:** `MongoNetworkError` or `Authentication failed`

**Cause:** Wrong connection string or IP not whitelisted

**Solution:**
```
1. Verify MONGODB_URI in Render environment
   - Check password is correct
   - Check database name is spelled correctly: ecommerce

2. Add IP to MongoDB Atlas whitelist
   - MongoDB Atlas > Network Access
   - Click "Add IP Address"
   - Add: 0.0.0.0/0 (allows all IPs)
   - Click Confirm

3. Test connection locally first:
   - Update local .env with cloud MONGODB_URI
   - Run: npm run dev
   - Try to fetch products
   - If works locally, should work on Render
```

### 4. Vercel Deployment Fails

**Error:** `Build failed` or `npm install error`

**Cause:** Missing dependencies or build script

**Solution:**
```bash
# Check 1: Ensure package.json has build script
# "build": "vite build"

# Check 2: Run build locally to verify
cd frontend
npm install
npm run build

# Check 3: Check Vercel logs
# Vercel > Deployments > Failed build > View logs
```

### 5. JWT Token Not Working

**Error:** `401 Unauthorized` after login

**Cause:** JWT secret different between local and Render

**Solution:**
```
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy output and set in Render environment:
JWT_SECRET = paste_the_output_here

# Redeploy backend
# Clear localStorage in browser and login again
```

### 6. 404 on Frontend Routes

**Error:** 404 when accessing `/cart` or other routes directly

**Cause:** Vercel not configured for SPA (Single Page App)

**Solution:**
```
1. Create vercel.json in frontend root:

{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}

2. Commit and push
3. Vercel auto-redeploys
```

### 7. Images Not Loading

**Error:** Product images show broken image icon

**Cause:** External image URLs blocked

**Solution:**
```
# If using Unsplash URLs, they should work fine
# Check browser console for image errors

# If images stored locally:
# Need to host images on cloud storage:
# - AWS S3
# - Cloudinary
# - Firebase Storage
# Then update product image URLs
```

---

# Monitoring & Maintenance

## Monitor Backend Health

### Check Render Logs

```
1. Go to Render dashboard
2. Select backend service
3. Click "Logs" tab
4. View real-time logs
5. Check for errors
```

### Set Up Error Notifications

```
Option 1: Render built-in
- Render dashboard > Settings > Alerts
- Configure email alerts

Option 2: External monitoring
- Use UptimeRobot.com (free)
- Monitor /health endpoint
- Get alerts if down
```

## Monitor Frontend Errors

### Sentry (Error Tracking)

```javascript
// frontend/src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  tracesSampleRate: 1.0,
});

// Now errors are tracked automatically
```

### Vercel Analytics

```
1. Vercel dashboard > project
2. Click "Analytics" tab
3. View page performance
4. Check Web Vitals
```

## Update Deployment

### Update Backend Code

```bash
# Make changes in backend
git add .
git commit -m "Your message"
git push origin develop

# Render auto-deploys on push
# Check Render dashboard for deployment status
# Takes 2-5 minutes
```

### Update Frontend Code

```bash
# Make changes in frontend
git add .
git commit -m "Your message"
git push origin develop

# Vercel auto-deploys on push
# Check Vercel dashboard for deployment status
# Takes 1-3 minutes
```

### Update Environment Variables

#### Render Backend
```
1. Render dashboard > service > Environment
2. Edit variable
3. Click "Save"
4. Service auto-redeploys
5. Wait for green status
```

#### Vercel Frontend
```
1. Vercel dashboard > project > Settings > Environment Variables
2. Edit variable
3. Go to Deployments
4. Click latest deployment
5. Click "Redeploy"
6. Confirm redeploy
```

## Database Maintenance

### Backup MongoDB

```
MongoDB Atlas automatically backs up:
- Daily snapshots (free tier)
- Can restore to any snapshot
- Keep 7 days of backups
```

### View Database Content

```
Option 1: MongoDB Atlas
1. Go to MongoDB Atlas
2. Select cluster
3. Click "Browse Collections"
4. View data in tables

Option 2: MongoDB Compass
1. Download MongoDB Compass
2. Connect with URI: mongodb+srv://user:pass@cluster...
3. Browse collections with GUI

Option 3: Terminal
mongosh "mongodb+srv://cluster.mongodb.net/ecommerce" --apiVersion 1 --username user
```

### Seed Production Database

```bash
# Upload seed script to production
1. SSH/connect to backend
2. Run: npm run seed

OR

# Create endpoint to seed (for admin only!)
POST /api/admin/seed (protected, admin only)

# Then call from browser or curl
```

---

## Cost Breakdown

### Free Tier Setup

| Service | Plan | Cost | Notes |
|---------|------|------|-------|
| MongoDB Atlas | M0 Free | $0 | 512MB storage, auto backups |
| Render Backend | Free | $0 | Spins down after 15 min inactivity |
| Vercel Frontend | Hobby | $0 | 100GB bandwidth/month |
| **Total** | | **$0/month** | Slow performance, limited uptime |

### Recommended Production Setup

| Service | Plan | Cost | Notes |
|---------|------|------|-------|
| MongoDB Atlas | M1 | $57/month | 10GB storage, 3-node cluster |
| Render Backend | Standard | $7-150/month | Always running, auto-scale |
| Vercel Frontend | Pro | $20/month | Priority builds, analytics |
| **Total** | | **$84-227/month** | Production-ready, good performance |

---

## Quick Commands Reference

### Deploy Changes

```bash
# Deploy backend
cd backend
git add .
git commit -m "Your changes"
git push origin main

# Deploy frontend
cd frontend
git add .
git commit -m "Your changes"
git push origin main

# Both auto-deploy to Render and Vercel
```

### Check Deployments

```bash
# Render logs
# Go to: https://dashboard.render.com

# Vercel logs
# Go to: https://vercel.com/dashboard

# Test backend
curl https://ecommerce-backend.onrender.com/health

# Test frontend
Visit: https://petparadise.vercel.app
```

### Update Environment

```bash
# Backend (Render)
1. Render.com > service > Environment
2. Edit variable
3. Save (auto-redeploy)

# Frontend (Vercel)
1. Vercel.com > project > Settings > Environment Variables
2. Edit variable
3. Go to Deployments > Redeploy
```

---

## Summary

✅ **What's Deployed:**
- Frontend: React app on Vercel
- Backend: Node.js API on Render
- Database: MongoDB on Atlas

✅ **What Works:**
- User authentication with JWT
- Product browsing and searching
- Shopping cart with localStorage
- Checkout and payment flow
- Order creation and tracking
- Admin dashboard and management

✅ **What's Accessible:**
- Frontend: https://petparadise.vercel.app
- Backend: https://ecommerce-backend.onrender.com
- Database: MongoDB Atlas cloud

---

**Happy Deployment! 🚀**

Next steps:
1. Deploy backend to Render first
2. Get backend URL
3. Deploy frontend to Vercel with backend URL
4. Test full user journey
5. Monitor logs for issues
