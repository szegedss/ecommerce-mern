const Category = require('../models/Category');
const logger = require('../utils/logger');

/**
 * Get all categories
 */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name_en: 1 });
    logger.debug('Categories fetched', { count: categories.length });
    res.json({ success: true, data: categories });
  } catch (error) {
    logger.error('Error fetching categories', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get category by ID or slug
 */
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    let category;

    // Check if it's a slug or ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(id);
    } else {
      category = await Category.findOne({ slug: id });
    }

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    logger.error('Error fetching category', { error: error.message, id: req.params.id });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create a new category (Admin)
 */
exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    logger.info('Category created', { id: category._id, name: category.name_en });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    logger.error('Error creating category', { error: error.message });
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Update a category (Admin)
 */
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    logger.info('Category updated', { id: category._id });
    res.json({ success: true, data: category });
  } catch (error) {
    logger.error('Error updating category', { error: error.message, id: req.params.id });
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Delete a category (Admin)
 */
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    logger.info('Category deleted', { id: req.params.id });
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    logger.error('Error deleting category', { error: error.message, id: req.params.id });
    res.status(500).json({ success: false, message: error.message });
  }
};
