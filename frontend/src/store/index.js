import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoggedIn: !!localStorage.getItem('token'),

  login: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isLoggedIn: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isLoggedIn: false });
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}));

export const useCartStore = create((set) => ({
  items: JSON.parse(localStorage.getItem('cart')) || [],
  coupon: JSON.parse(localStorage.getItem('appliedCoupon')) || null,
  discountAmount: parseFloat(localStorage.getItem('discountAmount')) || 0,

  addToCart: (product, quantity = 1) => {
    set((state) => {
      const existingItem = state.items.find((item) => item._id === product._id);
      let newItems;

      if (existingItem) {
        newItems = state.items.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...state.items, { ...product, quantity }];
      }

      localStorage.setItem('cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  removeFromCart: (productId) => {
    set((state) => {
      const newItems = state.items.filter((item) => item._id !== productId);
      localStorage.setItem('cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  updateQuantity: (productId, quantity) => {
    set((state) => {
      const newItems = state.items.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      );
      localStorage.setItem('cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  clearCart: () => {
    localStorage.removeItem('cart');
    set({ items: [] });
  },

  applyCoupon: (coupon, discountAmount) => {
    localStorage.setItem('appliedCoupon', JSON.stringify(coupon));
    localStorage.setItem('discountAmount', discountAmount.toString());
    set({ coupon, discountAmount });
  },

  removeCoupon: () => {
    localStorage.removeItem('appliedCoupon');
    localStorage.removeItem('discountAmount');
    set({ coupon: null, discountAmount: 0 });
  },

  getTotalPrice: () => {
    const state = useCartStore.getState();
    return state.items.reduce((total, item) => {
      const itemPrice = item.finalPrice || item.price;
      return total + itemPrice * item.quantity;
    }, 0);
  },

  getTotalQuantity: () => {
    const state = useCartStore.getState();
    return state.items.reduce((total, item) => total + item.quantity, 0);
  },

  getFinalTotal: () => {
    const state = useCartStore.getState();
    const subtotal = state.getTotalPrice();
    return Math.max(0, subtotal - state.discountAmount);
  },
}));

export const useCheckoutStore = create((set) => ({
  shippingAddress: JSON.parse(localStorage.getItem('shippingAddress')) || null,
  shippingMethod: localStorage.getItem('shippingMethod') || 'standard',
  paymentMethod: localStorage.getItem('paymentMethod') || 'credit-card',
  orderNotes: localStorage.getItem('orderNotes') || '',

  setShippingAddress: (address) => {
    localStorage.setItem('shippingAddress', JSON.stringify(address));
    set({ shippingAddress: address });
  },

  setShippingMethod: (method) => {
    localStorage.setItem('shippingMethod', method);
    set({ shippingMethod: method });
  },

  setPaymentMethod: (method) => {
    localStorage.setItem('paymentMethod', method);
    set({ paymentMethod: method });
  },

  setOrderNotes: (notes) => {
    localStorage.setItem('orderNotes', notes);
    set({ orderNotes: notes });
  },

  clearCheckout: () => {
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('shippingMethod');
    localStorage.removeItem('paymentMethod');
    localStorage.removeItem('orderNotes');
    set({
      shippingAddress: null,
      shippingMethod: 'standard',
      paymentMethod: 'credit-card',
      orderNotes: '',
    });
  },
}));

export const useWishlistStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchWishlist: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ loading: true, error: null });
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        set({ items: data.data.products, loading: false });
      } else {
        set({ error: data.message, loading: false });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addToWishlist: async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, message: 'Please login first' };

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/wishlist/${productId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        set({ items: data.data.products });
        return { success: true, message: 'Added to wishlist' };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  removeFromWishlist: async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, message: 'Please login first' };

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        set((state) => ({
          items: state.items.filter((item) => item.product._id !== productId),
        }));
        return { success: true, message: 'Removed from wishlist' };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  isInWishlist: (productId) => {
    const state = get();
    return state.items.some((item) => item.product?._id === productId);
  },

  clearWishlist: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await fetch(`${API_URL}/wishlist`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ items: [] });
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    }
  },

  getWishlistCount: () => {
    return get().items.length;
  },
}));