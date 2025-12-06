const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    // Thai code name
    code_th: {
      type: String,
      required: [true, 'Please provide a coupon code in Thai'],
      trim: true,
      maxlength: [100, 'Coupon code cannot exceed 100 characters'],
    },
    // English code name
    code_en: {
      type: String,
      required: [true, 'Please provide a coupon code in English'],
      trim: true,
      maxlength: [100, 'Coupon code cannot exceed 100 characters'],
    },
    // Unique code used for validation
    uniqueCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9]+$/, 'Coupon code must contain only uppercase letters and numbers'],
    },
    // Thai description
    description_th: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    // English description
    description_en: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    // Discount type: 'percentage' or 'fixed'
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Please specify discount type (percentage or fixed)'],
    },
    // Discount value (percentage 0-100 or fixed amount)
    discountValue: {
      type: Number,
      required: [true, 'Please provide discount value'],
      min: [0, 'Discount value must be at least 0'],
      validate: {
        validator: function (value) {
          if (this.discountType === 'percentage') {
            return value >= 0 && value <= 100;
          }
          return value >= 0;
        },
        message: 'For percentage discount, value must be between 0-100',
      },
    },
    // Minimum purchase amount required to use coupon
    minPurchaseAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum purchase amount must be at least 0'],
    },
    // Maximum discount cap (useful for percentage discounts)
    maxDiscountAmount: {
      type: Number,
      default: null,
    },
    // Coupon validity period
    startDate: {
      type: Date,
      required: [true, 'Please provide coupon start date'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please provide coupon expiry date'],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: 'Expiry date must be after start date',
      },
    },
    // Usage limits
    maxUsagePerUser: {
      type: Number,
      default: 1,
      min: [1, 'Max usage per user must be at least 1'],
    },
    totalUsageLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    // Current usage tracking
    currentUsageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Track which users have used this coupon
    usageHistory: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        usageCount: {
          type: Number,
          default: 1,
        },
        lastUsedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Categories this coupon applies to (if empty, applies to all)
    applicableCategories: [
      {
        type: String, // category slug
      },
    ],
    // Products this coupon applies to (if empty, applies to all)
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    // Created by admin
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Index for faster coupon lookups
couponSchema.index({ uniqueCode: 1 });
couponSchema.index({ expiryDate: 1 });
couponSchema.index({ isActive: 1 });

// Method to check if coupon is valid
couponSchema.methods.isValidCoupon = function () {
  const now = new Date();
  
  // Check if coupon is active
  if (!this.isActive) {
    return { valid: false, message: 'Coupon is not active' };
  }
  
  // Check expiry date
  if (now > this.expiryDate) {
    return { valid: false, message: 'Coupon has expired' };
  }
  
  // Check start date
  if (now < this.startDate) {
    return { valid: false, message: 'Coupon is not yet valid' };
  }
  
  // Check usage limit
  if (this.totalUsageLimit && this.currentUsageCount >= this.totalUsageLimit) {
    return { valid: false, message: 'Coupon has reached maximum usage limit' };
  }
  
  return { valid: true };
};

// Method to check if user can use coupon
couponSchema.methods.canUserUseCoupon = function (userId) {
  const userUsage = this.usageHistory.find(
    (usage) => usage.userId.toString() === userId.toString()
  );
  
  if (userUsage && userUsage.usageCount >= this.maxUsagePerUser) {
    return { canUse: false, message: 'You have reached maximum usage for this coupon' };
  }
  
  return { canUse: true };
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function (amount) {
  let discountAmount = 0;
  
  if (this.discountType === 'percentage') {
    discountAmount = (amount * this.discountValue) / 100;
    
    // Apply max discount cap if set
    if (this.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, this.maxDiscountAmount);
    }
  } else {
    // Fixed discount
    discountAmount = this.discountValue;
  }
  
  // Discount cannot be more than the amount
  return Math.min(discountAmount, amount);
};

// Method to apply coupon usage
couponSchema.methods.applyUsage = function (userId) {
  const existingUsage = this.usageHistory.find(
    (usage) => usage.userId.toString() === userId.toString()
  );
  
  if (existingUsage) {
    existingUsage.usageCount += 1;
    existingUsage.lastUsedAt = new Date();
  } else {
    this.usageHistory.push({
      userId,
      usageCount: 1,
      lastUsedAt: new Date(),
    });
  }
  
  this.currentUsageCount += 1;
};

module.exports = mongoose.model('Coupon', couponSchema);
