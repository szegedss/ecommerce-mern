import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components';
import {
  Home,
  Products,
  ProductDetails,
  Login as LoginPage,
  Register as RegisterPage,
  ForgotPassword,
  ResetPassword,
  VerifyEmail,
  Profile,
  Cart,
  Checkout,
  ThankYou,
  Payment,
  PaymentPage,
  OrderConfirmation,
  MyCoupons,
  MyOrders,
  Wishlist,
} from './pages';
import {
  AdminPage,
  AdminCategoriesPage,
  AdminProductsPage,
  AdminUsersPage,
  AdminCouponsPage,
  AdminOrdersPage,
} from './admin';

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/*"
          element={
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:productId" element={<ProductDetails />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/verify-email/:token" element={<VerifyEmail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/thank-you/:orderId" element={<ThankYou />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/payment-gateway" element={<PaymentPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/my-coupons" element={<MyCoupons />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/wishlist" element={<Wishlist />} />
              </Routes>
            </div>
          }
        />
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/coupons" element={<AdminCouponsPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
      </Routes>
    </Router>
  );
}

export default App;
