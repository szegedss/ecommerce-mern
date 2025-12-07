const Order = require('../models/Order');
const Product = require('../models/Product');
const logger = require('../utils/logger');

/**
 * Get all orders for current user
 */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name_th name_en images');

    res.json({ success: true, data: orders });
  } catch (error) {
    logger.error('Error fetching user orders', { error: error.message, userId: req.userId });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get order by ID
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId', 'name_th name_en images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    logger.error('Error fetching order', { error: error.message, orderId: req.params.id });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create a new order
 */
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal, discount, tax, total, couponCode } = req.body;

    // Validate stock availability
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.name} not found`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}`,
        });
      }
    }

    // Create order
    const order = new Order({
      user: req.userId,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      discount: discount || 0,
      couponCode,
      tax,
      total,
      status: 'pending',
      paymentStatus: 'pending',
    });

    await order.save();

    // Update stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity, soldCount: item.quantity },
      });
    }

    logger.info('Order created', { orderId: order._id, userId: req.userId, total });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    logger.error('Error creating order', { error: error.message, userId: req.userId });
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Update order status (Admin)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const updateData = {};

    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    logger.info('Order status updated', { orderId: order._id, status, paymentStatus });

    res.json({ success: true, data: order });
  } catch (error) {
    logger.error('Error updating order status', { error: error.message, orderId: req.params.id });
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Cancel order
 */
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check if order can be cancelled
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order in current status',
      });
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity, soldCount: -item.quantity },
      });
    }

    order.status = 'cancelled';
    await order.save();

    logger.info('Order cancelled', { orderId: order._id, userId: req.userId });

    res.json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (error) {
    logger.error('Error cancelling order', { error: error.message, orderId: req.params.id });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all orders (Admin)
 */
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'name email'),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Error fetching all orders', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};
