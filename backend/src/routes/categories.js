const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/auth');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Create category (admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name_th, name_en, description_th, description_en, image, icon, displayOrder } = req.body;

    if (!name_th || !name_en) {
      return res.status(400).json({
        success: false,
        message: 'Category names in both Thai and English are required',
      });
    }

    // Generate slug from English name
    const slug = name_en.toLowerCase().replace(/\s+/g, '-');

    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists',
      });
    }

    const category = new Category({
      name_th,
      name_en,
      slug,
      description_th: description_th || '',
      description_en: description_en || '',
      image: image || '',
      icon: icon || '',
      displayOrder: displayOrder || 0,
    });

    await category.save();
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update category (admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name_th, name_en, description_th, description_en, image, icon, displayOrder, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if English name is being changed and if new slug already exists
    if (name_en && name_en !== category.name_en) {
      const newSlug = name_en.toLowerCase().replace(/\s+/g, '-');
      const existingCategory = await Category.findOne({ slug: newSlug, _id: { $ne: req.params.id } });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this English name already exists',
        });
      }
      category.slug = newSlug;
    }

    if (name_th) category.name_th = name_th;
    if (name_en) category.name_en = name_en;
    if (description_th !== undefined) category.description_th = description_th;
    if (description_en !== undefined) category.description_en = description_en;
    if (image !== undefined) category.image = image;
    if (icon !== undefined) category.icon = icon;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete category (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if any products use this category
    const Product = require('../models/Product');
    const productCount = await Product.countDocuments({ category: category.slug });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${productCount} products are using this category.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
