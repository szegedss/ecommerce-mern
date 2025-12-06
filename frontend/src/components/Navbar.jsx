import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store';

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuthStore();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          E-Shop
        </Link>
        <div className="flex gap-4 items-center">
          <Link to="/products" className="text-gray-700 hover:text-primary">
            Products
          </Link>
          <Link to="/cart" className="text-gray-700 hover:text-primary">
            Cart
          </Link>
          {isLoggedIn ? (
            <>
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-primary">
                Login
              </Link>
              <Link to="/register" className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
