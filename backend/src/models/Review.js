const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // Reference to product
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Please provide a product ID'],
    },
    // Reference to user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user ID'],
    },
    // Reference to order (track which order triggered this review)
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Please provide an order ID'],
    },
    // Username (for display when user is deleted)
    userName: {
      type: String,
      required: [true, 'Please provide a user name'],
    },
    // Review rating (1-5 stars)
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    // Review title
    title: {
      type: String,
      required: [true, 'Please provide a review title'],
      trim: true,
      maxlength: [100, 'Review title cannot exceed 100 characters'],
    },
    // Review comment
    comment: {
      type: String,
      required: [true, 'Please provide a review comment'],
      maxlength: [1000, 'Review comment cannot exceed 1000 characters'],
    },
    // Review images (uploaded to Cloudinary)
    images: [{
      url: { type: String, required: true },
      publicId: { type: String }, // For Cloudinary deletion
    }],
    // Review video (optional, uploaded to Cloudinary)
    video: {
      url: { type: String, default: '' },
      publicId: { type: String },
    },
    // Helpful count
    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Users who found this review helpful
    helpfulBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Status: 'approved', 'pending', 'rejected'
    status: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved',
    },
  },
  { timestamps: true }
);

// Index for faster queries
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ product: 1, rating: -1 });
reviewSchema.index({ user: 1 });
// Compound index to ensure one review per product per order
reviewSchema.index({ product: 1, user: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
