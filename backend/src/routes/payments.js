const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_fake_key');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /payments/stripe:
 *   post:
 *     summary: Process Stripe payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               paymentMethodId:
 *                 type: string
 *               cardholderName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment processed successfully
 */
// POST /api/payments/stripe - Process Stripe payment
router.post('/stripe', protect, async (req, res) => {
  // #swagger.tags = ['Payments']
  // #swagger.summary = 'Process Stripe payment'
  try {
    const { amount, paymentMethodId, cardholderName } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      });
    }

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required',
      });
    }

    // ✅ SECURITY: In production, use Stripe's Payment Intents API
    // This ensures card data NEVER comes to your backend
    // For now, simulate payment processing with token
    const charge = {
      id: `ch_${Math.random().toString(36).substring(7)}`,
      amount,
      currency: 'thb',
      status: 'succeeded',
      payment_method: paymentMethodId,
    };

    res.json({
      success: true,
      data: {
        transactionId: charge.id,
        status: charge.status,
        amount: amount,
        method: 'stripe',
        timestamp: new Date()
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Stripe payment failed',
    });
  }
});

// Process PayPal payment
router.post('/paypal', protect, async (req, res) => {
  // #swagger.tags = ['Payments']
  // #swagger.summary = 'Process PayPal payment'
  try {
    const { paypalOrderId, paypalPayerId, amount } = req.body;

    if (!paypalOrderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PayPal order',
      });
    }

    // In production, verify with PayPal API
    // For demo, assume payment is successful
    res.json({
      success: true,
      data: {
        transactionId: paypalOrderId,
        paypalOrderId,
        status: 'completed',
        amount,
        method: 'paypal',
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'PayPal payment failed',
    });
  }
});

// Process PromptPay payment
router.post('/promptpay', protect, async (req, res) => {
  // #swagger.tags = ['Payments']
  // #swagger.summary = 'Process PromptPay payment'
  try {
    const { amount, phone, reference } = req.body;

    if (!amount || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PromptPay payment details',
      });
    }

    // In production, integrate with Thai payment gateway
    // For demo, create pending payment record
    const transactionId = `PP_${Date.now()}_${reference}`;

    res.json({
      success: true,
      data: {
        transactionId,
        phone,
        reference,
        amount,
        status: 'pending',
        method: 'promptpay',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'PromptPay payment failed',
    });
  }
});

// Confirm payment and update order
router.post('/confirm', protect, async (req, res) => {
  // #swagger.tags = ['Payments']
  // #swagger.summary = 'Confirm payment and update order'
  try {
    const { orderId, paymentMethod, paymentDetails, amount } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
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

    // Update order with payment info
    order.paymentMethod = paymentMethod;
    order.paymentStatus = 'completed';
    order.paymentDetails = {
      method: paymentMethod,
      transactionId: paymentDetails.transactionId,
      timestamp: new Date(),
      amount,
    };

    // Change status to processing if payment successful
    if (paymentDetails.status === 'completed') {
      order.status = 'processing';
    }

    await order.save();
    await order.populate('userId', '-password');

    res.json({
      success: true,
      data: order,
      message: 'Payment confirmed successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Payment confirmation failed',
    });
  }
});

// Get payment status
router.get('/:orderId/status', protect, async (req, res) => {
  // #swagger.tags = ['Payments']
  // #swagger.summary = 'Get payment status'
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        amount: order.total,
        timestamp: order.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
