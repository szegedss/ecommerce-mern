# 🐾 Pet Paradise E-Commerce - Backend Documentation

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Setup & Installation](#setup--installation)
4. [Database Design](#database-design)
5. [Authentication System](#authentication-system)
6. [API Endpoints](#api-endpoints)
7. [Middleware](#middleware)
8. [Models & Schemas](#models--schemas)
9. [Error Handling](#error-handling)
10. [Seed Data](#seed-data)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)

---

## Technology Stack

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | v14+ | Runtime environment |
| **Express.js** | 4.x | Web framework for REST API |
| **MongoDB** | 4.0+ | NoSQL database |
| **Mongoose** | 6.x | MongoDB object modeling |
| **JWT (jsonwebtoken)** | Latest | Token-based authentication |
| **bcryptjs** | Latest | Password hashing |
| **dotenv** | Latest | Environment variables |
| **cors** | Latest | Cross-origin requests |

### Dev Tools
- **Nodemon** - Auto-restart on file changes
- **Postman/Insomnia** - API testing (recommended)
- **MongoDB Compass** - Database GUI (optional)

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js              # MongoDB connection
│   │
│   ├── middleware/
│   │   └── auth.js                  # JWT verification & authorization
│   │
│   ├── models/                      # Mongoose schemas
│   │   ├── User.js                  # User schema
│   │   ├── Product.js               # Product schema
│   │   ├── Order.js                 # Order schema
│   │   └── Category.js              # Category schema
│   │
│   ├── routes/                      # API endpoints
│   │   ├── auth.js                  # Login/Register endpoints
│   │   ├── products.js              # Product endpoints
│   │   ├── categories.js            # Category CRUD (admin)
│   │   ├── orders.js                # Order endpoints
│   │   └── admin.js                 # Admin-only endpoints
│   │
│   ├── utils/
│   │   └── jwt.js                   # JWT token creation/verification
│   │
│   └── index.js                     # Server entry point
│
├── seed.js                          # Database seeding script
├── .env                             # Environment variables (not in git)
├── .env.example                     # Example env template
├── package.json                     # Dependencies & scripts
├── README.md                        # Setup guide
│
└── node_modules/                   # Installed packages
```

---

## Setup & Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)
- npm or yarn
- Text editor (VS Code recommended)

### Installation Steps

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Configure .env with your values
# Edit these in .env:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=development

# 5. Start development server
npm run dev

# 6. Optional: Seed database with demo data
npm run seed
```

### Environment Variables (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ecommerce
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce

# Authentication
JWT_SECRET=your_super_secret_key_here_min_32_chars
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### MongoDB Setup

#### Local Installation
```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Windows (download from mongodb.com)
# Then start MongoDB service

# Linux
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

#### MongoDB Atlas (Cloud)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster
4. Get connection string
5. Add to `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
   ```

### Verify Installation
```bash
# Test API is running
curl http://localhost:5000/api/products

# Should return: {"success":true,"data":[...]}
```

---

## Database Design

### Collections Overview

```
┌─────────────────────────────────────────┐
│           Database: ecommerce           │
├─────────────────────────────────────────┤
│ Collections:                            │
│  • users         (user accounts)        │
│  • products      (product catalog)      │
│  • categories    (product categories)   │
│  • orders        (customer orders)      │
└─────────────────────────────────────────┘
```

### Entity Relationships

```
User
 ├─ many Orders
 └─ has role (user/admin)

Category
 └─ has many Products

Product
 ├─ belongs to Category
 └─ ordered in Orders

Order
 ├─ belongs to User
 └─ contains many Products
```

---

## Authentication System

### JWT Authentication Flow

```
1. User Registration
   └─→ Receive email & password
       └─→ Hash password with bcrypt
           └─→ Save user to database
               └─→ Return success message

2. User Login
   └─→ Receive email & password
       └─→ Find user in database
           └─→ Compare password with hash (bcrypt)
               └─→ Password matches?
                   ├─ YES: Create JWT token + return user data
                   └─ NO: Return error

3. Protected Request
   └─→ Client sends request with token in header
       Headers: { Authorization: "Bearer <TOKEN>" }
       └─→ Server verifies token with JWT_SECRET
           └─→ Valid?
               ├─ YES: Proceed to route handler
               └─ NO: Return 401 Unauthorized
```

### Token Structure

```
Header
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "user",
  "iat": 1516239022,
  "exp": 1516325422
}

Signature
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  "your_super_secret_key"
)
```

### Token Usage

```javascript
// utils/jwt.js
const jwt = require('jsonwebtoken');

// Create token
const token = jwt.sign(
  { userId: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
// Returns: { userId, email, role, iat, exp }
```

### Role-Based Access Control

```
User Roles:
├─ "user"   - Can browse products, order, manage own account
└─ "admin"  - Can manage categories, users, view all orders, stats

Protected Routes:
├─ /api/products          - All users (no auth needed)
├─ /api/orders            - User only (verify auth)
│   └─ POST /orders       - Create order (user)
│   └─ GET /orders/:id    - Own order only
├─ /api/categories        - Admin only
│   └─ POST               - Create category (admin)
│   └─ PUT/:id            - Update category (admin)
│   └─ DELETE/:id         - Delete category (admin)
└─ /api/admin/*           - Admin only
    └─ /dashboard/stats   - Statistics (admin)
    └─ /users            - User management (admin)
```

---

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
```
POST /api/auth/register

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "phone": "1234567890"
}

Response (Success):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}

Response (Error):
{
  "success": false,
  "message": "Email already exists"
}

Status Codes:
- 201 - Created successfully
- 400 - Validation error
- 409 - Email already exists
```

#### Login User
```
POST /api/auth/login

Request Body:
{
  "email": "john@example.com",
  "password": "securepass123"
}

Response (Success):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

Status Codes:
- 200 - Login successful
- 401 - Invalid credentials
- 404 - User not found
```

---

### Products Routes (`/api/products`)

#### Get All Products
```
GET /api/products?category=dogs&page=1&limit=10

Query Parameters:
- category: Filter by category slug (optional)
- page: Page number (default: 1)
- limit: Items per page (default: 10)

Response:
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Premium Dog Food",
      "description": "High-quality pet food",
      "price": 29.99,
      "category": "dogs",
      "image": "https://images.unsplash.com/...",
      "stock": 50,
      "rating": 4.5,
      "reviews": 12,
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}

Status Codes:
- 200 - Success
- 500 - Server error
```

#### Get Single Product
```
GET /api/products/:id

Response:
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Premium Dog Food",
    "description": "High-quality pet food",
    "price": 29.99,
    "category": "dogs",
    "image": "https://images.unsplash.com/...",
    "stock": 50,
    "rating": 4.5,
    "reviews": 12
  }
}

Status Codes:
- 200 - Success
- 404 - Product not found
- 500 - Server error
```

---

### Categories Routes (`/api/categories`) - ADMIN ONLY

#### Get All Categories
```
GET /api/categories

Response:
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Dogs",
      "slug": "dogs",
      "description": "Dog products and supplies",
      "icon": "🦮",
      "image": "https://images.unsplash.com/...",
      "isActive": true,
      "displayOrder": 1
    }
  ]
}

Status Codes:
- 200 - Success
- 500 - Server error
```

#### Create Category (ADMIN)
```
POST /api/categories
Headers: { Authorization: "Bearer <token>" }

Request Body:
{
  "name": "Dogs",
  "description": "Dog products and supplies",
  "icon": "🦮",
  "image": "https://images.unsplash.com/...",
  "isActive": true,
  "displayOrder": 1
}

Response:
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Dogs",
    "slug": "dogs",
    "description": "Dog products and supplies",
    "icon": "🦮"
  }
}

Status Codes:
- 201 - Created
- 400 - Validation error
- 401 - Not authenticated
- 403 - Not admin
```

#### Update Category (ADMIN)
```
PUT /api/categories/:id
Headers: { Authorization: "Bearer <token>" }

Request Body:
{
  "name": "Dogs",
  "description": "Updated description",
  "isActive": true
}

Response:
{
  "success": true,
  "message": "Category updated successfully",
  "data": { /* updated category */ }
}

Status Codes:
- 200 - Updated
- 404 - Category not found
- 403 - Not admin
```

#### Delete Category (ADMIN)
```
DELETE /api/categories/:id
Headers: { Authorization: "Bearer <token>" }

Response:
{
  "success": true,
  "message": "Category deleted successfully"
}

Status Codes:
- 200 - Deleted
- 404 - Category not found
- 403 - Not admin
- 400 - Cannot delete category with products
```

---

### Orders Routes (`/api/orders`)

#### Create Order
```
POST /api/orders
Headers: { Authorization: "Bearer <token>" }

Request Body:
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit-card",
  "notes": "Please deliver carefully"
}

Response:
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439011",
    "items": [ /* items with final prices */ ],
    "totalAmount": 59.98,
    "status": "pending",
    "shippingAddress": { /* address details */ },
    "createdAt": "2024-01-15T10:00:00Z"
  }
}

Status Codes:
- 201 - Order created
- 400 - Invalid data or insufficient stock
- 401 - Not authenticated
- 500 - Stock deduction failed
```

#### Get User Orders
```
GET /api/orders
Headers: { Authorization: "Bearer <token>" }

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 10)

Response:
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "userId": "507f1f77bcf86cd799439011",
      "items": [ /* ... */ ],
      "totalAmount": 59.98,
      "status": "pending",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": { /* ... */ }
}

Status Codes:
- 200 - Success
- 401 - Not authenticated
```

#### Get Order Details
```
GET /api/orders/:id
Headers: { Authorization: "Bearer <token>" }

Response:
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439011",
    "items": [ /* ... */ ],
    "totalAmount": 59.98,
    "status": "pending",
    "shippingAddress": { /* ... */ },
    "createdAt": "2024-01-15T10:00:00Z"
  }
}

Status Codes:
- 200 - Success
- 401 - Not authenticated
- 403 - Cannot view other users' orders
- 404 - Order not found
```

#### Cancel Order
```
PUT /api/orders/:id/cancel
Headers: { Authorization: "Bearer <token>" }

Response:
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": { /* updated order */ }
}

Status Codes:
- 200 - Cancelled
- 401 - Not authenticated
- 403 - Not order owner
- 404 - Order not found
- 400 - Cannot cancel completed order
```

---

### Admin Routes (`/api/admin`) - ADMIN ONLY

#### Dashboard Statistics
```
GET /api/admin/dashboard/stats
Headers: { Authorization: "Bearer <token>" }

Response:
{
  "success": true,
  "data": {
    "totalUsers": 42,
    "totalProducts": 20,
    "totalCategories": 6,
    "totalOrders": 156,
    "totalRevenue": 5430.50,
    "recentOrders": [ /* last 5 orders */ ]
  }
}

Status Codes:
- 200 - Success
- 401 - Not authenticated
- 403 - Not admin
```

#### Get All Users (ADMIN)
```
GET /api/admin/users?page=1&limit=10
Headers: { Authorization: "Bearer <token>" }

Response:
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "user",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": { /* ... */ }
}

Status Codes:
- 200 - Success
- 403 - Not admin
```

#### Change User Role (ADMIN)
```
PUT /api/admin/users/:id/role
Headers: { Authorization: "Bearer <token>" }

Request Body:
{
  "role": "admin"  // or "user"
}

Response:
{
  "success": true,
  "message": "User role updated successfully",
  "data": { /* updated user */ }
}

Status Codes:
- 200 - Updated
- 403 - Not admin
- 404 - User not found
```

#### Delete User (ADMIN)
```
DELETE /api/admin/users/:id
Headers: { Authorization: "Bearer <token>" }

Response:
{
  "success": true,
  "message": "User deleted successfully"
}

Status Codes:
- 200 - Deleted
- 403 - Not admin
- 404 - User not found
```

---

## Middleware

### Authentication Middleware (`protect`)
Verifies JWT token and checks if user is logged in.

```javascript
// middleware/auth.js
const protect = (req, res, next) => {
  // 1. Get token from header
  const token = req.headers.authorization?.split(' ')[1];
  
  // 2. Check if token exists
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token, authorization denied' 
    });
  }
  
  // 3. Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};

module.exports = { protect };
```

**Usage:**
```javascript
// Protect route - only logged-in users
router.post('/orders', protect, createOrder);

// Verify: GET /orders
// Header: { Authorization: "Bearer <token>" }
```

### Authorization Middleware (`admin`)
Checks if authenticated user has admin role.

```javascript
const admin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
  next();
};

module.exports = { protect, admin };
```

**Usage:**
```javascript
// Protect + require admin
router.post('/categories', protect, admin, createCategory);

// Verify both: user is logged in AND is admin
```

### CORS Middleware
Allows requests from frontend domain.

```javascript
// index.js
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

// Allows http://localhost:5173 to make requests
```

---

## Models & Schemas

### User Model

```javascript
// models/User.js
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (hashed, required),
  phone: String,
  role: String (enum: 'user', 'admin', default: 'user'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Example:
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "John Doe",
  email: "john@example.com",
  password: "$2b$10$...(hashed password)...",
  phone: "1234567890",
  role: "user",
  createdAt: ISODate("2024-01-01T10:00:00Z")
}
```

### Product Model

```javascript
// models/Product.js
{
  _id: ObjectId,
  name: String (required),
  description: String,
  price: Number (required),
  category: String (required, ref: Category),
  image: String (URL),
  stock: Number (default: 0),
  rating: Number (default: 0),
  reviews: Number (default: 0),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Example:
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  name: "Premium Dog Food",
  description: "High-quality dog food with natural ingredients",
  price: 29.99,
  category: "dogs",
  image: "https://images.unsplash.com/photo-...",
  stock: 50,
  rating: 4.5,
  reviews: 12
}
```

### Category Model

```javascript
// models/Category.js
{
  _id: ObjectId,
  name: String (required, unique),
  slug: String (unique, auto-generated from name),
  description: String,
  icon: String,
  image: String (URL),
  isActive: Boolean (default: true),
  displayOrder: Number,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Example:
{
  _id: ObjectId("507f1f77bcf86cd799439013"),
  name: "Dogs",
  slug: "dogs",
  description: "Everything for your dog",
  icon: "🦮",
  image: "https://images.unsplash.com/photo-...",
  isActive: true,
  displayOrder: 1
}
```

**Slug Generation:**
```javascript
// Pre-save hook in Category model
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  }
  next();
});

// "Premium Dogs" → "premium-dogs"
```

### Order Model

```javascript
// models/Order.js
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  items: [
    {
      productId: ObjectId,
      quantity: Number,
      price: Number (price at time of order),
      productName: String
    }
  ],
  totalAmount: Number,
  status: String (enum: 'pending', 'processing', 'shipped', 'delivered', 'cancelled'),
  shippingAddress: {
    fullName: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: String,
  notes: String,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Example:
{
  _id: ObjectId("507f1f77bcf86cd799439014"),
  userId: ObjectId("507f1f77bcf86cd799439011"),
  items: [
    {
      productId: ObjectId("507f1f77bcf86cd799439012"),
      quantity: 2,
      price: 29.99,
      productName: "Premium Dog Food"
    }
  ],
  totalAmount: 59.98,
  status: "pending",
  shippingAddress: { /* ... */ },
  paymentMethod: "credit-card"
}
```

---

## Error Handling

### Standard Error Response Format

```javascript
{
  "success": false,
  "message": "Error description",
  "error": "detailed error info" // Optional, only in development
}
```

### Common HTTP Status Codes

```
200 OK                  - Request successful
201 Created             - Resource created
204 No Content          - Successful, no response body
400 Bad Request         - Invalid request data
401 Unauthorized        - Authentication required
403 Forbidden           - Permission denied
404 Not Found           - Resource doesn't exist
409 Conflict            - Resource already exists
500 Server Error        - Unexpected error
```

### Error Examples

```javascript
// Missing required field
{
  "success": false,
  "message": "Name is required",
  "statusCode": 400
}

// Email already exists
{
  "success": false,
  "message": "Email already exists",
  "statusCode": 409
}

// Invalid token
{
  "success": false,
  "message": "Token is not valid",
  "statusCode": 401
}

// Not authorized for this action
{
  "success": false,
  "message": "Access denied. Admin only.",
  "statusCode": 403
}

// Product out of stock
{
  "success": false,
  "message": "Insufficient stock for product: Premium Dog Food",
  "statusCode": 400
}
```

### Try-Catch Error Handling Pattern

```javascript
// routes/products.js
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
```

---

## Seed Data

### Running Seed Script

```bash
# Seed database with demo data
npm run seed

# Script location: backend/seed.js
# Includes:
# - 6 categories (Dogs, Cats, Small Animals, Birds, Pet Food, Toys)
# - 20+ products with images, prices, stock
```

### Seed Script Overview

```javascript
// seed.js
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');

async function seedDatabase() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    // 2. Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    
    // 3. Create categories
    const categories = await Category.insertMany([
      { name: 'Dogs', icon: '🦮', ... },
      { name: 'Cats', icon: '🐱', ... },
      // ...
    ]);
    
    // 4. Create products
    const products = await Product.insertMany([
      { name: 'Dog Food', category: 'dogs', ... },
      // ...
    ]);
    
    // 5. Display results
    console.log(`✅ Created ${categories.length} categories`);
    console.log(`✅ Created ${products.length} products`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
```

### Sample Category Data

```javascript
{
  name: "Dogs",
  slug: "dogs",
  description: "Everything for your furry friend",
  icon: "🦮",
  image: "https://images.unsplash.com/photo-...",
  isActive: true,
  displayOrder: 1
}
```

### Sample Product Data

```javascript
{
  name: "Premium Dog Food",
  description: "High-quality dog food with natural ingredients",
  price: 29.99,
  category: "dogs",
  image: "https://images.unsplash.com/photo-...",
  stock: 50,
  rating: 4.5,
  reviews: 12
}
```

---

## Deployment

### Prepare for Production

```bash
# 1. Set NODE_ENV
NODE_ENV=production

# 2. Change database to production MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce-prod

# 3. Use strong JWT_SECRET (min 32 chars)
JWT_SECRET=your_long_random_secret_key_min_32_chars

# 4. Set CORS_ORIGIN to production URL
CORS_ORIGIN=https://yourdomain.com
```

### Deploy to Heroku

```bash
# 1. Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Create app
heroku create your-app-name

# 4. Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set NODE_ENV=production

# 5. Deploy
git push heroku main

# 6. View logs
heroku logs --tail
```

### Deploy to AWS EC2

```bash
# 1. SSH into server
ssh -i your-key.pem ubuntu@your-ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install MongoDB (or use Atlas)
# ...

# 4. Clone repository
git clone your-repo
cd backend

# 5. Install dependencies & start
npm install
npm start

# 6. Keep running with PM2
npm install -g pm2
pm2 start index.js --name "ecommerce-api"
```

---

## Troubleshooting

### Common Issues

#### 1. **Cannot connect to MongoDB**
```
Error: connect ECONNREFUSED 127.0.0.1:27017

Solution:
- Check if MongoDB is running: mongod --version
- Start MongoDB: brew services start mongodb-community (Mac)
- Check MONGODB_URI in .env
- For Atlas: verify IP whitelist in MongoDB dashboard
```

#### 2. **Port 5000 already in use**
```
Error: listen EADDRINUSE: address already in use :::5000

Solution:
- Kill process: npx kill-port 5000
- Or change port in .env: PORT=5001
- Check: lsof -i :5000 (Mac/Linux)
```

#### 3. **JWT token invalid**
```
Error: jwt malformed / jwt expired

Solution:
- Clear localStorage in browser
- Regenerate token by logging in again
- Check JWT_SECRET is consistent
- Verify token hasn't expired (7 days)
```

#### 4. **Mongoose validation error**
```
Error: "Email is required"

Solution:
- Check request body includes all required fields
- Verify field names match schema exactly
- See Model & Schemas section for required fields
```

#### 5. **CORS error from frontend**
```
Error: Access to XMLHttpRequest blocked by CORS policy

Solution:
- Set CORS_ORIGIN to frontend URL in .env
- Restart backend server
- Check frontend is making requests to correct API URL
- Frontend URL: http://localhost:5173
- API URL: http://localhost:5000/api
```

#### 6. **Password hashing issues**
```
Error: Bcrypt not hashing password

Solution:
- Ensure bcryptjs is installed: npm install bcryptjs
- Pre-save hook in User model must hash password
- Don't manually encrypt password in route
```

### Debug Tips

```javascript
// Add logging to troubleshoot
console.log('Request body:', req.body);
console.log('User ID:', req.userId);
console.log('Database result:', data);

// Check environment variables
console.log('MongoDB URI:', process.env.MONGODB_URI);
console.log('JWT Secret:', process.env.JWT_SECRET ? '✓' : '✗');
console.log('Node Env:', process.env.NODE_ENV);

// Test database connection
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ DB Connected'))
  .catch(err => console.log('✗ DB Error:', err));

// Test routes with curl
curl http://localhost:5000/api/products
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'
```

### Performance Tips

```javascript
// 1. Add indexes to frequently queried fields
userSchema.index({ email: 1 });
productSchema.index({ category: 1 });

// 2. Use pagination for large datasets
const page = req.query.page || 1;
const limit = req.query.limit || 10;
const skip = (page - 1) * limit;

// 3. Limit fields returned
Product.find().select('name price image');

// 4. Use caching for static data
// (e.g., categories list)
```

---

## Development Workflow

### Creating a New Route

```javascript
// routes/myroute.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');

// GET route
router.get('/', async (req, res) => {
  try {
    // Your logic here
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Protected POST route
router.post('/', protect, async (req, res) => {
  try {
    // User ID available in req.userId
    // Your logic here
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Admin-only route
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    // Only admins can delete
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
```

### Register Route in index.js

```javascript
// index.js
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const myRoutes = require('./routes/myroute');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/myroute', myRoutes);
```

---

## Best Practices

✅ **Do:**
- Always hash passwords before saving
- Validate input data before database operations
- Use middleware for authentication/authorization
- Return consistent JSON format
- Log errors for debugging
- Use environment variables for secrets
- Add pagination to list endpoints
- Use proper HTTP status codes
- Add error handling to all async operations
- Test routes with Postman/Insomnia

❌ **Don't:**
- Store plain text passwords
- Trust user input without validation
- Expose error details to users
- Hardcode configuration values
- Make synchronous API calls in routes
- Forget to await promises
- Use old callback style (no async/await)
- Leave console.logs in production
- Allow direct database modification from client
- Skip error handling

---

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [JWT Introduction](https://jwt.io/)
- [bcryptjs Guide](https://github.com/dcodeIO/bcrypt.js)
- [Postman API Testing](https://www.postman.com/)

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start with nodemon (auto-reload)
npm start               # Start server

# Database
npm run seed            # Populate demo data
# mongosh              # MongoDB shell

# Testing
# npm test              # Run tests (if configured)

# Build
# npm run build         # Create production build
```

### Quick API Test

```bash
# Test backend is running
curl http://localhost:5000/api/products

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"123456"}'

# Get categories
curl http://localhost:5000/api/categories
```

---

**Happy Coding! 🚀**
