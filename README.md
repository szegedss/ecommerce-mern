# 🐾 Pet Paradise - E-Commerce MERN Stack -  test - 2

## 📝 Project Overview

Pet Paradise คือ e-commerce website ที่สร้างด้วย **MERN Stack** (MongoDB, Express, React, Node.js) สำหรับการขายสินค้าสัตว์เลี้ยง    

### ✨ Features

- **👤 User Authentication** - Register, Login, JWT Token-based auth
- **🛒 Shopping Cart** - Add/remove items, persistent storage
- **💳 Checkout & Payment** - Shipping address, payment methods (Stripe, PayPal, Promptpay, Bank Transfer, Credit Card, Cash on Delivery)
- **📦 Order Management** - Order creation, tracking, cancellation, delivery confirmation
- **⭐ Product Reviews** - Customer reviews with ratings, helpful counts, and order-based eligibility
- **📝 Order Timeline** - Detailed order status history with timestamps and notes
- **👨‍💼 Admin Portal** - Dashboard, Category management, User management, Order management
- **🌐 Multi-Language** - Thai (ไทย) & English (en) support
- **📱 Responsive Design** - Mobile & desktop friendly
- **🔐 Role-Based Access** - User & Admin roles

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Fast build tool
- **React Router v6** - Navigation
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **i18next** - Multi-language support

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

**1. Clone Repository**
```bash
git clone <repository-url>
cd ecommerce-mern
```

**2. Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
# Server runs on http://localhost:5000
```

**3. Setup Frontend (New Terminal)**
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

**4. Create Admin User (Optional)**
```bash
cd backend
node create-admin.js
# Admin Email: admin@petparadise.com
# Admin Password: admin123456
```

---

## 🌐 Supported Languages

### Available Languages
- 🇹🇭 **Thai (ไทย)** - Default
- **en English** - English

### How to Change Language
1. Open the website
2. Click language button in navbar (🇹🇭 or en)
3. Language changes instantly!

---

## 👤 Default Credentials

### Admin Account
```
Email:    admin@petparadise.com
Password: admin123456
```

⚠️ **Change password after first login!**

---

## 📚 Documentation

- **[Frontend Guide](./FRONTEND.md)** - React, Zustand, Components
- **[Backend Guide](./BACKEND.md)** - Express, MongoDB, API
- **[Review System Guide](./REVIEW_SYSTEM_UPDATE.md)** - Order-based reviews, delivery confirmation
- **[Deployment Guide](./DEPLOYMENT.md)** - Vercel & Render
- **[Admin Login Guide](./ADMIN_LOGIN.md)** - Access admin portal
- **[Multi-Language Guide](./I18N_GUIDE.md)** - i18n setup

---

## 📁 Project Structure

```
ecommerce-mern/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── admin/              # Admin portal
│   │   ├── store/              # Zustand stores
│   │   ├── api/                # API integration
│   │   ├── locales/            # Translations (th.json, en.json)
│   │   ├── i18n.js             # i18n configuration
│   │   └── App.jsx             # Main app
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # Node.js API
│   ├── src/
│   │   ├── config/             # Database config
│   │   ├── middleware/         # Auth middleware
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API routes
│   │   └── index.js            # Server entry
│   ├── create-admin.js          # Admin creation script
│   ├── seed.js                  # Database seeding
│   ├── package.json
│   └── .env.example
│
├── FRONTEND.md                  # Frontend documentation
├── BACKEND.md                   # Backend documentation
├── DEPLOYMENT.md                # Deployment guide
├── ADMIN_LOGIN.md               # Admin access guide
├── I18N_GUIDE.md                # Multi-language guide
└── README.md                    # This file
```

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register           - Create account
POST   /api/auth/login              - Login user
```

### Products & Categories
```
GET    /api/products                - Get all products
GET    /api/products/:id            - Get product details
GET    /api/categories              - Get all categories
POST   /api/categories              - Create category (admin)
PUT    /api/categories/:id          - Update category (admin)
DELETE /api/categories/:id          - Delete category (admin)
```

### Orders
```
POST   /api/orders                  - Create new order
GET    /api/orders                  - Get user's orders (paginated)
GET    /api/orders/:id              - Get order details
PUT    /api/orders/:id              - Update order status
PUT    /api/orders/:id/cancel       - Cancel order
PUT    /api/orders/:id/confirm-delivery - Confirm delivery received
GET    /api/admin/orders            - Get all orders (admin)
GET    /api/admin/dashboard/stats   - Dashboard statistics
```

### Reviews
```
GET    /api/reviews/product/:productId                       - Get product reviews
POST   /api/reviews/:productId                               - Create review (requires orderId)
PUT    /api/reviews/:reviewId                                - Edit own review
DELETE /api/reviews/:reviewId                                - Delete own review
POST   /api/reviews/:reviewId/helpful                        - Toggle helpful mark
GET    /api/reviews/check-review-eligibility/:productId      - Check if can review
```

### Users & Admin
```
GET    /api/users/profile           - Get user profile
PUT    /api/users/profile           - Update profile
GET    /api/admin/users             - List all users (admin)
PUT    /api/admin/users/:id/role    - Change user role (admin)
GET    /api/admin/dashboard/stats   - Dashboard stats (admin)
```

---

## 💡 Usage Examples

### Example 1: Customer Journey
```
1. Register & Login
   - Sign up with email/password
   - Login to get JWT token
   
2. Browse Products
   - View all products
   - Filter by category
   - Read other reviews
   
3. Add to Cart
   - Click "Add to Cart"
   - Cart updates in real-time
   
4. Checkout
   - Fill shipping address
   - Choose payment method
   - Review order total
   - Submit order
   
5. Track Order
   - View order status
   - See timeline of updates
   - Get tracking number
   
6. Receive Product
   - Click "Confirm Delivery"
   - System sends review notification
   
7. Review Product
   - Eligible only after delivery confirmed
   - Select 1-5 stars
   - Write title and comment
   - Submit review
   - Can edit/delete later
```

### Example 2: Admin Order Management
```
1. Login as Admin
   - Access admin dashboard
   - View all orders
   
2. Update Order Status
   - Select order
   - Change status: pending → processing
   - Add admin notes
   
3. Ship Order
   - Update status: processing → shipped
   - Add tracking number
   - System records shippedDate
   
4. Mark Delivered
   - Update status: shipped → delivered
   - System records deliveredDate
   - Customer can confirm receipt
   
5. Monitor Reviews
   - See review requests pending
   - View submitted reviews
   - Approve/reject if needed
```

### Example 3: Review System API Usage
```
// Frontend: Check if can review
GET /api/reviews/check-review-eligibility/productId
// Response: { canReview: true, orderId: "xxx" }

// Frontend: Submit review with orderId
POST /api/reviews/productId
Body: { title, comment, rating, orderId }

// Frontend: Get product reviews
GET /api/reviews/product/productId?page=1&sort=newest

// Frontend: Mark review helpful
POST /api/reviews/reviewId/helpful

// Frontend: Edit review
PUT /api/reviews/reviewId
Body: { title, comment, rating }

// Frontend: Delete review
DELETE /api/reviews/reviewId
```

### Example 4: Multi-Language Setup
```javascript
// Change language from Thai to English
1. Frontend loads th.json initially
2. User clicks language toggle
3. i18next loads en.json
4. All text updates instantly
5. Language preference saved

// Translation keys used:
- reviews.alreadyReviewed
- reviews.deliveryRequiredToReview
- reviews.rating
- orders.status
- common.loading
- etc.
```

---

## 💻 Available Scripts

### Backend
```bash
npm run dev        # Development with nodemon
npm start          # Production start
npm run seed       # Seed database with sample data
node create-admin.js  # Create admin user
```

### Frontend
```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview build locally
```

---

## 🚨 Error Handling & Status Codes

### HTTP Status Codes
- **200** - OK, request successful
- **201** - Created, resource created successfully
- **400** - Bad Request, validation failed
- **401** - Unauthorized, not authenticated
- **403** - Forbidden, no permission
- **404** - Not Found, resource doesn't exist
- **500** - Server Error, unexpected error

### Common Error Messages

**Review Submission**
```
400 - "Product must be delivered before you can review it"
400 - "Please confirm receipt of the product before reviewing"
400 - "You have already reviewed this product from this order"
400 - "This product is not in your order"
404 - "Order not found"
```

**Order Management**
```
400 - "Order must contain at least one item"
400 - "Shipping address is required"
400 - "Invalid order total"
403 - "Unauthorized to view this order"
404 - "Order not found"
```

**Authentication**
```
400 - "Invalid email or password"
400 - "Email already exists"
401 - "Token expired"
401 - "Invalid token"
403 - "Access denied, admin only"
```

---

## 🔍 Troubleshooting

### Review System Issues

**"Product must be delivered first"**
- Order status must be 'delivered'
- Check order status in admin panel
- Update order status if needed

**"Please confirm receipt"**
- Customer hasn't manually confirmed delivery
- Either confirm manually or wait 1 day for auto-confirm
- Check deliveryConfirmed field in database

**"Already reviewed this product"**
- Review already exists for this order
- Can create new review if you purchase product again
- Edit existing review instead of creating new

### Order Issues

**Order not appearing**
- Check user authentication
- Verify order creation was successful
- Check MongoDB for order document

**Status not updating**
- Check order ID is valid
- Verify user has authorization
- Ensure new status is valid

**Delivery not confirming**
- Order must be in 'delivered' status first
- Update order status to 'delivered'
- Then can confirm delivery

---

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_key_min_32_chars
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🎯 Features

### Customer Features
✅ User registration & login
✅ Product browsing & search
✅ Shopping cart (persistent)
✅ Checkout with shipping
✅ Multiple payment methods (Stripe, PayPal, Promptpay, Bank Transfer, Credit Card, Cash on Delivery)
✅ Order tracking with timeline
✅ Delivery confirmation
✅ Product reviews (only after delivery confirmed)
✅ Review editing and deletion
✅ Review helpful counts
✅ Multi-language support (Thai, English)
✅ Responsive mobile & desktop design

### Admin Features
✅ Dashboard with statistics
✅ Category management (create, update, delete)
✅ Product management (inventory, details)
✅ User management (view, role assignment)
✅ Order management (status tracking, notes)
✅ Role-based access control

---

---

## 🎁 Detailed Features

### 1. 👤 User Authentication & Authorization
- **Registration** - Create new account with email and password
- **Login** - Secure JWT token-based authentication
- **Password Hashing** - bcryptjs with salt rounds
- **Session Management** - Token stored in localStorage
- **Role-Based Access** - User and Admin roles
- **Protected Routes** - Frontend and backend middleware protection
- **Auto Logout** - Session expiration handling

### 2. 🛒 Shopping Cart
- **Add to Cart** - Persistent Zustand state management
- **Remove Items** - Remove individual items
- **Update Quantity** - Modify item quantities
- **Local Storage** - Cart persists across sessions
- **Real-time Updates** - Instant UI updates
- **Cart Summary** - Total price and item count display

### 3. 💳 Checkout & Order Creation
- **Shipping Address** - Full address information capture
- **Shipping Methods** - Multiple shipping options
- **Order Summary** - Subtotal, tax, discount, final total
- **Payment Methods**:
  - 💳 Credit Card (Stripe)
  - 📱 PayPal
  - 🇹🇭 Promptpay (Thai payment)
  - 🏦 Bank Transfer
  - 💰 Cash on Delivery
- **Payment Status Tracking** - Pending, completed, failed states
- **Order Validation** - Server-side validation of all order data

### 4. 📦 Order Management
- **Order Creation** - Save order with all details
- **Order Tracking** - View order status and details
- **Order Status** - pending → processing → shipped → delivered → completed
- **Order Timeline** - Detailed history with timestamps and notes
- **Delivery Tracking** - Tracking number and estimated delivery
- **Order Cancellation** - Cancel pending/processing orders
- **Order Pagination** - Browse multiple orders with pagination
- **Date Tracking**:
  - Created date
  - Shipped date
  - Delivered date
  - Delivery confirmed date

### 5. ⭐ Product Reviews System
- **Order-Based Reviews** - Can only review after product delivery
- **Delivery Confirmation**:
  - **Manual Confirmation** - Customer confirms receipt
  - **Auto-Confirmation** - Automatic after 1 day of delivery
- **Review Eligibility**:
  - Product must be in customer's order
  - Order must be in 'delivered' status
  - Delivery must be confirmed (manual or auto)
  - Only 1 review per product per order
  - Can review same product multiple times if purchased multiple times
- **Review Content**:
  - **Rating** - 1 to 5 stars
  - **Title** - Review headline (max 100 characters)
  - **Comment** - Detailed review (max 1000 characters)
  - **Helpful Count** - Number of users who found review helpful
- **Review Management**:
  - **Create** - Submit review after delivery confirmation
  - **Edit** - Modify own review anytime
  - **Delete** - Remove own review
  - **Mark Helpful** - Toggle helpful mark on reviews
- **Review Display**:
  - **Pagination** - 10 reviews per page
  - **Sorting Options**:
    - Newest first
    - Most helpful
    - Highest rating
    - Lowest rating
  - **Rating Distribution** - Visual distribution of star ratings
  - **Average Rating** - Calculated from all reviews
  - **Verified Purchase Badge** - Shows reviews from actual customers

### 6. 📝 Order Timeline & Status Updates
- **Status Progression** - Track order through each stage
- **Timeline Events** - Each status change recorded with:
  - Status name
  - Timestamp
  - Optional notes from admin
- **Automatic Updates** - System updates timestamps
- **Admin Notes** - Add notes when updating status
- **Customer Visibility** - Customers see all status updates

### 7. 🌐 Multi-Language Support (i18n)
- **Languages Supported**:
  - 🇹🇭 Thai (ไทย) - Default
  - 🇬🇧 English (en)
- **Language Files** - Organized JSON translations:
  - Common terms
  - Navigation
  - Authentication
  - Products
  - Cart
  - Checkout
  - Orders
  - Reviews
  - Admin
- **Language Switching** - Toggle button in navbar
- **Persistent Selection** - Language preference saved
- **Dynamic Translation** - Real-time text updates

### 8. 👨‍💼 Admin Dashboard
- **Dashboard Statistics**:
  - Total users count
  - Total orders count
  - Total revenue
  - Orders by status breakdown
- **User Management**:
  - View all users with details
  - Filter and search
  - Assign/change user roles
  - View user activity
- **Order Management**:
  - View all orders
  - Update order status
  - Add admin notes
  - Track payments
  - Filter by status
- **Category Management**:
  - Create categories
  - Edit category details
  - Delete categories
  - Assign products to categories
- **Product Management**:
  - Add new products
  - Edit product information
  - Manage inventory/stock
  - Set pricing
  - Upload product images
  - Assign to categories
- **Access Control** - Admin-only routes and data

### 9. 📱 Responsive Design
- **Mobile First** - Optimized for mobile devices
- **Tailwind CSS** - Utility-first CSS framework
- **Breakpoints**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- **Touch Friendly** - Larger buttons and spacing for mobile
- **Adaptive Layouts** - Content reorganizes for different screens
- **Optimized Images** - Proper sizing for all devices

### 10. 🔐 Security Features
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcryptjs with salt
- **Protected Routes** - Frontend and backend protection
- **Role-Based Authorization** - User/Admin access control
- **Environment Variables** - Sensitive data not exposed
- **CORS Configuration** - Controlled cross-origin requests
- **Input Validation** - Server-side validation
- **SQL Injection Prevention** - MongoDB query safety

---

---

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String ['user', 'admin'],
  avatar: String,
  phone: String,
  address: {
    street, city, state, zipCode, country
  },
  notifications: [{ // For review requests
    type, message, orderId, productId, read, createdAt
  }],
  timestamps: true
}
```

### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  image: String,
  category: ObjectId (ref: Category),
  stock: Number,
  rating: Number (average),
  reviews: Number (count),
  status: String ['active', 'inactive'],
  timestamps: true
}
```

### Order Model
```javascript
{
  userId: ObjectId (ref: User),
  items: [{
    productId: ObjectId,
    name: String,
    price: Number,
    quantity: Number
  }],
  shippingAddress: {
    firstName, lastName, email, phone, address, city, postalCode, country
  },
  subtotal: Number,
  discount: Number,
  couponCode: String,
  tax: Number,
  total: Number,
  status: String ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  paymentMethod: String ['stripe', 'paypal', 'promptpay', 'bank-transfer', 'credit-card', 'cash-on-delivery'],
  paymentStatus: String ['pending', 'completed', 'failed'],
  paymentDetails: { method, transactionId, timestamp, amount },
  trackingNumber: String,
  shippedDate: Date,
  deliveredDate: Date,
  deliveryConfirmed: Boolean, // Customer confirmed receipt
  deliveryConfirmedDate: Date,
  autoConfirmDate: Date, // Auto-confirm after 1 day
  timeline: [{ // Status history
    status: String,
    timestamp: Date,
    note: String
  }],
  timestamps: true
}
```

### Review Model
```javascript
{
  product: ObjectId (ref: Product),
  user: ObjectId (ref: User),
  order: ObjectId (ref: Order), // Which order triggered this review
  userName: String,
  rating: Number (1-5),
  title: String (max 100 chars),
  comment: String (max 1000 chars),
  helpful: Number (default: 0),
  helpfulBy: [ObjectId], // Users who found helpful
  status: String ['approved', 'pending', 'rejected'],
  timestamps: true,
  indexes: {
    unique: (product, user, order), // One review per product per order
    (product, createdAt),
    (product, rating),
    (user)
  }
}
```

### Category Model
```javascript
{
  name: String (unique),
  description: String,
  image: String,
  slug: String (for URLs),
  status: String ['active', 'inactive'],
  timestamps: true
}
```

---

## 🔌 Integration Flow Examples

### Order to Review Flow
```
1. Customer places order
   └─ Order created with items array

2. Order shipped
   └─ shippedDate set
   └─ trackingNumber added

3. Order delivered
   └─ status: 'delivered'
   └─ deliveredDate: now

4. Customer options:
   a) Manual confirm
      └─ PUT /orders/:id/confirm-delivery
      └─ deliveryConfirmed: true
      └─ Can review immediately
   
   b) Auto confirm after 1 day
      └─ GET /reviews/check-review-eligibility/:productId
      └─ System auto-confirms if 1 day passed
      └─ Can review immediately

5. Create review
   └─ POST /reviews/:productId
   └─ Include orderId in body
   └─ Review linked to specific order

6. Can review same product again
   └─ Only if another order exists
   └─ New review with different orderId
   └─ Multiple reviews allowed per product per user
```

### Helpful Count Flow
```
1. Review created
   └─ helpful: 0
   └─ helpfulBy: []

2. User marks helpful
   └─ POST /reviews/:reviewId/helpful
   └─ helpfulBy: [...userId]
   └─ helpful: 1

3. Same user marks again (toggle)
   └─ helpfulBy: [] (removed)
   └─ helpful: 0
```

---

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend (Render)
- Connect GitHub repository
- Set environment variables
- Auto-deploy on push

**Full Guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🐛 Troubleshooting

**MongoDB Connection Error**
- Check MONGODB_URI in .env
- Verify IP whitelist (Atlas)
- Ensure database exists

**CORS Error**
- Update CORS_ORIGIN in .env
- Match frontend URL
- Restart backend

**Admin Portal 404**
- Create admin user: `node create-admin.js`
- Verify role in MongoDB
- Clear localStorage

---

## 📞 Support

- **Frontend Issues** → [FRONTEND.md](./FRONTEND.md)
- **Backend Issues** → [BACKEND.md](./BACKEND.md)
- **Review System** → [REVIEW_SYSTEM_UPDATE.md](./REVIEW_SYSTEM_UPDATE.md)
- **Deployment Help** → [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Admin Access** → [ADMIN_LOGIN.md](./ADMIN_LOGIN.md)
- **Languages** → [I18N_GUIDE.md](./I18N_GUIDE.md)

---

## 📋 Changelog

### Version 1.3.0 - Phase 14: Order-Based Reviews System
**Release Date:** December 6, 2025

#### New Features
- ✨ **Order-Based Review System** - Reviews only available after product delivery
- ✨ **Delivery Confirmation** - Manual and auto-confirmation (1 day) system
- ✨ **Review Eligibility Check** - New API endpoint to check review permissions
- ✨ **Multiple Reviews per Product** - Customers can review same product multiple times if purchased multiple times
- ✨ **Review Management** - Edit and delete own reviews anytime
- ✨ **Review Pagination & Sorting** - Browse reviews with multiple sort options
- ✨ **Review Distribution Stats** - Visual breakdown of star ratings
- ✨ **Helpful Counts** - Mark reviews as helpful/unhelpful
- ✨ **Order Timeline** - Detailed status history with timestamps

#### Backend Changes
- Added `order` reference field to Review model
- Added `deliveryConfirmed` and `deliveryConfirmedDate` to Order model
- Added `notifications` array to User model
- New endpoint: `GET /reviews/check-review-eligibility/:productId`
- New endpoint: `PUT /orders/:id/confirm-delivery`
- Enhanced `POST /reviews/:productId` with order validation
- Automatic delivery confirmation after 1 day

#### Frontend Changes
- Redesigned ReviewForm component with order-based eligibility
- Added review status indicators (loading, no orders, already reviewed, error)
- Enhanced ReviewsList with pagination and sorting
- Improved mobile responsiveness
- Added new i18n translations (Thai & English)

#### Database Changes
- Added compound unique index on Review (product, user, order)
- Added indexes on Order (status, deliveredDate)
- Added delivery confirmation timestamp fields

#### API Endpoints Added
```
GET  /api/reviews/check-review-eligibility/:productId
PUT  /api/orders/:id/confirm-delivery
```

#### Key Improvements
- ✅ One review per product per order (enforced by unique index)
- ✅ Auto-confirmation after 1 day of delivery
- ✅ Better UX with clear eligibility messages
- ✅ Complete Thai & English translations
- ✅ Improved error handling

---

### Version 1.2.0 - Phase 13: Multi-Language Support
- 🌍 Thai & English language switching
- 📝 Complete translation system using i18next
- 💾 Language preference persistence

### Version 1.1.0 - Phase 12: Order Management
- 📦 Advanced order tracking
- 📋 Order timeline with detailed history
- 🎫 Tracking number support
- 💾 Order notes system

### Version 1.0.0 - Initial Release
- 👤 User authentication & authorization
- 🛒 Shopping cart functionality
- 💳 Multiple payment methods
- 👨‍💼 Admin dashboard
- 📱 Responsive design

---

**Status:** 🟢 Active Development

**Last Updated:** December 6, 2025

---

**Ready to start? Run `npm install` in both folders and `npm run dev`! 🚀**
