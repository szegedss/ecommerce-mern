# E-Commerce Backend API

A RESTful API for an e-commerce platform built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Product management
- Order management
- Role-based access control
- Input validation
- Error handling
- CORS enabled
- Security headers with Helmet

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on the port specified in `.env` (default: 5000)

## API Documentation

### Health Check
```
GET /api/health
```

### Authentication Routes

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Products Routes

#### Get All Products
```
GET /api/products
Query Parameters:
  - category: filter by category
  - search: search by name or description
```

#### Get Product by ID
```
GET /api/products/:id
```

#### Create Product (Admin only)
```
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "category": "Electronics",
  "image": "image-url",
  "stock": 10
}
```

#### Update Product (Admin only)
```
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 89.99,
  "stock": 15
}
```

#### Delete Product (Admin only)
```
DELETE /api/products/:id
Authorization: Bearer <token>
```

### Orders Routes

#### Create Order
```
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "product_id",
      "name": "Product Name",
      "price": 99.99,
      "quantity": 2
    }
  ],
  "totalAmount": 199.98,
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}
```

#### Get All Orders (User's orders)
```
GET /api/orders
Authorization: Bearer <token>
```

#### Get Order by ID
```
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Update Order Status (Admin only)
```
PUT /api/orders/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "shipped",
  "paymentStatus": "completed"
}
```

## Project Structure

```
src/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── User.js              # User schema
│   ├── Product.js           # Product schema
│   └── Order.js             # Order schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── products.js          # Product routes
│   └── orders.js            # Order routes
├── utils/
│   └── jwt.js               # JWT utilities
└── index.js                 # Application entry point
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  avatar: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Product Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  stock: Number,
  rating: Number,
  reviews: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  items: [
    {
      productId: ObjectId (ref: Product),
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  totalAmount: Number,
  status: String (enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: String,
  paymentStatus: String (enum: ['pending', 'completed', 'failed']),
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- JWT authentication
- Password hashing with bcryptjs
- CORS protection
- Security headers with Helmet
- Input validation with Mongoose schemas
- Role-based access control

## Dependencies

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `dotenv` - Environment variables
- `cors` - CORS middleware
- `helmet` - Security headers

## Dev Dependencies

- `nodemon` - Auto-reload on file changes

## Environment Variables

See `.env.example` for required environment variables:
- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE` - JWT expiration time
- `NODE_ENV` - Environment (development/production)

## License

ISC
