# 📁 Project Structure

## Backend Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js
│   │   ├── swagger.js
│   │   └── swagger-output.json
│   ├── controllers/     # Business logic layer
│   │   ├── index.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   └── orderController.js
│   ├── models/          # MongoDB/Mongoose models
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/          # API routes
│   │   ├── index.js     # Route aggregator
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── orders.js
│   │   ├── coupons.js
│   │   ├── reviews.js
│   │   ├── wishlist.js
│   │   ├── upload.js
│   │   ├── admin.js
│   │   └── payments.js
│   ├── middleware/      # Express middleware
│   │   ├── auth.js
│   │   └── requestLogger.js
│   ├── utils/           # Utility functions
│   │   ├── jwt.js
│   │   └── logger.js    # Winston logger
│   └── index.js         # App entry point
├── logs/                # Log files (gitignored)
│   ├── error.log
│   ├── combined.log
│   └── requests.log
├── swagger.js           # Swagger auto-generation script
└── package.json
```

## Frontend Structure

```
frontend/
├── src/
│   ├── admin/           # Admin panel
│   │   ├── pages/       # Admin pages
│   │   │   ├── index.js
│   │   │   ├── Admin.jsx
│   │   │   ├── AdminCategories.jsx
│   │   │   ├── AdminProducts.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   ├── AdminCoupons.jsx
│   │   │   └── AdminOrders.jsx
│   │   ├── components/  # Admin components
│   │   │   ├── index.js
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminUsersComponent.jsx
│   │   │   ├── CategoryManagement.jsx
│   │   │   └── CouponManagement.jsx
│   │   └── index.js
│   ├── api/             # API service layer
│   │   └── index.js
│   ├── components/      # Reusable components (organized by feature)
│   │   ├── index.js     # Main export
│   │   ├── common/      # Common components
│   │   │   ├── index.js
│   │   │   ├── Navbar.jsx
│   │   │   ├── LanguageSwitcher.jsx
│   │   │   └── filters/
│   │   │       ├── SearchBar.jsx
│   │   │       ├── PriceRangeFilter.jsx
│   │   │       ├── RatingFilter.jsx
│   │   │       └── SortFilter.jsx
│   │   ├── auth/        # Authentication components
│   │   │   ├── index.js
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── product/     # Product-related components
│   │   │   ├── index.js
│   │   │   ├── ProductGrid.jsx
│   │   │   ├── ReviewForm.jsx
│   │   │   ├── ReviewsList.jsx
│   │   │   └── WishlistButton.jsx
│   │   ├── cart/        # Cart & payment components
│   │   │   ├── index.js
│   │   │   ├── PaymentGateway.jsx
│   │   │   └── payments/
│   │   └── user/        # User-related components
│   │       ├── index.js
│   │       ├── AddressManager.jsx
│   │       └── NotificationBell.jsx
│   ├── pages/           # Page components
│   │   ├── index.js
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── VerifyEmail.jsx
│   │   ├── Profile.jsx
│   │   ├── MyOrders.jsx
│   │   ├── MyCoupons.jsx
│   │   ├── Wishlist.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Payment.jsx
│   │   ├── PaymentPage.jsx
│   │   ├── OrderConfirmation.jsx
│   │   └── ThankYou.jsx
│   ├── store/           # Zustand state management
│   │   └── index.js
│   ├── utils/           # Utility functions
│   │   ├── validationSchemas.js
│   │   └── alerts.js
│   ├── locales/         # i18n translations
│   ├── i18n.js          # i18n configuration
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # App entry point
│   └── index.css        # Global styles
└── package.json
```

## Key Features

### Backend
- ✅ **Organized Controllers**: Business logic separated into controller layer
- ✅ **Route Aggregation**: Centralized routing in `routes/index.js`
- ✅ **Logging**: Winston (file-based) + Morgan (HTTP requests)
- ✅ **API Documentation**: Swagger UI at `/api/docs` with auto-generation
- ✅ **Authentication**: JWT-based auth with bcrypt
- ✅ **File Upload**: Cloudinary integration with multer
- ✅ **Email**: Nodemailer with Gmail/Ethereal fallback

### Frontend
- ✅ **Feature-Based Structure**: Components organized by domain (auth, product, cart, user, common)
- ✅ **Admin Portal**: Separate admin section with dedicated pages and components
- ✅ **Centralized Exports**: Index files for clean imports
- ✅ **State Management**: Zustand stores
- ✅ **i18n Support**: Multi-language with react-i18next
- ✅ **Form Validation**: React Hook Form + Yup
- ✅ **Alerts**: SweetAlert2 integration

## Import Examples

### Frontend Imports
```jsx
// Components
import { Navbar, LanguageSwitcher } from './components';
import { LoginForm, RegisterForm } from './components';
import { ProductGrid, ReviewForm, WishlistButton } from './components';
import { AddressManager, NotificationBell } from './components';
import { PaymentGateway } from './components';

// Pages
import { Home, Products, ProductDetails, Login, Register } from './pages';

// Admin
import { AdminPage, AdminProductsPage, AdminUsersPage } from './admin';
```

### Backend Imports
```js
// Controllers
const { productController, categoryController, orderController } = require('../controllers');

// Routes (in index.js)
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);
```

## API Endpoints

Base URL: `http://localhost:5000/api`

### Public Routes
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `GET /categories` - Get all categories
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user

### Protected Routes (require JWT)
- `GET /orders/my` - Get user's orders
- `POST /orders` - Create order
- `GET /wishlist` - Get wishlist
- `POST /wishlist/:productId` - Add to wishlist

### Admin Routes (require admin role)
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `GET /admin/users` - Get all users
- `PUT /admin/users/:id` - Update user

## Documentation

- **Swagger UI**: http://localhost:5000/api/docs
- **Generate Swagger**: `npm run swagger` (in backend folder)

## Scripts

### Backend
```bash
npm run dev          # Start dev server with nodemon
npm start            # Start production server
npm run swagger      # Generate Swagger documentation
npm run swagger:dev  # Generate Swagger and start dev server
```

### Frontend
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```
