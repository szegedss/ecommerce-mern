const express = require('express');
const router = express.Router();

// ============================================
// AUTHENTICATION & USER ROUTES
// ============================================
const authRoutes = require('./auth');
router.use('/auth', authRoutes);

// ============================================
// PRODUCT MANAGEMENT ROUTES
// ============================================
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const reviewRoutes = require('./reviews');

router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/reviews', reviewRoutes);

// ============================================
// ORDER & PAYMENT ROUTES
// ============================================
const orderRoutes = require('./orders');
const paymentRoutes = require('./payments');
const couponRoutes = require('./coupons');

router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/coupons', couponRoutes);

// ============================================
// USER FEATURES ROUTES
// ============================================
const wishlistRoutes = require('./wishlist');

router.use('/wishlist', wishlistRoutes);

// ============================================
// FILE UPLOAD ROUTES
// ============================================
const uploadRoutes = require('./upload');

router.use('/upload', uploadRoutes);

// ============================================
// ADMIN ROUTES
// ============================================
const adminRoutes = require('./admin');

router.use('/admin', adminRoutes);

module.exports = router;
