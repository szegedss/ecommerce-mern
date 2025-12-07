const express = require('express');
const router = express.Router();
const { categoryController } = require('../controllers');
const { protect, admin } = require('../middleware/auth');

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', 
  // #swagger.tags = ['Categories']
  // #swagger.summary = 'Get all categories'
  categoryController.getAllCategories
);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID or slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
router.get('/:id', 
  // #swagger.tags = ['Categories']
  // #swagger.summary = 'Get category by ID'
  categoryController.getCategoryById
);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category (Admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Category created
 */
router.post('/', protect, admin, 
  // #swagger.tags = ['Categories']
  // #swagger.summary = 'Create a new category (Admin)'
  categoryController.createCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category (Admin)
 *     tags: [Categories]
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
 *         description: Category updated
 */
router.put('/:id', protect, admin, 
  // #swagger.tags = ['Categories']
  // #swagger.summary = 'Update a category (Admin)'
  categoryController.updateCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category (Admin)
 *     tags: [Categories]
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
 *         description: Category deleted
 */
router.delete('/:id', protect, admin, 
  // #swagger.tags = ['Categories']
  // #swagger.summary = 'Delete a category (Admin)'
  categoryController.deleteCategory
);

module.exports = router;
