const express = require('express');
const router = express.Router();
const { orderController } = require('../controllers');
const { protect, admin } = require('../middleware/auth');

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get current user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 */
router.get('/', protect, 
  // #swagger.tags = ['Orders']
  // #swagger.summary = 'Get current user orders'
  orderController.getMyOrders
);

/**
 * @swagger
 * /orders/all:
 *   get:
 *     summary: Get all orders (Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of all orders
 */
router.get('/all', protect, admin, 
  // #swagger.tags = ['Orders']
  // #swagger.summary = 'Get all orders (Admin)'
  orderController.getAllOrders
);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get('/:id', protect, 
  // #swagger.tags = ['Orders']
  // #swagger.summary = 'Get order by ID'
  orderController.getOrderById
);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created
 */
router.post('/', protect, 
  // #swagger.tags = ['Orders']
  // #swagger.summary = 'Create a new order'
  orderController.createOrder
);

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update order status (Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, paid, failed, refunded]
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.put('/:id/status', protect, admin, 
  // #swagger.tags = ['Orders']
  // #swagger.summary = 'Update order status (Admin)'
  orderController.updateOrderStatus
);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   post:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled
 */
router.post('/:id/cancel', protect, 
  // #swagger.tags = ['Orders']
  // #swagger.summary = 'Cancel an order'
  orderController.cancelOrder
);

module.exports = router;
