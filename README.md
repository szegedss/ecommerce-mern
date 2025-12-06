# E-Commerce MERN Stack

A full-stack e-commerce application built with React, Node.js, Express, and MongoDB.

## Project Structure

```
ecommerce-mern/
├── frontend/          # React + Vite + Tailwind CSS
└── backend/           # Node.js + Express + MongoDB + JWT
```

## Quick Start

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB connection string and JWT secret.

5. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file (copy from `.env.example`):
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Backend Features

- **Authentication**: User registration and login with JWT
- **Products**: CRUD operations for products
- **Orders**: Create and manage orders
- **Security**: JWT tokens, CORS, Helmet for headers

### API Endpoints

#### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

#### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status (admin)

## Frontend Features

- **Home Page**: Display products
- **Authentication**: Login and register pages
- **Shopping Cart**: Add/remove items, manage quantities
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **State Management**: Zustand for auth and cart state

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- CORS
- Helmet

### Frontend
- React 18
- Vite
- React Router v6
- Axios
- Zustand
- Tailwind CSS

## Database Models

### User
- name
- email (unique)
- password (hashed)
- role (user/admin)
- avatar
- phone
- address (street, city, state, zipCode, country)
- timestamps

### Product
- name
- description
- price
- category
- image
- stock
- rating
- reviews
- timestamps

### Order
- userId (reference to User)
- items (array with product references)
- totalAmount
- status (pending/processing/shipped/delivered/cancelled)
- shippingAddress
- paymentMethod
- paymentStatus
- timestamps

## Installation Requirements

- Node.js (v14+)
- npm or yarn
- MongoDB (local or cloud instance)

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
```

## Future Enhancements

- Product reviews and ratings
- Payment gateway integration (Stripe, PayPal)
- Email notifications
- Admin dashboard
- Product filtering and search
- Wishlist functionality
- Order tracking
- Product inventory management
- User profile management
- Two-factor authentication

## License

ISC

## Author

Your Name
