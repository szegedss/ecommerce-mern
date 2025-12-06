const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Create order
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, subtotal, discount, couponCode, tax, total, paymentMethod } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item',
      });
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.address) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
      });
    }

    // Validate total
    if (!total || total <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order total',
      });
    }

    const order = new Order({
      userId: req.userId,
      items,
      shippingAddress,
      subtotal: subtotal || 0,
      discount: discount || 0,
      couponCode: couponCode || null,
      tax: tax || 0,
      total,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
    });

    await order.save();
    await order.populate('userId', '-password');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Get user orders
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId: req.userId })
      .populate('items.productId')
      .populate('userId', '-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ userId: req.userId });

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get order by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', '-password');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user owns the order
    if (order.userId._id.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this order',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update order status
router.put('/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check authorization
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this order',
      });
    }

    if (status) {
      order.updateStatus(status);
    }

    await order.save();
    await order.populate('userId', '-password');

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Cancel order
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check authorization
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Only allow cancellation of pending orders
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this order',
      });
    }

    order.status = 'cancelled';
    await order.save();
    await order.populate('userId', '-password');

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// ADMIN ROUTES - Get all orders for admin
router.get('/admin/all', protect, async (req, res) => {
  try {
    // Check if user is admin (would need admin middleware in real app)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const paymentStatus = req.query.paymentStatus;

    let filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const orders = await Order.find(filter)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ADMIN ROUTE - Update order status
router.put('/admin/:id/status', protect, async (req, res) => {
  try {
    const { status, trackingNumber, note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Update status with timeline
    const updated = order.updateStatus(status, note);
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();
    await order.populate('userId', 'name email');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// ADMIN ROUTE - Get order statistics
router.get('/admin/stats', protect, async (req, res) => {
  try {
    const stats = {
      totalOrders: await Order.countDocuments(),
      pendingOrders: await Order.countDocuments({ status: 'pending' }),
      processingOrders: await Order.countDocuments({ status: 'processing' }),
      shippedOrders: await Order.countDocuments({ status: 'shipped' }),
      deliveredOrders: await Order.countDocuments({ status: 'delivered' }),
      cancelledOrders: await Order.countDocuments({ status: 'cancelled' }),
      pendingPayments: await Order.countDocuments({ paymentStatus: 'pending' }),
      completedPayments: await Order.countDocuments({ paymentStatus: 'completed' }),
      totalRevenue: 0,
    };

    // Calculate total revenue
    const revenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    if (revenue.length > 0) {
      stats.totalRevenue = revenue[0].total;
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
