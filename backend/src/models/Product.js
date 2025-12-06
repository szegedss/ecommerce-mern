const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    // Thai name
    name_th: {
      type: String,
      required: [true, 'Please provide a product name in Thai'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    // English name
    name_en: {
      type: String,
      required: [true, 'Please provide a product name in English'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    // Thai description
    description_th: {
      type: String,
      required: [true, 'Please provide a product description in Thai'],
    },
    // English description
    description_en: {
      type: String,
      required: [true, 'Please provide a product description in English'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a product category'],
    },
    image: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      required: [true, 'Please provide product stock'],
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
