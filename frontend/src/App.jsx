import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ThankYou from './pages/ThankYou';
import Payment from './pages/Payment';
import PaymentPage from './pages/PaymentPage';
import OrderConfirmation from './pages/OrderConfirmation';
import MyCoupons from './pages/MyCoupons';
import MyOrders from './pages/MyOrders';
import AdminPage from './pages/Admin';
import AdminCategoriesPage from './pages/AdminCategories';
import AdminUsersPage from './pages/AdminUsers';
import AdminCouponsPage from './pages/AdminCoupons';
import AdminOrders from './pages/AdminOrders';

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
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/thank-you/:orderId" element={<ThankYou />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/payment-gateway" element={<PaymentPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/my-coupons" element={<MyCoupons />} />
                <Route path="/my-orders" element={<MyOrders />} />
              </Routes>
            </div>
          }
        />
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/coupons" element={<AdminCouponsPage />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
      </Routes>
    </Router>
  );
}

export default App;
