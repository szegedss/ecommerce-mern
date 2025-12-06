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
    // Base price
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price cannot be negative'],
    },
    // Discount settings
    discount: {
      // Type of discount: 'percentage' or 'fixed'
      type: {
        type: String,
        enum: ['percentage', 'fixed', 'none'],
        default: 'none',
      },
      // Discount value (percentage 0-100 or fixed amount)
      value: {
        type: Number,
        default: 0,
        min: 0,
        validate: {
          validator: function (value) {
            if (this.discount.type === 'percentage') {
              return value >= 0 && value <= 100;
            }
            return true;
          },
          message: 'For percentage discount, value must be between 0-100',
        },
      },
      // Discount start date
      startDate: {
        type: Date,
        default: null,
      },
      // Discount end date
      endDate: {
        type: Date,
        default: null,
      },
    },
    // Calculated final price (will be updated by middleware)
    finalPrice: {
      type: Number,
      default: null,
    },
    category: {
      type: String,
      required: [true, 'Please provide a product category'],
    },
    // Main image (backward compatibility)
    image: {
      type: String,
      default: '',
    },
    // Multiple images array (new)
    images: [{
      url: { type: String, required: true },
      publicId: { type: String }, // Cloudinary public ID for deletion
      alt: { type: String, default: '' },
      isPrimary: { type: Boolean, default: false },
    }],
    // Video URL (optional)
    video: {
      url: { type: String, default: '' },
      publicId: { type: String },
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

// Pre-save middleware to calculate final price
productSchema.pre('save', function (next) {
  this.finalPrice = this.calculateFinalPrice();
  next();
});

// Method to calculate final price based on discount
productSchema.methods.calculateFinalPrice = function () {
  let finalPrice = this.price;

  // Check if discount is active
  const now = new Date();
  if (
    this.discount.type !== 'none' &&
    this.discount.startDate &&
    this.discount.endDate &&
    now >= this.discount.startDate &&
    now <= this.discount.endDate
  ) {
    if (this.discount.type === 'percentage') {
      finalPrice = this.price * (1 - this.discount.value / 100);
    } else if (this.discount.type === 'fixed') {
      finalPrice = Math.max(0, this.price - this.discount.value);
    }
  }

  return Math.round(finalPrice * 100) / 100; // Round to 2 decimal places
};

// Method to get discount amount
productSchema.methods.getDiscountAmount = function () {
  const finalPrice = this.calculateFinalPrice();
  return Math.round((this.price - finalPrice) * 100) / 100;
};

// Method to get discount percentage
productSchema.methods.getDiscountPercentage = function () {
  const finalPrice = this.calculateFinalPrice();
  if (this.price === 0) return 0;
  return Math.round(((this.price - finalPrice) / this.price) * 100);
};

module.exports = mongoose.model('Product', productSchema);

module.exports = mongoose.model('Product', productSchema);
