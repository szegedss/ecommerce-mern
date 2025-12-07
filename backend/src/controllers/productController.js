const Product = require('../models/Product');
const logger = require('../utils/logger');

/**
 * Get all products with filtering
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, minRating, sort, page = 1, limit = 20 } = req.query;
    let query = {};

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { name_th: { $regex: search, $options: 'i' } },
        { name_en: { $regex: search, $options: 'i' } },
        { description_th: { $regex: search, $options: 'i' } },
        { description_en: { $regex: search, $options: 'i' } },
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Sorting options
    let sortOption = { createdAt: -1 };
    if (sort) {
      switch (sort) {
        case 'price-asc':
          sortOption = { price: 1 };
          break;
        case 'price-desc':
          sortOption = { price: -1 };
          break;
        case 'rating':
          sortOption = { rating: -1 };
          break;
        case 'popular':
          sortOption = { soldCount: -1 };
          break;
        case 'newest':
        default:
          sortOption = { createdAt: -1 };
      }
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    logger.debug('Products fetched', { count: products.length, page: pageNum, total });

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    logger.error('Error fetching products', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get product by ID
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    logger.error('Error fetching product', { error: error.message, id: req.params.id });
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create a new product
 */
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    logger.info('Product created', { id: product._id, name: product.name_en });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    logger.error('Error creating product', { error: error.message });
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Update a product
 */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    logger.info('Product updated', { id: product._id });
    res.json({ success: true, data: product });
  } catch (error) {
    logger.error('Error updating product', { error: error.message, id: req.params.id });
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Delete a product
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    logger.info('Product deleted', { id: req.params.id });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    logger.error('Error deleting product', { error: error.message, id: req.params.id });
    res.status(500).json({ success: false, message: error.message });
  }
};
