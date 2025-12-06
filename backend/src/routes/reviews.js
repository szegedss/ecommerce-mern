const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'helpful') {
      sortOption = { helpful: -1, createdAt: -1 };
    } else if (sort === 'rating-high') {
      sortOption = { rating: -1, createdAt: -1 };
    } else if (sort === 'rating-low') {
      sortOption = { rating: 1, createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      product: productId,
      status: 'approved',
    })
      .populate('user', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments({
      product: productId,
      status: 'approved',
    });

    const allReviews = await Review.find({
      product: productId,
      status: 'approved',
    });

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    allReviews.forEach((review) => {
      ratingDistribution[review.rating]++;
      totalRating += review.rating;
    });

    const averageRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: {
        reviews,
        totalReviews,
        averageRating: parseFloat(averageRating),
        ratingDistribution,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
});

// Create a new review - Only allowed if product was delivered and confirmed
router.post('/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { title, comment, rating, orderId } = req.body;
    const userId = req.userId;

    console.log('Creating review:', { productId, orderId, title, comment, rating, userId });

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Validate order exists and belongs to user
    if (!orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID is required to review a product' 
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to review from this order' 
      });
    }

    // Check if product is in this order
    const productInOrder = order.items.some(item => 
      item.productId.toString() === productId
    );
    if (!productInOrder) {
      return res.status(400).json({ 
        success: false, 
        message: 'This product is not in your order' 
      });
    }

    // Check order status - must be delivered or confirmed
    if (order.status !== 'delivered') {
      return res.status(400).json({ 
        success: false, 
        message: 'Product must be delivered before you can review it',
        orderStatus: order.status
      });
    }

    // Check if delivery is confirmed (either manually or auto-confirmed)
    if (!order.deliveryConfirmed) {
      // Check if auto-confirmation time has passed (1 day after delivered)
      const oneDay = 24 * 60 * 60 * 1000; // milliseconds
      const deliveredTime = new Date(order.deliveredDate).getTime();
      const currentTime = new Date().getTime();
      const timePassed = currentTime - deliveredTime;

      if (timePassed < oneDay && !order.deliveryConfirmed) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please confirm receipt of the product before reviewing',
          canReviewAt: new Date(deliveredTime + oneDay)
        });
      } else if (timePassed >= oneDay && !order.deliveryConfirmed) {
        // Auto-confirm delivery
        order.deliveryConfirmed = true;
        order.deliveryConfirmedDate = new Date();
        await order.save();
      }
    }

    // Check if user already reviewed THIS product in THIS order
    const existingReview = await Review.findOne({
      product: new mongoose.Types.ObjectId(productId),
      user: new mongoose.Types.ObjectId(userId),
      order: new mongoose.Types.ObjectId(orderId),
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product from this order',
      });
    }

    // Validate all required fields
    if (!title || !comment || !rating) {
      console.log('Missing fields:', { title, comment, rating });
      return res.status(400).json({
        success: false,
        message: 'Please provide title, comment, and rating',
      });
    }

    if (rating < 1 || rating > 5) {
      console.log('Invalid rating:', rating);
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('Found user:', { id: user._id, name: user.name });

    // Create review with order reference
    const review = new Review({
      product: productId,
      user: userId,
      order: orderId,
      userName: user.name,
      title,
      comment,
      rating,
      status: 'approved',
    });

    const savedReview = await review.save();
    await savedReview.populate('user', 'name email');

    await updateProductRating(productId);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: savedReview,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error creating review' });
  }
});

// Update a review
router.put('/:reviewId', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { title, comment, rating } = req.body;
    const userId = req.userId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this review',
      });
    }

    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5',
        });
      }
      review.rating = rating;
    }

    const updatedReview = await review.save();
    await updatedReview.populate('user', 'name email');

    await updateProductRating(review.product);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating review' });
  }
});

// Delete a review
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.userId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this review',
      });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(reviewId);

    await updateProductRating(productId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error deleting review' });
  }
});

// Check if user can review this product (NEW ENDPOINT)
// Returns: { canReview, orderId, message, reason }
router.get('/check-review-eligibility/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userId;

    console.log('Check review eligibility:', { productId, userId });

    // Find all delivered orders with this product
    // Try both ObjectId and string comparison for flexibility
    const deliveredOrders = await Order.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: 'delivered',
    }).populate('items.productId');

    // Filter orders that contain this product
    const relevantOrders = deliveredOrders.filter(order => 
      order.items.some(item => {
        const itemProductId = typeof item.productId === 'object' 
          ? item.productId?._id?.toString() 
          : item.productId?.toString();
        const checkProductId = productId.toString();
        return itemProductId === checkProductId;
      })
    );

    console.log('Relevant orders found:', relevantOrders.length);

    if (relevantOrders.length === 0) {
      return res.status(200).json({
        success: true,
        canReview: false,
        reason: 'no_delivered_order',
        message: 'Product must be delivered before you can review it',
      });
    }

    // Track if any orders are waiting for confirmation
    let hasOrderWaitingConfirmation = false;
    let hasReviewedOrders = false;

    // Check each order for review eligibility
    for (const order of relevantOrders) {
      // Check if delivery is confirmed (manually or auto)
      let canReviewThisOrder = order.deliveryConfirmed;

      if (!canReviewThisOrder) {
        // Check if auto-confirmation time has passed
        const oneDay = 24 * 60 * 60 * 1000;
        const deliveredTime = new Date(order.deliveredDate).getTime();
        const currentTime = new Date().getTime();
        const timePassed = currentTime - deliveredTime;

        console.log('Order delivery time check:', {
          orderId: order._id,
          deliveredTime: new Date(deliveredTime),
          currentTime: new Date(currentTime),
          timePassed: timePassed,
          oneDay: oneDay,
          canAutoConfirm: timePassed >= oneDay
        });

        if (timePassed >= oneDay) {
          canReviewThisOrder = true;
          // Auto-confirm now
          order.deliveryConfirmed = true;
          order.deliveryConfirmedDate = new Date();
          await order.save();
          console.log('Auto-confirmed delivery for order:', order._id);
        } else {
          // Still waiting for confirmation, mark and skip this order
          console.log('Skipping order - waiting for delivery confirmation:', order._id);
          hasOrderWaitingConfirmation = true;
          continue;
        }
      } else {
        console.log('Order already manually confirmed:', order._id);
      }

      if (canReviewThisOrder) {
        // Check if already reviewed THIS product in THIS order
        const existingReview = await Review.findOne({
          product: new mongoose.Types.ObjectId(productId),
          user: new mongoose.Types.ObjectId(userId),
          order: order._id,
        });

        console.log('Existing review check:', {
          orderId: order._id,
          productId: productId,
          hasExistingReview: !!existingReview
        });

        if (!existingReview) {
          // Can review this product from this order
          console.log('User can review this product');
          return res.status(200).json({
            success: true,
            canReview: true,
            orderId: order._id,
            message: 'You can review this product',
          });
        } else {
          hasReviewedOrders = true;
        }
      }
    }

    // Determine the appropriate response
    if (hasOrderWaitingConfirmation && !hasReviewedOrders) {
      // Has orders but waiting for delivery confirmation
      console.log('User needs to confirm delivery before reviewing');
      return res.status(200).json({
        success: true,
        canReview: false,
        reason: 'waiting_for_delivery_confirmation',
        message: 'Please confirm receipt of the product before reviewing (or wait 1 day for auto-confirm)',
      });
    }

    // All eligible orders already have reviews
    console.log('User has already reviewed this product from all eligible orders');
    return res.status(200).json({
      success: true,
      canReview: false,
      reason: 'already_reviewed_all_orders',
      message: 'You have already reviewed this product from all eligible orders',
    });
  } catch (err) {
    console.error('Error in check-review-eligibility:', err);

    res.status(500).json({ success: false, message: 'Error checking review eligibility' });
  }
});

// Mark review as helpful
router.post('/:reviewId/helpful', auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.userId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.helpfulBy.includes(userId)) {
      review.helpfulBy = review.helpfulBy.filter((id) => id.toString() !== userId);
      review.helpful = Math.max(0, review.helpful - 1);
    } else {
      review.helpfulBy.push(userId);
      review.helpful += 1;
    }

    const updatedReview = await review.save();
    await updatedReview.populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Review marked as helpful',
      data: updatedReview,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error marking review as helpful' });
  }
});

// Helper function to update product rating
async function updateProductRating(productId) {
  try {
    const reviews = await Review.find({
      product: productId,
      status: 'approved',
    });

    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        reviews: 0,
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);

    await Product.findByIdAndUpdate(productId, {
      rating: parseFloat(averageRating),
      reviews: reviews.length,
    });
  } catch (err) {
    console.error('Error updating product rating:', err);
  }
}

module.exports = router;
