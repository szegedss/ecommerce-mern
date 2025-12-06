# 🐾 Pet Paradise E-Commerce - Frontend Documentation

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Setup & Installation](#setup--installation)
4. [Core Concepts](#core-concepts)
5. [Components Guide](#components-guide)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Styling](#styling)
9. [Key Features](#key-features)
10. [Troubleshooting](#troubleshooting)

---

## Technology Stack

### Framework & Libraries
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI library for building components |
| **React Router** | v6 | Client-side routing and navigation |
| **Vite** | Latest | Fast build tool and dev server |
| **Zustand** | Latest | Lightweight state management |
| **Axios** | Latest | HTTP client for API calls |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |

### Development Tools
- **Node.js** - Runtime environment
- **npm/yarn** - Package manager
- **ESLint** - Code quality tool
- **Postcss** - CSS transformation
- **Autoprefixer** - CSS vendor prefixes

---

## Project Structure

```
frontend/
├── src/
│   ├── admin/                          # Admin panel (separate section)
│   │   ├── api/
│   │   │   └── admin.js               # Admin API calls
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx     # Dashboard stats
│   │   │   ├── AdminLayout.jsx        # Sidebar layout
│   │   │   ├── AdminUsers.jsx         # User management
│   │   │   └── CategoryManagement.jsx # Category CRUD
│   │   └── pages/                      # Admin page wrappers
│   │
│   ├── components/                     # Reusable UI components
│   │   ├── Navbar.jsx                 # Navigation header
│   │   ├── LoginForm.jsx              # Login form
│   │   ├── RegisterForm.jsx           # Registration form
│   │   ├── ProductGrid.jsx            # Products display grid
│   │   └── ...
│   │
│   ├── pages/                          # Page components
│   │   ├── Home.jsx                   # Landing page
│   │   ├── Login.jsx                  # Login page
│   │   ├── Register.jsx               # Registration page
│   │   ├── Cart.jsx                   # Shopping cart
│   │   ├── Checkout.jsx               # Shipping address form
│   │   ├── Payment.jsx                # Payment processing
│   │   ├── OrderConfirmation.jsx      # Order success page
│   │   ├── Admin.jsx                  # Admin dashboard
│   │   ├── AdminCategories.jsx        # Category management
│   │   └── AdminUsers.jsx             # User management
│   │
│   ├── api/
│   │   └── index.js                   # Public API functions
│   │
│   ├── store/
│   │   └── index.js                   # Zustand stores (auth, cart, checkout)
│   │
│   ├── App.jsx                        # Main app component with routes
│   ├── main.jsx                       # Entry point
│   ├── index.css                      # Global styles
│   │
│   ├── vite.config.js                 # Vite configuration
│   ├── tailwind.config.js             # Tailwind customization
│   ├── postcss.config.js              # PostCSS configuration
│   ├── eslint.config.js               # ESLint rules
│   │
│   └── package.json                   # Dependencies & scripts
│
└── index.html                         # HTML template
```

---

## Setup & Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Backend running on `http://localhost:5000`

### Installation Steps

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Configure environment variables
# .env.local
VITE_API_URL=http://localhost:5000/api

# 5. Start development server
npm run dev

# 6. Build for production
npm run build

# 7. Preview production build
npm run preview
```

### Environment Variables
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Add more as needed:
# VITE_APP_NAME=Pet Paradise
# VITE_STRIPE_KEY=your_stripe_key
```

---

## Core Concepts

### 1. **Component-Based Architecture**
React breaks UI into reusable components, each managing its own state and rendering.

```jsx
// Example: Simple component
export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  );
}
```

### 2. **React Hooks**
Functions that let you use state and other React features.

#### Common Hooks:
- **useState()** - Manage component state
- **useEffect()** - Side effects (API calls, data fetching)
- **useContext()** - Access context values
- **useNavigate()** - Programmatic navigation
- **useLocation()** - Access current route info

```jsx
import { useState, useEffect } from 'react';

export default function MyComponent() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // Runs when component mounts or dependencies change
    console.log('Component mounted or count changed');
  }, [count]);
  
  return <div>Count: {count}</div>;
}
```

### 3. **Routing (React Router v6)**
Navigate between pages without full page reload.

```jsx
// App.jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/cart" element={<Cart />} />
  <Route path="/checkout" element={<Checkout />} />
</Routes>
```

### 4. **Conditional Rendering**
Show/hide elements based on conditions.

```jsx
{isLoggedIn ? (
  <p>Welcome back!</p>
) : (
  <p>Please log in</p>
)}
```

### 5. **List Rendering**
Display arrays of data as components.

```jsx
{products.map((product) => (
  <ProductCard key={product._id} product={product} />
))}
```

---

## Components Guide

### Page Components

#### **Home.jsx**
**Purpose:** Landing page with hero, features, testimonials

**Key Features:**
- Fetches categories from API
- Displays featured products
- Pet-themed design
- CTA buttons

```jsx
// Example usage
useEffect(() => {
  fetchCategories(); // Get pet categories
}, []);
```

#### **Cart.jsx**
**Purpose:** Shopping cart management

**Features:**
- View cart items
- Update quantities
- Remove items
- Calculate totals
- Proceed to checkout

```jsx
const { items, removeFromCart, updateQuantity } = useCartStore();
```

#### **Checkout.jsx**
**Purpose:** Shipping address & order review

**Flow:**
1. Check if user is logged in
2. If not → redirect to login
3. Show order summary
4. Display/collect shipping address
5. Proceed to payment

```jsx
if (!isLoggedIn) {
  return <RedirectToLogin />;
}
```

#### **Payment.jsx**
**Purpose:** Payment method selection & processing

**Features:**
- Multiple payment methods (credit card, PayPal, etc.)
- Card form with auto-formatting
- Order submission
- Error handling

```jsx
const handleSubmitOrder = async () => {
  // Validate card data
  // Send order to API
  // Clear cart
  // Redirect to confirmation
};
```

#### **OrderConfirmation.jsx**
**Purpose:** Show successful order details

**Features:**
- Display order number
- Show items ordered
- Shipping address
- Expected delivery date

### Admin Components

#### **AdminDashboard.jsx**
Shows statistics:
- Total users
- Total products
- Total categories
- Total revenue

#### **CategoryManagement.jsx**
**CRUD Operations:**
- **Create** - Add new category
- **Read** - Display all categories
- **Update** - Edit category details
- **Delete** - Remove category

```jsx
// Example: Add category
const handleSubmit = async (e) => {
  const response = await adminAPI.createCategory(formData);
  await fetchCategories(); // Refresh list
};
```

#### **AdminUsers.jsx**
**User Management:**
- List all users with pagination
- Change user roles (user → admin)
- Delete users

### Reusable Components

#### **Navbar.jsx**
Navigation header with:
- Logo/brand
- Menu links
- Cart icon with count
- Login/logout button
- User profile

#### **ProductGrid.jsx**
**Purpose:** Display products with filtering

**Features:**
- Category filtering
- Product cards with images
- Stock status
- Ratings
- Add to cart button
- Responsive grid

```jsx
// Filter products by category
<button onClick={() => setSelectedCategory('dogs')}>
  Dogs
</button>
```

#### **LoginForm.jsx & RegisterForm.jsx**
Form components for authentication:
- Input validation
- Error messages
- Form submission
- Store JWT token

```jsx
const handleLogin = async (credentials) => {
  const response = await loginAPI.login(credentials);
  useAuthStore.login(response.user, response.token);
};
```

---

## State Management

### Zustand Overview
Lightweight, simple state management without boilerplate.

```javascript
import { create } from 'zustand';

const useMyStore = create((set) => ({
  // State
  count: 0,
  
  // Actions
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

### Stores in Our App

#### **useAuthStore**
Manages user authentication

```javascript
// State
{
  user: null,
  token: null,
  isLoggedIn: false
}

// Actions
login(user, token)          // Set user and token
logout()                    // Clear user data
setUser(user)              // Update user info
```

**Usage:**
```jsx
const { user, isLoggedIn, login, logout } = useAuthStore();

// Login
login(userData, jwtToken);

// Check if logged in
if (isLoggedIn) {
  // Show user content
}
```

#### **useCartStore**
Manages shopping cart

```javascript
// State
{
  items: []
}

// Actions
addToCart(product, quantity)     // Add item
removeFromCart(productId)        // Remove item
updateQuantity(productId, qty)   // Update qty
clearCart()                      // Empty cart
getTotalPrice()                  // Calculate total
getTotalQuantity()               // Count items
```

**Usage:**
```jsx
const { items, addToCart, getTotalPrice } = useCartStore();

// Add product
addToCart(product, 1);

// Get total
const total = getTotalPrice();
```

**Persistence:**
Data saved to localStorage automatically:
```javascript
localStorage.setItem('cart', JSON.stringify(items));
```

#### **useCheckoutStore**
Manages checkout flow

```javascript
// State
{
  shippingAddress: null,
  shippingMethod: 'standard',
  paymentMethod: 'credit-card',
  orderNotes: ''
}

// Actions
setShippingAddress(address)      // Save address
setShippingMethod(method)        // Set shipping
setPaymentMethod(method)         // Set payment
clearCheckout()                  // Reset checkout
```

---

## API Integration

### API Client Setup (Axios)

```javascript
// api/index.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
```

### API Endpoints Called

#### Authentication
```javascript
POST   /api/auth/register      // Create new account
POST   /api/auth/login         // Login user
```

#### Products
```javascript
GET    /api/products           // Get all products
GET    /api/products/:id       // Get product details
```

#### Categories
```javascript
GET    /api/categories         // Get all categories
POST   /api/categories         // Create category (admin)
PUT    /api/categories/:id     // Update category (admin)
DELETE /api/categories/:id     // Delete category (admin)
```

#### Orders
```javascript
POST   /api/orders             // Create order
GET    /api/orders             // Get user's orders
GET    /api/orders/:id         // Get order details
PUT    /api/orders/:id         // Update order
PUT    /api/orders/:id/cancel  // Cancel order
```

#### Admin
```javascript
GET    /api/admin/dashboard/stats  // Get statistics
GET    /api/admin/users            // Get all users
PUT    /api/admin/users/:id/role   // Change user role
DELETE /api/admin/users/:id        // Delete user
```

### Making API Calls

```jsx
import axios from 'axios';

const fetchProducts = async () => {
  try {
    const response = await axios.get('/products');
    setProducts(response.data.data);
  } catch (error) {
    console.error('Error:', error);
    setError('Failed to load products');
  }
};
```

### With Authentication

```jsx
const fetchUserOrders = async () => {
  const token = localStorage.getItem('token');
  
  const response = await axios.get('/orders', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
```

---

## Styling

### Tailwind CSS
Utility-first CSS framework for rapid UI development.

#### Common Utilities

```jsx
// Layout
<div className="flex gap-4">           {/* Flexbox with gap */}
<div className="grid grid-cols-3">     {/* 3-column grid */}
<div className="max-w-7xl mx-auto">    {/* Max width + center */}

// Sizing
<div className="w-full h-screen">      {/* Full width & height */}
<div className="w-24 h-24">            {/* Fixed size */}

// Colors
<div className="bg-blue-600">          {/* Background */}
<p className="text-gray-700">          {/* Text color */}
<button className="border-red-500">   {/* Border color */}

// Spacing
<div className="p-6">                  {/* Padding */}
<div className="mb-4">                 {/* Margin bottom */}
<div className="gap-8">                {/* Gap between children */}

// Responsive
<div className="block md:hidden">      {/* Show only on mobile */}
<div className="hidden lg:block">      {/* Show only on large screens */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// Effects
<button className="hover:bg-blue-700"> {/* Hover state */}
<div className="transition">            {/* Smooth transitions */}
<div className="shadow-lg">             {/* Drop shadow */}
<div className="rounded-lg">            {/* Border radius */}
```

#### Responsive Design Pattern
```jsx
// Mobile first, then larger screens
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-4 
  gap-6
">
  {/* Grid: 1 col mobile, 2 cols tablet, 4 cols desktop */}
</div>
```

#### Custom Config
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',  // Custom blue
      },
    },
  },
};
```

---

## Key Features

### 🛒 Shopping Cart
- **Add items** - Click "Add to Cart" on product
- **Persist** - Data saved in localStorage
- **Manage** - Update quantity or remove items
- **Calculate** - Automatic total & tax

```jsx
// Add to cart
addToCart(product, quantity);

// Items in cart
const { items } = useCartStore();
```

### 🔐 Authentication
- **Register** - Create new account
- **Login** - Get JWT token
- **Persist** - Token saved in localStorage
- **Protected Routes** - Redirect if not logged in

```jsx
// Login flow
login(email, password)
  → Get JWT token
  → Store in localStorage
  → Update auth store
  → Redirect to home
```

### 💳 Checkout Flow
1. **Cart** - Review items
2. **Login Check** - Redirect if not logged in
3. **Checkout** - Enter/confirm shipping address
4. **Payment** - Select payment method
5. **Confirmation** - Order success

```jsx
/cart → /checkout → /payment → /order-confirmation
```

### 🏪 Admin Panel
- **Dashboard** - Statistics and KPIs
- **Categories** - Create, read, update, delete
- **Users** - Manage roles and permissions
- **Products** - Edit product details

### 📱 Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Tested on multiple devices

---

## Troubleshooting

### Common Issues

#### 1. **API calls return 404**
```
Problem: Cannot find API endpoint
Solution:
- Check VITE_API_URL in .env.local
- Verify backend is running (port 5000)
- Check API endpoint spelling
```

#### 2. **Token not sent with requests**
```
Problem: API returns 401 Unauthorized
Solution:
- Check localStorage has 'token' key
- Verify token in axios interceptor
- Check token hasn't expired
```

#### 3. **Cart items disappear on refresh**
```
Problem: useCartStore not persisting
Solution:
- Check localStorage.setItem('cart', ...) is called
- Verify browser localStorage is enabled
- Clear localStorage if corrupted: localStorage.clear()
```

#### 4. **Components not updating**
```
Problem: State changes don't reflect in UI
Solution:
- Check state is updated with setState (not mutated)
- Verify dependency array in useEffect
- Check component is not memoized incorrectly
```

#### 5. **CSS not applying**
```
Problem: Tailwind classes don't work
Solution:
- Run `npm install` to get latest Tailwind
- Restart dev server: npm run dev
- Check class names are exact (no typos)
- Rebuild CSS: npm run build
```

#### 6. **Module not found errors**
```
Problem: Import errors
Solution:
- Check file paths are correct
- Use @ alias if configured
- Clear node_modules: rm -rf node_modules && npm install
```

### Debug Tips

```javascript
// Log store state
const store = useAuthStore();
console.log('Auth Store:', store);

// Log API response
try {
  const response = await axios.get('/products');
  console.log('API Response:', response.data);
} catch (error) {
  console.log('API Error:', error.response);
}

// Check localStorage
console.log('localStorage:', localStorage);
console.log('Token:', localStorage.getItem('token'));
```

---

## Development Workflow

### 1. **Creating a New Page**
```jsx
// pages/NewPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch data
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Page Title</h1>
      {/* Content */}
    </div>
  );
}
```

### 2. **Adding Route**
```jsx
// App.jsx
<Route path="/new-page" element={<NewPage />} />
```

### 3. **Creating Component**
```jsx
// components/MyComponent.jsx
export default function MyComponent({ prop1, prop2 }) {
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

### 4. **Using Store**
```jsx
import { useCartStore } from '../store';

const { items, addToCart } = useCartStore();
```

---

## Best Practices

✅ **Do:**
- Keep components small and focused
- Use meaningful variable names
- Add error handling to API calls
- Use localStorage for persistence
- Test on multiple screen sizes
- Use semantic HTML
- Add loading states
- Validate form inputs

❌ **Don't:**
- Mutate state directly
- Make API calls without try-catch
- Hardcode URLs (use env variables)
- Ignore accessibility
- Add styles globally if possible
- Forget dependency arrays in useEffect
- Leave console.log in production code

---

## Resources

- [React Documentation](https://react.dev)
- [React Router Guide](https://reactrouter.com)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com)
- [Axios Documentation](https://axios-http.com)
- [Vite Guide](https://vitejs.dev)

---

**Happy Coding! 🚀**
