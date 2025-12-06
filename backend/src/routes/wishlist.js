const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

// @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.userId }).populate({
      path: 'products.product',
      select: 'name price images description category stock',
    });

    if (!wishlist) {
      // Create empty wishlist if none exists
      wishlist = await Wishlist.create({
        user: req.userId,
        products: [],
      });
    }

    // Filter out null products (deleted products)
    const validProducts = wishlist.products.filter((item) => item.product !== null);

    res.status(200).json({
      success: true,
      data: {
        _id: wishlist._id,
        products: validProducts,
        count: validProducts.length,
      },
    });
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ success: false, message: 'Error fetching wishlist' });
  }
});

// @route   POST /api/wishlist/:productId
// @desc    Add product to wishlist
// @access  Private
router.post('/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.userId,
        products: [],
      });
    }

    // Check if product already in wishlist
    const existingIndex = wishlist.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist',
      });
    }

    // Add product to wishlist
    wishlist.products.push({
      product: productId,
      addedAt: new Date(),
    });

    await wishlist.save();

    // Populate for response
    await wishlist.populate({
      path: 'products.product',
      select: 'name price images description category stock',
    });

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      data: {
        _id: wishlist._id,
        products: wishlist.products,
        count: wishlist.products.length,
      },
    });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({ success: false, message: 'Error adding to wishlist' });
  }
});

// @route   DELETE /api/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete('/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const wishlist = await Wishlist.findOne({ user: req.userId });

    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    // Find product in wishlist
    const productIndex = wishlist.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist',
      });
    }

    // Remove product from wishlist
    wishlist.products.splice(productIndex, 1);
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      data: {
        _id: wishlist._id,
        count: wishlist.products.length,
      },
    });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({ success: false, message: 'Error removing from wishlist' });
  }
});

// @route   GET /api/wishlist/check/:productId
// @desc    Check if product is in wishlist
// @access  Private
router.get('/check/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const wishlist = await Wishlist.findOne({ user: req.userId });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        inWishlist: false,
      });
    }

    const inWishlist = wishlist.products.some(
      (item) => item.product.toString() === productId
    );

    res.status(200).json({
      success: true,
      inWishlist,
    });
  } catch (err) {
    console.error('Error checking wishlist:', err);
    res.status(500).json({ success: false, message: 'Error checking wishlist' });
  }
});

// @route   DELETE /api/wishlist
// @desc    Clear entire wishlist
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.userId });

    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.products = [];
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared',
      data: {
        _id: wishlist._id,
        products: [],
        count: 0,
      },
    });
  } catch (err) {
    console.error('Error clearing wishlist:', err);
    res.status(500).json({ success: false, message: 'Error clearing wishlist' });
  }
});

// @route   POST /api/wishlist/move-to-cart/:productId
// @desc    Move product from wishlist to cart
// @access  Private
router.post('/move-to-cart/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    // Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < 1) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock',
      });
    }

    // Find wishlist
    const wishlist = await Wishlist.findOne({ user: req.userId });

    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    // Find product in wishlist
    const productIndex = wishlist.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist',
      });
    }

    // Remove from wishlist
    wishlist.products.splice(productIndex, 1);
    await wishlist.save();

    // Return success - cart addition handled on frontend
    res.status(200).json({
      success: true,
      message: 'Product ready to add to cart',
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images,
        stock: product.stock,
      },
    });
  } catch (err) {
    console.error('Error moving to cart:', err);
    res.status(500).json({ success: false, message: 'Error moving to cart' });
  }
});

module.exports = router;
