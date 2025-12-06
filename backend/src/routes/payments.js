const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_fake_key');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// Process Stripe payment
router.post('/stripe', protect, async (req, res) => {
  try {
    const { amount, cardData } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      });
    }

    // In production, use Stripe's Payment Intents or Tokens
    // For now, simulate payment processing
    const charge = {
      id: `ch_${Math.random().toString(36).substring(7)}`,
      amount,
      currency: 'thb',
      status: 'succeeded',
      payment_method: {
        card: {
          last4: cardData.cardNumber?.slice(-4) || '0000',
          brand: 'visa',
        },
      },
    };

    res.json({
      success: true,
      data: {
        transactionId: charge.id,
        status: charge.status,
        amount: amount / 100,
        method: 'stripe',
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
