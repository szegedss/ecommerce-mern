# 🐾 Pet Paradise - E-Commerce MERN Stack

## 📝 Project Overview

Pet Paradise คือ e-commerce website ที่สร้างด้วย **MERN Stack** (MongoDB, Express, React, Node.js) สำหรับการขายสินค้าสัตว์เลี้ยง

### ✨ Features

- **👤 User Authentication** - Register, Login, JWT Token-based auth
- **🛒 Shopping Cart** - Add/remove items, persistent storage
- **💳 Checkout & Payment** - Shipping address, payment methods
- **📦 Order Management** - Order creation, tracking, cancellation
- **👨‍💼 Admin Portal** - Dashboard, Category management, User management
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
POST   /api/auth/register      - Create account
POST   /api/auth/login         - Login user
```

### Products & Categories
```
GET    /api/products           - Get all products
GET    /api/categories         - Get categories
POST   /api/categories         - Create (admin)
PUT    /api/categories/:id     - Update (admin)
DELETE /api/categories/:id     - Delete (admin)
```

### Orders
```
POST   /api/orders             - Create order
GET    /api/orders             - Get user orders
PUT    /api/orders/:id/cancel  - Cancel order
```

### Admin
```
GET    /api/admin/dashboard/stats  - Statistics
GET    /api/admin/users            - List users
PUT    /api/admin/users/:id/role   - Change role
```

---

## 💻 Available Scripts

### Backend
```bash
npm run dev        # Development with nodemon
npm start          # Production start
npm run seed       # Seed database
node create-admin.js  # Create admin user
```

### Frontend
```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview build
```

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
✅ Multiple payment methods
✅ Order tracking
✅ Multi-language support

### Admin Features
✅ Dashboard with stats
✅ Category management
✅ Product management
✅ User management
✅ Role management

---

## 🌍 Deployment

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
- **Deployment Help** → [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Admin Access** → [ADMIN_LOGIN.md](./ADMIN_LOGIN.md)
- **Languages** → [I18N_GUIDE.md](./I18N_GUIDE.md)

---

**Status:** 🟢 Active Development

**Last Updated:** December 6, 2025

---

**Ready to start? Run `npm install` in both folders and `npm run dev`! 🚀**
