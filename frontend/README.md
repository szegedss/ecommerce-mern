# E-Commerce Frontend

A modern, responsive e-commerce frontend built with React, Vite, and Tailwind CSS.

## Features

- Home page with product grid
- User authentication (login/register)
- Shopping cart with persistent storage
- Responsive design for all devices
- State management with Zustand
- API integration with Axios
- Client-side routing with React Router

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```bash
cp .env.example .env.local
```

3. Update the API URL in `.env.local` if needed

## Running the Development Server

```bash
npm run dev
```

The application will run on `http://localhost:3000`

## Building for Production

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── api/
│   └── index.js             # API client and endpoints
├── components/
│   ├── Navbar.jsx           # Navigation bar
│   ├── ProductGrid.jsx      # Product listing
│   └── LoginForm.jsx        # Login form
├── pages/
│   ├── Home.jsx             # Home page
│   ├── Login.jsx            # Login page
│   └── Cart.jsx             # Shopping cart page
├── store/
│   └── index.js             # Zustand stores (auth, cart)
├── App.jsx                  # Main app component
├── main.jsx                 # Entry point
├── index.css                # Global styles
└── assets/                  # Static assets
```

## Key Components

### Navbar
Navigation bar with links to home, products, cart, and user authentication buttons.

### ProductGrid
Displays products in a responsive grid layout with add-to-cart functionality.

### LoginForm
User login form with email and password inputs.

### Cart Page
Shopping cart with ability to adjust quantities, remove items, and proceed to checkout.

## State Management (Zustand)

### Auth Store
- `user` - Current user info
- `token` - JWT token
- `isLoggedIn` - Login status
- `login()` - Set user and token
- `logout()` - Clear user and token
- `setUser()` - Update user info

### Cart Store
- `items` - Array of cart items
- `addToCart()` - Add product to cart
- `removeFromCart()` - Remove product from cart
- `updateQuantity()` - Change item quantity
- `clearCart()` - Empty the cart
- `getTotalPrice()` - Calculate total price

## API Integration

### Available Endpoints

**Auth:**
- `authAPI.register(data)` - Register new user
- `authAPI.login(data)` - Login user

**Products:**
- `productsAPI.getAll(params)` - Get all products
- `productsAPI.getById(id)` - Get product details
- `productsAPI.create(data)` - Create product
- `productsAPI.update(id, data)` - Update product
- `productsAPI.delete(id)` - Delete product

**Orders:**
- `ordersAPI.create(data)` - Create order
- `ordersAPI.getAll()` - Get user's orders
- `ordersAPI.getById(id)` - Get order details
- `ordersAPI.update(id, data)` - Update order

## Styling

The project uses Tailwind CSS for styling. Tailwind configuration is in `tailwind.config.js`.

### Custom Colors
- `primary` - #3B82F6 (blue)
- `secondary` - #10B981 (green)

## Environment Variables

### .env.local
```
VITE_API_URL=http://localhost:5000/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- `react` - UI library
- `react-dom` - React DOM rendering
- `react-router-dom` - Client-side routing
- `axios` - HTTP client
- `zustand` - State management

## Dev Dependencies

- `@vitejs/plugin-react` - Vite React plugin
- `vite` - Build tool
- `tailwindcss` - CSS framework
- `postcss` - CSS processor
- `autoprefixer` - CSS vendor prefixes
- `eslint` - Code linting
- `eslint-plugin-react` - React linting rules
- `eslint-plugin-react-hooks` - React hooks linting rules

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features to Implement

- [ ] Product search and filtering
- [ ] Product details page
- [ ] User profile page
- [ ] Order history page
- [ ] Checkout flow
- [ ] Payment integration
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Admin dashboard
- [ ] User settings

## Performance Optimization

- Code splitting with React Router
- Lazy loading of components
- Image optimization
- CSS minification
- Production build optimization

## License

ISC
